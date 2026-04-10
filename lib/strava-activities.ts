import { createHash } from 'crypto';
import type { Activity as CachedActivity } from '@prisma/client';

export const NINETY_DAYS_SECONDS = 90 * 24 * 60 * 60;

export type StravaActivity = {
  id: number | string;
  start_date: string;
  moving_time?: number;
  distance?: number;
  average_heartrate?: number;
  max_heartrate?: number;
  suffer_score?: number;
  type?: string;
  name?: string;
  athlete?: {
    id?: number;
  };
};

export type ActivitySummary = {
  stravaActivityId: string;
  name: string;
  type: string;
  startDate: Date;
  duration: number;
  distance: number | null;
  averageHeartRate: number | null;
  maxHeartRate: number | null;
  tss: number | null;
};

export const toSummary = (activity: StravaActivity): ActivitySummary | null => {
  if (!activity || !activity.id || !activity.start_date) {
    return null;
  }

  const toNumberOrNull = (value: unknown) =>
    typeof value === 'number' && Number.isFinite(value) ? value : null;

  return {
    stravaActivityId: String(activity.id),
    name: activity.name ?? 'Activity',
    type: activity.type ?? 'Workout',
    startDate: new Date(activity.start_date),
    duration:
      typeof activity.moving_time === 'number' && Number.isFinite(activity.moving_time)
        ? activity.moving_time
        : 0,
    distance: toNumberOrNull(activity.distance),
    averageHeartRate: toNumberOrNull(activity.average_heartrate),
    maxHeartRate: toNumberOrNull(activity.max_heartrate),
    tss: toNumberOrNull(activity.suffer_score),
  };
};

export const hashSummary = (summary: ActivitySummary) =>
  createHash('sha256')
    .update(
      JSON.stringify([
        summary.stravaActivityId,
        summary.name,
        summary.type,
        summary.startDate.toISOString(),
        summary.duration,
        summary.distance,
        summary.averageHeartRate,
        summary.maxHeartRate,
        summary.tss,
      ])
    )
    .digest('hex');

export const toClientActivity = (activity: CachedActivity) => ({
  id: activity.stravaActivityId,
  date: activity.startDate.toISOString(),
  duration: activity.duration,
  averageHeartRate: activity.averageHeartRate,
  maxHeartRate: activity.maxHeartRate,
  type: activity.type,
  name: activity.name,
  distance: activity.distance,
  tss: activity.tss,
});

export const toClientActivityFromStrava = (activities: StravaActivity[]) =>
  activities.map((activity) => ({
    id: activity.id,
    date: activity.start_date,
    duration: activity.moving_time,
    averageHeartRate: activity.average_heartrate,
    maxHeartRate: activity.max_heartrate,
    type: activity.type,
    name: activity.name,
    distance: activity.distance,
    tss: activity.suffer_score,
  }));

export const extractAthleteId = (activities: StravaActivity[]): number | null => {
  for (const activity of activities) {
    if (activity?.athlete?.id && Number.isFinite(activity.athlete.id)) {
      return Number(activity.athlete.id);
    }
  }
  return null;
};

export const parseAthleteId = (value?: string | null) => {
  if (!value) {
    return null;
  }
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
};

