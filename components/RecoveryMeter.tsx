'use client';

import { useMemo } from 'react';

export interface RecoveryStatus {
  needsRest: boolean;
  consecutiveTrainingDays: number;
  lastRestDay: string | null;
  recoveryScore: number;
  recommendation: string;
  scoreColor: string;
  scoreLabel: string;
}

interface RecoveryMeterProps {
  status: RecoveryStatus;
  className?: string;
}

/**
 * RecoveryMeter - Pixel-styled recovery status display
 */
export default function RecoveryMeter({
  status,
  className = '',
}: RecoveryMeterProps) {
  // Calculate segment fills for the meter
  const segments = useMemo(() => {
    const total = 10;
    const filled = Math.round((status.recoveryScore / 100) * total);
    return Array.from({ length: total }, (_, i) => i < filled);
  }, [status.recoveryScore]);

  // Get icon based on score
  const getIcon = () => {
    if (status.recoveryScore >= 70) return '💚';
    if (status.recoveryScore >= 50) return '💛';
    if (status.recoveryScore >= 30) return '🧡';
    return '❤️';
  };

  // Days since last rest
  const daysSinceRest = useMemo(() => {
    if (!status.lastRestDay) return null;
    const lastRest = new Date(status.lastRestDay);
    const now = new Date();
    return Math.floor((now.getTime() - lastRest.getTime()) / (1000 * 60 * 60 * 24));
  }, [status.lastRestDay]);

  return (
    <div
      className={`bg-slate-800 rounded-xl p-4 ${className}`}
      style={{ fontFamily: 'monospace' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{getIcon()}</span>
          <span className="text-white font-bold text-sm uppercase tracking-wider">
            Recovery
          </span>
        </div>
        <div
          className="px-3 py-1 rounded-full text-xs font-bold uppercase"
          style={{
            backgroundColor: status.scoreColor,
            color: status.recoveryScore >= 50 ? '#1F2937' : '#FFFFFF',
          }}
        >
          {status.scoreLabel}
        </div>
      </div>

      {/* Score meter */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-gray-400 text-xs">Score</span>
          <span className="text-white font-bold">{status.recoveryScore}%</span>
        </div>
        <div className="flex gap-1">
          {segments.map((filled, i) => (
            <div
              key={i}
              className="flex-1 h-3 rounded-sm transition-all duration-300"
              style={{
                backgroundColor: filled ? status.scoreColor : 'rgba(255,255,255,0.1)',
                boxShadow: filled ? `0 0 4px ${status.scoreColor}` : 'none',
              }}
            />
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-slate-700/50 rounded-lg p-2">
          <div className="text-gray-400 text-xs mb-1">Training Days</div>
          <div className="text-white font-bold text-lg">
            {status.consecutiveTrainingDays}
            <span className="text-gray-400 text-xs ml-1">consecutive</span>
          </div>
        </div>
        <div className="bg-slate-700/50 rounded-lg p-2">
          <div className="text-gray-400 text-xs mb-1">Last Rest</div>
          <div className="text-white font-bold text-lg">
            {daysSinceRest !== null ? (
              <>
                {daysSinceRest}
                <span className="text-gray-400 text-xs ml-1">
                  {daysSinceRest === 1 ? 'day ago' : 'days ago'}
                </span>
              </>
            ) : (
              <span className="text-gray-400 text-sm">No data</span>
            )}
          </div>
        </div>
      </div>

      {/* Recommendation */}
      <div
        className={`p-3 rounded-lg ${
          status.needsRest
            ? 'bg-red-900/30 border border-red-500/50'
            : 'bg-slate-700/50'
        }`}
      >
        <div className="flex items-start gap-2">
          <span className="text-lg">{status.needsRest ? '⚠️' : '💡'}</span>
          <p className="text-sm text-gray-300">{status.recommendation}</p>
        </div>
      </div>

      {/* Rest needed warning */}
      {status.needsRest && (
        <div className="mt-3 text-center">
          <span className="text-red-400 text-xs font-bold uppercase tracking-wider animate-pulse">
            Rest Day Recommended
          </span>
        </div>
      )}
    </div>
  );
}
