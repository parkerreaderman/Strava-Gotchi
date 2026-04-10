'use client';

import { useCallback, useEffect, useState } from 'react';
import SportyGotchi from './SportyGotchi';
import { FatigueState } from '@/lib/training-metrics';
import { getHeartRateZones, maxHRFromAge, maffetoneHRFromAge } from '@/lib/heart-rate-zones';

export interface UserProfile {
  name: string;
  age: number;
  maxHeartRate: number;
  restingHeartRate: number;
  characterColor: 'blue' | 'green' | 'purple' | 'orange' | 'pink';
  maffetoneHR?: number;
}

interface SetupScreenProps {
  onComplete: (profile: UserProfile) => void;
}

export default function SetupScreen({ onComplete }: SetupScreenProps) {
  const [age, setAge] = useState<number>(30);
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    age: 30,
    maxHeartRate: 190,
    restingHeartRate: 60,
    characterColor: 'blue',
  });
  const [stravaLoading, setStravaLoading] = useState(true);
  const [stravaError, setStravaError] = useState<string | null>(null);
  const [hasConsented, setHasConsented] = useState(false);
  const [previewState, setPreviewState] = useState<{
    state: FatigueState;
    description: string;
    tsb: number;
    source: 'sample' | 'strava';
  }>({
    state: 'optimal',
    description: 'We will personalize this once your Strava data syncs.',
    tsb: 0,
    source: 'sample',
  });

  const characterColors = [
    { name: 'blue', label: 'Ocean Blue', hex: '#60A5FA' },
    { name: 'green', label: 'Forest Green', hex: '#34D399' },
    { name: 'purple', label: 'Royal Purple', hex: '#A78BFA' },
    { name: 'orange', label: 'Sunset Orange', hex: '#FB923C' },
    { name: 'pink', label: 'Sakura Pink', hex: '#F472B6' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasConsented) return;
    onComplete({ ...profile, age: age || profile.age || 30 });
  };

  const loadInitialProfile = useCallback(async () => {
    setStravaLoading(true);
    setStravaError(null);

    try {
      const response = await fetch('/api/strava/bootstrap');

      if (!response.ok) {
        throw new Error('Unable to reach Strava right now.');
      }

      const data = (await response.json()) as {
        profile?: Partial<UserProfile>;
        readiness?: { state: FatigueState; description: string; metrics: { tsb: number } };
        source: 'sample' | 'strava';
      };

      if (data?.profile) {
        const merged = { ...data.profile, age: (data.profile as UserProfile).age ?? 30 } as Partial<UserProfile>;
        setProfile((prev) => ({ ...prev, ...merged }));
        if (typeof merged.age === 'number') setAge(merged.age);
      }

      if (data?.readiness) {
        setPreviewState({
          state: data.readiness.state,
          description: data.readiness.description,
          tsb: data.readiness.metrics.tsb,
          source: data.source ?? 'sample',
        });
      }
    } catch (err) {
      const isAbort = err instanceof DOMException && err.name === 'AbortError';
      if (!isAbort) {
        setStravaError(
          'We could not preload your Strava metrics. You can continue manually or retry.'
        );
      }
    } finally {
      setStravaLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialProfile();
  }, [loadInitialProfile]);

  // Update all HR values when age changes (single source: lib/heart-rate-zones)
  const handleAgeChange = (value: string) => {
    const newAge = value === '' ? 0 : parseInt(value, 10);
    if (value !== '' && (isNaN(newAge) || newAge < 10 || newAge > 100)) return;
    setAge(newAge);
    if (newAge >= 10 && newAge <= 100) {
      setProfile((prev) => ({
        ...prev,
        age: newAge,
        maxHeartRate: maxHRFromAge(newAge),
        maffetoneHR: maffetoneHRFromAge(newAge),
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-5xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="p-8 lg:p-12">
          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="text-center space-y-3">
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
                Single-step onboarding
              </p>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
                Sync Strava, meet your avatar, start training.
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                We preload your Strava metrics, explain what we access, and let you finish
                setup in one screen. Review the details below, tweak anything you like,
                and launch your Sporty Gotchi.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 text-sm font-semibold">
              {['Authorize Strava', 'Personalize avatar', 'Launch'].map((step, index) => {
                const status =
                  index === 0 ? 'done' : index === 1 ? 'active' : 'pending';
                return (
                  <div key={step} className="flex items-center gap-2">
                    <span
                      className={`h-8 w-8 rounded-full border-2 flex items-center justify-center ${
                        status === 'done'
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : status === 'active'
                          ? 'border-blue-600 text-blue-600'
                          : 'border-gray-300 text-gray-400'
                      }`}
                    >
                      {index + 1}
                    </span>
                    <span className={status === 'pending' ? 'text-gray-400' : 'text-gray-700'}>
                      {step}
                    </span>
                    {index < 2 && <span className="h-px w-8 bg-gray-200" />}
                  </div>
                );
              })}
            </div>

            <div className="grid lg:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Athlete name
                    </label>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      placeholder="Enter your name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Age
                    </label>
                    <input
                      type="number"
                      value={age || ''}
                      onChange={(e) => handleAgeChange(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      placeholder="30"
                      min="10"
                      max="100"
                      required
                    />
                    <p className="text-xs text-gray-600 mt-1 font-medium">
                      Used to calculate your personalized training zones.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Max heart rate
                      </label>
                      <input
                        type="number"
                        value={profile.maxHeartRate}
                        onChange={(e) =>
                          setProfile({
                            ...profile,
                            maxHeartRate: parseInt(e.target.value, 10),
                          })
                        }
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                        placeholder="190"
                        min="100"
                        max="220"
                        required
                      />
                      <p className="text-xs text-gray-600 mt-1 font-medium">
                        220 - age ≈ {profile.maxHeartRate} bpm
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Maffetone HR zone
                      </label>
                      <div className="w-full px-4 py-3 border-2 border-green-300 bg-green-50 rounded-lg text-gray-900 font-semibold">
                        {profile.maffetoneHR || 150} bpm
                      </div>
                      <p className="text-xs text-gray-600 mt-1 font-medium">
                        180 - age (maximum aerobic pace)
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Resting heart rate
                    </label>
                    <input
                      type="number"
                      value={profile.restingHeartRate}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          restingHeartRate: parseInt(e.target.value, 10),
                        })
                      }
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      placeholder="60"
                      min="30"
                      max="100"
                      required
                    />
                    <p className="text-xs text-gray-600 mt-1 font-medium">
                      Measure right after waking up for the most accurate reading.
                    </p>
                  </div>

                  <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">HR zones (from age)</h3>
                    <div className="space-y-2 text-sm text-blue-800">
                      <div className="flex justify-between">
                        <span className="font-medium">Maffetone (aerobic):</span>
                        <span className="font-bold">{profile.maffetoneHR ?? maffetoneHRFromAge(profile.age || age)} bpm</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Max heart rate:</span>
                        <span className="font-bold">{profile.maxHeartRate} bpm</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Heart rate reserve:</span>
                        <span className="font-bold">
                          {profile.maxHeartRate - profile.restingHeartRate} bpm
                        </span>
                      </div>
                      <div className="mt-2 pt-2 border-t border-blue-200">
                        <div className="font-medium mb-1">Zones</div>
                        {getHeartRateZones({
                          maxHeartRate: profile.maxHeartRate,
                          restingHeartRate: profile.restingHeartRate,
                        }).map((z) => (
                          <div key={z.name} className="flex justify-between text-xs">
                            <span>{z.label}</span>
                            <span className="font-bold">{z.bpmMin}–{z.bpmMax} bpm</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3">
                      Character color
                    </label>
                    <div className="grid grid-cols-5 gap-3">
                      {characterColors.map((color) => (
                        <button
                          key={color.name}
                          type="button"
                          onClick={() =>
                            setProfile({
                              ...profile,
                              characterColor: color.name as UserProfile['characterColor'],
                            })
                          }
                          className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all ${
                            profile.characterColor === color.name
                              ? 'border-blue-700 bg-blue-100 shadow-md'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <div
                            className="w-12 h-12 rounded-full mb-2 border-2 border-white shadow-sm"
                            style={{ backgroundColor: color.hex }}
                          />
                          <span className="text-xs font-bold text-gray-900">
                            {color.label.split(' ')[0]}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-gradient-to-br from-indigo-50 to-purple-100 rounded-2xl p-6 flex flex-col items-center gap-4">
                  <SportyGotchi
                    state={previewState.state}
                    name={profile.name || 'Your Gotchi'}
                    customColor={profile.characterColor}
                  />
                  <div className="w-full rounded-2xl bg-white/80 p-4 text-sm text-indigo-900 shadow-inner">
                    <p className="font-semibold flex items-center justify-between">
                      Readiness preview
                      <span className="text-xs uppercase tracking-wide text-purple-600">
                        {previewState.source === 'sample' ? 'Sample' : 'Live'}
                      </span>
                    </p>
                    <p className="text-lg font-bold text-indigo-700">
                      TSB {previewState.tsb >= 0 ? '+' : ''}
                      {previewState.tsb}
                    </p>
                    <p>{previewState.description}</p>
                  </div>
                </div>

                <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Strava permissions</h3>
                      <p className="text-sm text-gray-600">
                        We only request the scopes needed to keep your avatar honest.
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-semibold">
                      Read only
                    </span>
                  </div>

                  <ul className="space-y-3 text-sm text-gray-700">
                    <li>
                      <strong className="text-gray-900">Activity summaries</strong> – mileage,
                      duration, and elevation inform training load.
                    </li>
                    <li>
                      <strong className="text-gray-900">Heart-rate streams</strong> – used to update
                      fatigue and recovery status.
                    </li>
                    <li>
                      <strong className="text-gray-900">Power & pace</strong> – fuels the performance
                      readiness gauge.
                    </li>
                    <li>
                      <strong className="text-gray-900">Profile basics</strong> – name, clubs, and
                      avatar keep things personal.
                    </li>
                  </ul>

                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
                    {stravaLoading && (
                      <div className="flex items-center gap-3 text-blue-700">
                        <span className="h-3 w-3 rounded-full border-2 border-blue-300 border-t-blue-700 animate-spin" />
                        <p className="text-sm font-semibold">
                          Syncing Strava preview data&hellip;
                        </p>
                      </div>
                    )}

                    {!stravaLoading && !stravaError && (
                      <p className="text-sm text-green-700 font-medium">
                        Strava preview loaded successfully. You can still tweak anything before
                        finishing.
                      </p>
                    )}

                    {stravaError && (
                      <div className="space-y-3">
                        <p className="text-sm text-red-700 font-semibold">{stravaError}</p>
                        <button
                          type="button"
                          onClick={loadInitialProfile}
                          className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Retry Strava sync
                        </button>
                        <p className="text-xs text-gray-500">
                          You can still finish setup with sample data and reconnect later.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="text-xs text-gray-500">
                    We never post workouts, change privacy settings, or share your data. Revoke
                    access anytime from your Strava dashboard.
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <label className="flex items-start gap-3 text-sm text-gray-600">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  checked={hasConsented}
                  onChange={(event) => setHasConsented(event.target.checked)}
                  required
                />
                <span>
                  I agree to the{' '}
                  <a href="/policies/terms" target="_blank" className="text-blue-600 underline">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="/policies/privacy" target="_blank" className="text-blue-600 underline">
                    Privacy Policy
                  </a>
                  , and I consent to Sporty Gotchi accessing my Strava data as described above.
                </span>
              </label>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <button
                type="submit"
                  disabled={!hasConsented}
                  className={`flex-1 px-6 py-4 rounded-lg font-bold text-lg shadow-lg transition-colors ${
                    hasConsented
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
              >
                Launch Sporty Gotchi
              </button>
              <p className="text-center text-sm text-gray-500 sm:text-left">
                Need to change something later? You can always revisit setup in settings.
              </p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
