/**
 * Formats a year into a century representation with BC/AD suffix
 * @param year - The year to format (negative for BC, positive for AD)
 * @returns Formatted century string (e.g., "20 BC" or "21 AD")
 */
export function formatCentury(year: number): string {
  const centuryNum = Math.abs(Math.floor(year / 100));
  const suffix = year < 0 ? ' BC' : ' AD';
  return `${centuryNum}${suffix}`;
} 