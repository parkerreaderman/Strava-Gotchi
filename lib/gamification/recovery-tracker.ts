/**
 * Recovery Tracker
 *
 * Handles rest day detection and logging:
 * - Auto-detect rest days (no activity for 24+ hours)
 * - Low-intensity activities can count as "active recovery"
 * - Manual rest day logging with notes
 * - Recovery quality tracking
 */

export type RestDayType = 'auto_detected' | 'manual' | 'active_recovery';

export interface RestDay {
  id: number;
  userId: number;
  date: Date;
  type: RestDayType;
  notes: string | null;
  quality: number | null; // 1-5 rating
}

export interface RecoveryStatus {
  needsRest: boolean;
  consecutiveTrainingDays: number;
  lastRestDay: Date | null;
  recoveryScore: number; // 0-100
  recommendation: string;
}

export interface RecoveryMetrics {
  restDaysThisWeek: number;
  restDaysThisMonth: number;
  avgRestDayQuality: number | null;
  trainingToRestRatio: number;
  recoveryStreak: number; // Days since last proper rest
}

// Constants
const HOURS_FOR_AUTO_REST = 24;
const ACTIVE_RECOVERY_MAX_DURATION = 30 * 60; // 30 minutes
const ACTIVE_RECOVERY_MAX_INTENSITY = 0.6; // 60% of max HR
const IDEAL_REST_DAYS_PER_WEEK = 2;
const MAX_CONSECUTIVE_TRAINING_DAYS = 5;

/**
 * Check if an activity qualifies as active recovery
 */
export function isActiveRecovery(
  durationSeconds: number,
  avgHeartRate: number | null,
  maxHeartRate: number | null,
  userMaxHR: number = 190
): boolean {
  // Must be short duration
  if (durationSeconds > ACTIVE_RECOVERY_MAX_DURATION) {
    return false;
  }

  // If we have HR data, check intensity
  if (avgHeartRate && maxHeartRate) {
    const intensity = avgHeartRate / userMaxHR;
    return intensity < ACTIVE_RECOVERY_MAX_INTENSITY;
  }

  // Without HR data, assume short activities are recovery
  return durationSeconds <= 20 * 60; // 20 minutes or less
}

/**
 * Check if a rest day should be auto-detected
 */
export function shouldAutoDetectRestDay(
  lastActivityDate: Date | null,
  currentDate: Date = new Date()
): boolean {
  if (!lastActivityDate) {
    return false; // No activities yet
  }

  const hoursSinceActivity =
    (currentDate.getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60);

  return hoursSinceActivity >= HOURS_FOR_AUTO_REST;
}

/**
 * Calculate recovery score (0-100)
 * Based on rest frequency, quality, and training load
 */
export function calculateRecoveryScore(
  restDaysLast7Days: number,
  consecutiveTrainingDays: number,
  avgRestQuality: number | null,
  currentTSB: number // Training Stress Balance
): number {
  let score = 50; // Start at neutral

  // Rest frequency component (±20 points)
  const restRatio = restDaysLast7Days / 7;
  const idealRatio = IDEAL_REST_DAYS_PER_WEEK / 7;
  const restScore = Math.min(20, (restRatio / idealRatio) * 20);
  score += restScore;

  // Consecutive training penalty (up to -20 points)
  if (consecutiveTrainingDays > MAX_CONSECUTIVE_TRAINING_DAYS) {
    const overtrainDays = consecutiveTrainingDays - MAX_CONSECUTIVE_TRAINING_DAYS;
    score -= Math.min(20, overtrainDays * 5);
  }

  // Rest quality bonus (up to +15 points)
  if (avgRestQuality) {
    score += (avgRestQuality / 5) * 15;
  }

  // TSB component (±15 points)
  // Positive TSB = well-rested, negative = fatigued
  if (currentTSB > 0) {
    score += Math.min(15, currentTSB * 0.5);
  } else {
    score += Math.max(-15, currentTSB * 0.3);
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Get recovery recommendation based on metrics
 */
export function getRecoveryRecommendation(
  recoveryScore: number,
  consecutiveTrainingDays: number,
  currentTSB: number
): string {
  // Critical rest needed
  if (recoveryScore < 30 || consecutiveTrainingDays >= 7) {
    return 'Take a full rest day today. Your body needs recovery.';
  }

  // Rest recommended
  if (recoveryScore < 50 || consecutiveTrainingDays >= 5) {
    return 'Consider a rest day or light active recovery.';
  }

  // TSB-based recommendations
  if (currentTSB < -20) {
    return 'You are carrying significant fatigue. Easy training recommended.';
  }

  if (currentTSB < -10) {
    return 'Moderate fatigue detected. Listen to your body.';
  }

  // Good recovery
  if (recoveryScore >= 70) {
    return 'Well recovered! Ready for quality training.';
  }

  return 'Recovery looks good. Train as planned.';
}

/**
 * Get recovery status summary
 */
export function getRecoveryStatus(
  lastActivityDate: Date | null,
  lastRestDay: Date | null,
  consecutiveTrainingDays: number,
  restDaysLast7Days: number,
  avgRestQuality: number | null,
  currentTSB: number
): RecoveryStatus {
  const recoveryScore = calculateRecoveryScore(
    restDaysLast7Days,
    consecutiveTrainingDays,
    avgRestQuality,
    currentTSB
  );

  const needsRest =
    recoveryScore < 40 ||
    consecutiveTrainingDays >= MAX_CONSECUTIVE_TRAINING_DAYS ||
    currentTSB < -25;

  const recommendation = getRecoveryRecommendation(
    recoveryScore,
    consecutiveTrainingDays,
    currentTSB
  );

  return {
    needsRest,
    consecutiveTrainingDays,
    lastRestDay,
    recoveryScore,
    recommendation,
  };
}

/**
 * Calculate recovery metrics
 */
export function calculateRecoveryMetrics(
  restDays: RestDay[],
  activitiesLast30Days: number,
  lastRestDay: Date | null
): RecoveryMetrics {
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Count rest days
  const restDaysThisWeek = restDays.filter(
    (rd) => new Date(rd.date) >= oneWeekAgo
  ).length;
  const restDaysThisMonth = restDays.filter(
    (rd) => new Date(rd.date) >= oneMonthAgo
  ).length;

  // Calculate average quality
  const qualityRatings = restDays
    .filter((rd) => rd.quality !== null)
    .map((rd) => rd.quality as number);
  const avgRestDayQuality =
    qualityRatings.length > 0
      ? qualityRatings.reduce((a, b) => a + b, 0) / qualityRatings.length
      : null;

  // Training to rest ratio (this month)
  const trainingDaysThisMonth = activitiesLast30Days;
  const trainingToRestRatio =
    restDaysThisMonth > 0
      ? trainingDaysThisMonth / restDaysThisMonth
      : trainingDaysThisMonth;

  // Recovery streak (days since last rest)
  const recoveryStreak = lastRestDay
    ? Math.floor((now.getTime() - new Date(lastRestDay).getTime()) / (24 * 60 * 60 * 1000))
    : 0;

  return {
    restDaysThisWeek,
    restDaysThisMonth,
    avgRestDayQuality,
    trainingToRestRatio: Math.round(trainingToRestRatio * 10) / 10,
    recoveryStreak,
  };
}

/**
 * Get rest day quality labels
 */
export function getQualityLabel(quality: number): string {
  const labels: Record<number, string> = {
    1: 'Poor - Still tired',
    2: 'Fair - Some recovery',
    3: 'Good - Rested',
    4: 'Great - Refreshed',
    5: 'Excellent - Fully recovered',
  };
  return labels[quality] || 'Unknown';
}

/**
 * Get recovery score color
 */
export function getRecoveryScoreColor(score: number): string {
  if (score >= 70) return '#22C55E'; // Green
  if (score >= 50) return '#EAB308'; // Yellow
  if (score >= 30) return '#F97316'; // Orange
  return '#EF4444'; // Red
}

/**
 * Format recovery score for display
 */
export function formatRecoveryScore(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  if (score >= 20) return 'Low';
  return 'Critical';
}

/**
 * Calculate XP bonus for logging rest day
 */
export function getRestDayXPBonus(quality: number | null): number {
  const baseXP = 10;
  if (!quality) return baseXP;

  // Bonus for rating quality
  const qualityBonus = quality * 2; // 2-10 XP
  return baseXP + qualityBonus;
}

/**
 * Check if user has a "balanced training" pattern
 * (Good for achievements)
 */
export function hasBalancedTraining(
  restDaysLast7Days: number,
  trainingDaysLast7Days: number
): boolean {
  // Ideal: 2 rest days, 5 training days
  const restOk = restDaysLast7Days >= 1 && restDaysLast7Days <= 3;
  const trainingOk = trainingDaysLast7Days >= 3 && trainingDaysLast7Days <= 6;
  return restOk && trainingOk;
}
