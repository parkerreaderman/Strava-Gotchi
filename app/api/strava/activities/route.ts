import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { logger } from '@/lib/logger';
import type { Activity as CachedActivity } from '@prisma/client';
import {
  NINETY_DAYS_SECONDS,
  StravaActivity,
  extractAthleteId,
  hashSummary,
  parseAthleteId,
  toClientActivity,
  toClientActivityFromStrava,
  toSummary,
} from '@/lib/strava-activities';
import {
  calculateActivityXP,
  getLevelFromXP,
  getLevelProgress,
  getXPUntilNextLevel,
  calculateNewStreak,
  checkAllAchievements,
} from '@/lib/gamification';

type RefreshedTokens =
  | {
      access_token: string;
      refresh_token: string;
      expires_at?: number;
    }
  | undefined;

type StravaAthleteProfile = {
  id: number;
  firstname?: string | null;
  lastname?: string | null;
  profile_medium?: string | null;
  profile?: string | null;
};

const fetchAthleteProfile = async (
  token: string
): Promise<StravaAthleteProfile | null> => {
  try {
    const profileResponse = await fetch('https://www.strava.com/api/v3/athlete', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!profileResponse.ok) {
      return null;
    }

    return profileResponse.json();
  } catch (error) {
    logger.warn('Unable to fetch athlete profile', {
      error: error instanceof Error ? error.message : 'unknown',
    });
    return null;
  }
};

const syncActivitiesCache = async (
  userId: number,
  activities: StravaActivity[]
) => {
  let newActivitiesCount = 0;
  let totalNewXP = 0;

  await Promise.all(
    activities.map(async (activity) => {
      const summary = toSummary(activity);
      if (!summary) {
        return;
      }

      const checksum = hashSummary(summary);
      const existing = await prisma.activity.findUnique({
        where: { stravaActivityId: summary.stravaActivityId },
      });

      const payload = {
        userId,
        name: summary.name,
        type: summary.type,
        startDate: summary.startDate,
        duration: summary.duration,
        distance: summary.distance,
        averageHeartRate: summary.averageHeartRate,
        maxHeartRate: summary.maxHeartRate,
        tss: summary.tss,
        checksum,
      };

      if (!existing) {
        await prisma.activity.create({
          data: {
            ...payload,
            stravaActivityId: summary.stravaActivityId,
          },
        });
        newActivitiesCount++;

        // Calculate XP for this new activity
        const xpBreakdown = calculateActivityXP({
          duration: summary.duration,
          tss: summary.tss || 0,
          streakDays: 0, // Streak multiplier applied separately in updateGamificationStats
        });
        totalNewXP += xpBreakdown.total;
        return;
      }

      if (existing.checksum === checksum) {
        return;
      }

      await prisma.activity.update({
        where: { id: existing.id },
        data: payload,
      });
    })
  );

  return { newActivitiesCount, totalNewXP };
};

/**
 * Updates gamification stats after syncing activities
 */
const updateGamificationStats = async (userId: number, newXP: number) => {
  try {
    // Get user with their activities and achievements
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        activities: {
          orderBy: { startDate: 'desc' },
          take: 90,
        },
        achievements: {
          include: { achievement: true },
        },
      },
    });

    if (!user) return;

    // Calculate totals from activities
    const totalDistance = user.activities.reduce((sum, a) => sum + (a.distance || 0), 0);
    const totalDuration = user.activities.reduce((sum, a) => sum + (a.duration || 0), 0);
    const totalActivities = user.activities.length;

    // Get the most recent activity date
    const lastActivityDate = user.activities.length > 0
      ? new Date(user.activities[0].startDate)
      : null;

    // Update streak (only if there's a new activity)
    const newStreak = lastActivityDate
      ? calculateNewStreak(
          user.currentStreak,
          user.lastActivityDate,
          lastActivityDate
        )
      : user.currentStreak;

    // Apply streak multiplier to XP
    const streakMultiplier = Math.min(1 + (newStreak * 0.1), 1.5);
    const adjustedXP = Math.round(newXP * streakMultiplier);

    // Calculate new XP total and level
    const newTotalXP = user.xp + adjustedXP;
    const level = getLevelFromXP(newTotalXP);

    // Update user stats
    await prisma.user.update({
      where: { id: userId },
      data: {
        xp: newTotalXP,
        level,
        totalDistance,
        totalDuration,
        totalActivities,
        currentStreak: newStreak,
        longestStreak: Math.max(user.longestStreak, newStreak),
        lastActivityDate,
      },
    });

    // Check for new achievements
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const userStats = {
      totalDistance,
      totalDuration,
      totalActivities,
      currentStreak: newStreak,
      longestStreak: Math.max(user.longestStreak, newStreak),
      level,
      recentActivityCounts: {
        7: user.activities.filter((a) => new Date(a.startDate) >= sevenDaysAgo).length,
        30: user.activities.filter((a) => new Date(a.startDate) >= thirtyDaysAgo).length,
      },
      maxSingleTss: Math.max(0, ...user.activities.map((a) => a.tss || 0)),
      hasFirstActivity: totalActivities > 0,
    };

    const earnedSlugs = user.achievements.map((ua) => ua.achievement.slug);
    const newlyEarned = checkAllAchievements(userStats, earnedSlugs);

    // Award new achievements
    for (const achievement of newlyEarned) {
      // Find or create achievement in database
      let dbAchievement = await prisma.achievement.findUnique({
        where: { slug: achievement.slug },
      });

      if (!dbAchievement) {
        dbAchievement = await prisma.achievement.create({
          data: {
            slug: achievement.slug,
            name: achievement.name,
            description: achievement.description,
            category: achievement.category,
            tier: achievement.tier,
            xpReward: achievement.xpReward,
            requirement: JSON.stringify(achievement.requirement),
            sortOrder: achievement.sortOrder,
          },
        });
      }

      // Check if user already has this achievement
      const existingUserAchievement = await prisma.userAchievement.findUnique({
        where: {
          userId_achievementId: {
            userId,
            achievementId: dbAchievement.id,
          },
        },
      });

      if (!existingUserAchievement) {
        await prisma.userAchievement.create({
          data: {
            userId,
            achievementId: dbAchievement.id,
          },
        });

        // Award achievement XP
        await prisma.user.update({
          where: { id: userId },
          data: {
            xp: { increment: achievement.xpReward },
          },
        });
      }
    }

    logger.info('Gamification stats updated', {
      userId,
      xpEarned: adjustedXP,
      newLevel: level,
      streak: newStreak,
      newAchievements: newlyEarned.length,
    });
  } catch (error) {
    logger.error('Error updating gamification stats', {
      userId,
      error: error instanceof Error ? error.message : 'unknown',
    });
  }
};

// Server-side cache to track last Strava API call per user
const lastStravaCallCache = new Map<number, number>();
const MIN_STRAVA_CALL_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes minimum between Strava API calls per user (increased from 1 minute)

// Track in-flight requests to prevent concurrent calls for same user
const inFlightRequests = new Set<number>();

/**
 * Check if we should skip Strava API and use cached DB data
 * More aggressive caching to prevent rate limit issues
 */
const shouldUseCachedData = (userId: number, forceRefresh: boolean): boolean => {
  if (forceRefresh) return false;

  const lastCall = lastStravaCallCache.get(userId);
  if (!lastCall) return false;

  const timeSinceLastCall = Date.now() - lastCall;
  return timeSinceLastCall < MIN_STRAVA_CALL_INTERVAL_MS;
};

/**
 * Record that we made a Strava API call for this user
 */
const recordStravaCall = (userId: number): void => {
  lastStravaCallCache.set(userId, Date.now());
};

/**
 * Fetches activities from Strava API, persists Strava tokens + activity summaries,
 * and reuses cached data when nothing changed.
 *
 * Rate limiting strategy:
 * 1. Check if we have recent cached data in DB (called Strava < 1 minute ago)
 * 2. If yes, return cached data without hitting Strava
 * 3. If no, fetch from Strava and update cache
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const forceRefresh = searchParams.get('force') === 'true';
  const cookieAccessToken = request.cookies.get('strava_access_token')?.value;
  const cookieRefreshToken = request.cookies.get('strava_refresh_token')?.value;
  const cookieAthleteId = request.cookies.get('strava_athlete_id')?.value;
  const cookieExpiresAt = request.cookies.get('strava_access_token_expires_at')?.value;
  const parsedCookieExpiresAt = cookieExpiresAt
    ? Number.parseInt(cookieExpiresAt, 10)
    : undefined;
  const cookieExpiresAtSeconds = Number.isNaN(parsedCookieExpiresAt ?? NaN)
    ? undefined
    : parsedCookieExpiresAt;

  const accessToken =
    searchParams.get('access_token') ?? cookieAccessToken ?? undefined;
  const refreshToken =
    searchParams.get('refresh_token') ?? cookieRefreshToken ?? undefined;
  const athleteIdParam =
    searchParams.get('athlete_id') ?? cookieAthleteId ?? undefined;
  const page = Number.parseInt(searchParams.get('page') ?? '1', 10) || 1;
  const perPage =
    Number.parseInt(searchParams.get('per_page') ?? '50', 10) || 50;

  if (!accessToken && !refreshToken) {
    return NextResponse.json(
      {
        error:
          'No Strava credentials found. Reconnect your account to generate fresh tokens.',
      },
      { status: 401 }
    );
  }

  const clientId =
    process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID ?? process.env.STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;

  let activeAccessToken = accessToken;
  let refreshedTokens: RefreshedTokens;
  const after = Math.floor(Date.now() / 1000) - NINETY_DAYS_SECONDS;

  const fetchActivities = async (token: string) =>
    fetch(
      `https://www.strava.com/api/v3/athlete/activities?page=${page}&per_page=${perPage}&after=${after}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

  const handleRateLimit = (response: Response) => {
    const rateLimitLimit = response.headers.get('X-RateLimit-Limit');
    const rateLimitUsage = response.headers.get('X-RateLimit-Usage');
    const retryHeader =
      response.headers.get('Retry-After') ??
      response.headers.get('Retry-After-Ms');
    return NextResponse.json(
      {
        error:
          'Strava is temporarily rate-limiting requests. Please wait before trying again.',
        rateLimit: {
          limit: rateLimitLimit,
          usage: rateLimitUsage,
        },
        retryAfterSeconds: retryHeader ? Number.parseInt(retryHeader, 10) : null,
      },
      { status: 429 }
    );
  };

  const refreshAccessToken = async () => {
    if (!refreshToken || !clientId || !clientSecret) {
      return NextResponse.json(
        {
          error:
            'Your Strava session expired and could not be refreshed automatically. Please reconnect your account.',
        },
        { status: 401 }
      );
    }

    const refreshResponse = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    });

    if (!refreshResponse.ok) {
      return NextResponse.json(
        {
          error:
            'Unable to refresh your Strava session automatically. Please reconnect.',
        },
        { status: refreshResponse.status }
      );
    }

    const data = await refreshResponse.json();
    refreshedTokens = {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: data.expires_at,
    };
    activeAccessToken = data.access_token;
    return undefined;
  };

  if (!activeAccessToken && refreshToken) {
    const refreshError = await refreshAccessToken();
    if (refreshError) {
      return refreshError;
    }
  }

  if (!activeAccessToken) {
    return NextResponse.json(
      {
        error:
          'Unable to find a valid Strava access token. Please reconnect your account.',
      },
      { status: 401 }
    );
  }

  // Parse athlete ID early to check for cached data
  let athleteId = parseAthleteId(athleteIdParam);
  const ninetyDaysAgoDate = new Date(Date.now() - NINETY_DAYS_SECONDS * 1000);

  // Try to find user record for cache check
  let userRecord =
    typeof athleteId === 'number'
      ? await prisma.user.findUnique({ where: { stravaAthleteId: athleteId } })
      : null;

  // PRIORITY: Check database cache FIRST before calling Strava API
  // This prevents excessive API calls and respects rate limits
  // Strategy: Always prefer database cache unless force refresh or no cache exists
  let useCachedDataOnly = false;
  if (userRecord && !forceRefresh) {
    const cachedCount = await prisma.activity.count({
      where: {
        userId: userRecord.id,
        startDate: { gte: ninetyDaysAgoDate },
      },
    });
    
    // If we have cached data, prefer it to avoid rate limits
    if (cachedCount > 0) {
      const lastCall = lastStravaCallCache.get(userRecord.id);
      const timeSinceLastCall = lastCall ? Date.now() - lastCall : Infinity;
      
      // Use cache if:
      // 1. We called Strava recently (< 5 minutes), OR
      // 2. We have cache and haven't called Strava in a while (still use cache to avoid rate limits)
      if (timeSinceLastCall < MIN_STRAVA_CALL_INTERVAL_MS || !lastCall) {
        useCachedDataOnly = true;
        logger.info('Using cached activities to avoid rate limit', {
          userId: userRecord.id,
          cachedCount,
          timeSinceLastCall: lastCall ? Math.round(timeSinceLastCall / 1000) + 's' : 'never',
        });
      }
      // If cache exists but is stale, still prefer cache unless explicitly forced
      // This prevents hitting rate limits when user just refreshes the page
    }
  }

  let response: Response | null = null;
  let rateLimitLimit: string | null = null;
  let rateLimitUsage: string | null = null;
  let stravaActivities: StravaActivity[] = [];

  // Only call Strava API if not using cached data
  if (!useCachedDataOnly) {
    // Prevent concurrent requests for the same user
    if (userRecord && inFlightRequests.has(userRecord.id)) {
      logger.warn('Preventing concurrent Strava API request', { userId: userRecord.id });
      // Fall back to cached data if available
      const cachedCount = await prisma.activity.count({
        where: {
          userId: userRecord.id,
          startDate: { gte: ninetyDaysAgoDate },
        },
      });
      if (cachedCount > 0) {
        useCachedDataOnly = true;
      } else {
        return NextResponse.json(
          {
            error: 'Another request is in progress. Please wait.',
            activities: [],
          },
          { status: 429 }
        );
      }
    }

    if (userRecord) {
      inFlightRequests.add(userRecord.id);
    }

    try {
      response = await fetchActivities(activeAccessToken);
    } catch (error) {
      logger.error('Error reaching Strava', {
        error: error instanceof Error ? error.message : 'unknown',
      });
      // Clean up in-flight flag on error
      if (userRecord) {
        inFlightRequests.delete(userRecord.id);
      }
    }

    if (response?.status === 401 && refreshToken) {
      const refreshErrorResponse = await refreshAccessToken();
      if (refreshErrorResponse) {
        if (userRecord) inFlightRequests.delete(userRecord.id);
        return refreshErrorResponse;
      }
      response = await fetchActivities(activeAccessToken);
    }

    if (response?.status === 429) {
      if (userRecord) inFlightRequests.delete(userRecord.id);
      return handleRateLimit(response);
    }

    if (response?.status === 401) {
      if (userRecord) inFlightRequests.delete(userRecord.id);
      return NextResponse.json(
        {
          error:
            'The provided Strava access token is invalid or expired. Please reconnect your account.',
        },
        { status: 401 }
      );
    }

    if (response) {
      if (!response.ok) {
        if (userRecord) inFlightRequests.delete(userRecord.id);
        throw new Error(`Strava API error: ${response.status}`);
      }

      rateLimitLimit = response.headers.get('X-RateLimit-Limit');
      rateLimitUsage = response.headers.get('X-RateLimit-Usage');
      const parsed = await response.json();
      if (Array.isArray(parsed)) {
        stravaActivities = parsed;
      }
    }

    // Extract athlete ID from activities if not already known
    if (!athleteId) {
      athleteId = extractAthleteId(stravaActivities);
    }

    // Re-fetch user record if we now have athlete ID
    if (!userRecord && typeof athleteId === 'number') {
      userRecord = await prisma.user.findUnique({ where: { stravaAthleteId: athleteId } });
    }

    // Record that we made a Strava API call
    if (userRecord) {
      recordStravaCall(userRecord.id);
      inFlightRequests.delete(userRecord.id);
    }
  } else if (userRecord) {
    // Clean up in-flight flag even when using cache
    inFlightRequests.delete(userRecord.id);
  }

  if ((!athleteId || !userRecord) && activeAccessToken) {
    const profile = await fetchAthleteProfile(activeAccessToken);
    if (profile?.id) {
      athleteId = profile.id;
      const profileData = {
        firstName: profile.firstname ?? null,
        lastName: profile.lastname ?? null,
        profileMediumUrl: profile.profile_medium ?? null,
        profileUrl: profile.profile ?? null,
      };

      userRecord = await prisma.user.upsert({
        where: { stravaAthleteId: profile.id },
        update: profileData,
        create: {
          stravaAthleteId: profile.id,
          ...profileData,
        },
      });
    }
  }

  if (userRecord && stravaActivities.length > 0) {
    const syncResult = await syncActivitiesCache(userRecord.id, stravaActivities);

    // Update gamification if there are new activities
    if (syncResult && syncResult.newActivitiesCount > 0) {
      await updateGamificationStats(userRecord.id, syncResult.totalNewXP);
    }
  }

  if (userRecord) {
    const existingToken = await prisma.stravaToken.findUnique({
      where: { userId: userRecord.id },
    });

    const refreshTokenToPersist =
      refreshedTokens?.refresh_token ??
      refreshToken ??
      existingToken?.refreshToken;
    const expiresAtToPersist =
      refreshedTokens?.expires_at ??
      existingToken?.expiresAt ??
      cookieExpiresAtSeconds ??
      Math.floor(Date.now() / 1000) + 60 * 60 * 6;

    if (refreshTokenToPersist && activeAccessToken) {
      await prisma.stravaToken.upsert({
        where: { userId: userRecord.id },
        create: {
          userId: userRecord.id,
          accessToken: activeAccessToken,
          refreshToken: refreshTokenToPersist,
          expiresAt: expiresAtToPersist,
        },
        update: {
          accessToken: activeAccessToken,
          refreshToken: refreshTokenToPersist,
          expiresAt: expiresAtToPersist,
        },
      });
    }
  }

  let cachedActivityRows: CachedActivity[] = [];
  if (userRecord) {
    cachedActivityRows = await prisma.activity.findMany({
      where: {
        userId: userRecord.id,
        startDate: {
          gte: ninetyDaysAgoDate,
        },
      },
      orderBy: { startDate: 'desc' },
    });
  }

  const rawActivitiesForResponse = cachedActivityRows.length
    ? cachedActivityRows.map(toClientActivity)
    : toClientActivityFromStrava(stravaActivities);

  const activitiesToReturn = [...rawActivitiesForResponse].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  if (activitiesToReturn.length === 0) {
    return NextResponse.json(
      {
        error:
          'No recent Strava activities were found. Record a workout or expand the date range, then refresh.',
        activities: [],
      },
      { status: 404 }
    );
  }

  const hasMore = stravaActivities.length === perPage;
  const payload = {
    activities: activitiesToReturn,
    user: userRecord ? {
      id: userRecord.id,
      stravaAthleteId: userRecord.stravaAthleteId,
      firstName: userRecord.firstName,
      lastName: userRecord.lastName,
    } : null,
    pagination: {
      page,
      perPage,
      hasMore,
      nextPage: hasMore ? page + 1 : undefined,
    },
    refreshedTokens,
    rateLimit: {
      limit: rateLimitLimit,
      usage: rateLimitUsage,
    },
    source: cachedActivityRows.length ? 'cache' : 'strava',
  };

  const responseJson = NextResponse.json(payload);

  if (athleteId) {
    responseJson.cookies.set('strava_athlete_id', `${athleteId}`, {
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });
  }

  if (refreshedTokens) {
    const maxAgeSeconds = refreshedTokens.expires_at
      ? Math.max(refreshedTokens.expires_at - Math.floor(Date.now() / 1000), 60)
      : 60 * 60 * 6;

    responseJson.cookies.set('strava_access_token', refreshedTokens.access_token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      path: '/',
      maxAge: maxAgeSeconds,
    });

    responseJson.cookies.set('strava_refresh_token', refreshedTokens.refresh_token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });

    if (refreshedTokens.expires_at) {
      responseJson.cookies.set(
        'strava_access_token_expires_at',
        `${refreshedTokens.expires_at}`,
        {
          httpOnly: true,
          sameSite: 'lax',
          secure: true,
          path: '/',
          maxAge: 60 * 60 * 24 * 30,
        }
      );
    }
  }

  return responseJson;
}
