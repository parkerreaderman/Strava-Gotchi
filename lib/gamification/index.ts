/**
 * Gamification Module
 *
 * Exports all gamification-related utilities
 */

// XP & Leveling
export {
  calculateActivityXP,
  getXPForLevel,
  getXPRequiredForNextLevel,
  getLevelFromXP,
  getLevelProgress,
  getXPUntilNextLevel,
} from './xp-calculator';
export type { ActivityXPInput, XPBreakdown } from './xp-calculator';

// Evolution (single source of truth: evolution-manager)
export {
  getEvolutionStage,
  getNextEvolutionRequirements,
  EVOLUTION_NAMES,
} from './evolution-manager';

// Streaks
export {
  activityQualifiesForStreak,
  getHoursUntilStreakExpiry,
  isStreakActive,
  calculateNewStreak,
  shouldAwardStreakFreeze,
  applyStreakFreeze,
  generateStreakFreezeExpiry,
  getStreakStatus,
  getStreakMilestoneRewards,
  formatStreakDisplay,
  getStreakEmoji,
} from './streak-manager';
export type { StreakStatus, StreakFreeze } from './streak-manager';

// Achievements
export {
  DEFAULT_ACHIEVEMENTS,
  checkAchievementQualification,
  checkAllAchievements,
  checkActivityAchievements,
  getAchievementBySlug,
  getAchievementsByCategory,
  getAchievementsByTier,
  calculateAchievementXP,
} from './achievement-checker';
export type {
  AchievementCategory,
  AchievementTier,
  AchievementRequirement,
  AchievementDefinition,
  UserStats,
} from './achievement-checker';

// Challenges
export {
  DAILY_CHALLENGES,
  WEEKLY_CHALLENGES,
  getDailyChallengeWindow,
  getWeeklyChallengeWindow,
  selectRandomChallenges,
  calculateProgress,
  updateChallengeProgress,
  formatRequirement,
  formatProgress,
  getTimeRemaining,
  formatTimeRemaining,
} from './challenge-manager';
export type {
  ChallengeType,
  ChallengeRequirement,
  ChallengeDefinition,
  ChallengeProgress,
} from './challenge-manager';

// Evolution (single source of truth)
export {
  EVOLUTION_STAGES,
  EVOLUTION_REQUIREMENTS,
  calculateEvolutionStage,
  getEvolutionInfo,
  getEvolutionProgress,
  canAccessWearable,
  getUnlockedItems,
  getAuraConfig,
  getBadgeConfig,
  formatEvolutionDisplay,
  getEvolutionMotivation,
} from './evolution-manager';
export type {
  EvolutionStage,
  EvolutionRequirements,
  EvolutionInfo,
  EvolutionProgress,
} from './evolution-manager';

// Recovery
export {
  isActiveRecovery,
  shouldAutoDetectRestDay,
  calculateRecoveryScore,
  getRecoveryRecommendation,
  getRecoveryStatus,
  calculateRecoveryMetrics,
  getQualityLabel,
  getRecoveryScoreColor,
  formatRecoveryScore,
  getRestDayXPBonus,
  hasBalancedTraining,
} from './recovery-tracker';
export type {
  RestDayType,
  RestDay,
  RecoveryStatus,
  RecoveryMetrics,
} from './recovery-tracker';
