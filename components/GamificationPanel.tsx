'use client';

import { useState } from 'react';
import LevelDisplay from './LevelDisplay';
import StreakDisplay from './StreakDisplay';
import ChallengeCard, { Challenge } from './ChallengeCard';
import RecoveryMeter, { RecoveryStatus } from './RecoveryMeter';
import RestDayLogger from './RestDayLogger';

interface GamificationStats {
  xp: number;
  level: number;
  levelProgress: number;
  xpUntilNextLevel?: number;
  evolutionStage: number;
  evolutionName: string;
  streak: {
    currentStreak: number;
    longestStreak: number;
    isActive: boolean;
    hoursUntilExpiry: number | null;
    availableFreezes: number;
  };
  totalActivities: number;
  achievementCount: number;
  /** CTL-based leveling: current CTL and range for current level */
  ctl?: number;
  ctlRange?: { min: number; max: number };
}

interface GamificationPanelProps {
  stats: GamificationStats | null;
  challenges: { daily: Challenge[]; weekly: Challenge[] } | null;
  recovery: RecoveryStatus | null;
  onClaimChallenge: (challengeId: number) => Promise<boolean>;
  onLogRestDay: (data: { type: string; notes: string; quality: number | null }) => Promise<boolean>;
  loading?: boolean;
}

/**
 * GamificationPanel - Sidebar panel showing all gamification elements
 */
export default function GamificationPanel({
  stats,
  challenges,
  recovery,
  onClaimChallenge,
  onLogRestDay,
  loading = false,
}: GamificationPanelProps) {
  const [showRestLogger, setShowRestLogger] = useState(false);
  const [loggingRest, setLoggingRest] = useState(false);

  const handleLogRestDay = async (data: { type: string; notes: string; quality: number | null }) => {
    setLoggingRest(true);
    const success = await onLogRestDay(data);
    setLoggingRest(false);
    if (success) {
      setShowRestLogger(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-slate-800 rounded-xl p-6 animate-pulse">
            <div className="h-4 bg-slate-700 rounded w-1/3 mb-4"></div>
            <div className="h-8 bg-slate-700 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-slate-800 rounded-xl p-6 text-center">
        <p className="text-gray-400">Connect to see your stats</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Level & progress (CTL or XP) */}
      <LevelDisplay
        level={stats.level}
        levelProgress={stats.levelProgress}
        mode={stats.ctl != null ? 'ctl' : 'xp'}
        ctl={stats.ctl}
        ctlRange={stats.ctlRange}
      />

      {/* Streak */}
      <StreakDisplay
        currentStreak={stats.streak.currentStreak}
        longestStreak={stats.streak.longestStreak}
        freezesAvailable={stats.streak.availableFreezes}
        atRisk={!stats.streak.isActive && stats.streak.hoursUntilExpiry !== null && stats.streak.hoursUntilExpiry < 12}
      />

      {/* Recovery */}
      {recovery && (
        <div>
          <RecoveryMeter status={recovery} />
          {!showRestLogger ? (
            <button
              onClick={() => setShowRestLogger(true)}
              className="w-full mt-2 py-2 rounded-lg text-sm font-bold uppercase tracking-wider bg-emerald-600/20 text-emerald-400 border border-emerald-600/50 hover:bg-emerald-600/30 transition-colors"
              style={{ fontFamily: 'monospace' }}
            >
              + Log Rest Day
            </button>
          ) : (
            <div className="mt-2">
              <RestDayLogger
                onSubmit={handleLogRestDay}
                onCancel={() => setShowRestLogger(false)}
                isLoading={loggingRest}
              />
            </div>
          )}
        </div>
      )}

      {/* Daily Challenges */}
      {challenges?.daily && challenges.daily.length > 0 && (
        <div>
          <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-3" style={{ fontFamily: 'monospace' }}>
            Daily Challenges
          </h3>
          <div className="space-y-3">
            {challenges.daily.map((challenge) => (
              <ChallengeCard
                key={challenge.id}
                challenge={{
                  ...challenge,
                  type: 'daily',
                  requirement: {
                    type: challenge.requirement.type as 'duration' | 'distance' | 'activities' | 'tss',
                    value: challenge.requirement.value,
                    current: challenge.requirement.current,
                  },
                }}
                onClaim={challenge.completed && !challenge.claimed ? () => onClaimChallenge(challenge.id) : undefined}
              />
            ))}
          </div>
        </div>
      )}

      {/* Weekly Challenges */}
      {challenges?.weekly && challenges.weekly.length > 0 && (
        <div>
          <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-3" style={{ fontFamily: 'monospace' }}>
            Weekly Challenges
          </h3>
          <div className="space-y-3">
            {challenges.weekly.map((challenge) => (
              <ChallengeCard
                key={challenge.id}
                challenge={{
                  ...challenge,
                  type: 'weekly',
                  requirement: {
                    type: challenge.requirement.type as 'duration' | 'distance' | 'activities' | 'tss',
                    value: challenge.requirement.value,
                    current: challenge.requirement.current,
                  },
                }}
                onClaim={challenge.completed && !challenge.claimed ? () => onClaimChallenge(challenge.id) : undefined}
              />
            ))}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="bg-slate-800 rounded-xl p-4" style={{ fontFamily: 'monospace' }}>
        <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-3">
          Quick Stats
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-700/50 rounded-lg p-3 text-center">
            <div className="text-2xl mb-1">🏃</div>
            <div className="text-white font-bold">{stats.totalActivities}</div>
            <div className="text-gray-400 text-xs">Activities</div>
          </div>
          <div className="bg-slate-700/50 rounded-lg p-3 text-center">
            <div className="text-2xl mb-1">🏆</div>
            <div className="text-white font-bold">{stats.achievementCount}</div>
            <div className="text-gray-400 text-xs">Achievements</div>
          </div>
        </div>
      </div>
    </div>
  );
}
