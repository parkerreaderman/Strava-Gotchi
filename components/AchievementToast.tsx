'use client';

import { useEffect, useState } from 'react';

export interface Achievement {
  id: number;
  slug: string;
  name: string;
  description: string;
  category: 'distance' | 'streak' | 'consistency' | 'milestone' | 'special';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  xpReward: number;
  iconUrl?: string;
}

interface AchievementToastProps {
  /** Achievement that was unlocked */
  achievement: Achievement;
  /** Callback when toast is dismissed */
  onDismiss: () => void;
  /** Auto-dismiss after ms (0 = no auto dismiss) */
  autoDismissMs?: number;
}

/**
 * Tier colors and styling
 */
const TIER_STYLES: Record<Achievement['tier'], {
  bg: string;
  border: string;
  glow: string;
  text: string;
  icon: string;
}> = {
  bronze: {
    bg: 'linear-gradient(135deg, #92400E 0%, #78350F 100%)',
    border: '#D97706',
    glow: 'rgba(217, 119, 6, 0.5)',
    text: '#FEF3C7',
    icon: '🥉',
  },
  silver: {
    bg: 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)',
    border: '#9CA3AF',
    glow: 'rgba(156, 163, 175, 0.5)',
    text: '#F9FAFB',
    icon: '🥈',
  },
  gold: {
    bg: 'linear-gradient(135deg, #CA8A04 0%, #A16207 100%)',
    border: '#EAB308',
    glow: 'rgba(234, 179, 8, 0.6)',
    text: '#FFFFFF',
    icon: '🥇',
  },
  platinum: {
    bg: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
    border: '#A855F7',
    glow: 'rgba(168, 85, 247, 0.6)',
    text: '#FFFFFF',
    icon: '💎',
  },
};

/**
 * Category icons
 */
const CATEGORY_ICONS: Record<Achievement['category'], string> = {
  distance: '🏃',
  streak: '🔥',
  consistency: '📅',
  milestone: '🎯',
  special: '⭐',
};

/**
 * AchievementToast - Pixel-styled achievement unlock notification
 */
export default function AchievementToast({
  achievement,
  onDismiss,
  autoDismissMs = 5000,
}: AchievementToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const tierStyle = TIER_STYLES[achievement.tier];
  const categoryIcon = CATEGORY_ICONS[achievement.category];

  // Dismiss handler
  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(onDismiss, 300);
  };

  // Entrance animation
  useEffect(() => {
    const enterTimeout = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(enterTimeout);
  }, []);

  // Auto-dismiss
  useEffect(() => {
    if (autoDismissMs <= 0) return;

    const dismissTimeout = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onDismiss, 300);
    }, autoDismissMs);

    return () => clearTimeout(dismissTimeout);
  }, [autoDismissMs, onDismiss]);

  return (
    <div
      className={`
        fixed top-4 right-4 z-50
        transition-all duration-300 ease-out
        ${isVisible && !isExiting ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'}
      `}
      style={{ fontFamily: 'monospace' }}
    >
      {/* Toast container */}
      <div
        className="relative overflow-hidden rounded-lg p-1 cursor-pointer"
        style={{
          background: tierStyle.bg,
          boxShadow: `0 0 20px ${tierStyle.glow}, 0 4px 20px rgba(0, 0, 0, 0.3)`,
        }}
        onClick={handleDismiss}
      >
        {/* Inner content */}
        <div
          className="relative p-4 rounded-md"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            border: `2px solid ${tierStyle.border}`,
            minWidth: '280px',
          }}
        >
          {/* Confetti particles (decorative) */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 animate-ping"
                style={{
                  backgroundColor: tierStyle.border,
                  left: `${20 + i * 15}%`,
                  top: `${10 + (i % 3) * 30}%`,
                  animationDelay: `${i * 0.1}s`,
                  opacity: 0.6,
                }}
              />
            ))}
          </div>

          {/* Header */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{tierStyle.icon}</span>
            <span
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color: tierStyle.text }}
            >
              Achievement Unlocked!
            </span>
          </div>

          {/* Achievement content */}
          <div className="flex items-start gap-3">
            {/* Badge */}
            <div
              className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                border: `2px solid ${tierStyle.border}`,
              }}
            >
              {categoryIcon}
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <div
                className="font-bold text-lg truncate"
                style={{ color: tierStyle.text }}
              >
                {achievement.name}
              </div>
              <div className="text-sm opacity-80" style={{ color: tierStyle.text }}>
                {achievement.description}
              </div>
            </div>
          </div>

          {/* XP reward */}
          <div className="mt-3 pt-2 border-t border-white/20 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span className="text-lg">⭐</span>
              <span
                className="font-bold"
                style={{ color: '#FDE047' }}
              >
                +{achievement.xpReward} XP
              </span>
            </div>
            <span className="text-xs opacity-60" style={{ color: tierStyle.text }}>
              Tap to dismiss
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
