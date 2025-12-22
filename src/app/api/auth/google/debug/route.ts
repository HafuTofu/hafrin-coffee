import { NextResponse } from "next/server";

function mask(value?: string) {
  if (!value) return null;
  if (value.length <= 12) return `${value.slice(0, 4)}...${value.slice(-4)}`;
  return `${value.slice(0, 6)}...${value.slice(-6)}`;
}

export async function GET(req: Request) {
  try {
    const origin = new URL(req.url).origin;
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const masked = mask(clientId);
    const redirectUri = `${origin}/api/auth/google/callback`;

    // Helpful debug HTML (no secrets printed)
    const html = `<!doctype html>
      <html>
      <head><meta charset="utf-8"><title>Google OAuth debug</title></head>
      <body style="font-family:system-ui, Arial;line-height:1.5;padding:24px;">
        <h1>Google OAuth debug</h1>
        <p><strong>GOOGLE_CLIENT_ID:</strong> ${masked ?? '<em>not set</em>'}</p>
        <p><strong>Redirect URI expected:</strong> <code>${redirectUri}</code></p>
        <p>If <code>GOOGLE_CLIENT_ID</code> is missing, create <code>.env.local</code> in the project root with the variables and restart the dev server.</p>
        <p><a href="/api/auth/google">Start Google OAuth</a></p>
      </body>
      </html>`;

    console.log('DEBUG /api/auth/google/debug - clientId set:', !!clientId, 'masked:', masked, 'redirectUri:', redirectUri);

    return new NextResponse(html, {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  } catch (err) {
    console.error('DEBUG /api/auth/google/debug error', err);
    return NextResponse.json({ success: false, error: 'debug failed' }, { status: 500 });
  }
}
