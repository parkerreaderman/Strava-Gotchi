import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { logger } from '@/lib/logger';

/**
 * Handles the OAuth callback from Strava, including state validation and
 * refresh-token storage.
 *
 * Test instructions:
 * 1. Complete the `/api/auth/strava` flow and ensure `state` in the URL matches the cookie.
 * 2. Simulate an invalid state by deleting the cookie before Strava redirects back; expect `/error=state_mismatch`.
 * 3. Force Strava to return an error code to confirm user-friendly redirects (`access_denied`, `token_exchange_failed`).
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const state = searchParams.get('state');
  const stateCookie = request.cookies.get('strava_oauth_state');

  if (error) {
    return NextResponse.redirect(
      new URL('/?error=access_denied', request.url)
    );
  }

  if (!code) {
    return NextResponse.redirect(new URL('/?error=no_code', request.url));
  }

  if (!state || !stateCookie || stateCookie.value !== state) {
    return NextResponse.redirect(new URL('/?error=state_mismatch', request.url));
  }

  const clientId =
    process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID ?? process.env.STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(new URL('/?error=config_error', request.url));
  }

  try {
    // Exchange code for access + refresh tokens.
    const tokenResponse = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token');
    }

    const tokenData = await tokenResponse.json();
    const athlete = tokenData.athlete;

    if (!athlete) {
      throw new Error('Missing athlete details in token response');
    }

    const user = await prisma.user.upsert({
      where: { stravaAthleteId: athlete.id },
      create: {
        stravaAthleteId: athlete.id,
        firstName: athlete.firstname,
        lastName: athlete.lastname,
        profileMediumUrl: athlete.profile_medium,
        profileUrl: athlete.profile,
      },
      update: {
        firstName: athlete.firstname,
        lastName: athlete.lastname,
        profileMediumUrl: athlete.profile_medium,
        profileUrl: athlete.profile,
      },
    });

    await prisma.stravaToken.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresAt: tokenData.expires_at,
      },
      update: {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresAt: tokenData.expires_at,
      },
    });

    const redirectUrl = new URL('/', request.url);
    redirectUrl.searchParams.set('athlete_id', tokenData.athlete.id);

    const isProduction = process.env.NODE_ENV === 'production';
    const response = NextResponse.redirect(redirectUrl);
    response.cookies.delete('strava_oauth_state');
    response.cookies.set('strava_access_token', tokenData.access_token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProduction,
      path: '/',
      maxAge: tokenData.expires_at
        ? tokenData.expires_at - Math.floor(Date.now() / 1000)
        : 21600,
    });
    response.cookies.set('strava_refresh_token', tokenData.refresh_token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProduction,
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });
    response.cookies.set(
      'strava_access_token_expires_at',
      `${tokenData.expires_at ?? ''}`,
      {
        httpOnly: true,
        sameSite: 'lax',
        secure: isProduction,
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
      }
    );
    response.cookies.set('strava_athlete_id', `${tokenData.athlete.id}`, {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProduction,
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'unknown';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error('OAuth callback error:', errorMessage, errorStack);
    
    // Try to log, but don't fail if logger fails
    try {
      logger.error('OAuth callback error', {
        error: errorMessage,
        stack: errorStack,
      });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
    
    return NextResponse.redirect(
      new URL(`/?error=token_exchange_failed&details=${encodeURIComponent(errorMessage)}`, request.url)
    );
  }
}
