'use client';

export type LevelDisplayMode = 'ctl' | 'xp';

interface LevelDisplayProps {
  /** Current level (0–14+ with CTL; 1+ with XP) */
  level: number;
  /** Progress toward next level, 0–100 (e.g. CTL progress within band or XP %) */
  levelProgress: number;
  /** Display mode: 'ctl' = Fitness/CTL, 'xp' = XP */
  mode?: LevelDisplayMode;
  /** Current CTL (for ctl mode label, e.g. "55 CTL") */
  ctl?: number;
  /** CTL range for current level (for expanded label, e.g. "51–60 CTL") */
  ctlRange?: { min: number; max: number };
  /** Compact view (e.g. for header) */
  compact?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * LevelDisplay – level and progress with optional CTL or XP semantics.
 * Use mode="ctl" for fitness-based leveling (levelProgress = % within CTL band).
 */
export default function LevelDisplay({
  level,
  levelProgress,
  mode = 'ctl',
  ctl,
  ctlRange,
  compact = false,
  className = '',
}: LevelDisplayProps) {
  const progress = Math.min(100, Math.max(0, levelProgress));
  const segments = 10;
  const filledSegments = Math.floor((progress / 100) * segments);

  const label = mode === 'ctl' ? 'Fitness' : 'XP';
  const valueLabel =
    mode === 'ctl' && (ctl !== undefined || ctlRange)
      ? ctl !== undefined
        ? `${ctl} CTL`
        : ctlRange
          ? `${ctlRange.min}–${ctlRange.max} CTL`
          : null
      : null;

  if (compact) {
    return (
      <div
        className={`flex items-center gap-2 ${className}`}
        style={{ fontFamily: 'monospace' }}
      >
        <div
          className="flex items-center justify-center px-2 py-1 rounded"
          style={{
            backgroundColor: '#1E293B',
            color: '#FDE047',
            border: '2px solid #FDE047',
            imageRendering: 'pixelated',
          }}
        >
          <span className="text-xs font-bold">Lv.</span>
          <span className="text-lg font-bold ml-1">{level}</span>
        </div>
        <div
          className="flex gap-0.5"
          style={{ imageRendering: 'pixelated' }}
        >
          {Array.from({ length: segments }).map((_, i) => (
            <div
              key={i}
              className="w-2 h-3 rounded-sm"
              style={{
                backgroundColor: i < filledSegments ? '#FDE047' : '#374151',
                border: '1px solid #1E293B',
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`p-4 rounded-lg ${className}`}
      style={{
        backgroundColor: '#1E293B',
        border: '3px solid #374151',
        fontFamily: 'monospace',
        imageRendering: 'pixelated',
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">⭐</span>
          <div>
            <div className="text-xs text-gray-400 uppercase tracking-wider">{label}</div>
            <div className="text-3xl font-bold text-yellow-400">{level}</div>
          </div>
        </div>
        {valueLabel && (
          <div className="text-right">
            <div className="text-xs text-gray-400 uppercase tracking-wider">CTL</div>
            <div className="text-lg font-bold text-white">{valueLabel}</div>
          </div>
        )}
      </div>

      <div className="relative">
        <div
          className="h-6 rounded flex gap-1 p-1"
          style={{ backgroundColor: '#0F172A' }}
        >
          {Array.from({ length: segments }).map((_, i) => (
            <div
              key={i}
              className="flex-1 rounded-sm transition-all duration-300"
              style={{
                backgroundColor: i < filledSegments ? '#FDE047' : '#1E293B',
                boxShadow: i < filledSegments ? '0 0 4px #FDE047' : 'none',
              }}
            />
          ))}
        </div>
        <div
          className="absolute inset-0 flex items-center justify-center text-xs font-bold"
          style={{ color: progress > 50 ? '#1E293B' : '#9CA3AF' }}
        >
          {Math.round(progress)}%
        </div>
      </div>

      <div className="mt-2 text-center text-xs text-gray-500">
        {mode === 'ctl'
          ? `${100 - Math.round(progress)}% to next level`
          : `${Math.round(progress)}% to next level`}
      </div>
    </div>
  );
}
