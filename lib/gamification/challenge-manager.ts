/**
 * Challenge Manager
 *
 * Handles daily and weekly challenges:
 * - Daily challenges reset at midnight
 * - Weekly challenges reset on Monday
 * - Progress tracked per user
 */

export type ChallengeType = 'daily' | 'weekly';

export interface ChallengeRequirement {
  type: 'duration' | 'distance' | 'activities' | 'tss';
  value: number;
}

export interface ChallengeDefinition {
  slug: string;
  name: string;
  description: string;
  type: ChallengeType;
  requirement: ChallengeRequirement;
  xpReward: number;
}

export interface ChallengeProgress {
  challengeId: number;
  progress: number; // 0-100
  currentValue: number;
  targetValue: number;
  completed: boolean;
  claimed: boolean;
}

/**
 * Daily challenge templates
 */
export const DAILY_CHALLENGES: ChallengeDefinition[] = [
  {
    slug: 'daily-30min',
    name: 'Half Hour Hero',
    description: 'Complete 30 minutes of activity',
    type: 'daily',
    requirement: { type: 'duration', value: 1800 }, // 30 min in seconds
    xpReward: 25,
  },
  {
    slug: 'daily-45min',
    name: 'Extended Effort',
    description: 'Complete 45 minutes of activity',
    type: 'daily',
    requirement: { type: 'duration', value: 2700 },
    xpReward: 35,
  },
  {
    slug: 'daily-60min',
    name: 'Hour of Power',
    description: 'Complete 60 minutes of activity',
    type: 'daily',
    requirement: { type: 'duration', value: 3600 },
    xpReward: 50,
  },
  {
    slug: 'daily-5k',
    name: '5K Day',
    description: 'Cover 5 kilometers',
    type: 'daily',
    requirement: { type: 'distance', value: 5000 },
    xpReward: 30,
  },
  {
    slug: 'daily-10k',
    name: '10K Day',
    description: 'Cover 10 kilometers',
    type: 'daily',
    requirement: { type: 'distance', value: 10000 },
    xpReward: 50,
  },
  {
    slug: 'daily-tss-30',
    name: 'Training Load',
    description: 'Accumulate 30 TSS',
    type: 'daily',
    requirement: { type: 'tss', value: 30 },
    xpReward: 35,
  },
  {
    slug: 'daily-tss-50',
    name: 'Heavy Load',
    description: 'Accumulate 50 TSS',
    type: 'daily',
    requirement: { type: 'tss', value: 50 },
    xpReward: 50,
  },
];

/**
 * Weekly challenge templates
 */
export const WEEKLY_CHALLENGES: ChallengeDefinition[] = [
  {
    slug: 'weekly-3-activities',
    name: 'Active Week',
    description: 'Complete 3 activities this week',
    type: 'weekly',
    requirement: { type: 'activities', value: 3 },
    xpReward: 75,
  },
  {
    slug: 'weekly-5-activities',
    name: 'Dedicated Week',
    description: 'Complete 5 activities this week',
    type: 'weekly',
    requirement: { type: 'activities', value: 5 },
    xpReward: 125,
  },
  {
    slug: 'weekly-3h',
    name: '3-Hour Week',
    description: 'Log 3 hours of activity this week',
    type: 'weekly',
    requirement: { type: 'duration', value: 10800 },
    xpReward: 100,
  },
  {
    slug: 'weekly-5h',
    name: '5-Hour Week',
    description: 'Log 5 hours of activity this week',
    type: 'weekly',
    requirement: { type: 'duration', value: 18000 },
    xpReward: 150,
  },
  {
    slug: 'weekly-25k',
    name: '25K Week',
    description: 'Cover 25 kilometers this week',
    type: 'weekly',
    requirement: { type: 'distance', value: 25000 },
    xpReward: 100,
  },
  {
    slug: 'weekly-50k',
    name: '50K Week',
    description: 'Cover 50 kilometers this week',
    type: 'weekly',
    requirement: { type: 'distance', value: 50000 },
    xpReward: 175,
  },
  {
    slug: 'weekly-tss-150',
    name: 'Training Block',
    description: 'Accumulate 150 TSS this week',
    type: 'weekly',
    requirement: { type: 'tss', value: 150 },
    xpReward: 125,
  },
  {
    slug: 'weekly-tss-250',
    name: 'Big Week',
    description: 'Accumulate 250 TSS this week',
    type: 'weekly',
    requirement: { type: 'tss', value: 250 },
    xpReward: 200,
  },
];

/**
 * Get current daily challenge start/end times
 */
export function getDailyChallengeWindow(): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  return { start, end };
}

/**
 * Get current weekly challenge start/end times (Monday to Sunday)
 */
export function getWeeklyChallengeWindow(): { start: Date; end: Date } {
  const now = new Date();
  const dayOfWeek = now.getDay();

  // Calculate Monday of current week
  const monday = new Date(now);
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  monday.setDate(monday.getDate() - daysFromMonday);
  monday.setHours(0, 0, 0, 0);

  // Sunday end of week
  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 7);

  return { start: monday, end: sunday };
}

/**
 * Select random challenges for the day/week
 */
export function selectRandomChallenges(
  type: ChallengeType,
  count: number = 2
): ChallengeDefinition[] {
  const pool = type === 'daily' ? DAILY_CHALLENGES : WEEKLY_CHALLENGES;
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * Calculate progress percentage
 */
export function calculateProgress(current: number, target: number): number {
  if (target <= 0) return 100;
  return Math.min(Math.floor((current / target) * 100), 100);
}

/**
 * Update challenge progress with new activity data
 */
export function updateChallengeProgress(
  challenge: ChallengeDefinition,
  currentProgress: number,
  activityData: {
    duration: number;
    distance: number;
    tss: number;
  }
): { newProgress: number; completed: boolean } {
  const { requirement } = challenge;
  let increment = 0;

  switch (requirement.type) {
    case 'duration':
      increment = activityData.duration;
      break;
    case 'distance':
      increment = activityData.distance;
      break;
    case 'tss':
      increment = activityData.tss;
      break;
    case 'activities':
      increment = 1;
      break;
  }

  const newProgress = currentProgress + increment;
  const completed = newProgress >= requirement.value;

  return { newProgress, completed };
}

/**
 * Format challenge requirement for display
 */
export function formatRequirement(requirement: ChallengeRequirement): string {
  const { type, value } = requirement;

  switch (type) {
    case 'duration':
      const hours = Math.floor(value / 3600);
      const minutes = Math.floor((value % 3600) / 60);
      if (hours > 0) {
        return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
      }
      return `${minutes} min`;

    case 'distance':
      return `${(value / 1000).toFixed(1)} km`;

    case 'activities':
      return `${value} ${value === 1 ? 'activity' : 'activities'}`;

    case 'tss':
      return `${value} TSS`;

    default:
      return `${value}`;
  }
}

/**
 * Format current progress for display
 */
export function formatProgress(
  requirement: ChallengeRequirement,
  current: number
): string {
  const { type } = requirement;

  switch (type) {
    case 'duration':
      const hours = Math.floor(current / 3600);
      const minutes = Math.floor((current % 3600) / 60);
      if (hours > 0) {
        return `${hours}h ${minutes}m`;
      }
      return `${minutes} min`;

    case 'distance':
      return `${(current / 1000).toFixed(1)} km`;

    case 'activities':
      return `${current}`;

    case 'tss':
      return `${Math.round(current)}`;

    default:
      return `${current}`;
  }
}

/**
 * Get time remaining until challenge expires
 */
export function getTimeRemaining(endDate: Date): {
  hours: number;
  minutes: number;
  expired: boolean;
} {
  const now = new Date();
  const diff = endDate.getTime() - now.getTime();

  if (diff <= 0) {
    return { hours: 0, minutes: 0, expired: true };
  }

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return { hours, minutes, expired: false };
}

/**
 * Format time remaining for display
 */
export function formatTimeRemaining(endDate: Date): string {
  const { hours, minutes, expired } = getTimeRemaining(endDate);

  if (expired) return 'Expired';

  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return `${days}d ${remainingHours}h`;
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m`;
}
