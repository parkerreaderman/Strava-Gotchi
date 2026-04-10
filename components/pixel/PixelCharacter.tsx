'use client';

import { useEffect, useState } from 'react';
import { FatigueState } from '@/lib/training-metrics';
import PixelCharacterSVG from './PixelCharacterSVG';
import PixelSprite from './PixelSprite';
import { RUNNER_SPRITE_SHEET, getRunnerAnimationForState } from '@/lib/sprites/runner-sprite';
import type { WearableItems } from '@/lib/wearables';

export type { WearableItems } from '@/lib/wearables';

export interface EvolutionStage {
  stage: number;
  name: string;
  badge?: string;
  aura?: string;
}

interface PixelCharacterProps {
  /** Current fatigue state */
  state: FatigueState;
  /** Character display size in pixels */
  size?: number;
  /** Equipped wearables */
  wearables?: WearableItems;
  /** Evolution stage (1-5) */
  evolution?: EvolutionStage;
  /** User's level */
  level?: number;
  /** Whether to animate */
  animated?: boolean;
  /** Animation speed multiplier */
  animationSpeed?: number;
  /** Use runner sprite sheet instead of procedural SVG (off by default) */
  useRunnerSprite?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Animation frame rates by state (FPS)
 */
const STATE_FRAME_RATES: Record<FatigueState, number> = {
  fresh: 10,      // Energetic bouncing
  optimal: 8,     // Smooth idle
  trained: 6,     // Slower, steady
  fatigued: 4,    // Sluggish
  overtrained: 3, // Very slow, labored
};

/**
 * PixelCharacter - Main character component with wearables and animations
 *
 * Composites the base character with equipped items and handles idle animations.
 */
export default function PixelCharacter({
  state,
  size = 128,
  wearables,
  evolution,
  level,
  animated = true,
  animationSpeed = 1,
  useRunnerSprite = false,
  className = '',
}: PixelCharacterProps) {
  const [frame, setFrame] = useState(0);

  const frameRate = STATE_FRAME_RATES[state] * animationSpeed;

  // Animation loop for procedural SVG (when not using runner sprite)
  useEffect(() => {
    if (!animated || useRunnerSprite) return;

    const intervalMs = 1000 / frameRate;
    const intervalId = setInterval(() => {
      setFrame((prev) => (prev + 1) % 4);
    }, intervalMs);

    return () => clearInterval(intervalId);
  }, [animated, frameRate, useRunnerSprite]);

  // Get background style from wearable (IDs from lib/wearables)
  const getBackgroundStyle = (): React.CSSProperties => {
    const bgColors: Record<string, string> = {
      default: 'linear-gradient(180deg, #E5E7EB 0%, #F3F4F6 100%)',
      track: 'linear-gradient(180deg, #FEE2E2 0%, #FECACA 100%)',
      mountains: 'linear-gradient(180deg, #DBEAFE 0%, #BBF7D0 100%)',
      beach: 'linear-gradient(180deg, #FEF9C3 0%, #BAE6FD 100%)',
      city: 'linear-gradient(180deg, #E5E7EB 0%, #CBD5E1 100%)',
      forest: 'linear-gradient(180deg, #BBF7D0 0%, #6EE7B7 100%)',
      gym: 'linear-gradient(180deg, #F3F4F6 0%, #D1D5DB 100%)',
    };
    const bg = (wearables?.background as string) || 'default';
    return { background: bgColors[bg] || bgColors.default };
  };

  // Get aura style based on evolution
  const getAuraStyle = (): React.CSSProperties | null => {
    if (!evolution || evolution.stage < 2) return null;

    const auraColors: Record<number, string> = {
      2: 'rgba(251, 191, 36, 0.2)',   // Bronze glow
      3: 'rgba(156, 163, 175, 0.3)',  // Silver glow
      4: 'rgba(234, 179, 8, 0.4)',    // Gold glow
      5: 'rgba(168, 85, 247, 0.5)',   // Legendary purple
    };

    const auraSize: Record<number, number> = {
      2: 8,
      3: 12,
      4: 16,
      5: 24,
    };

    return {
      boxShadow: `0 0 ${auraSize[evolution.stage]}px ${auraColors[evolution.stage]}`,
      animation: evolution.stage >= 4 ? 'pulse 2s infinite' : undefined,
    };
  };

  return (
    <div
      className={`pixel-character-container ${className}`}
      style={{
        position: 'relative',
        width: size + 32, // Extra space for effects
        height: size + 32,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Background */}
      <div
        className="pixel-character-bg"
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '16px',
          ...getBackgroundStyle(),
        }}
      />

      {/* Aura effect */}
      {evolution && evolution.stage >= 2 && (
        <div
          className="pixel-character-aura"
          style={{
            position: 'absolute',
            width: size,
            height: size,
            borderRadius: '50%',
            ...getAuraStyle(),
          }}
        />
      )}

      {/* Character */}
      <div
        className="pixel-character-sprite"
        style={{
          position: 'relative',
          zIndex: 10,
        }}
      >
        {useRunnerSprite ? (
          <PixelSprite
            spriteSheet={RUNNER_SPRITE_SHEET}
            animation={getRunnerAnimationForState(state)}
            scale={size / RUNNER_SPRITE_SHEET.frameHeight}
            playing={animated}
            alt={`Runner ${state}`}
          />
        ) : (
          <PixelCharacterSVG
            state={state}
            size={size}
            frame={frame}
          />
        )}

        {/* Wearable overlays only for procedural SVG; runner sprite has its own outfit */}
        {!useRunnerSprite && (
          <>
            {wearables?.hat && wearables.hat !== 'none' && (
              <PixelWearableOverlay type="hat" item={wearables.hat} size={size} />
            )}
            {wearables?.shirt && wearables.shirt !== 'none' && (
              <PixelWearableOverlay type="shirt" item={wearables.shirt} size={size} />
            )}
            {wearables?.shorts && wearables.shorts !== 'none' && (
              <PixelWearableOverlay type="shorts" item={wearables.shorts} size={size} />
            )}
            {wearables?.shoes && wearables.shoes !== 'none' && (
              <PixelWearableOverlay type="shoes" item={wearables.shoes} size={size} />
            )}
          </>
        )}
      </div>

      {/* Evolution badge */}
      {evolution && evolution.stage >= 2 && (
        <div
          className="pixel-evolution-badge"
          style={{
            position: 'absolute',
            top: 4,
            right: 4,
            zIndex: 20,
          }}
        >
          <EvolutionBadge stage={evolution.stage} size={24} />
        </div>
      )}

      {/* Level indicator */}
      {level !== undefined && (
        <div
          className="pixel-level-badge"
          style={{
            position: 'absolute',
            bottom: 4,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 20,
            background: '#1E293B',
            color: '#FFFFFF',
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: 'bold',
            fontFamily: 'monospace',
            imageRendering: 'pixelated',
          }}
        >
          Lv.{level}
        </div>
      )}
    </div>
  );
}

/**
 * Pixel wearable overlay component
 */
interface PixelWearableOverlayProps {
  type: 'hat' | 'shirt' | 'shorts' | 'shoes';
  item: string;
  size: number;
}

function PixelWearableOverlay({ type, item, size }: PixelWearableOverlayProps) {
  // Wearable positioning offsets (as percentage of character size)
  const positions: Record<string, { top: number; left: number; width: number; height: number }> = {
    hat: { top: -5, left: 25, width: 50, height: 25 },
    shirt: { top: 35, left: 20, width: 60, height: 30 },
    shorts: { top: 55, left: 25, width: 50, height: 20 },
    shoes: { top: 85, left: 20, width: 60, height: 15 },
  };

  const pos = positions[type];
  const pixelSize = size / 32;

  // Wearable colors (IDs match lib/wearables constants)
  const wearableColors: Record<string, Record<string, string>> = {
    hat: { cap: '#EF4444', headband: '#F59E0B', beanie: '#6366F1', visor: '#10B981' },
    shirt: { tank: '#FFFFFF', tshirt: '#3B82F6', jersey: '#22C55E', jacket: '#1E293B' },
    shorts: { running: '#1E293B', compression: '#6366F1', bike: '#0EA5E9' },
    shoes: { running: '#FFFFFF', trail: '#92400E', spikes: '#EF4444' },
  };

  const color = wearableColors[type]?.[item] || '#888888';

  return (
    <div
      className={`pixel-wearable pixel-wearable-${type}`}
      style={{
        position: 'absolute',
        top: `${pos.top}%`,
        left: `${pos.left}%`,
        width: `${pos.width}%`,
        height: `${pos.height}%`,
        backgroundColor: color,
        borderRadius: pixelSize,
        opacity: 0.9,
        imageRendering: 'pixelated',
      }}
    />
  );
}

/**
 * Evolution badge component
 */
interface EvolutionBadgeProps {
  stage: number;
  size?: number;
}

function EvolutionBadge({ stage, size = 24 }: EvolutionBadgeProps) {
  const badgeColors: Record<number, { bg: string; border: string; icon: string }> = {
    1: { bg: '#E5E7EB', border: '#9CA3AF', icon: '' },
    2: { bg: '#FEF3C7', border: '#D97706', icon: '🥉' },
    3: { bg: '#F3F4F6', border: '#6B7280', icon: '🥈' },
    4: { bg: '#FEF9C3', border: '#CA8A04', icon: '🥇' },
    5: { bg: '#F3E8FF', border: '#9333EA', icon: '👑' },
  };

  const colors = badgeColors[stage] || badgeColors[1];

  return (
    <div
      style={{
        width: size,
        height: size,
        backgroundColor: colors.bg,
        border: `2px solid ${colors.border}`,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.5,
        imageRendering: 'pixelated',
      }}
    >
      {colors.icon}
    </div>
  );
}

// Export types for use in other components
export type { PixelCharacterProps };
