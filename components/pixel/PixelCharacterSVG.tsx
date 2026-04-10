'use client';

import { useMemo } from 'react';
import { FatigueState } from '@/lib/training-metrics';

/**
 * Color palettes for each fatigue state
 * Limited to 8-16 colors for authentic pixel art feel
 */
const STATE_PALETTES: Record<FatigueState, {
  body: string;
  bodyLight: string;
  bodyDark: string;
  outline: string;
  eye: string;
  highlight: string;
  cheek: string;
}> = {
  fresh: {
    body: '#60A5FA',      // Blue
    bodyLight: '#93C5FD',
    bodyDark: '#3B82F6',
    outline: '#1E40AF',
    eye: '#1E293B',
    highlight: '#FFFFFF',
    cheek: '#FCA5A5',
  },
  optimal: {
    body: '#4ADE80',      // Green
    bodyLight: '#86EFAC',
    bodyDark: '#22C55E',
    outline: '#15803D',
    eye: '#1E293B',
    highlight: '#FFFFFF',
    cheek: '#FCD34D',
  },
  trained: {
    body: '#FBBF24',      // Yellow
    bodyLight: '#FDE047',
    bodyDark: '#F59E0B',
    outline: '#B45309',
    eye: '#1E293B',
    highlight: '#FFFFFF',
    cheek: '#FB923C',
  },
  fatigued: {
    body: '#FB923C',      // Orange
    bodyLight: '#FDBA74',
    bodyDark: '#EA580C',
    outline: '#9A3412',
    eye: '#1E293B',
    highlight: '#E5E7EB',
    cheek: '#F87171',
  },
  overtrained: {
    body: '#F87171',      // Red
    bodyLight: '#FCA5A5',
    bodyDark: '#DC2626',
    outline: '#7F1D1D',
    eye: '#1E293B',
    highlight: '#D1D5DB',
    cheek: '#9CA3AF',
  },
};

/**
 * Expression configurations for each state
 */
const STATE_EXPRESSIONS: Record<FatigueState, {
  eyeStyle: 'normal' | 'happy' | 'tired' | 'x';
  mouthStyle: 'smile' | 'grin' | 'neutral' | 'frown';
  hasSweat: boolean;
  hasSparkle: boolean;
  hasStars: boolean;
}> = {
  fresh: {
    eyeStyle: 'happy',
    mouthStyle: 'grin',
    hasSweat: false,
    hasSparkle: true,
    hasStars: false,
  },
  optimal: {
    eyeStyle: 'normal',
    mouthStyle: 'smile',
    hasSweat: false,
    hasSparkle: false,
    hasStars: false,
  },
  trained: {
    eyeStyle: 'normal',
    mouthStyle: 'neutral',
    hasSweat: true,
    hasSparkle: false,
    hasStars: false,
  },
  fatigued: {
    eyeStyle: 'tired',
    mouthStyle: 'neutral',
    hasSweat: true,
    hasSparkle: false,
    hasStars: false,
  },
  overtrained: {
    eyeStyle: 'x',
    mouthStyle: 'frown',
    hasSweat: true,
    hasSparkle: false,
    hasStars: true,
  },
};

interface PixelCharacterSVGProps {
  state: FatigueState;
  /** Size in pixels (will be square) */
  size?: number;
  /** Animation frame (0-3 for idle bounce) */
  frame?: number;
  className?: string;
}

/**
 * PixelCharacterSVG - Procedurally generated pixel art character
 *
 * Creates an SVG-based pixel art character that mimics sprite sheet aesthetics.
 * Each "pixel" is rendered as a small rect for the authentic chunky look.
 */
export default function PixelCharacterSVG({
  state,
  size = 128,
  frame = 0,
  className = '',
}: PixelCharacterSVGProps) {
  const palette = STATE_PALETTES[state];
  const expression = STATE_EXPRESSIONS[state];

  // Calculate bounce offset based on frame (0-3)
  const bounceOffset = useMemo(() => {
    const bouncePattern = [0, -1, -2, -1];
    return bouncePattern[frame % 4] || 0;
  }, [frame]);

  // Pixel size (32x32 grid scaled to output size)
  const pixelSize = size / 32;

  // Helper to draw a pixel
  const pixel = (x: number, y: number, color: string) => (
    <rect
      key={`${x}-${y}`}
      x={x * pixelSize}
      y={(y + bounceOffset) * pixelSize}
      width={pixelSize}
      height={pixelSize}
      fill={color}
    />
  );

  // Helper to draw multiple pixels
  const pixels = (coords: [number, number][], color: string) =>
    coords.map(([x, y]) => pixel(x, y, color));

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={`pixel-character ${className}`}
      style={{ imageRendering: 'pixelated' }}
      role="img"
      aria-label={`Sporty Gotchi character in ${state} state`}
    >
      {/* Body outline */}
      {pixels([
        // Head outline (top)
        [12, 4], [13, 4], [14, 4], [15, 4], [16, 4], [17, 4], [18, 4], [19, 4],
        [11, 5], [20, 5],
        [10, 6], [21, 6],
        [10, 7], [21, 7],
        [10, 8], [21, 8],
        [10, 9], [21, 9],
        [10, 10], [21, 10],
        [10, 11], [21, 11],
        [11, 12], [20, 12],
        // Body outline
        [9, 13], [22, 13],
        [8, 14], [23, 14],
        [8, 15], [23, 15],
        [8, 16], [23, 16],
        [8, 17], [23, 17],
        [8, 18], [23, 18],
        [8, 19], [23, 19],
        [9, 20], [22, 20],
        [10, 21], [21, 21],
        // Feet outline
        [10, 22], [14, 22], [17, 22], [21, 22],
        [9, 23], [15, 23], [16, 23], [22, 23],
        [9, 24], [22, 24],
        [10, 25], [11, 25], [12, 25], [13, 25], [14, 25],
        [17, 25], [18, 25], [19, 25], [20, 25], [21, 25],
      ], palette.outline)}

      {/* Body fill */}
      {pixels([
        // Head fill
        [12, 5], [13, 5], [14, 5], [15, 5], [16, 5], [17, 5], [18, 5], [19, 5],
        [11, 6], [12, 6], [13, 6], [14, 6], [15, 6], [16, 6], [17, 6], [18, 6], [19, 6], [20, 6],
        [11, 7], [12, 7], [13, 7], [14, 7], [15, 7], [16, 7], [17, 7], [18, 7], [19, 7], [20, 7],
        [11, 8], [12, 8], [13, 8], [14, 8], [17, 8], [18, 8], [19, 8], [20, 8],
        [11, 9], [12, 9], [13, 9], [14, 9], [15, 9], [16, 9], [17, 9], [18, 9], [19, 9], [20, 9],
        [11, 10], [12, 10], [13, 10], [14, 10], [15, 10], [16, 10], [17, 10], [18, 10], [19, 10], [20, 10],
        [11, 11], [12, 11], [13, 11], [14, 11], [15, 11], [16, 11], [17, 11], [18, 11], [19, 11], [20, 11],
        [12, 12], [13, 12], [14, 12], [15, 12], [16, 12], [17, 12], [18, 12], [19, 12],
      ], palette.body)}

      {/* Body fill (torso) */}
      {pixels([
        [10, 13], [11, 13], [12, 13], [13, 13], [14, 13], [15, 13], [16, 13], [17, 13], [18, 13], [19, 13], [20, 13], [21, 13],
        [9, 14], [10, 14], [11, 14], [12, 14], [13, 14], [14, 14], [15, 14], [16, 14], [17, 14], [18, 14], [19, 14], [20, 14], [21, 14], [22, 14],
        [9, 15], [10, 15], [11, 15], [12, 15], [13, 15], [14, 15], [15, 15], [16, 15], [17, 15], [18, 15], [19, 15], [20, 15], [21, 15], [22, 15],
        [9, 16], [10, 16], [11, 16], [12, 16], [13, 16], [14, 16], [15, 16], [16, 16], [17, 16], [18, 16], [19, 16], [20, 16], [21, 16], [22, 16],
        [9, 17], [10, 17], [11, 17], [12, 17], [13, 17], [14, 17], [15, 17], [16, 17], [17, 17], [18, 17], [19, 17], [20, 17], [21, 17], [22, 17],
        [9, 18], [10, 18], [11, 18], [12, 18], [13, 18], [14, 18], [15, 18], [16, 18], [17, 18], [18, 18], [19, 18], [20, 18], [21, 18], [22, 18],
        [9, 19], [10, 19], [11, 19], [12, 19], [13, 19], [14, 19], [15, 19], [16, 19], [17, 19], [18, 19], [19, 19], [20, 19], [21, 19], [22, 19],
        [10, 20], [11, 20], [12, 20], [13, 20], [14, 20], [15, 20], [16, 20], [17, 20], [18, 20], [19, 20], [20, 20], [21, 20],
        [11, 21], [12, 21], [13, 21], [14, 21], [17, 21], [18, 21], [19, 21], [20, 21],
      ], palette.body)}

      {/* Belly highlight */}
      {pixels([
        [13, 15], [14, 15], [15, 15], [16, 15], [17, 15], [18, 15],
        [12, 16], [13, 16], [14, 16], [15, 16], [16, 16], [17, 16], [18, 16], [19, 16],
        [12, 17], [13, 17], [14, 17], [15, 17], [16, 17], [17, 17], [18, 17], [19, 17],
        [13, 18], [14, 18], [15, 18], [16, 18], [17, 18], [18, 18],
      ], palette.bodyLight)}

      {/* Feet */}
      {pixels([
        [10, 23], [11, 23], [12, 23], [13, 23], [14, 23],
        [17, 23], [18, 23], [19, 23], [20, 23], [21, 23],
        [10, 24], [11, 24], [12, 24], [13, 24], [14, 24],
        [17, 24], [18, 24], [19, 24], [20, 24], [21, 24],
      ], palette.bodyDark)}

      {/* Eyes */}
      {expression.eyeStyle === 'x' ? (
        // X eyes for overtrained
        <>
          {pixels([[13, 8], [14, 8], [17, 8], [18, 8]], palette.eye)}
          {pixels([[12, 7], [15, 7], [16, 7], [19, 7]], palette.eye)}
          {pixels([[12, 9], [15, 9], [16, 9], [19, 9]], palette.eye)}
        </>
      ) : expression.eyeStyle === 'tired' ? (
        // Half-closed eyes for fatigued
        <>
          {pixels([[13, 8], [14, 8]], palette.eye)}
          {pixels([[17, 8], [18, 8]], palette.eye)}
          {pixels([[13, 7], [14, 7], [17, 7], [18, 7]], palette.bodyDark)}
        </>
      ) : expression.eyeStyle === 'happy' ? (
        // Happy curved eyes
        <>
          {pixels([[13, 8], [14, 8]], palette.eye)}
          {pixels([[17, 8], [18, 8]], palette.eye)}
          {pixels([[12, 8], [15, 8], [16, 8], [19, 8]], palette.body)}
        </>
      ) : (
        // Normal eyes
        <>
          {pixels([[13, 7], [14, 7], [13, 8], [14, 8]], palette.eye)}
          {pixels([[17, 7], [18, 7], [17, 8], [18, 8]], palette.eye)}
          {/* Eye highlights */}
          {pixel(14, 7, palette.highlight)}
          {pixel(18, 7, palette.highlight)}
        </>
      )}

      {/* Mouth */}
      {expression.mouthStyle === 'grin' ? (
        // Big smile
        pixels([[13, 10], [14, 10], [15, 10], [16, 10], [17, 10], [18, 10], [14, 11], [15, 11], [16, 11], [17, 11]], palette.eye)
      ) : expression.mouthStyle === 'smile' ? (
        // Small smile
        pixels([[14, 10], [15, 10], [16, 10], [17, 10]], palette.eye)
      ) : expression.mouthStyle === 'frown' ? (
        // Sad frown
        pixels([[14, 11], [15, 11], [16, 11], [17, 11], [13, 10], [18, 10]], palette.eye)
      ) : (
        // Neutral line
        pixels([[14, 10], [15, 10], [16, 10], [17, 10]], palette.eye)
      )}

      {/* Cheeks */}
      {(expression.eyeStyle === 'happy' || expression.eyeStyle === 'normal') && (
        <>
          {pixel(11, 9, palette.cheek)}
          {pixel(20, 9, palette.cheek)}
        </>
      )}

      {/* Sweat drops */}
      {expression.hasSweat && (
        <>
          {pixel(22, 6, '#60A5FA')}
          {pixel(22, 7, '#93C5FD')}
        </>
      )}

      {/* Sparkles for fresh state */}
      {expression.hasSparkle && (
        <>
          {pixel(6, 5, '#FDE047')}
          {pixel(25, 8, '#FDE047')}
          {pixel(7, 12, '#FFFFFF')}
        </>
      )}

      {/* Dizzy stars for overtrained */}
      {expression.hasStars && (
        <>
          {pixels([[5, 4], [6, 3], [7, 4], [6, 5]], '#FDE047')}
          {pixels([[24, 5], [25, 4], [26, 5], [25, 6]], '#FDE047')}
        </>
      )}
    </svg>
  );
}
