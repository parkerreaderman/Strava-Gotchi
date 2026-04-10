import { describe, expect, it } from 'vitest';

import {
  TrainingMetricsService,
  calculateTrainingMetrics,
  getFatigueState,
} from './training-metrics';

describe('calculateTrainingMetrics', () => {
  it('returns zeros when no activity data is provided', () => {
    const metrics = calculateTrainingMetrics([]);

    expect(metrics).toEqual({
      ctl: 0,
      atl: 0,
      tsb: 0,
      totalTSS: 0,
    });
  });

  it('computes CTL/ATL/TSB using EWMA smoothing for multi-day data', () => {
    const metrics = calculateTrainingMetrics([
      { date: '2024-01-01T00:00:00Z', duration: 3600, type: 'Run', tss: 100 },
      { date: '2024-01-02T00:00:00Z', duration: 3600, type: 'Run', tss: 50 },
      { date: '2024-01-03T00:00:00Z', duration: 3600, type: 'Run', tss: 75 },
      { date: '2024-01-04T00:00:00Z', duration: 0, type: 'Workout', tss: 0 },
    ]);

    expect(metrics).toEqual({
      ctl: 9,
      atl: 32,
      tsb: -22,
      totalTSS: 225,
    });
  });

  it('captures high fatigue scenarios where ATL greatly exceeds CTL', () => {
    const highLoadMetrics = calculateTrainingMetrics([
      { date: '2024-02-01T00:00:00Z', duration: 7200, type: 'Run', tss: 200 },
      { date: '2024-02-02T00:00:00Z', duration: 7200, type: 'Run', tss: 200 },
      { date: '2024-02-03T00:00:00Z', duration: 7200, type: 'Run', tss: 200 },
    ]);

    expect(highLoadMetrics).toEqual({
      ctl: 27,
      atl: 116,
      tsb: -89,
      totalTSS: 600,
    });

    expect(getFatigueState(highLoadMetrics.tsb)).toBe('overtrained');
  });
});

describe('TrainingMetricsService', () => {
  it('reuses HR profile configuration and returns readiness summary', () => {
    const service = new TrainingMetricsService({
      maxHR: 185,
      restingHR: 55,
    });

    const summary = service.summarize([
      { date: '2024-03-01T00:00:00Z', duration: 3600, type: 'Run', tss: 80 },
      { date: '2024-03-02T00:00:00Z', duration: 1800, type: 'Run', tss: 40 },
    ]);

    expect(summary.metrics.totalTSS).toBe(120);
    expect(summary.state).toBeDefined();
    expect(summary.description.length).toBeGreaterThan(0);
  });
});

