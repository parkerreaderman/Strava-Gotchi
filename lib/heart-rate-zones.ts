/**
 * Heart rate zones – single source of truth for zone calculation.
 * Zones are derived from max HR and resting HR (e.g. from age: 220 - age).
 */

export interface HRZone {
  name: string;
  label: string;
  /** Percentage of max HR (0-100) */
  pctMaxMin: number;
  pctMaxMax: number;
  /** BPM range [min, max] */
  bpmMin: number;
  bpmMax: number;
  /** Percentage of heart rate reserve (Karvonen) */
  pctHRRMin?: number;
  pctHRRMax?: number;
}

export interface HRZoneInput {
  maxHeartRate: number;
  restingHeartRate: number;
}

/** Zone definitions as % of max HR (simple method). Boundaries inclusive. */
const ZONE_PCT_MAX: Array<{ name: string; label: string; min: number; max: number }> = [
  { name: 'Z1', label: 'Recovery', min: 0, max: 60 },
  { name: 'Z2', label: 'Aerobic', min: 60, max: 70 },
  { name: 'Z3', label: 'Tempo', min: 70, max: 80 },
  { name: 'Z4', label: 'Threshold', min: 80, max: 90 },
  { name: 'Z5', label: 'VO2max', min: 90, max: 100 },
];

/**
 * Calculate heart rate zones from max and resting HR.
 * Uses % of max HR for simplicity; HRR (Karvonen) can be added for display.
 */
export function getHeartRateZones(input: HRZoneInput): HRZone[] {
  const { maxHeartRate, restingHeartRate } = input;
  const hrr = maxHeartRate - restingHeartRate;

  return ZONE_PCT_MAX.map((z) => {
    const bpmMin = Math.round((z.min / 100) * maxHeartRate);
    const bpmMax = Math.round((z.max / 100) * maxHeartRate);
    const pctHRRMin = hrr > 0 ? ((bpmMin - restingHeartRate) / hrr) * 100 : 0;
    const pctHRRMax = hrr > 0 ? ((bpmMax - restingHeartRate) / hrr) * 100 : 0;
    return {
      name: z.name,
      label: z.label,
      pctMaxMin: z.min,
      pctMaxMax: z.max,
      bpmMin,
      bpmMax,
      pctHRRMin: Math.round(pctHRRMin),
      pctHRRMax: Math.round(pctHRRMax),
    };
  });
}

/**
 * Estimate max HR from age (220 - age). Use when no measured max HR.
 */
export function maxHRFromAge(age: number): number {
  const a = Math.max(10, Math.min(100, age));
  return 220 - a;
}

/**
 * Maffetone aerobic threshold (180 - age). Optional for zone context.
 */
export function maffetoneHRFromAge(age: number): number {
  const a = Math.max(10, Math.min(100, age));
  return 180 - a;
}
