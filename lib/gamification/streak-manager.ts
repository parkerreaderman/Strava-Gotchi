/**
 * Streak Manager
 *
 * Handles streak calculation and maintenance:
 * - Activity counts if >= 15 minutes duration
 * - 36-hour grace period before streak breaks
 * - Earn streak freeze every 7-day milestone (max 3 stored)
 */

// Constants
const MIN_ACTIVITY_DURATION_SECONDS = 15 * 60; // 15 minutes
const GRACE_PERIOD_HOURS = 36;
const STREAK_FREEZE_MILESTONE = 7; // Earn freeze every 7 days
const MAX_STORED_FREEZES = 3;

export interface StreakStatus {
  currentStreak: number;
  longestStreak: number;
  isActive: boolean;
  hoursUntilExpiry: number | null;
  availableFreezes: number;
  lastActivityDate: Date | null;
  streakBroken: boolean;
}

export interface StreakFreeze {
  id: number;
  usedAt: Date | null;
  expiresAt: Date;
}

/**
 * Check if an activity qualifies for streak
 */
export function activityQualifiesForStreak(durationSeconds: number): boolean {
  return durationSeconds >= MIN_ACTIVITY_DURATION_SECONDS;
}

/**
 * Calculate hours remaining in grace period
 */
export function getHoursUntilStreakExpiry(lastActivityDate: Date | null): number | null {
  if (!lastActivityDate) return null;

  const now = new Date();
  const expiryTime = new Date(lastActivityDate.getTime() + GRACE_PERIOD_HOURS * 60 * 60 * 1000);
  const hoursRemaining = (expiryTime.getTime() - now.getTime()) / (1000 * 60 * 60);

  return hoursRemaining > 0 ? Math.round(hoursRemaining * 10) / 10 : 0;
}

/**
 * Check if streak is still active (within grace period)
 */
export function isStreakActive(lastActivityDate: Date | null): boolean {
  if (!lastActivityDate) return false;

  const hoursRemaining = getHoursUntilStreakExpiry(lastActivityDate);
  return hoursRemaining !== null && hoursRemaining > 0;
}

/**
 * Calculate new streak value after activity
 */
export function calculateNewStreak(
  currentStreak: number,
  lastActivityDate: Date | null,
  activityDate: Date
): number {
  // First activity ever
  if (!lastActivityDate) {
    return 1;
  }

  // Check if activity is on a new day
  const lastDate = new Date(lastActivityDate);
  const newDate = new Date(activityDate);

  // Normalize to date only (ignore time)
  lastDate.setHours(0, 0, 0, 0);
  newDate.setHours(0, 0, 0, 0);

  // Same day - streak unchanged
  if (lastDate.getTime() === newDate.getTime()) {
    return currentStreak;
  }

  // Check if within grace period
  if (isStreakActive(lastActivityDate)) {
    return currentStreak + 1;
  }

  // Streak broken - start new streak
  return 1;
}

/**
 * Check if a streak freeze should be awarded
 * (Every 7-day milestone)
 */
export function shouldAwardStreakFreeze(
  oldStreak: number,
  newStreak: number,
  currentFreezes: number
): boolean {
  if (currentFreezes >= MAX_STORED_FREEZES) {
    return false;
  }

  // Check if we crossed a 7-day milestone
  const oldMilestones = Math.floor(oldStreak / STREAK_FREEZE_MILESTONE);
  const newMilestones = Math.floor(newStreak / STREAK_FREEZE_MILESTONE);

  return newMilestones > oldMilestones;
}

/**
 * Apply a streak freeze to save streak
 */
export function applyStreakFreeze(
  freezes: StreakFreeze[],
  currentStreak: number
): { success: boolean; freezeId: number | null; newStreak: number } {
  // Find an unused, non-expired freeze
  const now = new Date();
  const availableFreeze = freezes.find(
    (f) => f.usedAt === null && new Date(f.expiresAt) > now
  );

  if (!availableFreeze) {
    return { success: false, freezeId: null, newStreak: 0 };
  }

  return {
    success: true,
    freezeId: availableFreeze.id,
    newStreak: currentStreak, // Streak preserved
  };
}

/**
 * Generate streak freeze expiry date (30 days from now)
 */
export function generateStreakFreezeExpiry(): Date {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + 30);
  return expiry;
}

/**
 * Get streak status summary
 */
export function getStreakStatus(
  currentStreak: number,
  longestStreak: number,
  lastActivityDate: Date | null,
  freezes: StreakFreeze[]
): StreakStatus {
  const now = new Date();
  const availableFreezes = freezes.filter(
    (f) => f.usedAt === null && new Date(f.expiresAt) > now
  ).length;

  const active = isStreakActive(lastActivityDate);
  const hoursUntilExpiry = getHoursUntilStreakExpiry(lastActivityDate);

  return {
    currentStreak,
    longestStreak,
    isActive: active,
    hoursUntilExpiry,
    availableFreezes,
    lastActivityDate,
    streakBroken: !active && currentStreak > 0,
  };
}

/**
 * Get streak milestone rewards
 */
export function getStreakMilestoneRewards(streak: number): {
  freezeEarned: boolean;
  xpBonus: number;
  milestoneReached: number | null;
} {
  const milestones = [7, 14, 30, 60, 100, 365];
  const milestoneReached = milestones.find((m) => streak === m) || null;

  // XP bonuses for milestones
  const xpBonuses: Record<number, number> = {
    7: 50,
    14: 100,
    30: 250,
    60: 500,
    100: 1000,
    365: 5000,
  };

  return {
    freezeEarned: streak > 0 && streak % STREAK_FREEZE_MILESTONE === 0,
    xpBonus: milestoneReached ? xpBonuses[milestoneReached] || 0 : 0,
    milestoneReached,
  };
}

/**
 * Format streak for display
 */
export function formatStreakDisplay(streak: number): string {
  if (streak === 0) return 'No streak';
  if (streak === 1) return '1 day';
  return `${streak} days`;
}

/**
 * Get streak emoji based on length
 */
export function getStreakEmoji(streak: number): string {
  if (streak >= 365) return '🏆';
  if (streak >= 100) return '💎';
  if (streak >= 30) return '🔥';
  if (streak >= 7) return '⚡';
  if (streak >= 1) return '✨';
  return '💤';
}
