import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import {
  getLevelFromXP,
  getLevelProgress,
  getXPUntilNextLevel,
  getEvolutionStage,
  EVOLUTION_NAMES,
  getStreakStatus,
} from '@/lib/gamification';

const prisma = new PrismaClient();

/**
 * GET /api/gamification/stats
 *
 * Get user's gamification stats (level, XP, streak, evolution)
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
        },
        achievements: {
          include: { achievement: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Calculate derived stats
    const level = getLevelFromXP(user.xp);
    const levelProgress = getLevelProgress(user.xp);
    const xpUntilNextLevel = getXPUntilNextLevel(user.xp);

    // Get CTL for evolution calculation (would come from training metrics)
    // For now, estimate based on recent activity
    const estimatedCTL = Math.min(user.totalActivities * 2, 150);
    const evolutionStage = getEvolutionStage(level, estimatedCTL);

    // Get streak status
    const streakStatus = getStreakStatus(
      user.currentStreak,
      user.longestStreak,
      user.lastActivityDate,
      user.streakFreezes.map((f) => ({
        id: f.id,
        usedAt: f.usedAt,
        expiresAt: f.expiresAt,
      }))
    );

    return NextResponse.json({
      // XP & Level
      xp: user.xp,
      level,
      levelProgress,
      xpUntilNextLevel,

      // Evolution
      evolutionStage,
      evolutionName: EVOLUTION_NAMES[evolutionStage],

      // Streak
      streak: streakStatus,

      // Totals
      totalActivities: user.totalActivities,
      totalDistance: user.totalDistance,
      totalDuration: user.totalDuration,

      // Achievements
      achievementCount: user.achievements.length,
    });
  } catch (error) {
    console.error('Error fetching gamification stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
