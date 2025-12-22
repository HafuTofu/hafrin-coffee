import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const origin = new URL(req.url).origin;
    const clientId = process.env.GOOGLE_CLIENT_ID;

    if (!clientId) {
      // Return a helpful HTML page instructing the developer to configure env vars
      const html = `<!doctype html>
        <html>
        <head><meta charset="utf-8"><title>Google OAuth not configured</title></head>
        <body style="font-family:system-ui, Arial;line-height:1.5;padding:40px;">
          <h1>Google OAuth not configured</h1>
          <p>The server is missing the <code>GOOGLE_CLIENT_ID</code> environment variable.</p>
          <p>To enable Google Sign-In locally:
            <ol>
              <li>Create OAuth credentials in Google Cloud Console (Application type: Web application).</li>
              <li>Add the redirect URI: <code>${origin}/api/auth/google/callback</code></li>
              <li>Copy <code>GOOGLE_CLIENT_ID</code> and <code>GOOGLE_CLIENT_SECRET</code> into a <code>.env.local</code> file in the project root.</li>
            </ol>
          </p>
          <p>We've included an <code>.env.example</code> file in the repository as a template.</p>
        </body>
        </html>`;

      return new NextResponse(html, {
        status: 500,
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }

    const redirectUri = `${origin}/api/auth/google/callback`;
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'select_account'
    });

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    return NextResponse.redirect(authUrl);
  } catch (err) {
    console.error('GET /api/auth/google error', err);
    return NextResponse.json({ success: false, error: 'Failed to start Google OAuth' }, { status: 500 });
  }
}
