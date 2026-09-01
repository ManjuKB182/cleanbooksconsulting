// Client-side CSV export for the dashboard "Export" button. Builds a CSV string
// from the same {key, header} column shape DataTable uses, so any dashboard can
// export exactly what's on screen without a backend round-trip.

export interface CsvColumn<T> {
  key: string;
  header: string;
  value?: (row: T) => string | number;
}

function escapeCell(value: string | number): string {
  const str = String(value);
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

export function downloadCsv<T>(filename: string, columns: CsvColumn<T>[], rows: T[]): void {
  const header = columns.map((c) => escapeCell(c.header)).join(",");
  const lines = rows.map((row) =>
    columns.map((c) => escapeCell(c.value ? c.value(row) : ((row as Record<string, unknown>)[c.key] as string | number) ?? "")).join(",")
  );
  const csv = [header, ...lines].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
