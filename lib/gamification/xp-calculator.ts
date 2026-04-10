/**
 * XP Calculator
 *
 * Calculates XP earned from activities based on:
 * - Base XP per activity
 * - Duration bonus (1 XP per minute, max 120)
 * - TSS bonus (0.5 XP per TSS point)
 * - Streak multiplier (+10% per streak day, max 50%)
 */

export interface ActivityXPInput {
  /** Duration in seconds */
  duration: number;
  /** Training Stress Score (optional) */
  tss?: number;
  /** Current streak days */
  streakDays: number;
  /** Activity type for potential bonuses */
  activityType?: string;
}

export interface XPBreakdown {
  base: number;
  duration: number;
  tss: number;
  streakMultiplier: number;
  total: number;
}

// Constants
const BASE_XP = 10;
const XP_PER_MINUTE = 1;
const MAX_DURATION_XP = 120;
const XP_PER_TSS = 0.5;
const STREAK_BONUS_PER_DAY = 0.1; // 10%
const MAX_STREAK_BONUS = 0.5; // 50%

/**
 * Calculate XP earned from an activity
 */
export function calculateActivityXP(input: ActivityXPInput): XPBreakdown {
  const { duration, tss = 0, streakDays } = input;

  // Base XP
  const base = BASE_XP;

  // Duration bonus (convert seconds to minutes)
  const durationMinutes = Math.floor(duration / 60);
  const durationXP = Math.min(durationMinutes * XP_PER_MINUTE, MAX_DURATION_XP);

  // TSS bonus
  const tssXP = Math.floor(tss * XP_PER_TSS);

  // Calculate subtotal before streak
  const subtotal = base + durationXP + tssXP;

  // Streak multiplier
  const streakBonus = Math.min(streakDays * STREAK_BONUS_PER_DAY, MAX_STREAK_BONUS);
  const streakMultiplier = Math.floor(subtotal * streakBonus);

  // Total XP
  const total = subtotal + streakMultiplier;

  return {
    base,
    duration: durationXP,
    tss: tssXP,
    streakMultiplier,
    total,
  };
}

/**
 * Calculate total XP needed to reach a specific level
 */
export function getXPForLevel(level: number): number {
  if (level <= 1) return 0;

  let totalXP = 0;

  for (let i = 2; i <= level; i++) {
    totalXP += getXPRequiredForNextLevel(i - 1);
  }

  return totalXP;
}

/**
 * Get XP required to advance from current level to next
 */
export function getXPRequiredForNextLevel(currentLevel: number): number {
  if (currentLevel <= 10) {
    return 100;
  } else if (currentLevel <= 25) {
    return 200;
  } else if (currentLevel <= 50) {
    return 400;
  } else {
    return 800;
  }
}

/**
 * Calculate level from total XP
 */
export function getLevelFromXP(totalXP: number): number {
  let level = 1;
  let xpRemaining = totalXP;

  while (xpRemaining >= getXPRequiredForNextLevel(level)) {
    xpRemaining -= getXPRequiredForNextLevel(level);
    level++;
  }

  return level;
}

/**
 * Get progress toward next level (0-100)
 */
export function getLevelProgress(totalXP: number): number {
  const currentLevel = getLevelFromXP(totalXP);
  const xpForCurrentLevel = getXPForLevel(currentLevel);
  const xpIntoLevel = totalXP - xpForCurrentLevel;
  const xpNeeded = getXPRequiredForNextLevel(currentLevel);

  return Math.floor((xpIntoLevel / xpNeeded) * 100);
}

/**
 * Calculate XP remaining until next level
 */
export function getXPUntilNextLevel(totalXP: number): number {
  const currentLevel = getLevelFromXP(totalXP);
  const xpForNextLevel = getXPForLevel(currentLevel + 1);
  return xpForNextLevel - totalXP;
}

// Evolution stage logic moved to evolution-manager (single source of truth).
// Use: getEvolutionStage, EVOLUTION_NAMES, getNextEvolutionRequirements from '@/lib/gamification' (re-exported from evolution-manager).
