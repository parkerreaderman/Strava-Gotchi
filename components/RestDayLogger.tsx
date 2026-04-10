'use client';

import { useState } from 'react';

export type RestDayType = 'manual' | 'active_recovery';

interface RestDayLoggerProps {
  onSubmit: (data: {
    type: RestDayType;
    notes: string;
    quality: number | null;
  }) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  className?: string;
}

/**
 * Quality rating options
 */
const QUALITY_OPTIONS = [
  { value: 1, label: 'Poor', emoji: '😫', description: 'Still tired' },
  { value: 2, label: 'Fair', emoji: '😐', description: 'Some recovery' },
  { value: 3, label: 'Good', emoji: '🙂', description: 'Rested' },
  { value: 4, label: 'Great', emoji: '😊', description: 'Refreshed' },
  { value: 5, label: 'Excellent', emoji: '🤩', description: 'Fully recovered' },
];

/**
 * RestDayLogger - Pixel-styled rest day logging form
 */
export default function RestDayLogger({
  onSubmit,
  onCancel,
  isLoading = false,
  className = '',
}: RestDayLoggerProps) {
  const [type, setType] = useState<RestDayType>('manual');
  const [notes, setNotes] = useState('');
  const [quality, setQuality] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ type, notes, quality });
  };

  return (
    <div
      className={`bg-slate-800 rounded-xl overflow-hidden ${className}`}
      style={{ fontFamily: 'monospace' }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🛌</span>
          <div>
            <h3 className="text-white font-bold text-lg">Log Rest Day</h3>
            <p className="text-emerald-100 text-xs">
              Track your recovery for bonus XP
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        {/* Rest type selection */}
        <div>
          <label className="block text-gray-400 text-xs uppercase tracking-wider mb-2">
            Rest Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setType('manual')}
              className={`p-3 rounded-lg border-2 transition-all ${
                type === 'manual'
                  ? 'border-emerald-500 bg-emerald-500/20'
                  : 'border-slate-600 hover:border-slate-500'
              }`}
            >
              <div className="text-2xl mb-1">🏠</div>
              <div className="text-white text-sm font-bold">Full Rest</div>
              <div className="text-gray-400 text-xs">No training</div>
            </button>
            <button
              type="button"
              onClick={() => setType('active_recovery')}
              className={`p-3 rounded-lg border-2 transition-all ${
                type === 'active_recovery'
                  ? 'border-emerald-500 bg-emerald-500/20'
                  : 'border-slate-600 hover:border-slate-500'
              }`}
            >
              <div className="text-2xl mb-1">🚶</div>
              <div className="text-white text-sm font-bold">Active Recovery</div>
              <div className="text-gray-400 text-xs">Light activity</div>
            </button>
          </div>
        </div>

        {/* Quality rating */}
        <div>
          <label className="block text-gray-400 text-xs uppercase tracking-wider mb-2">
            How do you feel? (optional)
          </label>
          <div className="flex gap-1">
            {QUALITY_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() =>
                  setQuality(quality === option.value ? null : option.value)
                }
                className={`flex-1 p-2 rounded-lg border-2 transition-all ${
                  quality === option.value
                    ? 'border-emerald-500 bg-emerald-500/20'
                    : 'border-slate-600 hover:border-slate-500'
                }`}
                title={`${option.label}: ${option.description}`}
              >
                <div className="text-xl">{option.emoji}</div>
                <div className="text-gray-400 text-[10px] mt-1 hidden sm:block">
                  {option.label}
                </div>
              </button>
            ))}
          </div>
          {quality && (
            <p className="text-emerald-400 text-xs mt-2 text-center">
              {QUALITY_OPTIONS.find((o) => o.value === quality)?.description}
            </p>
          )}
        </div>

        {/* Notes */}
        <div>
          <label className="block text-gray-400 text-xs uppercase tracking-wider mb-2">
            Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Sleep quality, soreness, activities..."
            className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-emerald-500 resize-none"
            rows={3}
          />
        </div>

        {/* XP preview */}
        <div className="bg-slate-700/50 rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">⭐</span>
            <span className="text-gray-400 text-sm">XP Reward</span>
          </div>
          <span className="text-yellow-400 font-bold">
            +{10 + (quality ? quality * 2 : 0)} XP
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 rounded-lg font-bold text-sm uppercase tracking-wider bg-slate-700 text-gray-300 hover:bg-slate-600 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="flex-1 py-3 rounded-lg font-bold text-sm uppercase tracking-wider bg-emerald-600 text-white hover:bg-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⏳</span>
                Logging...
              </span>
            ) : (
              'Log Rest Day'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
