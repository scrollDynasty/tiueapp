// Simple, dependency-free date formatting utilities

export function formatDateYMD(input: string | Date): string {
  const date = parseToDate(input);
  if (!date) {
    return typeof input === 'string' ? input.split(' ')[0] ?? input : '';
  }
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
}

export function parseToDate(input: string | Date): Date | null {
  if (input instanceof Date && !isNaN(input.getTime())) return input;
  if (typeof input !== 'string') return null;

  // Handle formats like "2025-09-06 10:33:20" or "2025-09-06"
  const m = input.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) {
    const [_, y, mo, d] = m;
    const year = Number(y);
    const month = Number(mo) - 1; // zero-based
    const day = Number(d);
    const dt = new Date(year, month, day);
    return isNaN(dt.getTime()) ? null : dt;
  }

  const dt = new Date(input);
  return isNaN(dt.getTime()) ? null : dt;
}
