'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * Types for gamification data
 */
export interface GamificationStats {
  xp: number;
  level: number;
  levelProgress: number;
  xpUntilNextLevel: number;
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
  totalDistance: number;
  totalDuration: number;
  achievementCount: number;
}

export interface Challenge {
  id: number;
  name: string;
  description: string;
  type: 'daily' | 'weekly';
  xpReward: number;
  progress: number;
  requirement: {
    type: 'duration' | 'distance' | 'activities' | 'tss';
    value: number;
    current: number;
    formatted?: string;
    currentFormatted?: string;
  };
  completed: boolean;
  claimed: boolean;
  expiresAt: string;
  timeRemaining?: string;
}

export interface Achievement {
  id: number;
  slug: string;
  name: string;
  description: string;
  category: 'distance' | 'streak' | 'consistency' | 'milestone' | 'special';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  xpReward: number;
  earned: boolean;
  earnedAt?: string;
  progress?: number;
}

export interface RecoveryStatus {
  needsRest: boolean;
  consecutiveTrainingDays: number;
  lastRestDay: string | null;
  recoveryScore: number;
  recommendation: string;
  scoreColor: string;
  scoreLabel: string;
}

export interface GamificationData {
  stats: GamificationStats | null;
  challenges: { daily: Challenge[]; weekly: Challenge[] } | null;
  achievements: Achievement[] | null;
  recovery: RecoveryStatus | null;
  loading: boolean;
  error: string | null;
}

/**
 * Hook to fetch and manage gamification data
 */
export function useGamification(userId: number | null): GamificationData & {
  refresh: () => Promise<void>;
  claimChallenge: (challengeId: number) => Promise<boolean>;
  logRestDay: (data: { type: string; notes: string; quality: number | null }) => Promise<boolean>;
} {
  const [stats, setStats] = useState<GamificationStats | null>(null);
  const [challenges, setChallenges] = useState<{ daily: Challenge[]; weekly: Challenge[] } | null>(null);
  const [achievements, setAchievements] = useState<Achievement[] | null>(null);
  const [recovery, setRecovery] = useState<RecoveryStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!userId) return null;
    const res = await fetch(`/api/gamification/stats?userId=${userId}`);
    if (!res.ok) throw new Error('Failed to fetch stats');
    return res.json();
  }, [userId]);

  const fetchChallenges = useCallback(async () => {
    if (!userId) return null;
    const res = await fetch(`/api/gamification/challenges?userId=${userId}`);
    if (!res.ok) throw new Error('Failed to fetch challenges');
    return res.json();
  }, [userId]);

  const fetchAchievements = useCallback(async () => {
    if (!userId) return null;
    const res = await fetch(`/api/gamification/achievements?userId=${userId}`);
    if (!res.ok) throw new Error('Failed to fetch achievements');
    return res.json();
  }, [userId]);

  const fetchRecovery = useCallback(async () => {
    if (!userId) return null;
    const res = await fetch(`/api/gamification/recovery?userId=${userId}`);
    if (!res.ok) throw new Error('Failed to fetch recovery');
    return res.json();
  }, [userId]);

  const refresh = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const [statsData, challengesData, achievementsData, recoveryData] = await Promise.all([
        fetchStats(),
        fetchChallenges(),
        fetchAchievements(),
        fetchRecovery(),
      ]);

      setStats(statsData);
      setChallenges(challengesData);
      setAchievements(achievementsData?.achievements || null);
      setRecovery(recoveryData?.status || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch gamification data');
    } finally {
      setLoading(false);
    }
  }, [userId, fetchStats, fetchChallenges, fetchAchievements, fetchRecovery]);

  const claimChallenge = useCallback(async (challengeId: number): Promise<boolean> => {
    if (!userId) return false;

    try {
      const res = await fetch('/api/gamification/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, challengeId }),
      });

      if (!res.ok) return false;

      // Refresh data after claiming
      await refresh();
      return true;
    } catch {
      return false;
    }
  }, [userId, refresh]);

  const logRestDay = useCallback(async (data: { type: string; notes: string; quality: number | null }): Promise<boolean> => {
    if (!userId) return false;

    try {
      const res = await fetch('/api/gamification/recovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...data }),
      });

      if (!res.ok) return false;

      // Refresh data after logging
      await refresh();
      return true;
    } catch {
      return false;
    }
  }, [userId, refresh]);

  // Initial fetch
  useEffect(() => {
    if (userId) {
      refresh();
    }
  }, [userId, refresh]);

  return {
    stats,
    challenges,
    achievements,
    recovery,
    loading,
    error,
    refresh,
    claimChallenge,
    logRestDay,
  };
}

export default useGamification;
