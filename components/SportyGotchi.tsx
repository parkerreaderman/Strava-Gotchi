'use client';

import { useMemo } from 'react';
import { FatigueState, getFatigueState } from '@/lib/training-metrics';
import { PixelCharacter, PixelBackground } from './pixel';
import type { BackgroundTheme } from './pixel';
import type { WearableItems } from '@/lib/wearables';

export type { WearableItems } from '@/lib/wearables';

/**
 * Color schemes for state badges (kept for UI consistency)
 */
type ColorScheme = { body: string; accent: string; glow: string };

const stateColors: Record<FatigueState, ColorScheme> = {
  fresh: {
    body: '#60A5FA',
    accent: '#3B82F6',
    glow: '#DBEAFE',
  },
  optimal: {
    body: '#34D399',
    accent: '#10B981',
    glow: '#D1FAE5',
  },
  trained: {
    body: '#FBBF24',
    accent: '#F59E0B',
    glow: '#FEF3C7',
  },
  fatigued: {
    body: '#FB923C',
    accent: '#F97316',
    glow: '#FFEDD5',
  },
  overtrained: {
    body: '#F87171',
    accent: '#EF4444',
    glow: '#FEE2E2',
  },
};

interface SportyGotchiProps {
  /** Direct state override */
  state?: FatigueState;
  /** TSB value to calculate state from */
  tsb?: number;
  /** Character display name */
  name?: string;
  /** Custom color theme (deprecated - colors now tied to state) */
  customColor?: string;
  /** Equipped wearable items */
  wearables?: WearableItems;
  /** User's current level (optional) */
  level?: number;
  /** Evolution stage 1-5 (optional) */
  evolutionStage?: number;
  /** Whether to show background (default: true) */
  showBackground?: boolean;
  /** Character display size */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * SportyGotchi - Main character component
 *
 * Displays the pixel art Tamagotchi-style fitness companion.
 * Appearance changes based on training load and fatigue state.
 *
 * Now powered by high-quality pixel art!
 */
export default function SportyGotchi({
  state,
  tsb,
  name = 'Sporty',
  wearables,
  level,
  evolutionStage = 1,
  showBackground = true,
  size = 'md',
}: SportyGotchiProps) {
  // Resolve fatigue state from TSB or direct prop
  const resolvedState: FatigueState = useMemo(() => {
    if (typeof tsb === 'number') {
      return getFatigueState(tsb);
    }
    return state ?? 'optimal';
  }, [state, tsb]);

  // Get colors for UI elements (badge, etc.)
  const colors = stateColors[resolvedState];

  // Map size to pixel dimensions
  const sizeMap = {
    sm: 96,
    md: 128,
    lg: 160,
  };
  const pixelSize = sizeMap[size];

  // Map background wearable to theme
  const backgroundTheme: BackgroundTheme = (wearables?.background as BackgroundTheme) || 'default';

  // Build evolution stage object
  const evolution = useMemo(() => {
    const stageNames = ['Rookie', 'Regular', 'Athlete', 'Elite', 'Champion'];
    return {
      stage: evolutionStage,
      name: stageNames[evolutionStage - 1] || 'Rookie',
    };
  }, [evolutionStage]);

  // Character content (with or without background)
  const characterContent = (
    <PixelCharacter
      state={resolvedState}
      size={pixelSize}
      wearables={wearables}
      evolution={evolution}
      level={level}
      animated={true}
    />
  );

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Character display area */}
      {showBackground ? (
        <PixelBackground
          theme={backgroundTheme}
          width={pixelSize + 64}
          height={pixelSize + 64}
          className="rounded-2xl shadow-lg"
        >
          {characterContent}
        </PixelBackground>
      ) : (
        <div
          className="flex items-center justify-center"
          style={{ width: pixelSize + 32, height: pixelSize + 32 }}
        >
          {characterContent}
        </div>
      )}

      {/* Character info */}
      <div className="text-center">
        <h2
          className="text-2xl font-bold text-gray-900"
          style={{ fontFamily: 'monospace' }}
        >
          {name}
        </h2>
        <div className="flex items-center justify-center gap-2 mt-3">
          {/* State badge */}
          <div
            className="px-4 py-2 rounded-full text-white font-bold text-sm uppercase tracking-wide"
            style={{
              backgroundColor: colors.accent,
              fontFamily: 'monospace',
              imageRendering: 'pixelated',
            }}
          >
            {resolvedState}
          </div>
          {/* Evolution badge (if not rookie) */}
          {evolutionStage > 1 && (
            <div
              className="px-3 py-2 rounded-full text-xs font-bold uppercase tracking-wide"
              style={{
                backgroundColor: getEvolutionColor(evolutionStage),
                color: evolutionStage >= 4 ? '#1F2937' : '#FFFFFF',
                fontFamily: 'monospace',
              }}
            >
              {evolution.name}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Get badge color for evolution stage
 */
function getEvolutionColor(stage: number): string {
  const colors: Record<number, string> = {
    1: '#9CA3AF', // Gray (Rookie)
    2: '#D97706', // Bronze (Regular)
    3: '#6B7280', // Silver (Athlete)
    4: '#EAB308', // Gold (Elite)
    5: '#A855F7', // Purple (Champion)
  };
  return colors[stage] || colors[1];
}

