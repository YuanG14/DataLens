import type { ConfidenceLevel, DetectedDataType, SemanticRole } from '@/features/import/types';

/** Lowercases and strips everything but letters/digits, so "Stress Level", "stress_level", and "stressScore"-ish variants line up for comparison. */
export function normalizeColumnName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Known aliases per role, already normalized. Purely a name lookup — this
 * is the "explainable, no AI" detector the spec asks for: every guess can
 * be traced back to one of these entries.
 */
const ROLE_ALIASES: Partial<Record<SemanticRole, string[]>> = {
  identifier: ['id', 'identifier', 'recordid', 'uuid', 'rowid'],
  name: ['name', 'student', 'studentname', 'fullname'],
  age: ['age', 'studentage'],
  gender: ['gender', 'sex'],
  date: ['date', 'surveydate', 'recordeddate', 'timestamp'],
  stress: ['stress', 'stresslevel', 'stressscore'],
  anxiety: ['anxiety', 'anxietylevel', 'anxietyscore'],
  depression: ['depression', 'depressionlevel', 'depressionscore', 'depressionlabel'],
  sleep: ['sleep', 'sleephours', 'hoursofsleep'],
  screen_time: ['screentime', 'screentimebeforesleep', 'dailyscreentime'],
  academic_performance: ['gpa', 'academicperformance'],
  percentage: ['attendance', 'percentage', 'completionrate'],
  score: ['score', 'rating'],
};

/** Which detected data types are "expected" for a role — used to grade confidence, not to block a match. */
const EXPECTED_TYPES: Partial<Record<SemanticRole, DetectedDataType[]>> = {
  identifier: ['string', 'integer'],
  name: ['string'],
  age: ['integer'],
  gender: ['string'],
  date: ['date'],
  stress: ['integer', 'number'],
  anxiety: ['integer', 'number'],
  depression: ['integer', 'number', 'boolean'],
  sleep: ['integer', 'number'],
  screen_time: ['integer', 'number'],
  academic_performance: ['integer', 'number'],
  percentage: ['integer', 'number'],
  score: ['integer', 'number'],
};

function fallbackRoleForType(dataType: DetectedDataType): SemanticRole {
  switch (dataType) {
    case 'integer':
    case 'number':
      return 'numeric_measure';
    case 'boolean':
      return 'boolean';
    case 'date':
      return 'date';
    case 'string':
      return 'category';
    default:
      return 'unknown';
  }
}

export interface RoleDetectionResult {
  role: SemanticRole;
  confidence: ConfidenceLevel;
}

/**
 * Guesses a column's semantic role from its (normalized) name and its
 * detected data type. Name match quality plus type agreement together
 * decide confidence:
 *   - exact alias match + expected type  -> high
 *   - exact alias match, unexpected type -> medium (name is a strong signal even if values look odd)
 *   - partial/substring alias match      -> medium
 *   - no name match, type alone          -> low, generic role (numeric_measure/category/...)
 *   - nothing usable                     -> unknown, low
 *
 * `uniqueRatio` (uniqueCount / rowCount) lets an all-unique text/integer
 * column named like an id be recognized as 'identifier' with high
 * confidence even if it isn't in the alias list verbatim.
 */
export function detectSemanticRole(
  originalName: string,
  dataType: DetectedDataType,
  uniqueRatio: number,
): RoleDetectionResult {
  const normalized = normalizeColumnName(originalName);

  if (uniqueRatio === 1 && /id$/.test(normalized) && dataType !== 'date') {
    return { role: 'identifier', confidence: 'high' };
  }

  for (const [role, aliases] of Object.entries(ROLE_ALIASES) as [SemanticRole, string[]][]) {
    if (aliases.includes(normalized)) {
      const expected = EXPECTED_TYPES[role];
      const typeMatches = !expected || expected.includes(dataType);
      return { role, confidence: typeMatches ? 'high' : 'medium' };
    }
  }

  for (const [role, aliases] of Object.entries(ROLE_ALIASES) as [SemanticRole, string[]][]) {
    if (aliases.some((alias) => normalized.includes(alias) || alias.includes(normalized))) {
      return { role, confidence: 'medium' };
    }
  }

  if (dataType === 'unknown') {
    return { role: 'unknown', confidence: 'low' };
  }

  return { role: fallbackRoleForType(dataType), confidence: 'low' };
}
