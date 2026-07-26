export type InsightCategory = 'summary' | 'key-finding' | 'relationship' | 'group-difference' | 'trend' | 'data-quality';

export type InsightConfidence = 'high' | 'medium' | 'low';

/**
 * One generated insight. Every field traces back to something the Phase 7
 * analytics engine actually calculated — `evidence` is the literal number
 * the insight is describing, shown in the UI so the claim is checkable.
 * Nothing here is ever produced except by reading `AnalyticsResult`.
 */
export interface Insight {
  id: string;
  category: InsightCategory;
  title: string;
  description: string;
  /** Short, literal statement of the underlying number(s) — e.g. "r = -0.62". */
  evidence: string;
  confidence: InsightConfidence;
}

export interface GeneratedInsights {
  insights: Insight[];
  /** True when the dataset has at least one column semantically tied to mental health (stress/anxiety/depression). */
  isSensitiveDomain: boolean;
}
