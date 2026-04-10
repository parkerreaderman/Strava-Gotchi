'use client';

export interface Challenge {
  id: number;
  name: string;
  description: string;
  type: 'daily' | 'weekly';
  xpReward: number;
  progress: number; // 0-100
  completed: boolean;
  claimed?: boolean;
  requirement: {
    type: 'duration' | 'distance' | 'activities' | 'tss';
    value: number;
    current: number;
  };
  expiresAt: string;
}

interface ChallengeCardProps {
  challenge: Challenge;
  onClaim?: (challenge: Challenge) => void;
  className?: string;
}

/**
 * Type-specific icons and colors
 */
const CHALLENGE_STYLES = {
  daily: {
    icon: '☀️',
    label: 'Daily',
    bg: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
    border: '#FBBF24',
    accent: '#FEF3C7',
  },
  weekly: {
    icon: '📅',
    label: 'Weekly',
    bg: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
    border: '#A78BFA',
    accent: '#EDE9FE',
  },
};

/**
 * Requirement type labels
 */
const REQUIREMENT_LABELS: Record<Challenge['requirement']['type'], { unit: string; format: (val: number) => string }> = {
  duration: { unit: 'min', format: (v) => `${Math.round(v / 60)}` },
  distance: { unit: 'km', format: (v) => `${(v / 1000).toFixed(1)}` },
  activities: { unit: '', format: (v) => `${v}` },
  tss: { unit: 'TSS', format: (v) => `${Math.round(v)}` },
};

/**
 * ChallengeCard - Pixel-styled challenge display with progress
 */
export default function ChallengeCard({
  challenge,
  onClaim,
  className = '',
}: ChallengeCardProps) {
  const style = CHALLENGE_STYLES[challenge.type];
  const reqLabel = REQUIREMENT_LABELS[challenge.requirement.type];
  const timeRemaining = getTimeRemaining(challenge.expiresAt);
  const isExpired = new Date(challenge.expiresAt) < new Date();

  return (
    <div
      className={`relative overflow-hidden rounded-xl ${className}`}
      style={{
        background: challenge.completed ? '#1E293B' : style.bg,
        border: `3px solid ${challenge.completed ? '#22C55E' : style.border}`,
        fontFamily: 'monospace',
        imageRendering: 'pixelated',
      }}
    >
      {/* Completed overlay */}
      {challenge.completed && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-green-900/30"
          style={{ backdropFilter: 'blur(2px)' }}
        >
          <div className="text-center">
            <div className="text-4xl mb-2">✅</div>
            <div className="text-green-400 font-bold text-lg">COMPLETE!</div>
          </div>
        </div>
      )}

      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">{style.icon}</span>
            <span
              className="text-xs font-bold uppercase tracking-wider px-2 py-1 rounded"
              style={{
                backgroundColor: 'rgba(0,0,0,0.2)',
                color: challenge.completed ? '#22C55E' : style.accent,
              }}
            >
              {style.label} Challenge
            </span>
          </div>

          {/* Time remaining */}
          {!challenge.completed && !isExpired && (
            <div
              className="text-xs px-2 py-1 rounded"
              style={{
                backgroundColor: 'rgba(0,0,0,0.2)',
                color: style.accent,
              }}
            >
              ⏰ {timeRemaining}
            </div>
          )}
        </div>

        {/* Challenge info */}
        <div className="mb-4">
          <h4 className="font-bold text-lg text-white mb-1">
            {challenge.name}
          </h4>
          <p className="text-sm text-white/70">
            {challenge.description}
          </p>
        </div>

        {/* Progress section */}
        <div className="mb-4">
          {/* Progress text */}
          <div className="flex items-center justify-between mb-2 text-sm">
            <span className="text-white/70">Progress</span>
            <span className="font-bold text-white">
              {reqLabel.format(challenge.requirement.current)}
              {' / '}
              {reqLabel.format(challenge.requirement.value)}
              {reqLabel.unit && ` ${reqLabel.unit}`}
            </span>
          </div>

          {/* Progress bar */}
          <div className="relative h-4 rounded overflow-hidden bg-black/30">
            {/* Segments */}
            <div className="absolute inset-0 flex gap-0.5 p-0.5">
              {Array.from({ length: 10 }).map((_, i) => {
                const segmentFilled = i < Math.floor(challenge.progress / 10);
                const partialFill = i === Math.floor(challenge.progress / 10)
                  ? (challenge.progress % 10) * 10
                  : 0;

                return (
                  <div
                    key={i}
                    className="flex-1 rounded-sm overflow-hidden"
                    style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
                  >
                    <div
                      className="h-full transition-all duration-300"
                      style={{
                        width: segmentFilled ? '100%' : `${partialFill}%`,
                        backgroundColor: challenge.completed ? '#22C55E' : style.accent,
                        boxShadow: segmentFilled ? `0 0 4px ${style.accent}` : 'none',
                      }}
                    />
                  </div>
                );
              })}
            </div>

            {/* Percentage label */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                className="text-xs font-bold"
                style={{
                  color: challenge.progress > 50 ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.7)',
                  textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                }}
              >
                {Math.round(challenge.progress)}%
              </span>
            </div>
          </div>
        </div>

        {/* Reward / Claim section */}
        <div className="flex items-center justify-between">
          {/* XP reward */}
          <div className="flex items-center gap-2">
            <span className="text-lg">⭐</span>
            <span
              className="font-bold"
              style={{ color: '#FDE047' }}
            >
              +{challenge.xpReward} XP
            </span>
          </div>

          {/* Claim button (if completed but not claimed) */}
          {challenge.completed && onClaim && (
            <button
              onClick={() => onClaim(challenge)}
              className="px-4 py-2 rounded-lg font-bold text-sm uppercase tracking-wider transition-all hover:scale-105"
              style={{
                backgroundColor: '#22C55E',
                color: '#FFFFFF',
                boxShadow: '0 0 10px rgba(34, 197, 94, 0.5)',
              }}
            >
              Claim Reward
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Get human-readable time remaining string
 */
function getTimeRemaining(expiresAt: string): string {
  const now = new Date();
  const expires = new Date(expiresAt);
  const diff = expires.getTime() - now.getTime();

  if (diff <= 0) return 'Expired';

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h`;
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m`;
}
