import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import {
  DEFAULT_ACHIEVEMENTS,
  checkAllAchievements,
  getAchievementsByCategory,
} from '@/lib/gamification';

const prisma = new PrismaClient();

/**
 * GET /api/gamification/achievements
 *
 * Get all achievements with user's progress
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const category = searchParams.get('category');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Get user with achievements
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      include: {
        achievements: {
          include: { achievement: true },
        },
        activities: {
          orderBy: { startDate: 'desc' },
          take: 30,
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get earned achievement slugs
    const earnedSlugs = user.achievements.map((ua) => ua.achievement.slug);

    // Filter achievements by category if specified
    const achievements = category
      ? getAchievementsByCategory(category as 'distance' | 'streak' | 'consistency' | 'milestone' | 'special')
      : DEFAULT_ACHIEVEMENTS;

    // Map achievements with earned status
    const achievementsWithStatus = achievements.map((achievement, index) => {
      const earned = user.achievements.find(
        (ua) => ua.achievement.slug === achievement.slug
      );

      return {
        id: earned?.achievement.id || index + 1000, // Use DB id or generate one
        ...achievement,
        earned: !!earned,
        earnedAt: earned?.earnedAt?.toISOString(),
      };
    });

    // Calculate recent activity counts for consistency achievements
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const activitiesLast7Days = user.activities.filter(
      (a) => new Date(a.startDate) >= sevenDaysAgo
    ).length;
    const activitiesLast30Days = user.activities.filter(
      (a) => new Date(a.startDate) >= thirtyDaysAgo
    ).length;

    // Get max single TSS
    const maxTss = Math.max(
      0,
      ...user.activities.map((a) => a.tss || 0)
    );

    return NextResponse.json({
      achievements: achievementsWithStatus,
      stats: {
        totalEarned: earnedSlugs.length,
        totalAvailable: DEFAULT_ACHIEVEMENTS.length,
        recentActivityCounts: {
          7: activitiesLast7Days,
          30: activitiesLast30Days,
        },
        maxSingleTss: maxTss,
      },
    });
  } catch (error) {
    console.error('Error fetching achievements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch achievements' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/gamification/achievements/check
 *
 * Check and award any newly earned achievements
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

    // Get user with stats
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      include: {
        achievements: {
          include: { achievement: true },
        },
        activities: {
          orderBy: { startDate: 'desc' },
          take: 30,
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Calculate activity counts
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const userStats = {
      totalDistance: user.totalDistance,
      totalDuration: user.totalDuration,
      totalActivities: user.totalActivities,
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      level: user.level,
      recentActivityCounts: {
        7: user.activities.filter((a) => new Date(a.startDate) >= sevenDaysAgo).length,
        30: user.activities.filter((a) => new Date(a.startDate) >= thirtyDaysAgo).length,
      },
      maxSingleTss: Math.max(0, ...user.activities.map((a) => a.tss || 0)),
      hasFirstActivity: user.totalActivities > 0,
    };

    // Get currently earned slugs
    const earnedSlugs = user.achievements.map((ua) => ua.achievement.slug);

    // Check for new achievements
    const newlyEarned = checkAllAchievements(userStats, earnedSlugs);

    if (newlyEarned.length === 0) {
      return NextResponse.json({
        newAchievements: [],
        totalXpEarned: 0,
      });
    }

    // Get or create achievement records and award to user
    const awardedAchievements = [];
    let totalXpEarned = 0;

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

      // Award to user
      await prisma.userAchievement.create({
        data: {
          userId: user.id,
          achievementId: dbAchievement.id,
        },
      });

      awardedAchievements.push({
        ...achievement,
        earnedAt: new Date(),
      });

      totalXpEarned += achievement.xpReward;
    }

    // Update user's XP
    if (totalXpEarned > 0) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          xp: { increment: totalXpEarned },
        },
      });
    }

    return NextResponse.json({
      newAchievements: awardedAchievements,
      totalXpEarned,
    });
  } catch (error) {
    console.error('Error checking achievements:', error);
    return NextResponse.json(
      { error: 'Failed to check achievements' },
      { status: 500 }
    );
  }
}
