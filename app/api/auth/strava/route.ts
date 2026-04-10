import { randomBytes } from 'crypto';
import { NextResponse } from 'next/server';

/**
 * Initiates Strava OAuth flow and encodes a CSRF-resistant state value.
 *
 * Test instructions:
 * 1. Run `pnpm dev` (or the relevant dev command) and visit `/api/auth/strava`.
 * 2. Confirm you are redirected to Strava with `scope=read,activity:read_all,profile:read_all,offline_access`.
 * 3. Intentionally break env vars to confirm a 500 with the friendly error payload.
 */
export async function GET() {
  const clientId =
    process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID ?? process.env.STRAVA_CLIENT_ID;
  const redirectUri =
    process.env.NEXT_PUBLIC_REDIRECT_URI ?? process.env.STRAVA_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return NextResponse.json(
      {
        error:
          'Missing Strava credentials. Double-check NEXT_PUBLIC_STRAVA_CLIENT_ID and NEXT_PUBLIC_REDIRECT_URI (or their server-side counterparts).',
      },
      { status: 500 }
    );
  }

  // Build Strava authorization URL and request offline access for refresh tokens.
  // Strava expects scopes as a comma-separated list and uses `access_type=offline`
  // instead of an `offline_access` scope.
  const scope = 'read,activity:read_all,profile:read_all';
  const state = randomBytes(16).toString('hex');
  const authUrl = new URL('https://www.strava.com/oauth/authorize');
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('approval_prompt', 'auto');
  authUrl.searchParams.set('scope', scope);
  authUrl.searchParams.set('access_type', 'offline');
  authUrl.searchParams.set('state', state);

  // Surface the state in a short-lived cookie so the callback can validate it.
  const response = NextResponse.redirect(authUrl.toString());
  response.cookies.set('strava_oauth_state', state, {
    httpOnly: true,
    maxAge: 60 * 5,
    sameSite: 'lax',
    secure: true,
    path: '/',
  });

  return response;
}
