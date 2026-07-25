import type { RiskLevel } from '../types/dashboard';

/**
 * Same linear heuristic as the original prototype: a placeholder scoring
 * function, not a trained model. Kept as-is for Phase 1.5 (no behavior
 * changes) — flagged in the audit as something to replace with a real
 * model or backend-computed score in a later phase.
 */
export function estimateRisk(dailySocialMediaHours: number, sleepHours: number): RiskLevel {
  const score = dailySocialMediaHours * 2 - sleepHours * 1.5;
  if (score > 5) return 'High';
  if (score > 0) return 'Medium';
  return 'Low';
}

export const RISK_COLOR_CLASS: Record<RiskLevel, string> = {
  Low: 'text-green-300',
  Medium: 'text-yellow-300',
  High: 'text-red-300',
};
