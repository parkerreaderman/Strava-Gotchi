import type { SpriteSheetConfig } from '@/components/pixel/PixelSprite';
import type { FatigueState } from '@/lib/training-metrics';

/** New sprite sheet: 868×1024, 6×6 grid = 36 frames (single run cycle) */
const COLS = 6;
const ROWS = 6;
const FRAME_WIDTH = Math.floor(868 / COLS);   // 144
const FRAME_HEIGHT = Math.floor(1024 / ROWS); // 170

const runAnimation = (frameRate: number) => ({
  name: 'run',
  row: 0,
  frameCount: 36,
  frameRate,
  loop: true,
  framesPerRow: 6,
});

export const RUNNER_SPRITE_SHEET: SpriteSheetConfig = {
  src: '/sprites/runner-sprite.png',
  frameWidth: FRAME_WIDTH,
  frameHeight: FRAME_HEIGHT,
  animations: {
    tired: runAnimation(6),
    ready: runAnimation(10),
    energized: runAnimation(12),
  },
};

/** Map fatigue state to runner animation name (same sprite, different playback speed) */
export function getRunnerAnimationForState(state: FatigueState): 'tired' | 'ready' | 'energized' {
  switch (state) {
    case 'fresh':
      return 'energized';
    case 'optimal':
    case 'trained':
      return 'ready';
    case 'fatigued':
    case 'overtrained':
      return 'tired';
    default:
      return 'ready';
  }
}
