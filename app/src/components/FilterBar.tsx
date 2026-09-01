import { useState } from "react";
import { addDaysIso, isoToday, type DateRange } from "../dashboards/chartUtils";
import { SearchIcon } from "./icons";

const PRESETS: { label: string; days: number | null }[] = [
  { label: "30D", days: 30 },
  { label: "90D", days: 90 },
  { label: "6M", days: 183 },
  { label: "All", days: null },
];

export function presetRange(days: number | null, earliest: string): DateRange {
  const to = isoToday();
  return { from: days === null ? earliest : addDaysIso(to, -days), to };
}

export interface SelectFilter {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}

export function FilterBar({
  range,
  onChange,
  earliest,
  defaultPreset = "6M",
  search,
  onSearchChange,
  searchPlaceholder,
  select,
}: {
  range?: DateRange;
  onChange?: (range: DateRange) => void;
  earliest?: string;
  defaultPreset?: string;
  search?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  select?: SelectFilter;
}) {
  const [activePreset, setActivePreset] = useState<string | null>(defaultPreset);
  const hasDateRange = range !== undefined && onChange !== undefined && earliest !== undefined;

  return (
    <div className="filter-bar">
      {hasDateRange && (
        <div className="filter-presets">
          {PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              className={`filter-chip ${activePreset === preset.label ? "active" : ""}`}
              onClick={() => {
                setActivePreset(preset.label);
                onChange(presetRange(preset.days, earliest));
              }}
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}

      {onSearchChange && (
        <label className="filter-search">
          <SearchIcon width={14} height={14} />
          <input
            type="search"
            value={search ?? ""}
            placeholder={searchPlaceholder ?? "Search"}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </label>
      )}

      {select && (
        <label className="filter-select">
          {select.label}
          <select value={select.value} onChange={(e) => select.onChange(e.target.value)}>
            <option value="all">All</option>
            {select.options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </label>
      )}

      {hasDateRange && (
        <div className="filter-dates">
          <label>
            From
            <input
              type="date"
              value={range.from}
              min={earliest}
              max={range.to}
              onChange={(e) => {
                setActivePreset(null);
                onChange({ ...range, from: e.target.value });
              }}
            />
          </label>
          <label>
            To
            <input
              type="date"
              value={range.to}
              min={range.from}
              max={isoToday()}
              onChange={(e) => {
                setActivePreset(null);
                onChange({ ...range, to: e.target.value });
              }}
            />
          </label>
        </div>
      )}
    </div>
  );
}
