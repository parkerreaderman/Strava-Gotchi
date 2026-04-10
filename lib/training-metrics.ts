/**
 * Training load calculations based on Intervals.icu methodology
 * These metrics help track fitness, fatigue, and form
 */

export interface Activity {
  date: string;
  duration: number; // in seconds
  averageHeartRate?: number;
  maxHeartRate?: number;
  type: string;
  name?: string;
  distance?: number;
  tss?: number; // If provided by Strava
}

export interface TrainingMetrics {
  ctl: number; // Chronic Training Load (Fitness) - 42 day average
  atl: number; // Acute Training Load (Fatigue) - 7 day average
  tsb: number; // Training Stress Balance (Form) = CTL - ATL
  totalTSS: number; // Total TSS for the period
}

export type FatigueState = 'fresh' | 'optimal' | 'trained' | 'fatigued' | 'overtrained';

/**
 * Calculate Training Stress Score (TSS) for an activity
 * Using heart rate-based calculation (hrTSS)
 * Formula: hrTSS = duration (hours) × intensity factor² × 100
 */
export function calculateTSS(activity: Activity, userMaxHR: number, userRestingHR: number): number {
  if (activity.tss) return activity.tss;

  if (!activity.averageHeartRate) {
    // Fallback: estimate based on duration and activity type
    return estimateTSSByDuration(activity);
  }

  const durationHours = activity.duration / 3600;

  // Calculate heart rate reserve percentage
  const hrReserve = userMaxHR - userRestingHR;
  const workingHR = activity.averageHeartRate - userRestingHR;
  const intensityFactor = workingHR / hrReserve;

  // TSS formula
  const tss = durationHours * Math.pow(intensityFactor, 2) * 100;

  return Math.max(0, Math.round(tss));
}

/**
 * Estimate TSS when heart rate data is unavailable
 */
function estimateTSSByDuration(activity: Activity): number {
  const durationHours = activity.duration / 3600;

  // Rough estimates by activity type
  const intensityMultipliers: { [key: string]: number } = {
    'Run': 80,
    'Ride': 70,
    'Swim': 75,
    'Walk': 40,
    'Hike': 50,
    'WeightTraining': 60,
    'Workout': 65,
  };

  const multiplier = intensityMultipliers[activity.type] || 60;
  return Math.round(durationHours * multiplier);
}

/**
 * Calculate exponentially weighted moving average
 * Used for CTL and ATL calculations
 */
function calculateEWMA(previousValue: number, todayTSS: number, timeConstant: number): number {
  const alpha = 2 / (timeConstant + 1);
  return previousValue + alpha * (todayTSS - previousValue);
}

/**
 * Calculate training metrics (CTL, ATL, TSB) from activity history
 */
export function calculateTrainingMetrics(
  activities: Activity[],
  userMaxHR: number = 190,
  userRestingHR: number = 60
): TrainingMetrics {
  // Sort activities by date
  const sortedActivities = [...activities].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  let ctl = 0; // Fitness (42-day average)
  let atl = 0; // Fatigue (7-day average)
  let totalTSS = 0;

  // Calculate daily TSS and running metrics
  const dailyTSS = new Map<string, number>();

  sortedActivities.forEach(activity => {
    const tss = calculateTSS(activity, userMaxHR, userRestingHR);
    const dateKey = activity.date.split('T')[0];
    dailyTSS.set(dateKey, (dailyTSS.get(dateKey) || 0) + tss);
    totalTSS += tss;
  });

  // Calculate CTL and ATL using exponential weighted moving average
  const dates = Array.from(dailyTSS.keys()).sort();

  dates.forEach(date => {
    const tss = dailyTSS.get(date) || 0;
    ctl = calculateEWMA(ctl, tss, 42);
    atl = calculateEWMA(atl, tss, 7);
  });

  // Training Stress Balance (Form)
  const tsb = ctl - atl;

  return {
    ctl: Math.round(ctl),
    atl: Math.round(atl),
    tsb: Math.round(tsb),
    totalTSS: Math.round(totalTSS),
  };
}

/**
 * Determine fatigue state based on TSB
 * This drives the character's appearance and state
 */
export function getFatigueState(tsb: number): FatigueState {
  if (tsb > 25) return 'fresh';          // Well rested, might be losing fitness
  if (tsb >= 5) return 'optimal';        // Ready to perform
  if (tsb >= -10) return 'trained';      // Slightly fatigued but building fitness
  if (tsb >= -30) return 'fatigued';     // Need recovery soon
  return 'overtrained';                   // Risk of overtraining, need rest
}

/**
 * Get a description of the current training state
 */
export function getStateDescription(state: FatigueState): string {
  const descriptions = {
    fresh: "Well rested and ready to train! Consider a harder workout.",
    optimal: "Peak form! Great time for a race or hard session.",
    trained: "Building fitness nicely. Keep up the good work!",
    fatigued: "Getting tired. Consider easier training or rest.",
    overtrained: "Very fatigued! You need recovery time.",
  };

  return descriptions[state];
}

/**
 * Short one-line description for hero status (v3 simplified UI)
 */
export function getShortStateDescription(state: FatigueState): string {
  const descriptions: Record<FatigueState, string> = {
    fresh: 'Ready to train hard',
    optimal: 'Peak form — go race!',
    trained: 'Building fitness nicely',
    fatigued: 'Time for easier training',
    overtrained: 'Rest day needed',
  };
  return descriptions[state];
}

export interface ReadinessSummary {
  metrics: TrainingMetrics;
  state: FatigueState;
  description: string;
}

/**
 * Thin service wrapper that provides an object-oriented interface so the same
 * configuration (heart-rate profile) can be reused across the app and tests.
 */
export class TrainingMetricsService {
  constructor(
    private readonly options: { maxHR: number; restingHR: number } = {
      maxHR: 190,
      restingHR: 60,
    }
  ) {}

  calculate(activities: Activity[]): TrainingMetrics {
    return calculateTrainingMetrics(
      activities,
      this.options.maxHR,
      this.options.restingHR
    );
  }

  summarize(activities: Activity[]): ReadinessSummary {
    const metrics = this.calculate(activities);
    const state = getFatigueState(metrics.tsb);
    return {
      metrics,
      state,
      description: getStateDescription(state),
    };
  }
}
