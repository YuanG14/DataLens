import type { Gender, Platform, StudentRecord } from '@/features/dashboard/types';
import { AGE_MAX, AGE_MIN, MOCK_DATA_SIZE } from './constants';

const PLATFORMS: Platform[] = ['Instagram', 'TikTok', 'Both'];
const GENDERS: Gender[] = ['male', 'female'];

/**
 * Generates a synthetic dataset with intentionally correlated fields so the
 * dashboard has something meaningful to visualize before a real dataset is
 * imported. Mirrors the relationships from the original prototype:
 * more social media / pre-sleep screen time -> less sleep, more stress,
 * more anxiety, more addiction risk, higher depression-label probability.
 */
export function generateMockData(count: number = MOCK_DATA_SIZE): StudentRecord[] {
  const data: StudentRecord[] = [];

  for (let i = 0; i < count; i++) {
    const age = Math.floor(Math.random() * (AGE_MAX - AGE_MIN + 1)) + AGE_MIN;
    const gender = GENDERS[Math.floor(Math.random() * GENDERS.length)];
    const platform = PLATFORMS[Math.floor(Math.random() * PLATFORMS.length)];
    const daily_social_media_hours = parseFloat((Math.random() * 7 + 1).toFixed(1));
    const screen_time_before_sleep = parseFloat((Math.random() * 2.5 + 0.5).toFixed(1));

    const sleep_hours = parseFloat(
      (9 - daily_social_media_hours * 0.3 - Math.random() * 2).toFixed(1)
    );
    const academic_performance = parseFloat(
      (4.0 - daily_social_media_hours * 0.15 + Math.random() * 0.5).toFixed(2)
    );

    const stress_level = Math.min(10, Math.ceil(daily_social_media_hours * 0.8 + Math.random() * 3));
    const anxiety_level = Math.min(
      10,
      Math.ceil(daily_social_media_hours * 0.7 + screen_time_before_sleep * 1.5 + Math.random() * 2)
    );
    const addiction_level = Math.min(10, Math.ceil(daily_social_media_hours * 1.1 + Math.random() * 2));

    const riskScore =
      daily_social_media_hours * 2 + stress_level * 1.5 + anxiety_level * 1.5 - sleep_hours * 2;
    const depression_label = riskScore > 18 ? 1 : 0;

    data.push({
      age,
      gender,
      platform_usage: platform,
      daily_social_media_hours,
      sleep_hours,
      screen_time_before_sleep,
      academic_performance,
      stress_level,
      anxiety_level,
      addiction_level,
      depression_label,
    });
  }

  return data;
}
