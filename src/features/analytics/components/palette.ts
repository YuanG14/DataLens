/** Shared chart palette so every generic chart in this feature looks consistent. */
export const ANALYTICS_PALETTE = [
  '#008080', // brand teal
  '#4A90E2',
  '#E74C3C',
  '#9B59B6',
  '#F39C12',
  '#2ECC71',
  '#E67E22',
  '#1ABC9C',
] as const;

export function paletteColor(index: number): string {
  return ANALYTICS_PALETTE[index % ANALYTICS_PALETTE.length];
}
