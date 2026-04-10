import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import {
  getRecoveryStatus,
  calculateRecoveryMetrics,
  getRestDayXPBonus,
  getQualityLabel,
  getRecoveryScoreColor,
  formatRecoveryScore,
} from '@/lib/gamification';

const prisma = new PrismaClient();

/**
 * GET /api/gamification/recovery
 *
 * Get user's recovery status and metrics
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
        restDays: {
          orderBy: { date: 'desc' },
          take: 30,
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

    // Calculate metrics
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get last rest day
    const lastRestDay = user.restDays.length > 0 ? user.restDays[0].date : null;

    // Count rest days in last 7 days
    const restDaysLast7Days = user.restDays.filter(
      (rd) => new Date(rd.date) >= oneWeekAgo
    ).length;

    // Calculate consecutive training days
    let consecutiveTrainingDays = 0;
    const sortedActivities = [...user.activities].sort(
      (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    );

    if (sortedActivities.length > 0) {
      const checkDate = new Date();
      checkDate.setHours(0, 0, 0, 0);

      for (let i = 0; i < 14; i++) {
        // Check last 2 weeks
        const hasActivityOnDay = sortedActivities.some((a) => {
          const actDate = new Date(a.startDate);
          actDate.setHours(0, 0, 0, 0);
          return actDate.getTime() === checkDate.getTime();
        });

        const hasRestOnDay = user.restDays.some((rd) => {
          const restDate = new Date(rd.date);
          restDate.setHours(0, 0, 0, 0);
          return restDate.getTime() === checkDate.getTime();
        });

        if (hasActivityOnDay && !hasRestOnDay) {
          consecutiveTrainingDays++;
        } else if (hasRestOnDay || (!hasActivityOnDay && i > 0)) {
          break;
        }

        checkDate.setDate(checkDate.getDate() - 1);
      }
    }

    // Calculate average rest day quality
    const qualityRatings = user.restDays
      .filter((rd) => rd.quality !== null)
      .map((rd) => rd.quality as number);
    const avgRestQuality =
      qualityRatings.length > 0
        ? qualityRatings.reduce((a, b) => a + b, 0) / qualityRatings.length
        : null;

    // Estimate current TSB (simplified - would normally come from training metrics)
    const recentActivities = user.activities.filter(
      (a) => new Date(a.startDate) >= oneWeekAgo
    );
    const avgRecentTSS =
      recentActivities.length > 0
        ? recentActivities.reduce((sum, a) => sum + (a.tss || 0), 0) /
          recentActivities.length
        : 0;
    const estimatedTSB = 25 - avgRecentTSS; // Simplified estimate

    // Get recovery status
    const status = getRecoveryStatus(
      user.lastActivityDate,
      lastRestDay,
      consecutiveTrainingDays,
      restDaysLast7Days,
      avgRestQuality,
      estimatedTSB
    );

    // Get recovery metrics
    const metrics = calculateRecoveryMetrics(
      user.restDays.map((rd) => ({
        id: rd.id,
        userId: rd.userId,
        date: rd.date,
        type: rd.type as 'auto_detected' | 'manual' | 'active_recovery',
        notes: rd.notes,
        quality: rd.quality,
      })),
      user.activities.length,
      lastRestDay
    );

    return NextResponse.json({
      status: {
        ...status,
        scoreColor: getRecoveryScoreColor(status.recoveryScore),
        scoreLabel: formatRecoveryScore(status.recoveryScore),
      },
      metrics,
      recentRestDays: user.restDays.slice(0, 7).map((rd) => ({
        id: rd.id,
        date: rd.date.toISOString(),
        type: rd.type,
        notes: rd.notes,
        quality: rd.quality,
        qualityLabel: rd.quality ? getQualityLabel(rd.quality) : null,
      })),
    });
  } catch (error) {
    console.error('Error fetching recovery status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recovery status' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/gamification/recovery
 *
 * Log a rest day
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, date, type = 'manual', notes, quality } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const restDate = date ? new Date(date) : new Date();
    restDate.setHours(0, 0, 0, 0);

    // Check if rest day already exists for this date
    const existing = await prisma.restDay.findUnique({
      where: {
        userId_date: {
          userId: parseInt(userId),
          date: restDate,
        },
      },
    });

    if (existing) {
      // Update existing rest day
      const updated = await prisma.restDay.update({
        where: { id: existing.id },
        data: {
          type,
          notes,
          quality: quality ? parseInt(quality) : null,
        },
      });

      return NextResponse.json({
        success: true,
        restDay: {
          id: updated.id,
          date: updated.date.toISOString(),
          type: updated.type,
          notes: updated.notes,
          quality: updated.quality,
        },
        xpAwarded: 0, // No XP for updates
      });
    }

    // Create new rest day
    const restDay = await prisma.restDay.create({
      data: {
        userId: parseInt(userId),
        date: restDate,
        type,
        notes,
        quality: quality ? parseInt(quality) : null,
      },
    });

    // Award XP for logging rest day
    const xpBonus = getRestDayXPBonus(quality ? parseInt(quality) : null);
    await prisma.user.update({
      where: { id: parseInt(userId) },
      data: {
        xp: { increment: xpBonus },
      },
    });

    return NextResponse.json({
      success: true,
      restDay: {
        id: restDay.id,
        date: restDay.date.toISOString(),
        type: restDay.type,
        notes: restDay.notes,
        quality: restDay.quality,
        qualityLabel: restDay.quality ? getQualityLabel(restDay.quality) : null,
      },
      xpAwarded: xpBonus,
    });
  } catch (error) {
    console.error('Error logging rest day:', error);
    return NextResponse.json(
      { error: 'Failed to log rest day' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/gamification/recovery
 *
 * Delete a rest day
 */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const restDayId = searchParams.get('id');
    const userId = searchParams.get('userId');

    if (!restDayId || !userId) {
      return NextResponse.json(
        { error: 'id and userId are required' },
        { status: 400 }
      );
    }

    // Verify ownership
    const restDay = await prisma.restDay.findFirst({
      where: {
        id: parseInt(restDayId),
        userId: parseInt(userId),
      },
    });

    if (!restDay) {
      return NextResponse.json(
        { error: 'Rest day not found' },
        { status: 404 }
      );
    }

    await prisma.restDay.delete({
      where: { id: restDay.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting rest day:', error);
    return NextResponse.json(
      { error: 'Failed to delete rest day' },
      { status: 500 }
    );
  }
}
