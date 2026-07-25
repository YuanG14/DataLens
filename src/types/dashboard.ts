export type Gender = 'male' | 'female';
export type Platform = 'Instagram' | 'TikTok' | 'Both';
export type DepressionLabel = 0 | 1;

export interface StudentRecord {
  age: number;
  gender: Gender;
  platform_usage: Platform;
  daily_social_media_hours: number;
  sleep_hours: number;
  screen_time_before_sleep: number;
  academic_performance: number;
  stress_level: number;
  anxiety_level: number;
  addiction_level: number;
  depression_label: DepressionLabel;
}

export interface FilterState {
  maxAge: number;
  gender: 'all' | Gender;
  platform: 'all' | Platform;
  depression: 'all' | '0' | '1';
}

export interface DashboardStats {
  total: number;
  depressionRate: string;
  avgSocial: string;
  avgSleep: string;
  avgStress: string;
  avgAnxiety: string;
  avgAddiction: string;
  avgGPA: string;
}

export type RiskLevel = 'Low' | 'Medium' | 'High';
