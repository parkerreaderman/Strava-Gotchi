import { describe, expect, it } from 'vitest';
import {
  StravaActivity,
  extractAthleteId,
  hashSummary,
  parseAthleteId,
  toClientActivity,
  toClientActivityFromStrava,
  toSummary,
} from './strava-activities';

describe('strava-activities helpers', () => {
  it('creates a summary for valid activities', () => {
    const summary = toSummary({
      id: 123,
      name: 'Lunch Run',
      type: 'Run',
      start_date: '2024-01-01T12:00:00Z',
      moving_time: 3600,
      average_heartrate: 150,
      max_heartrate: 180,
      suffer_score: 75,
      distance: 10000,
    });

    expect(summary).toMatchObject({
      stravaActivityId: '123',
      name: 'Lunch Run',
      type: 'Run',
      duration: 3600,
      averageHeartRate: 150,
      maxHeartRate: 180,
    });
    expect(summary?.startDate).toBeInstanceOf(Date);
  });

  it('returns null summary when required fields are missing', () => {
    expect(
      toSummary({ id: 0, start_date: '' } as StravaActivity)
    ).toBeNull();
    expect(
      toSummary({ id: 123, start_date: '' } as StravaActivity)
    ).toBeNull();
  });

  it('hashes summaries deterministically', () => {
    const base = toSummary({
      id: 1,
      start_date: '2024-01-01T00:00:00Z',
    } as StravaActivity)!;
    const modified = { ...base, name: 'Changed' };

    expect(hashSummary(base)).toEqual(hashSummary(base));
    expect(hashSummary(base)).not.toEqual(hashSummary(modified));
  });

  it('maps cached activities back to client shape', () => {
    const client = toClientActivity({
      id: 1,
      userId: 1,
      stravaActivityId: 'abc',
      startDate: new Date('2024-01-01T00:00:00Z'),
      duration: 1200,
      distance: 5000,
      averageHeartRate: 140,
      maxHeartRate: 175,
      type: 'Run',
      name: 'Test',
      tss: 50,
      checksum: '123',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    expect(client).toMatchObject({
      id: 'abc',
      duration: 1200,
      name: 'Test',
    });
  });

  it('extracts Strava athlete IDs reliably', () => {
    const activities: StravaActivity[] = [
      { id: 1, start_date: '2024-01-01', athlete: {} },
      {
        id: 2,
        start_date: '2024-01-02',
        athlete: { id: 999 },
      },
    ];

    expect(extractAthleteId(activities)).toBe(999);
  });

  it('parses athlete IDs from strings', () => {
    expect(parseAthleteId('123')).toBe(123);
    expect(parseAthleteId(undefined)).toBeNull();
    expect(parseAthleteId('abc')).toBeNull();
  });

  it('maps raw Strava activities to client shape', () => {
    const result = toClientActivityFromStrava([
      {
        id: 1,
        start_date: '2024-01-01',
        moving_time: 600,
        average_heartrate: 150,
      } as StravaActivity,
    ]);

    expect(result[0]).toMatchObject({
      id: 1,
      duration: 600,
      averageHeartRate: 150,
    });
  });
});

