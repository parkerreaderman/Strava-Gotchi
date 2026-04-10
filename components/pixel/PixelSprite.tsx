'use client';

import { useEffect, useState } from 'react';

export interface SpriteAnimation {
  /** Name of the animation (e.g., 'idle', 'walk', 'celebrate') */
  name: string;
  /** Row in the sprite sheet (0-indexed); ignored when framesPerRow is set */
  row: number;
  /** Number of frames in this animation */
  frameCount: number;
  /** Frames per second (8-12 recommended for pixel art) */
  frameRate: number;
  /** Whether this animation should loop */
  loop?: boolean;
  /** When set, frames are laid out in a grid: col = frameIndex % framesPerRow, row = floor(frameIndex / framesPerRow) */
  framesPerRow?: number;
}

export interface SpriteSheetConfig {
  /** Path to the sprite sheet image */
  src: string;
  /** Width of a single frame in pixels */
  frameWidth: number;
  /** Height of a single frame in pixels */
  frameHeight: number;
  /** Available animations in this sprite sheet */
  animations: Record<string, SpriteAnimation>;
}

export interface PixelSpriteProps {
  /** Sprite sheet configuration */
  spriteSheet: SpriteSheetConfig;
  /** Current animation to play */
  animation: string;
  /** Scale factor for rendering (default: 4 for 32px -> 128px) */
  scale?: number;
  /** Whether the animation is playing */
  playing?: boolean;
  /** Callback when animation completes (non-looping only) */
  onAnimationComplete?: () => void;
  /** Additional CSS classes */
  className?: string;
  /** Flip sprite horizontally */
  flipX?: boolean;
  /** Alt text for accessibility */
  alt?: string;
}

/**
 * PixelSprite - Base component for rendering animated pixel art sprites
 *
 * Uses CSS background-position to animate through sprite sheet frames.
 * Renders with `image-rendering: pixelated` for crisp pixel art scaling.
 */
export default function PixelSprite({
  spriteSheet,
  animation,
  scale = 4,
  playing = true,
  onAnimationComplete,
  className = '',
  flipX = false,
  alt = 'Pixel sprite',
}: PixelSpriteProps) {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  const currentAnimation = spriteSheet.animations[animation];

  // Preload sprite sheet image
  useEffect(() => {
    const img = new Image();
    img.onload = () => setIsLoaded(true);
    img.onerror = () => console.error(`Failed to load sprite: ${spriteSheet.src}`);
    img.src = spriteSheet.src;
  }, [spriteSheet.src]);

  // Reset frame when animation changes
  useEffect(() => {
    setCurrentFrame(0);
  }, [animation]);

  // Animation loop using interval
  useEffect(() => {
    if (!playing || !currentAnimation || currentAnimation.frameCount <= 1) {
      return;
    }

    const intervalMs = 1000 / currentAnimation.frameRate;
    let frameIndex = 0;

    const intervalId = setInterval(() => {
      frameIndex++;

      if (frameIndex >= currentAnimation.frameCount) {
        if (currentAnimation.loop !== false) {
          frameIndex = 0;
        } else {
          clearInterval(intervalId);
          onAnimationComplete?.();
          return;
        }
      }

      setCurrentFrame(frameIndex);
    }, intervalMs);

    return () => clearInterval(intervalId);
  }, [playing, currentAnimation, onAnimationComplete]);

  if (!currentAnimation) {
    console.warn(`Animation "${animation}" not found in sprite sheet`);
    return null;
  }

  const { frameWidth, frameHeight } = spriteSheet;
  const displayWidth = frameWidth * scale;
  const displayHeight = frameHeight * scale;

  const framesPerRow = currentAnimation.framesPerRow;
  const gridLayout = framesPerRow != null;

  // Calculate background position for current frame
  const backgroundX = gridLayout
    ? -(currentFrame % framesPerRow) * frameWidth * scale
    : -(currentFrame * frameWidth * scale);
  const backgroundY = gridLayout
    ? -Math.floor(currentFrame / framesPerRow) * frameHeight * scale
    : -(currentAnimation.row * frameHeight * scale);

  const backgroundSize = gridLayout
    ? `${frameWidth * framesPerRow * scale}px ${frameHeight * Math.ceil(currentAnimation.frameCount / framesPerRow) * scale}px`
    : `auto ${spriteSheet.frameHeight * scale * Object.keys(spriteSheet.animations).length}px`;

  return (
    <div
      role="img"
      aria-label={alt}
      className={`pixel-sprite ${className}`}
      style={{
        width: displayWidth,
        height: displayHeight,
        backgroundImage: isLoaded ? `url(${spriteSheet.src})` : 'none',
        backgroundPosition: `${backgroundX}px ${backgroundY}px`,
        backgroundSize,
        backgroundRepeat: 'no-repeat',
        imageRendering: 'pixelated',
        transform: flipX ? 'scaleX(-1)' : undefined,
        // Fallback background while loading
        backgroundColor: isLoaded ? 'transparent' : 'rgba(0,0,0,0.1)',
      }}
    />
  );
}

/**
 * Helper to create a simple single-row sprite sheet config
 */
export function createSimpleSpriteSheet(
  src: string,
  frameWidth: number,
  frameHeight: number,
  frameCount: number,
  frameRate: number = 10,
  loop: boolean = true
): SpriteSheetConfig {
  return {
    src,
    frameWidth,
    frameHeight,
    animations: {
      default: {
        name: 'default',
        row: 0,
        frameCount,
        frameRate,
        loop,
      },
    },
  };
}

/**
 * Predefined sprite sheet configs for common use cases
 */
export const SPRITE_CONFIGS = {
  /** Standard 32x32 character with 4 animation frames */
  character32x32: (src: string, animations: Record<string, Omit<SpriteAnimation, 'name'>>) => ({
    src,
    frameWidth: 32,
    frameHeight: 32,
    animations: Object.fromEntries(
      Object.entries(animations).map(([name, config]) => [
        name,
        { ...config, name },
      ])
    ),
  }),

  /** Standard 16x16 icon/UI element */
  icon16x16: (src: string, frameCount: number = 1) =>
    createSimpleSpriteSheet(src, 16, 16, frameCount, 8),

  /** Standard 24x24 badge */
  badge24x24: (src: string, frameCount: number = 1) =>
    createSimpleSpriteSheet(src, 24, 24, frameCount, 8),
};
