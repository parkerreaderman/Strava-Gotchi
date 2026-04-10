import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { Activity, TrainingMetricsService } from '@/lib/training-metrics';

const trainingMetrics = new TrainingMetricsService();

const sampleActivities: Activity[] = [
  { date: new Date().toISOString(), duration: 3600, type: 'Run', tss: 85 },
  {
    date: new Date(Date.now() - 86400000).toISOString(),
    duration: 2700,
    type: 'Ride',
    tss: 70,
  },
  {
    date: new Date(Date.now() - 2 * 86400000).toISOString(),
    duration: 1800,
    type: 'Workout',
    tss: 45,
  },
];

const sampleProfile = {
  name: 'Alex Athlete',
  age: 30,
  maxHeartRate: 188,
  restingHeartRate: 58,
  characterColor: 'blue',
} as const;

const sampleReadiness = trainingMetrics.summarize(sampleActivities);

export async function GET(request: NextRequest) {
  const athleteIdCookie = request.cookies.get('strava_athlete_id')?.value;

  if (!athleteIdCookie) {
    logger.info('Bootstrap route served sample payload');
    return NextResponse.json({
      profile: sampleProfile,
      readiness: sampleReadiness,
      activitiesPreview: sampleActivities,
      source: 'sample',
    });
  }

  const athleteId = Number.parseInt(athleteIdCookie, 10);
  if (Number.isNaN(athleteId)) {
    logger.warn('Invalid strava_athlete_id cookie', { athleteIdCookie });
    return NextResponse.json({
      profile: sampleProfile,
      readiness: sampleReadiness,
      activitiesPreview: sampleActivities,
      source: 'sample',
    });
  }

  const userRecord = await prisma.user.findUnique({
    where: { stravaAthleteId: athleteId },
    include: {
      activities: {
        take: 30,
        orderBy: { startDate: 'desc' },
      },
    },
  });

  if (!userRecord) {
    logger.info('Bootstrap route fallback: user not found', { athleteId });
    return NextResponse.json({
      profile: sampleProfile,
      readiness: sampleReadiness,
      activitiesPreview: sampleActivities,
      source: 'sample',
    });
  }

  const activities: Activity[] = userRecord.activities.map((activity) => ({
    date: activity.startDate.toISOString(),
    duration: activity.duration,
    type: activity.type,
    averageHeartRate: activity.averageHeartRate ?? undefined,
    maxHeartRate: activity.maxHeartRate ?? undefined,
    tss: activity.tss ?? undefined,
  }));

  const readiness = trainingMetrics.summarize(activities);

  logger.info('Bootstrap route served live payload', {
    athleteId,
    activityCount: activities.length,
  });

  return NextResponse.json({
    profile: {
      name:
        `${userRecord.firstName ?? ''} ${userRecord.lastName ?? ''}`.trim() ||
        sampleProfile.name,
    },
    readiness,
    activitiesPreview: activities.slice(0, 5),
    source: 'strava',
  });
}

