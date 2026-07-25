import type { DashboardStats, StudentRecord } from '../types/dashboard';

const avgOf = (data: StudentRecord[], key: keyof StudentRecord): number => {
  if (data.length === 0) return 0;
  const sum = data.reduce((acc, curr) => acc + (curr[key] as number), 0);
  return sum / data.length;
};

export function calculateStats(data: StudentRecord[]): DashboardStats {
  const total = data.length;
  if (total === 0) {
    return {
      total: 0,
      depressionRate: '0.0',
      avgSocial: '0.0',
      avgSleep: '0.0',
      avgStress: '0.0',
      avgAnxiety: '0.0',
      avgAddiction: '0.0',
      avgGPA: '0.00',
    };
  }

  const depressedCount = data.filter((d) => d.depression_label === 1).length;

  return {
    total,
    depressionRate: ((depressedCount / total) * 100).toFixed(1),
    avgSocial: avgOf(data, 'daily_social_media_hours').toFixed(1),
    avgSleep: avgOf(data, 'sleep_hours').toFixed(1),
    avgStress: avgOf(data, 'stress_level').toFixed(1),
    avgAnxiety: avgOf(data, 'anxiety_level').toFixed(1),
    avgAddiction: avgOf(data, 'addiction_level').toFixed(1),
    avgGPA: avgOf(data, 'academic_performance').toFixed(2),
  };
}

export function getScoreColorClass(val: number): string {
  if (val >= 8) return 'bg-red-100 text-red-700';
  if (val >= 5) return 'bg-orange-100 text-orange-700';
  return 'bg-green-100 text-green-700';
}

const CORRELATION_KEYS: (keyof StudentRecord)[] = [
  'daily_social_media_hours',
  'stress_level',
  'anxiety_level',
  'addiction_level',
  'screen_time_before_sleep',
];

export const CORRELATION_LABELS = [
  'Social Media Hrs',
  'Stress',
  'Anxiety',
  'Addiction',
  'Screen Time (Pre-sleep)',
];

/** Mean-difference proxy for correlation: depressed vs. non-depressed averages per field. */
export function calculateCorrelation(data: StudentRecord[]): number[] {
  const dep = data.filter((d) => d.depression_label === 1);
  const nonDep = data.filter((d) => d.depression_label === 0);

  return CORRELATION_KEYS.map((key) => {
    const avgD = avgOf(dep, key);
    const avgN = avgOf(nonDep, key);
    return parseFloat((avgD - avgN).toFixed(2));
  });
}

export interface UsageBracket {
  label: string;
  anxiety: number;
  addiction: number;
}

export function calculateUsageBrackets(data: StudentRecord[]): UsageBracket[] {
  const ranges: [string, (h: number) => boolean][] = [
    ['<2h', (h) => h < 2],
    ['2-4h', (h) => h >= 2 && h < 4],
    ['4-6h', (h) => h >= 4 && h < 6],
    ['6h+', (h) => h >= 6],
  ];

  return ranges.map(([label, predicate]) => {
    const bucket = data.filter((d) => predicate(d.daily_social_media_hours));
    return {
      label,
      anxiety: parseFloat(avgOf(bucket, 'anxiety_level').toFixed(1)),
      addiction: parseFloat(avgOf(bucket, 'addiction_level').toFixed(1)),
    };
  });
}

export interface PlatformProfile {
  platform: string;
  stress: number;
  anxiety: number;
  addiction: number;
  depressionRateX10: number;
  sleep: number;
}

export function calculatePlatformProfiles(data: StudentRecord[]): PlatformProfile[] {
  const platforms = ['Instagram', 'TikTok', 'Both'] as const;

  return platforms.map((platform) => {
    const subset = data.filter((d) => d.platform_usage === platform);
    const depRate = subset.length
      ? (subset.filter((d) => d.depression_label === 1).length / subset.length) * 10
      : 0;

    return {
      platform,
      stress: avgOf(subset, 'stress_level'),
      anxiety: avgOf(subset, 'anxiety_level'),
      addiction: avgOf(subset, 'addiction_level'),
      depressionRateX10: depRate,
      sleep: avgOf(subset, 'sleep_hours'),
    };
  });
}

export interface AgeGenderDepressionRate {
  age: number;
  malePct: number;
  femalePct: number;
}

export function calculateDepressionByAgeGender(data: StudentRecord[]): AgeGenderDepressionRate[] {
  const ages = [13, 14, 15, 16, 17, 18, 19];

  return ages.map((age) => {
    const rateFor = (gender: 'male' | 'female') => {
      const subset = data.filter((d) => d.age === age && d.gender === gender);
      if (subset.length === 0) return 0;
      return (subset.filter((d) => d.depression_label === 1).length / subset.length) * 100;
    };

    return {
      age,
      malePct: parseFloat(rateFor('male').toFixed(1)),
      femalePct: parseFloat(rateFor('female').toFixed(1)),
    };
  });
}

export function buildInsightText(stats: DashboardStats): string {
  const highUsage = parseFloat(stats.avgSocial) > 5;
  return `In this filtered group, the Depression Rate is ${stats.depressionRate}%. Strongest correlation detected between Social Media Hours (${stats.avgSocial}h) and Anxiety Levels.${
    highUsage ? ' Warning: high usage detected in this segment.' : ''
  }`;
}
