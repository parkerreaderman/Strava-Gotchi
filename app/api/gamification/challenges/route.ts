import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import {
  getDailyChallengeWindow,
  getWeeklyChallengeWindow,
  selectRandomChallenges,
  calculateProgress,
  formatRequirement,
  formatProgress,
  formatTimeRemaining,
} from '@/lib/gamification';

const prisma = new PrismaClient();

/**
 * GET /api/gamification/challenges
 *
 * Get active challenges with user progress
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get challenge windows
    const dailyWindow = getDailyChallengeWindow();
    const weeklyWindow = getWeeklyChallengeWindow();

    // Get active challenges for this user
    const activeChallenges = await prisma.challenge.findMany({
      where: {
        isActive: true,
        endDate: { gt: new Date() },
      },
      include: {
        userChallenges: {
          where: { userId: user.id },
        },
      },
    });

    // If no active challenges, create new ones
    if (activeChallenges.length === 0) {
      const newChallenges = await createNewChallenges(user.id);
      return NextResponse.json({ challenges: newChallenges });
    }

    // Format challenges with progress
    const formattedChallenges = activeChallenges.map((challenge) => {
      const userProgress = challenge.userChallenges[0];
      const requirement = JSON.parse(challenge.requirement);

      return {
        id: challenge.id,
        name: challenge.name,
        description: challenge.description,
        type: challenge.type,
        xpReward: challenge.xpReward,
        progress: userProgress ? calculateProgress(userProgress.progress, requirement.value) : 0,
        requirement: {
          type: requirement.type,
          value: requirement.value,
          current: userProgress?.progress || 0,
          formatted: formatRequirement(requirement),
          currentFormatted: formatProgress(requirement, userProgress?.progress || 0),
        },
        completed: userProgress?.completed || false,
        claimed: userProgress?.claimed || false,
        expiresAt: challenge.endDate.toISOString(),
        timeRemaining: formatTimeRemaining(challenge.endDate),
      };
    });

    // Separate daily and weekly
    const daily = formattedChallenges.filter((c) => c.type === 'daily');
    const weekly = formattedChallenges.filter((c) => c.type === 'weekly');

    return NextResponse.json({
      daily,
      weekly,
      windows: {
        daily: {
          start: dailyWindow.start.toISOString(),
          end: dailyWindow.end.toISOString(),
        },
        weekly: {
          start: weeklyWindow.start.toISOString(),
          end: weeklyWindow.end.toISOString(),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching challenges:', error);
    return NextResponse.json(
      { error: 'Failed to fetch challenges' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/gamification/challenges/claim
 *
 * Claim reward for completed challenge
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, challengeId } = body;

    if (!userId || !challengeId) {
      return NextResponse.json(
        { error: 'userId and challengeId are required' },
        { status: 400 }
      );
    }

    // Get user challenge
    const userChallenge = await prisma.userChallenge.findFirst({
      where: {
        userId: parseInt(userId),
        challengeId: parseInt(challengeId),
      },
      include: { challenge: true },
    });

    if (!userChallenge) {
      return NextResponse.json(
        { error: 'Challenge not found for user' },
        { status: 404 }
      );
    }

    if (!userChallenge.completed) {
      return NextResponse.json(
        { error: 'Challenge not completed yet' },
        { status: 400 }
      );
    }

    if (userChallenge.claimed) {
      return NextResponse.json(
        { error: 'Reward already claimed' },
        { status: 400 }
      );
    }

    // Award XP and mark as claimed
    await prisma.$transaction([
      prisma.userChallenge.update({
        where: { id: userChallenge.id },
        data: { claimed: true },
      }),
      prisma.user.update({
        where: { id: parseInt(userId) },
        data: {
          xp: { increment: userChallenge.challenge.xpReward },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      xpAwarded: userChallenge.challenge.xpReward,
    });
  } catch (error) {
    console.error('Error claiming challenge reward:', error);
    return NextResponse.json(
      { error: 'Failed to claim reward' },
      { status: 500 }
    );
  }
}

/**
 * Helper: Create new challenges for a user
 */
async function createNewChallenges(userId: number) {
  const dailyWindow = getDailyChallengeWindow();
  const weeklyWindow = getWeeklyChallengeWindow();

  // Select random challenges
  const dailyChallenges = selectRandomChallenges('daily', 2);
  const weeklyChallenges = selectRandomChallenges('weekly', 2);

  const created = [];

  // Create daily challenges
  for (const def of dailyChallenges) {
    const challenge = await prisma.challenge.create({
      data: {
        slug: `${def.slug}-${Date.now()}`,
        name: def.name,
        description: def.description,
        type: 'daily',
        requirement: JSON.stringify(def.requirement),
        xpReward: def.xpReward,
        startDate: dailyWindow.start,
        endDate: dailyWindow.end,
        isActive: true,
      },
    });

    // Create user progress entry
    await prisma.userChallenge.create({
      data: {
        userId,
        challengeId: challenge.id,
        progress: 0,
      },
    });

    created.push({
      id: challenge.id,
      name: challenge.name,
      description: challenge.description,
      type: 'daily',
      xpReward: challenge.xpReward,
      progress: 0,
      requirement: {
        ...def.requirement,
        current: 0,
        formatted: formatRequirement(def.requirement),
        currentFormatted: formatProgress(def.requirement, 0),
      },
      completed: false,
      claimed: false,
      expiresAt: dailyWindow.end.toISOString(),
      timeRemaining: formatTimeRemaining(dailyWindow.end),
    });
  }

  // Create weekly challenges
  for (const def of weeklyChallenges) {
    const challenge = await prisma.challenge.create({
      data: {
        slug: `${def.slug}-${Date.now()}`,
        name: def.name,
        description: def.description,
        type: 'weekly',
        requirement: JSON.stringify(def.requirement),
        xpReward: def.xpReward,
        startDate: weeklyWindow.start,
        endDate: weeklyWindow.end,
        isActive: true,
      },
    });

    await prisma.userChallenge.create({
      data: {
        userId,
        challengeId: challenge.id,
        progress: 0,
      },
    });

    created.push({
      id: challenge.id,
      name: challenge.name,
      description: challenge.description,
      type: 'weekly',
      xpReward: challenge.xpReward,
      progress: 0,
      requirement: {
        ...def.requirement,
        current: 0,
        formatted: formatRequirement(def.requirement),
        currentFormatted: formatProgress(def.requirement, 0),
      },
      completed: false,
      claimed: false,
      expiresAt: weeklyWindow.end.toISOString(),
      timeRemaining: formatTimeRemaining(weeklyWindow.end),
    });
  }

  return created;
}
