import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/user";
import crypto from "crypto";

async function exchangeCodeForTokens(code: string, redirectUri: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Google client credentials not configured');
  }

  const params = new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code'
  });

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString()
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Token exchange failed: ${res.status} ${text}`);
  }

  const data = await res.json();
  return data;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const origin = url.origin;

    if (!code) {
      return NextResponse.json({ success: false, error: 'Missing code' }, { status: 400 });
    }

    const redirectUri = `${origin}/api/auth/google/callback`;
    const tokenData = await exchangeCodeForTokens(code, redirectUri) as any;
    const accessToken = tokenData?.access_token as string | undefined;

    if (!accessToken) {
      throw new Error('No access token returned');
    }

    // Get user info
    const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!userInfoRes.ok) {
      throw new Error('Failed to fetch user info from Google');
    }

    const profile = await userInfoRes.json() as any;
    const email = profile?.email as string | undefined;
    const name = (profile?.name as string) || (email ? email.split('@')[0] : 'User');

    await connectDB();

    // Find or create user, and persist Google profile fields
    let user = await User.findOne({ email }).select('+password');

    const profilePic = profile?.picture as string | undefined;
    const providerId = profile?.sub as string | undefined; // Google's subject id

    if (!user) {
      // Create a secure hashed password for OAuth-created users
      const randomPassword = crypto.randomBytes(16).toString('hex');
      const salt = crypto.randomBytes(16).toString('hex');
      const derived = crypto.scryptSync(randomPassword, salt, 64).toString('hex');
      const storedPassword = `${salt}:${derived}`;

      const username = email ? String(email).split('@')[0] : `guser_${crypto.randomBytes(4).toString('hex')}`;

      // Build a minimal user object (only allowed fields)
      const userObj: any = {
        username: String(username),
        name: String(name || username),
        email: String(email || `${username}@example.com`),
        password: storedPassword,
        picture: profilePic,
        provider: 'google',
        providerId,
        oauth: true
      };

      try {
        // Validate with mongoose first to get clear validation errors
        const doc = new User(userObj);
        await doc.validate();
        await doc.save();
        user = doc;
      } catch (createErr) {
        console.error('User create validation/save error', createErr, 'payload:', userObj);
        throw createErr;
      }
    } else {
      // Update existing user with profile info if missing or changed
      let shouldSave = false;
      if (profilePic && user.picture !== profilePic) {
        user.picture = profilePic;
        shouldSave = true;
      }
      if (providerId && String(user.providerId) !== String(providerId)) {
        user.providerId = providerId;
        shouldSave = true;
      }
      if (!user.oauth) {
        user.oauth = true;
        shouldSave = true;
      }
      if (name && user.name !== name) {
        user.name = name;
        shouldSave = true;
      }

      if (shouldSave) {
        await user.save();
      }
    }

    // Ensure we have a plain JS object for cookie value
    const userObj = (user as any).toObject ? (user as any).toObject() : (user as any);

    // Set session cookie to user id
    const res = NextResponse.redirect(`${origin}/`);
    res.cookies.set('session', String((user as any)._id), {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30 // 30 days
    });

    return res;
  } catch (err: any) {
    // Log the full error server-side for debugging
    console.error('GET /api/auth/google/callback error', err && (err.stack || err));

    // In development, return the real error message to help debugging
    const isProd = process.env.NODE_ENV === 'production';
    const message = isProd ? 'Google callback error' : (err && (err.message || String(err)));
    const details = isProd ? undefined : (err && (err.stack || null));

    const payload: any = { success: false, error: message };
    if (details) payload.details = details;

    return NextResponse.json(payload, { status: 500 });
  }
}
