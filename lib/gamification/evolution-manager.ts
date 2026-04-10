/**
 * Evolution Manager
 *
 * Handles character evolution stages based on level and fitness metrics.
 * Evolution is accessory-based (badges, auras, stage-specific items).
 *
 * Stages:
 * 1. Rookie   - Level 1+,  CTL 0+   - Basic wearables
 * 2. Regular  - Level 10+, CTL 20+  - Bronze badge, subtle glow
 * 3. Athlete  - Level 25+, CTL 40+  - Silver badge, pulsing aura
 * 4. Elite    - Level 50+, CTL 70+  - Gold badge, energy aura
 * 5. Champion - Level 75+, CTL 100+ - Platinum badge, legendary aura
 */

export type EvolutionStage = 1 | 2 | 3 | 4 | 5;

export interface EvolutionRequirements {
  level: number;
  ctl: number;
}

export interface EvolutionInfo {
  stage: EvolutionStage;
  name: string;
  badge: string;
  aura: string | null;
  color: string;
  unlocks: string[];
}

export interface EvolutionProgress {
  currentStage: EvolutionInfo;
  nextStage: EvolutionInfo | null;
  levelProgress: number; // 0-100
  ctlProgress: number; // 0-100
  canEvolve: boolean;
  blockedBy: 'level' | 'ctl' | null;
}

/**
 * Evolution stage definitions
 */
export const EVOLUTION_STAGES: Record<EvolutionStage, EvolutionInfo> = {
  1: {
    stage: 1,
    name: 'Rookie',
    badge: 'rookie',
    aura: null,
    color: '#9CA3AF', // Gray
    unlocks: ['Basic hats', 'Basic shirts', 'Basic shorts', 'Basic shoes'],
  },
  2: {
    stage: 2,
    name: 'Regular',
    badge: 'regular',
    aura: 'glow',
    color: '#D97706', // Bronze
    unlocks: ['Bronze badge', 'Subtle glow aura', 'Athletic gear'],
  },
  3: {
    stage: 3,
    name: 'Athlete',
    badge: 'athlete',
    aura: 'pulse',
    color: '#6B7280', // Silver
    unlocks: ['Silver badge', 'Pulsing aura', 'Pro gear'],
  },
  4: {
    stage: 4,
    name: 'Elite',
    badge: 'elite',
    aura: 'energy',
    color: '#EAB308', // Gold
    unlocks: ['Gold badge', 'Energy aura', 'Elite accessories'],
  },
  5: {
    stage: 5,
    name: 'Champion',
    badge: 'champion',
    aura: 'legendary',
    color: '#A855F7', // Purple
    unlocks: ['Platinum badge', 'Champion crown', 'Legendary aura'],
  },
};

/**
 * Requirements for each stage (single source of truth for evolution gating)
 */
export const EVOLUTION_REQUIREMENTS: Record<EvolutionStage, EvolutionRequirements> = {
  1: { level: 0, ctl: 0 },
  2: { level: 2, ctl: 20 },
  3: { level: 4, ctl: 40 },
  4: { level: 7, ctl: 70 },
  5: { level: 10, ctl: 100 },
};

/** Stage names for display (derived from EVOLUTION_STAGES) */
export const EVOLUTION_NAMES: Record<EvolutionStage, string> = {
  1: EVOLUTION_STAGES[1].name,
  2: EVOLUTION_STAGES[2].name,
  3: EVOLUTION_STAGES[3].name,
  4: EVOLUTION_STAGES[4].name,
  5: EVOLUTION_STAGES[5].name,
};

/**
 * Calculate evolution stage from level and CTL.
 * This is the single source of truth for evolution stage.
 */
export function calculateEvolutionStage(level: number, ctl: number): EvolutionStage {
  if (level >= 10 && ctl >= 100) return 5;
  if (level >= 7 && ctl >= 70) return 4;
  if (level >= 4 && ctl >= 40) return 3;
  if (level >= 2 && ctl >= 20) return 2;
  return 1;
}

/**
 * Alias for calculateEvolutionStage for backward compatibility.
 * Prefer calculateEvolutionStage in new code.
 */
export function getEvolutionStage(level: number, ctl: number): EvolutionStage {
  return calculateEvolutionStage(level, ctl);
}

/**
 * Get next evolution requirements for a given stage (for UI progress).
 */
export function getNextEvolutionRequirements(currentStage: number): { level: number; ctl: number } | null {
  if (currentStage >= 5) return null;
  const next = (currentStage + 1) as EvolutionStage;
  return EVOLUTION_REQUIREMENTS[next] ?? null;
}

/**
 * Get evolution info for a stage
 */
export function getEvolutionInfo(stage: EvolutionStage): EvolutionInfo {
  return EVOLUTION_STAGES[stage];
}

/**
 * Get evolution progress toward next stage
 */
export function getEvolutionProgress(level: number, ctl: number): EvolutionProgress {
  const currentStage = calculateEvolutionStage(level, ctl);
  const currentInfo = EVOLUTION_STAGES[currentStage];

  // Check if at max stage
  if (currentStage === 5) {
    return {
      currentStage: currentInfo,
      nextStage: null,
      levelProgress: 100,
      ctlProgress: 100,
      canEvolve: false,
      blockedBy: null,
    };
  }

  const nextStage = (currentStage + 1) as EvolutionStage;
  const nextInfo = EVOLUTION_STAGES[nextStage];
  const nextReqs = EVOLUTION_REQUIREMENTS[nextStage];
  const currentReqs = EVOLUTION_REQUIREMENTS[currentStage];

  // Calculate progress percentages
  const levelRange = nextReqs.level - currentReqs.level;
  const ctlRange = nextReqs.ctl - currentReqs.ctl;

  const levelProgress = Math.min(
    100,
    Math.floor(((level - currentReqs.level) / levelRange) * 100)
  );
  const ctlProgress = Math.min(
    100,
    Math.floor(((ctl - currentReqs.ctl) / ctlRange) * 100)
  );

  // Check what's blocking evolution
  const meetsLevel = level >= nextReqs.level;
  const meetsCTL = ctl >= nextReqs.ctl;
  const canEvolve = meetsLevel && meetsCTL;

  let blockedBy: 'level' | 'ctl' | null = null;
  if (!canEvolve) {
    if (!meetsLevel && !meetsCTL) {
      // Both blocking - pick the one with less progress
      blockedBy = levelProgress < ctlProgress ? 'level' : 'ctl';
    } else {
      blockedBy = !meetsLevel ? 'level' : 'ctl';
    }
  }

  return {
    currentStage: currentInfo,
    nextStage: nextInfo,
    levelProgress,
    ctlProgress,
    canEvolve,
    blockedBy,
  };
}

/**
 * Check if user can access a wearable based on evolution stage
 */
export function canAccessWearable(
  wearableStage: EvolutionStage,
  userStage: EvolutionStage
): boolean {
  return userStage >= wearableStage;
}

/**
 * Get all unlocked items for a stage (cumulative)
 */
export function getUnlockedItems(stage: EvolutionStage): string[] {
  const items: string[] = [];
  for (let s = 1; s <= stage; s++) {
    items.push(...EVOLUTION_STAGES[s as EvolutionStage].unlocks);
  }
  return items;
}

/**
 * Get aura configuration for rendering
 */
export function getAuraConfig(stage: EvolutionStage): {
  type: string | null;
  intensity: number;
  color: string;
  animated: boolean;
} | null {
  const info = EVOLUTION_STAGES[stage];

  if (!info.aura) {
    return null;
  }

  const auraConfigs: Record<string, { intensity: number; animated: boolean }> = {
    glow: { intensity: 0.3, animated: false },
    pulse: { intensity: 0.5, animated: true },
    energy: { intensity: 0.7, animated: true },
    legendary: { intensity: 1.0, animated: true },
  };

  const config = auraConfigs[info.aura];

  return {
    type: info.aura,
    intensity: config.intensity,
    color: info.color,
    animated: config.animated,
  };
}

/**
 * Get badge configuration for rendering
 */
export function getBadgeConfig(stage: EvolutionStage): {
  id: string;
  name: string;
  color: string;
  tier: 'none' | 'bronze' | 'silver' | 'gold' | 'platinum';
} {
  const tierMap: Record<EvolutionStage, 'none' | 'bronze' | 'silver' | 'gold' | 'platinum'> = {
    1: 'none',
    2: 'bronze',
    3: 'silver',
    4: 'gold',
    5: 'platinum',
  };

  const info = EVOLUTION_STAGES[stage];

  return {
    id: info.badge,
    name: info.name,
    color: info.color,
    tier: tierMap[stage],
  };
}

/**
 * Format evolution stage for display
 */
export function formatEvolutionDisplay(stage: EvolutionStage): string {
  const info = EVOLUTION_STAGES[stage];
  return `${info.name} (Stage ${stage})`;
}

/**
 * Get motivational message based on progress
 */
export function getEvolutionMotivation(progress: EvolutionProgress): string {
  if (progress.canEvolve) {
    return `Ready to evolve to ${progress.nextStage?.name}!`;
  }

  if (!progress.nextStage) {
    return 'You have reached the pinnacle of evolution!';
  }

  if (progress.blockedBy === 'level') {
    const needed = EVOLUTION_REQUIREMENTS[progress.nextStage.stage as EvolutionStage].level;
    return `Keep training! Reach level ${needed} to evolve.`;
  }

  if (progress.blockedBy === 'ctl') {
    const needed = EVOLUTION_REQUIREMENTS[progress.nextStage.stage as EvolutionStage].ctl;
    return `Build your fitness! Reach ${needed} CTL to evolve.`;
  }

  return 'Keep pushing your limits!';
}
