// Central place for values that were previously duplicated as magic
// numbers/strings across components (age bounds, sample sizes, chart
// palette). Change once here instead of hunting through every file.

export const AGE_MIN = 13;
export const AGE_MAX = 19;
export const AGE_RANGE = Array.from({ length: AGE_MAX - AGE_MIN + 1 }, (_, i) => AGE_MIN + i);

export const MOCK_DATA_SIZE = 1000;

/** Scatter chart only plots a sample of points for render performance. */
export const SCATTER_SAMPLE_SIZE = 200;

/** Record table only renders a page at a time for render performance. */
export const TABLE_PAGE_SIZE = 50;

export const BRAND_COLOR = '#008080';

export const CHART_PALETTE = {
  brand: '#008080',
  brandFaded: '#00808088',
  brandTint: '#00808022',
  blue: '#4A90E2',
  blueTint: '#4A90E222',
  red: '#E74C3C',
  redTint: '#E74C3C22',
  purple: '#9B59B6',
} as const;
