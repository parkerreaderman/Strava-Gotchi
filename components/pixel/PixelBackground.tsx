'use client';

import { useMemo } from 'react';

export type BackgroundTheme = 'default' | 'track' | 'mountains' | 'beach' | 'city' | 'forest' | 'gym';

interface PixelBackgroundProps {
  theme: BackgroundTheme;
  width?: number;
  height?: number;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Background color configurations for each theme
 */
const THEME_CONFIGS: Record<BackgroundTheme, {
  sky: string;
  skyGradient: string;
  ground: string;
  groundGradient: string;
  accent1: string;
  accent2: string;
  details: string;
}> = {
  default: {
    sky: '#E5E7EB',
    skyGradient: '#F3F4F6',
    ground: '#D1D5DB',
    groundGradient: '#9CA3AF',
    accent1: '#6B7280',
    accent2: '#4B5563',
    details: '#374151',
  },
  track: {
    sky: '#BFDBFE',
    skyGradient: '#DBEAFE',
    ground: '#DC2626',
    groundGradient: '#B91C1C',
    accent1: '#FFFFFF',
    accent2: '#FEE2E2',
    details: '#7F1D1D',
  },
  mountains: {
    sky: '#7DD3FC',
    skyGradient: '#BAE6FD',
    ground: '#22C55E',
    groundGradient: '#16A34A',
    accent1: '#FFFFFF',
    accent2: '#E5E7EB',
    details: '#166534',
  },
  beach: {
    sky: '#38BDF8',
    skyGradient: '#7DD3FC',
    ground: '#FDE68A',
    groundGradient: '#FCD34D',
    accent1: '#0EA5E9',
    accent2: '#06B6D4',
    details: '#D97706',
  },
  city: {
    sky: '#A5B4FC',
    skyGradient: '#C7D2FE',
    ground: '#6B7280',
    groundGradient: '#4B5563',
    accent1: '#FDE047',
    accent2: '#F3F4F6',
    details: '#1F2937',
  },
  forest: {
    sky: '#86EFAC',
    skyGradient: '#BBF7D0',
    ground: '#65A30D',
    groundGradient: '#4D7C0F',
    accent1: '#22C55E',
    accent2: '#15803D',
    details: '#14532D',
  },
  gym: {
    sky: '#F3F4F6',
    skyGradient: '#E5E7EB',
    ground: '#9CA3AF',
    groundGradient: '#6B7280',
    accent1: '#EF4444',
    accent2: '#3B82F6',
    details: '#1F2937',
  },
};

/**
 * PixelBackground - Themed pixel art backgrounds with procedural elements
 */
export default function PixelBackground({
  theme,
  width = 256,
  height = 256,
  className = '',
  children,
}: PixelBackgroundProps) {
  const config = THEME_CONFIGS[theme];
  const pixelSize = width / 32;

  // Generate background elements based on theme
  const backgroundElements = useMemo(() => {
    switch (theme) {
      case 'track':
        return <TrackElements config={config} pixelSize={pixelSize} />;
      case 'mountains':
        return <MountainElements config={config} pixelSize={pixelSize} />;
      case 'beach':
        return <BeachElements config={config} pixelSize={pixelSize} />;
      case 'city':
        return <CityElements config={config} pixelSize={pixelSize} />;
      case 'forest':
        return <ForestElements config={config} pixelSize={pixelSize} />;
      case 'gym':
        return <GymElements config={config} pixelSize={pixelSize} />;
      default:
        return null;
    }
  }, [theme, config, pixelSize]);

  return (
    <div
      className={`pixel-background pixel-background-${theme} ${className}`}
      style={{
        position: 'relative',
        width,
        height,
        overflow: 'hidden',
        imageRendering: 'pixelated',
      }}
    >
      {/* Sky gradient */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '60%',
          background: `linear-gradient(180deg, ${config.sky} 0%, ${config.skyGradient} 100%)`,
        }}
      />

      {/* Ground gradient */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '40%',
          background: `linear-gradient(180deg, ${config.ground} 0%, ${config.groundGradient} 100%)`,
        }}
      />

      {/* Theme-specific elements */}
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          imageRendering: 'pixelated',
        }}
      >
        {backgroundElements}
      </svg>

      {/* Children (character, UI elements, etc.) */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {children}
      </div>
    </div>
  );
}

// Helper components for each theme's background elements

interface ElementProps {
  config: typeof THEME_CONFIGS[BackgroundTheme];
  pixelSize: number;
}

function TrackElements({ config, pixelSize }: ElementProps) {
  return (
    <g>
      {/* Track lanes */}
      <rect x={0} y={pixelSize * 20} width="100%" height={pixelSize * 2} fill={config.accent1} />
      <rect x={0} y={pixelSize * 24} width="100%" height={pixelSize * 2} fill={config.accent1} />
      {/* Lane markers */}
      {[4, 12, 20, 28].map((x) => (
        <rect key={x} x={pixelSize * x} y={pixelSize * 22} width={pixelSize * 2} height={pixelSize * 2} fill={config.accent1} />
      ))}
    </g>
  );
}

function MountainElements({ config, pixelSize }: ElementProps) {
  return (
    <g>
      {/* Mountains */}
      <polygon
        points={`${pixelSize * 0},${pixelSize * 20} ${pixelSize * 10},${pixelSize * 8} ${pixelSize * 20},${pixelSize * 20}`}
        fill={config.accent2}
      />
      <polygon
        points={`${pixelSize * 12},${pixelSize * 20} ${pixelSize * 22},${pixelSize * 6} ${pixelSize * 32},${pixelSize * 20}`}
        fill={config.details}
      />
      {/* Snow caps */}
      <polygon
        points={`${pixelSize * 7},${pixelSize * 11} ${pixelSize * 10},${pixelSize * 8} ${pixelSize * 13},${pixelSize * 11}`}
        fill={config.accent1}
      />
      <polygon
        points={`${pixelSize * 19},${pixelSize * 9} ${pixelSize * 22},${pixelSize * 6} ${pixelSize * 25},${pixelSize * 9}`}
        fill={config.accent1}
      />
      {/* Trees */}
      {[3, 8, 25, 29].map((x) => (
        <g key={x}>
          <rect x={pixelSize * x} y={pixelSize * 22} width={pixelSize} height={pixelSize * 3} fill="#78350F" />
          <polygon
            points={`${pixelSize * (x - 1)},${pixelSize * 22} ${pixelSize * (x + 0.5)},${pixelSize * 18} ${pixelSize * (x + 2)},${pixelSize * 22}`}
            fill={config.accent1 === '#FFFFFF' ? '#166534' : config.details}
          />
        </g>
      ))}
    </g>
  );
}

function BeachElements({ config, pixelSize }: ElementProps) {
  return (
    <g>
      {/* Waves */}
      {[0, 8, 16, 24].map((x) => (
        <path
          key={x}
          d={`M${pixelSize * x},${pixelSize * 16} Q${pixelSize * (x + 4)},${pixelSize * 14} ${pixelSize * (x + 8)},${pixelSize * 16}`}
          fill="none"
          stroke={config.accent1}
          strokeWidth={pixelSize}
        />
      ))}
      {/* Palm tree */}
      <rect x={pixelSize * 4} y={pixelSize * 14} width={pixelSize * 2} height={pixelSize * 10} fill="#78350F" />
      <ellipse cx={pixelSize * 5} cy={pixelSize * 12} rx={pixelSize * 4} ry={pixelSize * 3} fill="#22C55E" />
      {/* Sun */}
      <circle cx={pixelSize * 26} cy={pixelSize * 6} r={pixelSize * 3} fill="#FDE047" />
    </g>
  );
}

function CityElements({ config, pixelSize }: ElementProps) {
  return (
    <g>
      {/* Buildings */}
      {[
        { x: 2, h: 12, w: 4 },
        { x: 7, h: 16, w: 5 },
        { x: 13, h: 10, w: 4 },
        { x: 20, h: 14, w: 6 },
        { x: 27, h: 8, w: 4 },
      ].map((b, i) => (
        <g key={i}>
          <rect
            x={pixelSize * b.x}
            y={pixelSize * (20 - b.h)}
            width={pixelSize * b.w}
            height={pixelSize * b.h}
            fill={config.details}
          />
          {/* Windows */}
          {Array.from({ length: Math.floor(b.h / 3) }).map((_, j) => (
            <rect
              key={j}
              x={pixelSize * (b.x + 1)}
              y={pixelSize * (20 - b.h + 1 + j * 3)}
              width={pixelSize}
              height={pixelSize}
              fill={config.accent1}
            />
          ))}
        </g>
      ))}
      {/* Street lamp */}
      <rect x={pixelSize * 18} y={pixelSize * 16} width={pixelSize} height={pixelSize * 8} fill={config.accent2} />
      <circle cx={pixelSize * 18.5} cy={pixelSize * 15} r={pixelSize} fill={config.accent1} />
    </g>
  );
}

function ForestElements({ config, pixelSize }: ElementProps) {
  return (
    <g>
      {/* Trees at different depths */}
      {[
        { x: 2, scale: 0.6, color: config.details },
        { x: 6, scale: 0.8, color: config.accent2 },
        { x: 14, scale: 1, color: config.accent1 },
        { x: 22, scale: 0.7, color: config.accent2 },
        { x: 28, scale: 0.9, color: config.details },
      ].map((tree, i) => {
        const treeHeight = 10 * tree.scale;
        const treeWidth = 6 * tree.scale;
        return (
          <g key={i}>
            {/* Trunk */}
            <rect
              x={pixelSize * (tree.x + treeWidth / 2 - 0.5)}
              y={pixelSize * (22 - treeHeight * 0.3)}
              width={pixelSize}
              height={pixelSize * (treeHeight * 0.3 + 2)}
              fill="#78350F"
            />
            {/* Foliage layers */}
            <polygon
              points={`
                ${pixelSize * tree.x},${pixelSize * (22 - treeHeight * 0.3)}
                ${pixelSize * (tree.x + treeWidth / 2)},${pixelSize * (22 - treeHeight)}
                ${pixelSize * (tree.x + treeWidth)},${pixelSize * (22 - treeHeight * 0.3)}
              `}
              fill={tree.color}
            />
          </g>
        );
      })}
      {/* Sun rays through trees */}
      <line
        x1={pixelSize * 20}
        y1={pixelSize * 4}
        x2={pixelSize * 16}
        y2={pixelSize * 16}
        stroke="#FDE047"
        strokeWidth={pixelSize * 0.5}
        opacity={0.4}
      />
    </g>
  );
}

function GymElements({ config, pixelSize }: ElementProps) {
  return (
    <g>
      {/* Floor line */}
      <rect x={0} y={pixelSize * 24} width="100%" height={pixelSize} fill={config.details} />
      {/* Dumbbell rack (background) */}
      <rect x={pixelSize * 2} y={pixelSize * 12} width={pixelSize * 6} height={pixelSize * 12} fill={config.details} />
      {/* Dumbbells */}
      {[14, 16, 18].map((y) => (
        <g key={y}>
          <rect x={pixelSize * 3} y={pixelSize * y} width={pixelSize * 4} height={pixelSize} fill={config.accent2} />
          <rect x={pixelSize * 2.5} y={pixelSize * (y - 0.5)} width={pixelSize} height={pixelSize * 2} fill={config.accent1} />
          <rect x={pixelSize * 6.5} y={pixelSize * (y - 0.5)} width={pixelSize} height={pixelSize * 2} fill={config.accent1} />
        </g>
      ))}
      {/* Treadmill silhouette */}
      <rect x={pixelSize * 24} y={pixelSize * 16} width={pixelSize * 6} height={pixelSize * 8} fill={config.details} />
      <rect x={pixelSize * 25} y={pixelSize * 12} width={pixelSize * 4} height={pixelSize * 4} fill={config.details} />
    </g>
  );
}

export { THEME_CONFIGS };
