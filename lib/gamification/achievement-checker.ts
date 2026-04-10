/**
 * Achievement Checker
 *
 * Checks and awards achievements based on user stats and activities.
 * Categories: distance, streak, consistency, milestone, special
 */

export type AchievementCategory = 'distance' | 'streak' | 'consistency' | 'milestone' | 'special';
export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface AchievementRequirement {
  type: 'distance' | 'streak' | 'activities' | 'duration' | 'level' | 'tss' | 'custom';
  value: number;
  /** Optional: timeframe in days (e.g., 4 activities in 7 days) */
  timeframeDays?: number;
}

export interface AchievementDefinition {
  slug: string;
  name: string;
  description: string;
  category: AchievementCategory;
  tier: AchievementTier;
  xpReward: number;
  requirement: AchievementRequirement;
  sortOrder: number;
}

export interface UserStats {
  totalDistance: number; // in meters
  totalDuration: number; // in seconds
  totalActivities: number;
  currentStreak: number;
  longestStreak: number;
  level: number;
  /** Activities in the last N days for consistency checks */
  recentActivityCounts?: Record<number, number>; // { 7: 4, 30: 15 }
  /** Highest single-activity TSS */
  maxSingleTss?: number;
  /** Has completed first activity */
  hasFirstActivity: boolean;
}

/**
 * Default achievement definitions
 */
export const DEFAULT_ACHIEVEMENTS: AchievementDefinition[] = [
  // Distance achievements
  {
    slug: 'first-steps',
    name: 'First Steps',
    description: 'Complete your first activity',
    category: 'milestone',
    tier: 'bronze',
    xpReward: 25,
    requirement: { type: 'activities', value: 1 },
    sortOrder: 1,
  },
  {
    slug: 'distance-10k',
    name: '10K Club',
    description: 'Log 10 kilometers total',
    category: 'distance',
    tier: 'bronze',
    xpReward: 50,
    requirement: { type: 'distance', value: 10000 },
    sortOrder: 10,
  },
  {
    slug: 'distance-100k',
    name: 'Century Runner',
    description: 'Log 100 kilometers total',
    category: 'distance',
    tier: 'silver',
    xpReward: 150,
    requirement: { type: 'distance', value: 100000 },
    sortOrder: 11,
  },
  {
    slug: 'distance-500k',
    name: 'Half Thousand',
    description: 'Log 500 kilometers total',
    category: 'distance',
    tier: 'gold',
    xpReward: 400,
    requirement: { type: 'distance', value: 500000 },
    sortOrder: 12,
  },
  {
    slug: 'distance-1000k',
    name: 'Thousand Mile Club',
    description: 'Log 1,000 kilometers total',
    category: 'distance',
    tier: 'platinum',
    xpReward: 1000,
    requirement: { type: 'distance', value: 1000000 },
    sortOrder: 13,
  },

  // Streak achievements
  {
    slug: 'streak-7',
    name: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    category: 'streak',
    tier: 'bronze',
    xpReward: 75,
    requirement: { type: 'streak', value: 7 },
    sortOrder: 20,
  },
  {
    slug: 'streak-30',
    name: 'Monthly Master',
    description: 'Maintain a 30-day streak',
    category: 'streak',
    tier: 'silver',
    xpReward: 250,
    requirement: { type: 'streak', value: 30 },
    sortOrder: 21,
  },
  {
    slug: 'streak-100',
    name: 'Century Streak',
    description: 'Maintain a 100-day streak',
    category: 'streak',
    tier: 'gold',
    xpReward: 750,
    requirement: { type: 'streak', value: 100 },
    sortOrder: 22,
  },
  {
    slug: 'streak-365',
    name: 'Year of Dedication',
    description: 'Maintain a 365-day streak',
    category: 'streak',
    tier: 'platinum',
    xpReward: 2500,
    requirement: { type: 'streak', value: 365 },
    sortOrder: 23,
  },

  // Consistency achievements
  {
    slug: 'consistent-week',
    name: 'Consistent Week',
    description: 'Complete 4+ activities in a week',
    category: 'consistency',
    tier: 'bronze',
    xpReward: 50,
    requirement: { type: 'activities', value: 4, timeframeDays: 7 },
    sortOrder: 30,
  },
  {
    slug: 'consistent-month',
    name: 'Monthly Momentum',
    description: 'Complete 16+ activities in a month',
    category: 'consistency',
    tier: 'silver',
    xpReward: 200,
    requirement: { type: 'activities', value: 16, timeframeDays: 30 },
    sortOrder: 31,
  },

  // Milestone achievements
  {
    slug: 'activities-10',
    name: 'Getting Started',
    description: 'Complete 10 activities',
    category: 'milestone',
    tier: 'bronze',
    xpReward: 50,
    requirement: { type: 'activities', value: 10 },
    sortOrder: 40,
  },
  {
    slug: 'activities-50',
    name: 'Dedicated Athlete',
    description: 'Complete 50 activities',
    category: 'milestone',
    tier: 'silver',
    xpReward: 150,
    requirement: { type: 'activities', value: 50 },
    sortOrder: 41,
  },
  {
    slug: 'activities-100',
    name: 'Century Club',
    description: 'Complete 100 activities',
    category: 'milestone',
    tier: 'gold',
    xpReward: 350,
    requirement: { type: 'activities', value: 100 },
    sortOrder: 42,
  },
  {
    slug: 'activities-500',
    name: 'Legendary Athlete',
    description: 'Complete 500 activities',
    category: 'milestone',
    tier: 'platinum',
    xpReward: 1500,
    requirement: { type: 'activities', value: 500 },
    sortOrder: 43,
  },

  // Level achievements
  {
    slug: 'level-10',
    name: 'Double Digits',
    description: 'Reach level 10',
    category: 'milestone',
    tier: 'bronze',
    xpReward: 100,
    requirement: { type: 'level', value: 10 },
    sortOrder: 50,
  },
  {
    slug: 'level-25',
    name: 'Quarter Century',
    description: 'Reach level 25',
    category: 'milestone',
    tier: 'silver',
    xpReward: 250,
    requirement: { type: 'level', value: 25 },
    sortOrder: 51,
  },
  {
    slug: 'level-50',
    name: 'Half Way There',
    description: 'Reach level 50',
    category: 'milestone',
    tier: 'gold',
    xpReward: 500,
    requirement: { type: 'level', value: 50 },
    sortOrder: 52,
  },
  {
    slug: 'level-100',
    name: 'Centurion',
    description: 'Reach level 100',
    category: 'milestone',
    tier: 'platinum',
    xpReward: 2000,
    requirement: { type: 'level', value: 100 },
    sortOrder: 53,
  },

  // Special achievements
  {
    slug: 'tss-100',
    name: 'Century Load',
    description: 'Complete an activity with 100+ TSS',
    category: 'special',
    tier: 'gold',
    xpReward: 200,
    requirement: { type: 'tss', value: 100 },
    sortOrder: 60,
  },
  {
    slug: 'hour-plus',
    name: 'Hour Power',
    description: 'Complete an activity over 1 hour',
    category: 'special',
    tier: 'bronze',
    xpReward: 50,
    requirement: { type: 'duration', value: 3600 },
    sortOrder: 61,
  },
  {
    slug: 'two-hours',
    name: 'Endurance King',
    description: 'Complete an activity over 2 hours',
    category: 'special',
    tier: 'silver',
    xpReward: 150,
    requirement: { type: 'duration', value: 7200 },
    sortOrder: 62,
  },
];

/**
 * Check if user qualifies for an achievement
 */
export function checkAchievementQualification(
  achievement: AchievementDefinition,
  stats: UserStats
): boolean {
  const { requirement } = achievement;

  switch (requirement.type) {
    case 'distance':
      return stats.totalDistance >= requirement.value;

    case 'streak':
      return stats.currentStreak >= requirement.value || stats.longestStreak >= requirement.value;

    case 'activities':
      if (requirement.timeframeDays && stats.recentActivityCounts) {
        const count = stats.recentActivityCounts[requirement.timeframeDays] || 0;
        return count >= requirement.value;
      }
      return stats.totalActivities >= requirement.value;

    case 'duration':
      // For single-activity duration checks, this should be called per-activity
      return stats.totalDuration >= requirement.value;

    case 'level':
      return stats.level >= requirement.value;

    case 'tss':
      return (stats.maxSingleTss || 0) >= requirement.value;

    default:
      return false;
  }
}

/**
 * Check all achievements and return newly qualified ones
 */
export function checkAllAchievements(
  stats: UserStats,
  earnedSlugs: string[]
): AchievementDefinition[] {
  const newlyEarned: AchievementDefinition[] = [];

  for (const achievement of DEFAULT_ACHIEVEMENTS) {
    // Skip if already earned
    if (earnedSlugs.includes(achievement.slug)) {
      continue;
    }

    // Check if qualified
    if (checkAchievementQualification(achievement, stats)) {
      newlyEarned.push(achievement);
    }
  }

  return newlyEarned;
}

/**
 * Check single-activity achievements (TSS, duration, etc.)
 */
export function checkActivityAchievements(
  activityDuration: number,
  activityTss: number | null,
  earnedSlugs: string[]
): AchievementDefinition[] {
  const newlyEarned: AchievementDefinition[] = [];

  for (const achievement of DEFAULT_ACHIEVEMENTS) {
    if (earnedSlugs.includes(achievement.slug)) {
      continue;
    }

    const { requirement } = achievement;

    // Check single-activity duration
    if (requirement.type === 'duration' && activityDuration >= requirement.value) {
      newlyEarned.push(achievement);
    }

    // Check single-activity TSS
    if (requirement.type === 'tss' && activityTss && activityTss >= requirement.value) {
      newlyEarned.push(achievement);
    }
  }

  return newlyEarned;
}

/**
 * Get achievement by slug
 */
export function getAchievementBySlug(slug: string): AchievementDefinition | undefined {
  return DEFAULT_ACHIEVEMENTS.find((a) => a.slug === slug);
}

/**
 * Get achievements by category
 */
export function getAchievementsByCategory(category: AchievementCategory): AchievementDefinition[] {
  return DEFAULT_ACHIEVEMENTS.filter((a) => a.category === category).sort(
    (a, b) => a.sortOrder - b.sortOrder
  );
}

/**
 * Get achievements by tier
 */
export function getAchievementsByTier(tier: AchievementTier): AchievementDefinition[] {
  return DEFAULT_ACHIEVEMENTS.filter((a) => a.tier === tier).sort(
    (a, b) => a.sortOrder - b.sortOrder
  );
}

/**
 * Calculate total XP from achievements
 */
export function calculateAchievementXP(earnedSlugs: string[]): number {
  return earnedSlugs.reduce((total, slug) => {
    const achievement = getAchievementBySlug(slug);
    return total + (achievement?.xpReward || 0);
  }, 0);
}
