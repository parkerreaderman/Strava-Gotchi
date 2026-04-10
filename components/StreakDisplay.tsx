'use client';

interface StreakDay {
  date: string;
  hasActivity: boolean;
}

interface StreakDisplayProps {
  /** Current streak count */
  currentStreak: number;
  /** Longest streak ever achieved */
  longestStreak: number;
  /** Last 7 days of activity (for calendar view) */
  recentDays?: StreakDay[];
  /** Number of streak freezes available */
  freezesAvailable?: number;
  /** Whether streak is at risk of breaking */
  atRisk?: boolean;
  /** Whether to show compact version */
  compact?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * StreakDisplay - Pixel-styled streak counter with fire animation
 */
export default function StreakDisplay({
  currentStreak,
  longestStreak,
  recentDays,
  freezesAvailable = 0,
  atRisk = false,
  compact = false,
  className = '',
}: StreakDisplayProps) {
  // Generate default recent days if not provided
  const days = recentDays || generateDefaultDays(currentStreak);

  // Get streak tier for styling
  const streakTier = getStreakTier(currentStreak);

  if (compact) {
    return (
      <div
        className={`flex items-center gap-2 ${className}`}
        style={{ fontFamily: 'monospace' }}
      >
        {/* Fire icon with animation */}
        <div
          className={`text-2xl ${atRisk ? 'animate-pulse' : ''}`}
          style={{
            filter: atRisk ? 'grayscale(50%)' : 'none',
          }}
        >
          🔥
        </div>

        {/* Streak count */}
        <div
          className="px-2 py-1 rounded font-bold"
          style={{
            backgroundColor: streakTier.bgColor,
            color: streakTier.textColor,
            border: `2px solid ${streakTier.borderColor}`,
            imageRendering: 'pixelated',
          }}
        >
          {currentStreak}
        </div>

        {/* At risk indicator */}
        {atRisk && (
          <span className="text-xs text-orange-400 animate-pulse">!</span>
        )}
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
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Fire icon with glow */}
          <div
            className={`text-4xl ${currentStreak > 0 ? 'animate-bounce' : ''}`}
            style={{
              filter: currentStreak > 0 ? `drop-shadow(0 0 8px ${streakTier.glowColor})` : 'grayscale(100%)',
            }}
          >
            🔥
          </div>
          <div>
            <div className="text-xs text-gray-400 uppercase tracking-wider">
              Current Streak
            </div>
            <div
              className="text-4xl font-bold"
              style={{ color: streakTier.textColor }}
            >
              {currentStreak}
              <span className="text-lg ml-1 text-gray-500">days</span>
            </div>
          </div>
        </div>

        {/* Best streak */}
        <div className="text-right">
          <div className="text-xs text-gray-400 uppercase tracking-wider">Best</div>
          <div className="text-xl font-bold text-gray-300">
            {longestStreak}
            <span className="text-sm ml-1 text-gray-500">days</span>
          </div>
        </div>
      </div>

      {/* Weekly calendar */}
      <div className="mb-4">
        <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">
          This Week
        </div>
        <div className="flex gap-1">
          {days.map((day, index) => {
            const dayLabel = getDayLabel(day.date);
            const isToday = isDateToday(day.date);

            return (
              <div key={index} className="flex-1 text-center">
                <div className="text-xs text-gray-500 mb-1">{dayLabel}</div>
                <div
                  className={`
                    h-8 rounded flex items-center justify-center text-lg
                    ${isToday ? 'ring-2 ring-yellow-400' : ''}
                  `}
                  style={{
                    backgroundColor: day.hasActivity ? '#22C55E' : '#374151',
                    color: day.hasActivity ? '#FFFFFF' : '#6B7280',
                  }}
                >
                  {day.hasActivity ? '✓' : '·'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer with freezes and status */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-700">
        {/* Streak freezes */}
        <div className="flex items-center gap-2">
          <span className="text-lg">❄️</span>
          <div>
            <div className="text-xs text-gray-400">Freezes</div>
            <div className="flex gap-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="w-4 h-4 rounded"
                  style={{
                    backgroundColor: i < freezesAvailable ? '#60A5FA' : '#374151',
                    border: '1px solid #1E293B',
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Status */}
        {atRisk ? (
          <div className="flex items-center gap-2 text-orange-400 animate-pulse">
            <span>⚠️</span>
            <span className="text-xs font-bold uppercase">Streak at risk!</span>
          </div>
        ) : currentStreak > 0 ? (
          <div className="flex items-center gap-2 text-green-400">
            <span>✨</span>
            <span className="text-xs font-bold uppercase">Keep it going!</span>
          </div>
        ) : (
          <div className="text-xs text-gray-500">
            Complete an activity to start your streak
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Get streak tier styling based on streak count
 */
function getStreakTier(streak: number): {
  bgColor: string;
  textColor: string;
  borderColor: string;
  glowColor: string;
} {
  if (streak >= 100) {
    return {
      bgColor: '#7C3AED',
      textColor: '#FDE047',
      borderColor: '#A855F7',
      glowColor: '#A855F7',
    };
  }
  if (streak >= 30) {
    return {
      bgColor: '#EA580C',
      textColor: '#FFFFFF',
      borderColor: '#F97316',
      glowColor: '#F97316',
    };
  }
  if (streak >= 7) {
    return {
      bgColor: '#DC2626',
      textColor: '#FFFFFF',
      borderColor: '#EF4444',
      glowColor: '#EF4444',
    };
  }
  if (streak >= 1) {
    return {
      bgColor: '#F59E0B',
      textColor: '#1E293B',
      borderColor: '#FBBF24',
      glowColor: '#FBBF24',
    };
  }
  return {
    bgColor: '#374151',
    textColor: '#9CA3AF',
    borderColor: '#4B5563',
    glowColor: 'transparent',
  };
}

/**
 * Generate default days for the last 7 days
 */
function generateDefaultDays(currentStreak: number): StreakDay[] {
  const days: StreakDay[] = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    days.push({
      date: date.toISOString().split('T')[0],
      hasActivity: i < currentStreak && i < 7,
    });
  }

  return days;
}

/**
 * Get short day label from date string
 */
function getDayLabel(dateString: string): string {
  const date = new Date(dateString);
  return ['S', 'M', 'T', 'W', 'T', 'F', 'S'][date.getDay()];
}

/**
 * Check if date is today
 */
function isDateToday(dateString: string): boolean {
  const today = new Date().toISOString().split('T')[0];
  return dateString === today;
}

export type { StreakDay };
