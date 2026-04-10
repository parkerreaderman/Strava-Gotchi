import type { FatigueState } from '@/lib/training-metrics';

/** Full-page gradient classes by fatigue state (weather-app style) */
export const STATE_GRADIENTS: Record<FatigueState, string> = {
  fresh: 'bg-gradient-to-br from-emerald-900/40 via-slate-900 to-teal-900/40',
  optimal: 'bg-gradient-to-br from-blue-900/40 via-slate-900 to-indigo-900/40',
  trained: 'bg-gradient-to-br from-amber-900/30 via-slate-900 to-yellow-900/30',
  fatigued: 'bg-gradient-to-br from-orange-900/40 via-slate-900 to-amber-900/40',
  overtrained: 'bg-gradient-to-br from-red-900/40 via-slate-900 to-rose-900/40',
};
