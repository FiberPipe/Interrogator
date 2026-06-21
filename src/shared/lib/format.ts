export function safeToFixed(value: number | null | undefined, decimals: number = 6): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '—';
  }
  return value.toFixed(decimals);
}
