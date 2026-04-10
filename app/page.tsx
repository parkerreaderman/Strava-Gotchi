'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import SportyGotchi, { WearableItems } from '@/components/SportyGotchi';
import SetupScreen from '@/components/SetupScreen';
import TrainingGraph from '@/components/TrainingGraph';
import Locker from '@/components/Locker';
import AchievementGrid from '@/components/AchievementGrid';
import AchievementToast, { Achievement } from '@/components/AchievementToast';
import MetricCard from '@/components/MetricCard';
import CollapsibleSection from '@/components/CollapsibleSection';
import SettingsPanel from '@/components/SettingsPanel';
import RecoveryMeter, { RecoveryStatus } from '@/components/RecoveryMeter';
import RestDayLogger from '@/components/RestDayLogger';
import ChallengeCard, { Challenge } from '@/components/ChallengeCard';
import StreakDisplay from '@/components/StreakDisplay';
import useGamification from '@/hooks/useGamification';
import {
  Activity,
  TrainingMetrics,
  TrainingMetricsService,
  getFatigueState,
  getShortStateDescription,
} from '@/lib/training-metrics';
import { STATE_GRADIENTS } from '@/lib/ui/state-theme';
import {
  fetchWithRetry,
  clearCache,
  getRateLimitStatus,
  formatRateLimitInfo,
  clearRateLimitState,
} from '@/lib/api-utils';

interface UserProfile {
  id?: number;
  name: string;
  age?: number;
  maxHeartRate: number;
  restingHeartRate: number;
  characterColor: string;
}

export default function Home() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [metrics, setMetrics] = useState<TrainingMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showSetup, setShowSetup] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showRestLogger, setShowRestLogger] = useState(false);
  const [loggingRest, setLoggingRest] = useState(false);
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);
  const [rateLimitInfo, setRateLimitInfo] = useState<string | null>(null);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [wearables, setWearables] = useState<WearableItems>({
    hat: 'none',
    shirt: 'none',
    shorts: 'none',
    shoes: 'none',
    background: 'default',
  });

  // Gamification hook
  const gamification = useGamification(userProfile?.id || null);

  // Ref to track gamification.refresh to avoid infinite loops
  const gamificationRefreshRef = useRef(gamification.refresh);
  useEffect(() => {
    gamificationRefreshRef.current = gamification.refresh;
  }, [gamification.refresh]);

  // Track if initial fetch has been done to prevent duplicate fetches
  const hasFetchedRef = useRef(false);

  // Check for authentication and user profile
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const athleteId = params.get('athlete_id');
    const token = params.get('access_token');

    // If we have athlete_id in URL, we just completed OAuth
    if (athleteId) {
      setAccessToken('authenticated'); // Token is in httpOnly cookie
      localStorage.setItem('strava_connected', 'true');
      localStorage.setItem('strava_athlete_id', athleteId);
      window.history.replaceState({}, '', '/');
    } else if (token) {
      // Legacy: access token passed directly
      setAccessToken(token);
      localStorage.setItem('strava_access_token', token);
      localStorage.setItem('strava_connected', 'true');
      window.history.replaceState({}, '', '/');
    } else {
      // Check if we were previously connected
      const wasConnected = localStorage.getItem('strava_connected');
      const storedToken = localStorage.getItem('strava_access_token');
      if (wasConnected || storedToken) {
        setAccessToken(storedToken || 'authenticated');
      }
    }

    // Check for user profile
    const storedProfile = localStorage.getItem('user_profile');
    if (storedProfile) {
      setUserProfile(JSON.parse(storedProfile));
    } else if (athleteId || token || localStorage.getItem('strava_connected')) {
      // Show setup if connected but no profile
      setShowSetup(true);
    }

    // Load wearables from localStorage
    const storedWearables = localStorage.getItem('wearables');
    if (storedWearables) {
      setWearables(JSON.parse(storedWearables));
    }
  }, []);

  const fetchActivities = useCallback(async (forceRefresh = false, options?: { quiet?: boolean }) => {
    const quiet = options?.quiet ?? false;

    // Check if already rate limited
    const rateLimitStatus = getRateLimitStatus();
    if (rateLimitStatus.isLimited) {
      setIsRateLimited(true);
      setError(`Rate limited. Please wait ${rateLimitStatus.retryInSeconds} seconds before retrying.`);
      return;
    }

    if (!quiet) {
      setLoading(true);
    }
    setError(null);
    setIsRateLimited(false);

    // Clear cache if force refresh
    if (forceRefresh) {
      clearCache('activities');
    }

    interface ActivitiesResponse {
      activities: Activity[];
      user?: { id: number; stravaAthleteId: number; firstName: string; lastName: string };
      rateLimit?: { limit: string | null; usage: string | null };
      error?: string;
    }

    const result = await fetchWithRetry<ActivitiesResponse>(
      '/api/strava/activities',
      undefined,
      {
        cacheKey: 'activities',
        cacheDurationMs: 5 * 60 * 1000, // 5 minutes cache
        maxRetries: 2,
      }
    );

    if (result.rateLimited) {
      setIsRateLimited(true);
      setError(result.error || 'Rate limited by Strava. Please wait before trying again.');
      if (!quiet) setLoading(false);
      return;
    }

    if (result.error) {
      // Check if it's an auth error
      if (result.error.includes('Authentication') || result.error.includes('401') || result.error.includes('expired')) {
        setAccessToken(null);
        localStorage.removeItem('strava_connected');
        localStorage.removeItem('strava_athlete_id');
        clearCache('activities');
        if (!quiet) setLoading(false);
        return;
      }
      setError(result.error);
      if (!quiet) setLoading(false);
      return;
    }

    const data = result.data;
    if (!data) {
      setError('No data received');
      if (!quiet) setLoading(false);
      return;
    }

    setActivities(data.activities || []);

    // Update rate limit info display
    if (data.rateLimit) {
      const info = formatRateLimitInfo(data.rateLimit.limit, data.rateLimit.usage);
      setRateLimitInfo(info);
    }

    // Persist API user id into profile (localStorage + state). Functional update covers the case where
    // the first fetch finished before user_profile existed, and falls back to reading storage if needed.
    if (data.user?.id) {
      setUserProfile((prev) => {
        let base: UserProfile | null = prev;
        if (!base) {
          try {
            const raw = localStorage.getItem('user_profile');
            if (raw) base = JSON.parse(raw) as UserProfile;
          } catch {
            /* ignore */
          }
        }
        if (!base) return prev;
        if (base.id === data.user!.id) return prev;
        const next = { ...base, id: data.user!.id };
        localStorage.setItem('user_profile', JSON.stringify(next));
        return next;
      });
    }

    // Prefer HR from saved profile so metrics stay correct right after onboarding (avoids stale closure).
    let storedHR: Partial<Pick<UserProfile, 'maxHeartRate' | 'restingHeartRate'>> = {};
    try {
      const raw = localStorage.getItem('user_profile');
      if (raw) storedHR = JSON.parse(raw) as UserProfile;
    } catch {
      /* ignore */
    }
    const maxHR = storedHR.maxHeartRate ?? userProfile?.maxHeartRate ?? 190;
    const restingHR = storedHR.restingHeartRate ?? userProfile?.restingHeartRate ?? 60;
    const calculatedMetrics = new TrainingMetricsService({ maxHR, restingHR }).calculate(
      data.activities || []
    );
    setMetrics(calculatedMetrics);

    // Use API user id (not closure) so achievements run on the same response that assigns the id.
    if (data.user?.id && !result.fromCache) {
      try {
        const achievementRes = await fetch('/api/gamification/achievements', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: data.user.id }),
        });

        if (achievementRes.ok) {
          const achievementData = await achievementRes.json();
          if (achievementData.newAchievements?.length > 0) {
            setNewAchievement(achievementData.newAchievements[0]);
          }
        }
      } catch {
        // Silently fail achievement check - not critical
      }

      gamificationRefreshRef.current();
    }

    if (!quiet) setLoading(false);
  }, [userProfile?.maxHeartRate, userProfile?.restingHeartRate]);

  // Fetch activities when we have a token (only once on mount/auth change)
  useEffect(() => {
    if (accessToken && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchActivities();
    }
  }, [accessToken, fetchActivities]);

  // Reset fetch flag when disconnecting
  useEffect(() => {
    if (!accessToken) {
      hasFetchedRef.current = false;
    }
  }, [accessToken]);

  const handleSetupComplete = async (profile: UserProfile) => {
    const profileWithId = { ...profile, id: profile.id || 0 };
    setUserProfile(profileWithId);
    localStorage.setItem('user_profile', JSON.stringify(profileWithId));
    setShowSetup(false);
    // Merge DB user id if the initial activities fetch finished before user_profile existed; quiet = no loading flash.
    await fetchActivities(false, { quiet: true });
  };

  const handleConnect = () => {
    window.location.href = '/api/auth/strava';
  };

  const handleDisconnect = () => {
    setAccessToken(null);
    setActivities([]);
    setMetrics(null);
    setRateLimitInfo(null);
    setIsRateLimited(false);
    localStorage.removeItem('strava_access_token');
    localStorage.removeItem('strava_connected');
    localStorage.removeItem('strava_athlete_id');
    // Clear API cache
    clearCache();
    // Clear cookies by calling a logout endpoint or just refreshing
    document.cookie = 'strava_access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'strava_refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'strava_athlete_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  };

  const handleWearablesChange = (newWearables: WearableItems) => {
    setWearables(newWearables);
    localStorage.setItem('wearables', JSON.stringify(newWearables));
  };

  // Determine character state
  const fatigueState = metrics ? getFatigueState(metrics.tsb) : 'optimal';

  // Show setup screen if needed
  if (showSetup && accessToken) {
    return <SetupScreen onComplete={handleSetupComplete} />;
  }

  const scrollToLocker = () => {
    document.getElementById('locker')?.scrollIntoView({ block: 'start', behavior: 'smooth' });
  };

  const gradientClass = STATE_GRADIENTS[fatigueState] ?? STATE_GRADIENTS.optimal;

  return (
    <div className={`min-h-screen ${gradientClass}`}>
      {/* Achievement Toast */}
      {newAchievement && (
        <AchievementToast
          achievement={newAchievement}
          onDismiss={() => setNewAchievement(null)}
        />
      )}

      {/* Slim Header */}
      <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700">
        <div className="max-w-lg mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h1
              className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400"
              style={{ fontFamily: 'monospace' }}
            >
              Sporty Gotchi
            </h1>
            {gamification.stats && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 px-2 py-0.5 bg-yellow-500/20 rounded-full">
                  <span className="text-yellow-400 text-xs">Lv</span>
                  <span className="text-yellow-300 font-bold text-sm">{gamification.stats.level}</span>
                </div>
                {gamification.stats.streak.currentStreak > 0 && (
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-orange-500/20 rounded-full">
                    <span className="text-sm">🔥</span>
                    <span className="text-orange-300 font-bold text-sm">{gamification.stats.streak.currentStreak}</span>
                  </div>
                )}
              </div>
            )}
          </div>
          {accessToken ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled
                title="Coming soon"
                className="p-2 rounded-lg text-slate-500 cursor-not-allowed"
                aria-label="Friends (coming soon)"
                aria-disabled="true"
              >
                <span className="text-lg" aria-hidden>👥</span>
              </button>
              <button
                type="button"
                onClick={scrollToLocker}
                className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                aria-label="Scroll to locker"
              >
                <span className="text-lg" aria-hidden>🎒</span>
              </button>
              <button
                type="button"
                onClick={() => setShowSettings(true)}
                className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                aria-label="Open settings"
              >
                <span className="text-lg" aria-hidden>⚙️</span>
              </button>
            </div>
          ) : (
            <button
              onClick={handleConnect}
              className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
              </svg>
              Connect Strava
            </button>
          )}
        </div>
      </header>

      <SettingsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onEditProfile={() => setShowSetup(true)}
        onDisconnect={handleDisconnect}
        onShowAchievements={() => setShowAchievements(true)}
        rateLimitInfo={rateLimitInfo}
      />

      {/* Achievement Modal */}
      {showAchievements && gamification.achievements && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAchievements(false)}
              className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center bg-slate-700 rounded-full text-white hover:bg-slate-600 transition-colors"
            >
              ✕
            </button>
            <AchievementGrid
              achievements={gamification.achievements}
              className="bg-slate-800 rounded-xl p-6"
            />
          </div>
        </div>
      )}

      <main className="max-w-lg mx-auto px-4 py-8">
        {!accessToken ? (
          // Welcome screen
          <div className="text-center py-16">
            <h2
              className="text-4xl font-bold text-white mb-4"
              style={{ fontFamily: 'monospace' }}
            >
              Your Fitness Companion
            </h2>
            <p className="text-xl text-gray-400 mb-8">
              Connect your Strava account to meet your Sporty Gotchi!
              Level up, earn achievements, and watch your character evolve.
            </p>
            <div className="bg-slate-800/80 rounded-2xl shadow-lg p-8 mb-8 border border-slate-700">
              <SportyGotchi state="optimal" name="???" />
            </div>
            <button
              onClick={handleConnect}
              className="px-8 py-4 text-lg font-medium text-white bg-orange-600 rounded-xl hover:bg-orange-700 transition-colors shadow-lg hover:shadow-xl flex items-center gap-3 mx-auto"
              style={{ fontFamily: 'monospace' }}
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
              </svg>
              Get Started - Connect Strava
            </button>
          </div>
        ) : loading && activities.length === 0 ? (
          // Loading state
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400 mx-auto" />
            <p className="mt-4 text-gray-400" style={{ fontFamily: 'monospace' }}>
              Loading your activities...
            </p>
          </div>
        ) : error ? (
          // Error state
          <div className={`${isRateLimited ? 'bg-yellow-900/20 border-yellow-500/50' : 'bg-red-900/20 border-red-500/50'} border rounded-xl p-6 text-center`}>
            {isRateLimited ? (
              <>
                <p className="text-yellow-400 font-medium text-lg mb-2">⏱️ Rate Limited</p>
                <p className="text-yellow-300/80">{error}</p>
                <p className="text-gray-400 text-sm mt-2">
                  Strava limits API requests to protect their servers. Your data is cached locally.
                </p>
              </>
            ) : (
              <p className="text-red-400 font-medium">Error: {error}</p>
            )}
            <div className="flex gap-2 justify-center mt-4">
              <button
                onClick={() => fetchActivities(true)}
                disabled={isRateLimited}
                className={`px-4 py-2 text-white rounded-lg transition-colors ${isRateLimited ? 'bg-gray-600 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}
              >
                {isRateLimited ? 'Please Wait...' : 'Try Again'}
              </button>
              {isRateLimited && (
                <button
                  onClick={() => {
                    clearRateLimitState();
                    setIsRateLimited(false);
                    setError(null);
                    fetchActivities(true);
                  }}
                  className="px-4 py-2 text-yellow-400 border border-yellow-500 rounded-lg hover:bg-yellow-900/20 transition-colors"
                  title="Clear rate limit state (use if stuck)"
                >
                  Clear Rate Limit
                </button>
              )}
            </div>
          </div>
        ) : (
          // v3: Hero + Locker + Collapsible sections
          <div className="space-y-8">
            {/* Hero: avatar + one-line status */}
            <div className="flex flex-col items-center py-4">
              <SportyGotchi
                state={fatigueState}
                name={userProfile?.name || 'Sporty'}
                wearables={wearables}
                level={gamification.stats?.level}
                evolutionStage={gamification.stats?.evolutionStage || 1}
                size="lg"
              />
              <p className="text-center text-lg mt-4" style={{ fontFamily: 'monospace' }}>
                <span className="font-bold text-white capitalize">{fatigueState}</span>
                <span className="text-gray-400"> — {getShortStateDescription(fatigueState)}</span>
              </p>
            </div>

            {/* Locker */}
            <div id="locker">
              <Locker
                currentItems={wearables}
                onItemsChange={handleWearablesChange}
              />
            </div>

            {/* Collapsible: Recovery */}
            <CollapsibleSection title="Recovery" icon="💚" defaultOpen={false}>
              {gamification.recovery && (
                <>
                  <RecoveryMeter status={gamification.recovery} />
                  {!showRestLogger ? (
                    <button
                      type="button"
                      onClick={() => setShowRestLogger(true)}
                      className="w-full mt-2 py-2 rounded-lg text-sm font-bold uppercase tracking-wider bg-emerald-600/20 text-emerald-400 border border-emerald-600/50 hover:bg-emerald-600/30 transition-colors"
                      style={{ fontFamily: 'monospace' }}
                    >
                      + Log Rest Day
                    </button>
                  ) : (
                    <div className="mt-2">
                      <RestDayLogger
                        onSubmit={async (data) => {
                          setLoggingRest(true);
                          const ok = await gamification.logRestDay({
                            type: data.type,
                            notes: data.notes,
                            quality: data.quality,
                          });
                          setLoggingRest(false);
                          if (ok) setShowRestLogger(false);
                        }}
                        onCancel={() => setShowRestLogger(false)}
                        isLoading={loggingRest}
                      />
                    </div>
                  )}
                </>
              )}
              {!gamification.recovery && gamification.loading && (
                <p className="text-gray-400 text-sm">Loading recovery…</p>
              )}
              {!gamification.recovery && !gamification.loading && (
                <p className="text-gray-400 text-sm">Connect and sync to see recovery.</p>
              )}
            </CollapsibleSection>

            {/* Collapsible: Challenges */}
            <CollapsibleSection title="Challenges" icon="🎯" defaultOpen={false}>
              {gamification.challenges?.daily && gamification.challenges.daily.length > 0 && (
                <div className="space-y-3 mb-4">
                  <h4 className="text-white font-bold text-sm uppercase tracking-wider" style={{ fontFamily: 'monospace' }}>Daily</h4>
                  {gamification.challenges.daily.map((challenge: Challenge) => (
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
                      onClaim={challenge.completed && !challenge.claimed ? () => gamification.claimChallenge(challenge.id) : undefined}
                    />
                  ))}
                </div>
              )}
              {gamification.challenges?.weekly && gamification.challenges.weekly.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-white font-bold text-sm uppercase tracking-wider" style={{ fontFamily: 'monospace' }}>Weekly</h4>
                  {gamification.challenges.weekly.map((challenge: Challenge) => (
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
                      onClaim={challenge.completed && !challenge.claimed ? () => gamification.claimChallenge(challenge.id) : undefined}
                    />
                  ))}
                </div>
              )}
              {(!gamification.challenges?.daily?.length && !gamification.challenges?.weekly?.length) && !gamification.loading && (
                <p className="text-gray-400 text-sm">No active challenges right now.</p>
              )}
            </CollapsibleSection>

            {/* Collapsible: Training details */}
            <CollapsibleSection title="Training details" icon="📊" defaultOpen={false}>
              {metrics && (
                <>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <MetricCard label="Fitness (CTL)" value={metrics.ctl} icon="💪" color="blue" />
                    <MetricCard label="Fatigue (ATL)" value={metrics.atl} icon="😓" color="orange" />
                    <MetricCard
                      label="Form (TSB)"
                      value={metrics.tsb}
                      icon={metrics.tsb >= 0 ? '✨' : '😴'}
                      color={metrics.tsb >= 0 ? 'green' : 'red'}
                    />
                    <MetricCard label="Total TSS" value={metrics.totalTSS} icon="📊" color="purple" />
                  </div>
                  <TrainingGraph
                    activities={activities}
                    userMaxHR={userProfile?.maxHeartRate}
                    userRestingHR={userProfile?.restingHeartRate}
                  />
                </>
              )}
              {!metrics && <p className="text-gray-400 text-sm">Sync activities to see metrics.</p>}
            </CollapsibleSection>

            {/* Collapsible: Recent activities */}
            <CollapsibleSection title="Recent activities" icon="🏃" defaultOpen={false}>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {activities.slice(0, 10).map((activity, index) => (
                  <div
                    key={`${activity.date}-${index}`}
                    className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-white">{activity.name ?? activity.type}</p>
                      <p className="text-sm text-gray-400">{new Date(activity.date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-white">{Math.round(activity.duration / 60)} min</p>
                      {activity.tss != null && (
                        <p className="text-xs text-purple-400">{Math.round(activity.tss)} TSS</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {activities.length === 0 && <p className="text-gray-400 text-sm">No activities yet.</p>}
            </CollapsibleSection>

            {/* Collapsible: Streaks */}
            <CollapsibleSection title="Streaks" icon="🔥" defaultOpen={false}>
              {gamification.stats && (
                <StreakDisplay
                  currentStreak={gamification.stats.streak.currentStreak}
                  longestStreak={gamification.stats.streak.longestStreak}
                  freezesAvailable={gamification.stats.streak.availableFreezes}
                  atRisk={!gamification.stats.streak.isActive && gamification.stats.streak.hoursUntilExpiry !== null && gamification.stats.streak.hoursUntilExpiry < 12}
                />
              )}
              {!gamification.stats && !gamification.loading && <p className="text-gray-400 text-sm">Connect to see streaks.</p>}
            </CollapsibleSection>
          </div>
        )}
      </main>
    </div>
  );
}
