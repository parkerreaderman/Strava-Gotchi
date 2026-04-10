'use client';

import {
  Activity,
  calculateTSS,
  calculateTrainingMetrics,
  getFatigueState,
  getStateDescription,
} from '@/lib/training-metrics';

interface TrainingGraphProps {
  activities: Activity[];
  userMaxHR?: number;
  userRestingHR?: number;
}

export default function TrainingGraph({ activities, userMaxHR = 190, userRestingHR = 60 }: TrainingGraphProps) {
  if (!activities || activities.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center space-y-4">
        <h3 className="text-xl font-semibold text-gray-900">No activities yet</h3>
        <p className="text-gray-600 text-sm">
          Connect Strava and record at least one workout to unlock the training dashboard. We’ll auto-refresh as soon as data lands.
        </p>
      </div>
    );
  }

  // Get last 7 days
  const today = new Date();
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (6 - i));
    return date;
  });

  // Group activities by day and calculate daily TSS
  const dailyData = last7Days.map((date) => {
    const dateStr = date.toISOString().split('T')[0];
    const dayActivities = activities.filter((activity) => {
      const activityDate = new Date(activity.date).toISOString().split('T')[0];
      return activityDate === dateStr;
    });

    // Calculate total duration and average HR for the day
    const totalDuration = dayActivities.reduce(
      (sum, activity) => sum + activity.duration,
      0
    );

    const avgHR = dayActivities.length > 0
      ? dayActivities.reduce((sum, activity) => sum + (activity.averageHeartRate || 0), 0) /
        dayActivities.filter(a => a.averageHeartRate).length
      : 0;

    // Estimate TSS for the day
    const tss = dayActivities.reduce((sum, activity) => {
      if (activity.tss) return sum + activity.tss;

      // Calculate based on duration and HR
      const durationHours = activity.duration / 3600;
      const hrReserve = userMaxHR - userRestingHR;
      const workingHR = (activity.averageHeartRate || userRestingHR + hrReserve * 0.6) - userRestingHR;
      const intensityFactor = workingHR / hrReserve;
      return sum + (durationHours * Math.pow(intensityFactor, 2) * 100);
    }, 0);

    return {
      date,
      dateStr,
      dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
      activities: dayActivities,
      totalDuration,
      avgHR,
      tss: Math.round(tss),
    };
  });

  const maxTSS = Math.max(...dailyData.map((d) => d.tss), 100);
  const metrics = calculateTrainingMetrics(activities, userMaxHR, userRestingHR);
  const fatigueState = getFatigueState(metrics.tsb);
  const fatigueMessage = getStateDescription(fatigueState);

  const totalWeeklyTSS = dailyData.reduce((sum, day) => sum + day.tss, 0);
  const totalWeeklyHours = Math.round(
    dailyData.reduce((sum, day) => sum + day.totalDuration, 0) / 3600
  );

  const previousWeekStart = new Date(today);
  previousWeekStart.setDate(previousWeekStart.getDate() - 13);
  const previousWeekEnd = new Date(today);
  previousWeekEnd.setDate(previousWeekEnd.getDate() - 7);

  const isWithinRange = (date: Date, start: Date, end: Date) =>
    date.getTime() >= start.getTime() && date.getTime() <= end.getTime();

  const previousWeekTSS = activities.reduce((sum, activity) => {
    const activityDate = new Date(activity.date);
    if (!isWithinRange(activityDate, previousWeekStart, previousWeekEnd)) {
      return sum;
    }
    return sum + calculateTSS(activity, userMaxHR, userRestingHR);
  }, 0);

  const wowDelta = totalWeeklyTSS - previousWeekTSS;
  const wowPercent =
    previousWeekTSS === 0 ? null : Math.round((wowDelta / previousWeekTSS) * 100);

  const stateStyles: Record<string, { accent: string; badge: string }> = {
    fresh: { accent: 'from-emerald-500 to-emerald-400', badge: 'text-emerald-700 bg-emerald-100' },
    optimal: { accent: 'from-blue-500 to-blue-400', badge: 'text-blue-700 bg-blue-100' },
    trained: { accent: 'from-purple-500 to-purple-400', badge: 'text-purple-700 bg-purple-100' },
    fatigued: { accent: 'from-amber-500 to-amber-400', badge: 'text-amber-700 bg-amber-100' },
    overtrained: { accent: 'from-rose-500 to-rose-400', badge: 'text-rose-700 bg-rose-100' },
  };

  const currentStyle = stateStyles[fatigueState] || stateStyles.trained;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Readiness card */}
        <div className="rounded-2xl border border-gray-100 p-5 shadow-inner bg-gradient-to-br from-gray-50 to-white lg:w-1/3">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">
                Readiness
              </p>
              <h3 className="text-lg font-semibold text-gray-900">
                Training Stress Balance
              </h3>
            </div>
            <span className={`text-xs px-3 py-1 rounded-full font-semibold ${currentStyle.badge}`}>
              {fatigueState}
            </span>
          </div>
          <div className="flex items-end gap-3 mb-4">
            <div className="text-5xl font-black text-gray-900">{metrics.tsb}</div>
            <div className="text-sm text-gray-500 pb-2">TSB score</div>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">{fatigueMessage}</p>
          <div className="mt-5 rounded-xl bg-gray-900/5 p-3">
            <div className="text-xs uppercase tracking-wide text-gray-500">CTL</div>
            <div className="flex items-center justify-between text-sm font-medium text-gray-900">
              <span>{metrics.ctl}</span>
              <span className="text-gray-400">ATL {metrics.atl}</span>
            </div>
          </div>
          <TrendIndicator label="WoW Load" delta={wowDelta} percent={wowPercent} />
        </div>

        {/* Bar chart */}
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Last 7 days</p>
              <h3 className="text-xl font-bold text-gray-900">Training Load</h3>
            </div>
            <div className="text-sm text-gray-500">
              Avg TSS{' '}
              <span className="font-semibold text-gray-900">
                {Math.round(totalWeeklyTSS / 7)}
              </span>
            </div>
          </div>

          <div className="flex items-end justify-between gap-2 sm:gap-4 h-48">
            {dailyData.map((day, index) => {
              const heightPercent = (day.tss / maxTSS) * 100;
              const isToday = index === 6;

              return (
                <div key={day.dateStr} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex flex-col justify-end h-40">
                    <div
                      className={`w-full rounded-t-lg transition-all hover:scale-105 ${
                        day.tss === 0
                          ? 'bg-gray-200'
                          : day.tss > 100
                          ? 'bg-gradient-to-t from-orange-500 to-orange-400'
                          : day.tss > 50
                          ? 'bg-gradient-to-t from-blue-500 to-blue-400'
                          : 'bg-gradient-to-t from-green-500 to-green-400'
                      } ${isToday ? 'ring-2 ring-purple-500 ring-offset-2' : ''}`}
                      style={{ height: `${heightPercent}%` }}
                      title={`${day.tss} TSS - ${day.activities.length} activities`}
                    >
                      {day.tss > 0 && (
                        <div className="text-white text-[10px] font-bold text-center pt-1">
                          {day.tss}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-center">
                    <div
                      className={`text-xs font-semibold ${
                        isToday ? 'text-purple-600' : 'text-gray-600'
                      }`}
                    >
                      {day.dayName}
                    </div>
                    <div className="text-[10px] text-gray-400">{day.date.getDate()}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap justify-center gap-4 mt-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-gradient-to-t from-green-500 to-green-400" />
              <span className="text-gray-600">Light &lt;50</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-gradient-to-t from-blue-500 to-blue-400" />
              <span className="text-gray-600">Moderate 50-100</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-gradient-to-t from-orange-500 to-orange-400" />
              <span className="text-gray-600">Hard &gt;100</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
        <div className="rounded-xl bg-gray-50 p-4 text-center">
          <div className="text-xs uppercase tracking-wide text-gray-500">Total TSS</div>
          <div className="text-2xl font-bold text-blue-600">
            {totalWeeklyTSS}
          </div>
        </div>
        <div className="rounded-xl bg-gray-50 p-4 text-center">
          <div className="text-xs uppercase tracking-wide text-gray-500">Active Days</div>
          <div className="text-2xl font-bold text-green-600">
            {dailyData.filter((day) => day.activities.length > 0).length}
          </div>
        </div>
        <div className="rounded-xl bg-gray-50 p-4 text-center">
          <div className="text-xs uppercase tracking-wide text-gray-500">Total Hours</div>
          <div className="text-2xl font-bold text-purple-600">
            {totalWeeklyHours}h
          </div>
        </div>
      </div>
    </div>
  );
}

interface TrendIndicatorProps {
  label: string;
  delta: number;
  percent: number | null;
}

function TrendIndicator({ label, delta, percent }: TrendIndicatorProps) {
  const direction = delta >= 0 ? 'up' : 'down';
  const color =
    direction === 'up'
      ? 'text-emerald-600 bg-emerald-50'
      : 'text-rose-600 bg-rose-50';
  const arrow = direction === 'up' ? '▲' : '▼';

  return (
    <div className="mt-4 flex items-center justify-between rounded-xl bg-white px-3 py-2 shadow-inner">
      <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </span>
      <span className={`flex items-center gap-2 rounded-full px-2 py-1 text-sm font-semibold ${color}`}>
        {arrow} {Math.abs(delta)}
        {typeof percent === 'number' && (
          <span className="text-xs text-gray-500">({percent > 0 ? '+' : ''}{percent}%)</span>
        )}
      </span>
    </div>
  );
}
