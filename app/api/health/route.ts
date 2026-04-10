import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { logger } from '@/lib/logger';

type ComponentStatus = 'ok' | 'degraded' | 'error';

export async function GET() {
  const result: Record<string, ComponentStatus> = {
    api: 'ok',
    database: 'ok',
    stravaCredentials:
      process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID && process.env.STRAVA_CLIENT_SECRET
        ? 'ok'
        : 'degraded',
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (error) {
    result.database = 'error';
    result.api = 'degraded';
    logger.error('Health check failed to reach database', {
      error: error instanceof Error ? error.message : 'unknown',
    });
  }

  const statusCode =
    Object.values(result).some((status) => status === 'error') ? 503 : 200;

  return NextResponse.json(
    {
      status: statusCode === 200 ? 'ok' : 'degraded',
      components: result,
      timestamp: new Date().toISOString(),
    },
    { status: statusCode }
  );
}

