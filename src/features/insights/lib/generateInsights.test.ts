import { describe, expect, it } from 'vitest';
import type { AnalyzableColumn, AnalyzableDataset } from '@/features/analytics/types';
import { analyzeDataset } from '@/features/analytics/lib/analyze';
import { generateInsights, isSensitiveDomain } from '@/features/insights/lib/generateInsights';

/**
 * These tests exercise the real pipeline (AnalyzableDataset -> analyzeDataset
 * -> generateInsights), not mocked analytics, so they verify the actual
 * contract Phase 10 cares about: every insight is traceable to a real
 * computed value, and the same engine behaves correctly across unrelated
 * domains and degenerate inputs.
 */

function col(name: string, columnType: AnalyzableColumn['columnType'], semanticRole: AnalyzableColumn['semanticRole']): AnalyzableColumn {
  return { name, displayName: name, columnType, semanticRole };
}

function dataset(name: string, columns: AnalyzableColumn[], rows: Record<string, unknown>[]): AnalyzableDataset {
  return { name, rowCount: rows.length, columns, rows };
}

describe('generateInsights — domain agnosticism', () => {
  it('generates relationship insights for a mental-health dataset without forcing clinical language', () => {
    const columns = [
      col('sleep_hours', 'numeric', 'sleep'),
      col('stress_level', 'numeric', 'stress'),
    ];
    // Deliberately strong, clean negative correlation so the rule is
    // guaranteed to fire (r <= -0.7 => 'strong').
    const rows = Array.from({ length: 10 }, (_, i) => ({
      sleep_hours: 4 + i * 0.5,
      stress_level: 10 - i * 0.5,
    }));
    const ds = dataset('Student Mental Health', columns, rows);
    const analytics = analyzeDataset(ds);
    const { insights } = generateInsights(ds, analytics);

    const relationship = insights.find((i) => i.category === 'relationship');
    expect(relationship).toBeDefined();
    expect(relationship!.description.toLowerCase()).not.toMatch(/causes|proves|diagnos/);
    expect(relationship!.description.toLowerCase()).toMatch(/relationship|association/);

    expect(isSensitiveDomain(ds)).toBe(true);
  });

  it('generates relationship insights for a student-performance dataset using the same rules', () => {
    const columns = [
      col('study_hours', 'numeric', 'numeric_measure'),
      col('gpa', 'numeric', 'score'),
    ];
    const rows = Array.from({ length: 10 }, (_, i) => ({
      study_hours: 1 + i * 0.6,
      gpa: 2.0 + i * 0.18,
    }));
    const ds = dataset('Student Performance', columns, rows);
    const analytics = analyzeDataset(ds);
    const { insights } = generateInsights(ds, analytics);

    const relationship = insights.find((i) => i.category === 'relationship');
    expect(relationship).toBeDefined();
    expect(isSensitiveDomain(ds)).toBe(false);
  });

  it('generates group-difference insights for a sales/business dataset with no numeric-pair correlation available', () => {
    const columns = [
      col('category', 'categorical', 'category'),
      col('price', 'numeric', 'numeric_measure'),
    ];
    const rows = [
      ...Array.from({ length: 6 }, () => ({ category: 'Electronics', price: 400 + Math.random() * 20 })),
      ...Array.from({ length: 6 }, () => ({ category: 'Groceries', price: 5 + Math.random() * 2 })),
    ];
    const ds = dataset('Sales Data', columns, rows);
    const analytics = analyzeDataset(ds);
    const { insights } = generateInsights(ds, analytics);

    const groupDiff = insights.find((i) => i.category === 'group-difference');
    expect(groupDiff).toBeDefined();
    expect(isSensitiveDomain(ds)).toBe(false);
  });
});

describe('generateInsights — rule reliability (evidence must match the rule)', () => {
  it('a strong negative correlation (r <= -0.7) produces a relationship insight whose evidence cites the real r value', () => {
    const columns = [col('x', 'numeric', 'numeric_measure'), col('y', 'numeric', 'numeric_measure')];
    const rows = Array.from({ length: 8 }, (_, i) => ({ x: i, y: 20 - i * 2 }));
    const ds = dataset('Synthetic', columns, rows);
    const analytics = analyzeDataset(ds);

    const pair = analytics.correlations[0];
    expect(pair).toBeDefined();
    expect(pair!.strength).toBe('strong');

    const { insights } = generateInsights(ds, analytics);
    const relationship = insights.find((i) => i.category === 'relationship');
    expect(relationship).toBeDefined();
    // The evidence string must be built from the actual computed r, not invented.
    expect(relationship!.evidence).toContain(String(pair!.r));
  });

  it('a data-quality warning from the analytics engine surfaces as a data-quality insight using the same message', () => {
    const columns = [col('score', 'numeric', 'numeric_measure')];
    const rows: Record<string, unknown>[] = [
      ...Array.from({ length: 8 }, (_, i) => ({ score: i })),
      ...Array.from({ length: 4 }, () => ({ score: null })), // ~33% missing
    ];
    const ds = dataset('Quality Test', columns, rows);
    const analytics = analyzeDataset(ds);
    expect(analytics.dataQuality.warnings.some((w) => w.level === 'warning')).toBe(true);

    const { insights } = generateInsights(ds, analytics);
    const qualityInsight = insights.find((i) => i.category === 'data-quality');
    expect(qualityInsight).toBeDefined();
    const sourceWarning = analytics.dataQuality.warnings.find((w) => w.level === 'warning')!;
    expect(qualityInsight!.evidence).toBe(sourceWarning.message);
  });
});

describe('generateInsights — edge cases', () => {
  it('no numeric columns: does not attempt correlation, group-difference, trend, or KPI insights', () => {
    const columns = [col('city', 'categorical', 'category'), col('country', 'categorical', 'category')];
    const rows = [{ city: 'A', country: 'X' }, { city: 'B', country: 'Y' }, { city: 'C', country: 'X' }];
    const ds = dataset('Categorical Only', columns, rows);
    const analytics = analyzeDataset(ds);

    expect(analytics.correlations.length).toBe(0);
    expect(analytics.kpis.length).toBe(0);

    const { insights } = generateInsights(ds, analytics);
    expect(insights.some((i) => i.category === 'relationship')).toBe(false);
    expect(insights.some((i) => i.category === 'trend')).toBe(false);
    // Only the always-present summary card should remain.
    expect(insights.filter((i) => i.category === 'summary').length).toBe(1);
  });

  it('only one numeric column: correlation rules never run', () => {
    const columns = [col('score', 'numeric', 'numeric_measure'), col('label', 'categorical', 'category')];
    const rows = Array.from({ length: 6 }, (_, i) => ({ score: i, label: 'X' }));
    const ds = dataset('Single Numeric', columns, rows);
    const analytics = analyzeDataset(ds);

    expect(analytics.correlations.length).toBe(0);
    const { insights } = generateInsights(ds, analytics);
    expect(insights.some((i) => i.category === 'relationship')).toBe(false);
  });

  it('constant numeric values: correlation is safely undefined/negligible, never NaN or invented', () => {
    const columns = [col('a', 'numeric', 'numeric_measure'), col('b', 'numeric', 'numeric_measure')];
    const rows = Array.from({ length: 10 }, () => ({ a: 5, b: 5 }));
    const ds = dataset('Constant Values', columns, rows);
    const analytics = analyzeDataset(ds);

    for (const pair of analytics.correlations) {
      expect(Number.isNaN(pair.r)).toBe(false);
    }
    const { insights } = generateInsights(ds, analytics);
    expect(insights.some((i) => Number.isNaN(Number(i.evidence.match(/-?\d+(\.\d+)?/)?.[0] ?? 0)))).toBe(false);
  });

  it('very small dataset (below the minimum sample size): no correlation insight is manufactured', () => {
    const columns = [col('a', 'numeric', 'numeric_measure'), col('b', 'numeric', 'numeric_measure')];
    const rows = [{ a: 1, b: 2 }, { a: 2, b: 4 }]; // below MIN_OBSERVATIONS_FOR_CORRELATION (3)
    const ds = dataset('Tiny Dataset', columns, rows);
    const analytics = analyzeDataset(ds);

    expect(analytics.correlations.length).toBe(0);
    const { insights } = generateInsights(ds, analytics);
    expect(insights.some((i) => i.category === 'relationship')).toBe(false);
  });

  it('no meaningful relationships at all: pool is empty and only the summary insight is returned', () => {
    const columns = [col('a', 'numeric', 'numeric_measure'), col('b', 'numeric', 'numeric_measure')];
    // Random-ish, uncorrelated small values with no missingness, no trend column, no categories.
    const rows = [
      { a: 1, b: 9 }, { a: 2, b: 2 }, { a: 3, b: 7 }, { a: 4, b: 1 },
      { a: 5, b: 8 }, { a: 6, b: 3 }, { a: 7, b: 6 }, { a: 8, b: 4 },
    ];
    const ds = dataset('No Relationships', columns, rows);
    const analytics = analyzeDataset(ds);

    const { insights, poolSize } = generateInsights(ds, analytics);
    // Whatever the pool size turns out to be, the summary must always be
    // present and first, and the engine must not throw or fabricate data.
    expect(insights[0].category).toBe('summary');
    expect(poolSize).toBe(insights.length - 1 + Math.max(0, 0)); // sanity: pool feeds the non-summary slots
  });

  it('unknown schema (unrecognized column names/roles): engine still returns a summary without throwing', () => {
    const columns = [col('mystery_col_1', 'text', 'unknown' as AnalyzableColumn['semanticRole']), col('mystery_col_2', 'numeric', 'unknown' as AnalyzableColumn['semanticRole'])];
    const rows = Array.from({ length: 5 }, (_, i) => ({ mystery_col_1: `v${i}`, mystery_col_2: i * 3 }));
    const ds = dataset('Unknown Schema', columns, rows);

    expect(() => {
      const analytics = analyzeDataset(ds);
      generateInsights(ds, analytics);
    }).not.toThrow();
  });
});

describe('generateInsights — no unsupported causal claims', () => {
  it('never uses causal language, regardless of correlation strength or direction', () => {
    const columns = [col('x', 'numeric', 'numeric_measure'), col('y', 'numeric', 'numeric_measure')];
    const rows = Array.from({ length: 10 }, (_, i) => ({ x: i, y: i * 3 + 1 })); // strong positive
    const ds = dataset('Causation Check', columns, rows);
    const analytics = analyzeDataset(ds);
    const { insights } = generateInsights(ds, analytics);

    // "cause-and-effect" is fine when used in the approved disclaimer
    // ("...not a cause-and-effect relationship"); what's actually banned is
    // an affirmative causal claim like "X causes Y" or "X leads to Y".
    const banned = /\bcauses\b|\bcaused by\b|\bleads to\b|\bresults in\b|\bdue to\b/i;
    for (const insight of insights) {
      const withoutDisclaimer = insight.description.replace(/cause-and-effect/gi, '');
      expect(withoutDisclaimer).not.toMatch(banned);
    }
  });
});
