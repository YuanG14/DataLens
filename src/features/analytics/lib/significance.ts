// Standard numerical-analysis building blocks for a two-tailed significance
// test on a Pearson correlation coefficient (equivalently: on a simple
// linear regression slope, since testing "is the slope 0" and "is r 0" are
// the same test). Implemented from the well-known continued-fraction form
// of the incomplete beta function so this has no external stats dependency.

/** Lanczos approximation of ln(Γ(x)) — standard, accurate to ~15 significant digits. */
function logGamma(x: number): number {
  const g = 7;
  const coefficients = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059,
    12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
  ];
  if (x < 0.5) {
    return Math.log(Math.PI / Math.sin(Math.PI * x)) - logGamma(1 - x);
  }
  const xAdjusted = x - 1;
  let a = coefficients[0];
  const t = xAdjusted + g + 0.5;
  for (let i = 1; i < g + 2; i++) a += coefficients[i] / (xAdjusted + i);
  return 0.5 * Math.log(2 * Math.PI) + (xAdjusted + 0.5) * Math.log(t) - t + Math.log(a);
}

/** Continued-fraction expansion used by the regularized incomplete beta function. */
function betaContinuedFraction(x: number, a: number, b: number): number {
  const MAX_ITERATIONS = 200;
  const EPSILON = 3e-9;

  const qab = a + b;
  const qap = a + 1;
  const qam = a - 1;
  let c = 1;
  let d = 1 - (qab * x) / qap;
  if (Math.abs(d) < 1e-30) d = 1e-30;
  d = 1 / d;
  let h = d;

  for (let m = 1; m <= MAX_ITERATIONS; m++) {
    const m2 = 2 * m;
    let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < 1e-30) d = 1e-30;
    c = 1 + aa / c;
    if (Math.abs(c) < 1e-30) c = 1e-30;
    d = 1 / d;
    h *= d * c;

    aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < 1e-30) d = 1e-30;
    c = 1 + aa / c;
    if (Math.abs(c) < 1e-30) c = 1e-30;
    d = 1 / d;
    const del = d * c;
    h *= del;

    if (Math.abs(del - 1) < EPSILON) break;
  }
  return h;
}

/** Regularized incomplete beta function I_x(a, b), x in [0, 1]. */
function regularizedIncompleteBeta(x: number, a: number, b: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;

  const logBeta = logGamma(a + b) - logGamma(a) - logGamma(b) + a * Math.log(x) + b * Math.log(1 - x);
  const front = Math.exp(logBeta);

  if (x < (a + 1) / (a + b + 2)) {
    return (front * betaContinuedFraction(x, a, b)) / a;
  }
  return 1 - (front * betaContinuedFraction(1 - x, b, a)) / b;
}

/**
 * Two-tailed p-value for a t-distributed statistic with `df` degrees of
 * freedom. This is the standard identity relating the t-distribution's
 * tail probability to the regularized incomplete beta function.
 */
function twoTailedTTestPValue(t: number, df: number): number {
  if (df <= 0) return 1;
  const x = df / (df + t * t);
  return regularizedIncompleteBeta(x, df / 2, 0.5);
}

/**
 * Two-tailed p-value that the true Pearson correlation is 0, given the
 * observed `r` over `sampleSize` paired observations. Also valid for
 * testing whether a simple linear regression slope is 0 (mathematically
 * the same test), which is what trend analysis uses it for.
 */
export function correlationPValue(r: number, sampleSize: number): number {
  const df = sampleSize - 2;
  if (df <= 0) return 1;
  const clampedR = Math.max(-0.999999, Math.min(0.999999, r));
  const t = clampedR * Math.sqrt(df / (1 - clampedR * clampedR));
  return twoTailedTTestPValue(Math.abs(t), df);
}

export const SIGNIFICANCE_ALPHA = 0.05;

export function isSignificant(pValue: number): boolean {
  return pValue < SIGNIFICANCE_ALPHA;
}
