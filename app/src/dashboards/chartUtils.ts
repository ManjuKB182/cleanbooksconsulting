// Shared helpers for filtering mock rows by date and rolling them up into monthly
// series for the trend charts. All dates are plain ISO "yyyy-mm-dd" strings, which
// sort and compare correctly as-is.

export interface DateRange {
  from: string;
  to: string;
}

export function isoToday(): string {
  return new Date().toISOString().slice(0, 10);
}

export function addDaysIso(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function withinRange(dateStr: string, range: DateRange): boolean {
  return dateStr >= range.from && dateStr <= range.to;
}

function monthKey(dateStr: string): string {
  return dateStr.slice(0, 7);
}

function monthKeyToLabel(key: string): string {
  const [y, m] = key.split("-");
  const d = new Date(Date.UTC(Number(y), Number(m) - 1, 1));
  return d.toLocaleDateString("en-US", { month: "short", year: "2-digit", timeZone: "UTC" });
}

/** Rolls row-level records up into one point per month, summing the given fields. */
export function aggregateMonthly<T extends object>(
  rows: T[],
  dateField: keyof T,
  valueFields: (keyof T)[]
): Array<Record<string, number | string>> {
  const buckets = new Map<string, Record<string, number>>();

  for (const row of rows) {
    const key = monthKey(String(row[dateField]));
    if (!buckets.has(key)) {
      const init: Record<string, number> = {};
      valueFields.forEach((field) => {
        init[String(field)] = 0;
      });
      buckets.set(key, init);
    }
    const bucket = buckets.get(key)!;
    valueFields.forEach((field) => {
      bucket[String(field)] += Number(row[field]) || 0;
    });
  }

  return Array.from(buckets.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, values]) => ({ month: monthKeyToLabel(key), ...values }));
}

/** Counts rows per category (e.g. return reason, invoice status) for bar/pie charts. */
export function countBy<T>(rows: T[], key: (row: T) => string, value?: (row: T) => number): Array<{ name: string; value: number }> {
  const totals = new Map<string, number>();
  for (const row of rows) {
    const k = key(row);
    totals.set(k, (totals.get(k) ?? 0) + (value ? value(row) : 1));
  }
  return Array.from(totals.entries()).map(([name, value]) => ({ name, value }));
}
