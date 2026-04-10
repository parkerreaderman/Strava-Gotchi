'use client';

import { useState } from 'react';
import type { Achievement } from './AchievementToast';

interface AchievementWithProgress extends Achievement {
  earned: boolean;
  earnedAt?: string;
  progress?: number; // 0-100 for partial progress
}

interface AchievementGridProps {
  /** List of all achievements with progress */
  achievements: AchievementWithProgress[];
  /** Filter by category (optional) */
  categoryFilter?: Achievement['category'] | 'all';
  /** Whether to show locked achievements */
  showLocked?: boolean;
  /** Callback when achievement is clicked */
  onAchievementClick?: (achievement: AchievementWithProgress) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Tier styling for badges
 */
const TIER_STYLES: Record<Achievement['tier'], {
  border: string;
  bg: string;
  glow: string;
}> = {
  bronze: { border: '#D97706', bg: '#78350F', glow: 'rgba(217, 119, 6, 0.3)' },
  silver: { border: '#9CA3AF', bg: '#4B5563', glow: 'rgba(156, 163, 175, 0.3)' },
  gold: { border: '#EAB308', bg: '#A16207', glow: 'rgba(234, 179, 8, 0.4)' },
  platinum: { border: '#A855F7', bg: '#6D28D9', glow: 'rgba(168, 85, 247, 0.4)' },
};

/**
 * Category icons and labels
 */
const CATEGORIES: Record<Achievement['category'] | 'all', { icon: string; label: string }> = {
  all: { icon: '🏆', label: 'All' },
  distance: { icon: '🏃', label: 'Distance' },
  streak: { icon: '🔥', label: 'Streaks' },
  consistency: { icon: '📅', label: 'Consistency' },
  milestone: { icon: '🎯', label: 'Milestones' },
  special: { icon: '⭐', label: 'Special' },
};

/**
 * AchievementGrid - Display grid of achievements with filtering
 */
export default function AchievementGrid({
  achievements,
  categoryFilter: initialFilter = 'all',
  showLocked = true,
  onAchievementClick,
  className = '',
}: AchievementGridProps) {
  const [filter, setFilter] = useState<Achievement['category'] | 'all'>(initialFilter);
  const [selectedAchievement, setSelectedAchievement] = useState<AchievementWithProgress | null>(null);

  // Filter achievements
  const filteredAchievements = achievements.filter((a) => {
    if (filter !== 'all' && a.category !== filter) return false;
    if (!showLocked && !a.earned) return false;
    return true;
  });

  // Count stats
  const earnedCount = achievements.filter((a) => a.earned).length;
  const totalCount = achievements.length;

  const handleAchievementClick = (achievement: AchievementWithProgress) => {
    setSelectedAchievement(achievement);
    onAchievementClick?.(achievement);
  };

  return (
    <div
      className={`${className}`}
      style={{ fontFamily: 'monospace', imageRendering: 'pixelated' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏆</span>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Achievements</h3>
            <p className="text-sm text-gray-500">
              {earnedCount} / {totalCount} unlocked
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-32">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-yellow-400 transition-all duration-300"
              style={{ width: `${(earnedCount / totalCount) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Category filter tabs */}
      <div className="flex gap-1 mb-4 overflow-x-auto pb-2">
        {(Object.keys(CATEGORIES) as Array<Achievement['category'] | 'all'>).map((category) => {
          const { icon, label } = CATEGORIES[category];
          const isActive = filter === category;
          const count = category === 'all'
            ? achievements.length
            : achievements.filter((a) => a.category === category).length;

          return (
            <button
              key={category}
              onClick={() => setFilter(category)}
              className={`
                flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-bold
                transition-all duration-200
                ${isActive
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
              `}
            >
              <span>{icon}</span>
              <span>{label}</span>
              <span className="ml-1 opacity-60">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Achievement grid */}
      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
        {filteredAchievements.map((achievement) => (
          <AchievementBadge
            key={achievement.id}
            achievement={achievement}
            onClick={() => handleAchievementClick(achievement)}
          />
        ))}
      </div>

      {/* Empty state */}
      {filteredAchievements.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <span className="text-4xl block mb-2">🔍</span>
          <p>No achievements in this category yet</p>
        </div>
      )}

      {/* Achievement detail modal */}
      {selectedAchievement && (
        <AchievementDetailModal
          achievement={selectedAchievement}
          onClose={() => setSelectedAchievement(null)}
        />
      )}
    </div>
  );
}

/**
 * Individual achievement badge
 */
function AchievementBadge({
  achievement,
  onClick,
}: {
  achievement: AchievementWithProgress;
  onClick: () => void;
}) {
  const tierStyle = TIER_STYLES[achievement.tier];
  const categoryIcon = CATEGORIES[achievement.category].icon;

  return (
    <button
      onClick={onClick}
      className={`
        relative aspect-square rounded-lg p-2
        transition-all duration-200
        ${achievement.earned
          ? 'hover:scale-110 hover:z-10'
          : 'opacity-40 grayscale hover:opacity-60'
        }
      `}
      style={{
        backgroundColor: achievement.earned ? tierStyle.bg : '#374151',
        border: `3px solid ${achievement.earned ? tierStyle.border : '#4B5563'}`,
        boxShadow: achievement.earned ? `0 0 10px ${tierStyle.glow}` : 'none',
      }}
      title={achievement.name}
    >
      {/* Icon */}
      <div className="flex items-center justify-center h-full text-2xl">
        {achievement.earned ? categoryIcon : '🔒'}
      </div>

      {/* Progress indicator (for partially completed) */}
      {!achievement.earned && achievement.progress !== undefined && achievement.progress > 0 && (
        <div
          className="absolute bottom-0 left-0 right-0 h-1 bg-gray-600 rounded-b"
        >
          <div
            className="h-full bg-yellow-400 rounded-b transition-all"
            style={{ width: `${achievement.progress}%` }}
          />
        </div>
      )}

      {/* New badge indicator */}
      {achievement.earned && achievement.earnedAt && isRecent(achievement.earnedAt) && (
        <div
          className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center animate-pulse"
        >
          !
        </div>
      )}
    </button>
  );
}

/**
 * Achievement detail modal
 */
function AchievementDetailModal({
  achievement,
  onClose,
}: {
  achievement: AchievementWithProgress;
  onClose: () => void;
}) {
  const tierStyle = TIER_STYLES[achievement.tier];
  const categoryInfo = CATEGORIES[achievement.category];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Modal */}
      <div
        className="relative max-w-sm w-full rounded-xl overflow-hidden"
        style={{
          backgroundColor: '#1E293B',
          border: `4px solid ${achievement.earned ? tierStyle.border : '#4B5563'}`,
          boxShadow: achievement.earned ? `0 0 30px ${tierStyle.glow}` : 'none',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="p-4 text-center"
          style={{
            background: achievement.earned ? tierStyle.bg : '#374151',
          }}
        >
          <div className="text-5xl mb-2">
            {achievement.earned ? categoryInfo.icon : '🔒'}
          </div>
          <h3 className="text-xl font-bold text-white">{achievement.name}</h3>
          <div className="text-sm text-white/70 mt-1 capitalize">
            {achievement.tier} • {categoryInfo.label}
          </div>
        </div>

        {/* Body */}
        <div className="p-4">
          <p className="text-gray-300 text-center mb-4">
            {achievement.description}
          </p>

          {achievement.earned ? (
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-900/50 rounded-lg text-green-400">
                <span>✓</span>
                <span>Unlocked</span>
                {achievement.earnedAt && (
                  <span className="text-green-600 text-sm">
                    {formatDate(achievement.earnedAt)}
                  </span>
                )}
              </div>
              <div className="mt-3 text-yellow-400 font-bold">
                +{achievement.xpReward} XP earned
              </div>
            </div>
          ) : (
            <div className="text-center">
              {achievement.progress !== undefined && achievement.progress > 0 && (
                <div className="mb-3">
                  <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 transition-all"
                      style={{ width: `${achievement.progress}%` }}
                    />
                  </div>
                  <div className="text-sm text-gray-400 mt-1">
                    {Math.round(achievement.progress)}% complete
                  </div>
                </div>
              )}
              <div className="text-gray-400">
                Complete to earn{' '}
                <span className="text-yellow-400 font-bold">+{achievement.xpReward} XP</span>
              </div>
            </div>
          )}
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center text-white/60 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

/**
 * Check if date is within last 24 hours
 */
function isRecent(dateString: string): boolean {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  return diff < 24 * 60 * 60 * 1000;
}

/**
 * Format date for display
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export type { AchievementWithProgress };
