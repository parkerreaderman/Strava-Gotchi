import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import {
  getStreakStatus,
  applyStreakFreeze,
  getStreakMilestoneRewards,
  formatStreakDisplay,
  getStreakEmoji,
} from '@/lib/gamification';

const prisma = new PrismaClient();

/**
 * GET /api/gamification/streak
 *
 * Get user's current streak status
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
      include: {
        streakFreezes: {
          where: {
            usedAt: null,
            expiresAt: { gt: new Date() },
          },
          orderBy: { expiresAt: 'asc' },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const freezes = user.streakFreezes.map((f) => ({
      id: f.id,
      usedAt: f.usedAt,
      expiresAt: f.expiresAt,
    }));

    const status = getStreakStatus(
      user.currentStreak,
      user.longestStreak,
      user.lastActivityDate,
      freezes
    );

    // Get milestone info
    const milestoneRewards = getStreakMilestoneRewards(user.currentStreak);

    return NextResponse.json({
      ...status,
      display: formatStreakDisplay(user.currentStreak),
      emoji: getStreakEmoji(user.currentStreak),
      freezes: freezes.map((f) => ({
        id: f.id,
        expiresAt: f.expiresAt.toISOString(),
      })),
      nextMilestone: getNextStreakMilestone(user.currentStreak),
      milestoneRewards,
    });
  } catch (error) {
    console.error('Error fetching streak:', error);
    return NextResponse.json(
      { error: 'Failed to fetch streak' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/gamification/streak/freeze
 *
 * Use a streak freeze to save expiring streak
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      include: {
        streakFreezes: {
          where: {
            usedAt: null,
            expiresAt: { gt: new Date() },
          },
          orderBy: { expiresAt: 'asc' },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const freezes = user.streakFreezes.map((f) => ({
      id: f.id,
      usedAt: f.usedAt,
      expiresAt: f.expiresAt,
    }));

    const result = applyStreakFreeze(freezes, user.currentStreak);

    if (!result.success) {
      return NextResponse.json(
        { error: 'No available streak freezes' },
        { status: 400 }
      );
    }

    // Mark freeze as used and extend streak grace period
    const now = new Date();
    await prisma.$transaction([
      prisma.streakFreeze.update({
        where: { id: result.freezeId! },
        data: { usedAt: now },
      }),
      prisma.user.update({
        where: { id: user.id },
        data: {
          lastActivityDate: now, // Reset grace period
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      streakPreserved: user.currentStreak,
      freezesRemaining: freezes.length - 1,
    });
  } catch (error) {
    console.error('Error using streak freeze:', error);
    return NextResponse.json(
      { error: 'Failed to use streak freeze' },
      { status: 500 }
    );
  }
}

/**
 * Helper: Get next streak milestone
 */
function getNextStreakMilestone(currentStreak: number): {
  days: number;
  daysRemaining: number;
  reward: string;
} | null {
  const milestones = [
    { days: 7, reward: 'Streak Freeze + 50 XP' },
    { days: 14, reward: '100 XP' },
    { days: 30, reward: '250 XP' },
    { days: 60, reward: '500 XP' },
    { days: 100, reward: '1000 XP' },
    { days: 365, reward: '5000 XP + Special Badge' },
  ];

  const nextMilestone = milestones.find((m) => m.days > currentStreak);

  if (!nextMilestone) {
    return null;
  }

  return {
    days: nextMilestone.days,
    daysRemaining: nextMilestone.days - currentStreak,
    reward: nextMilestone.reward,
  };
}
