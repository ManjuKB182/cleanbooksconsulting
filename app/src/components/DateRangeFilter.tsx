import { useState } from "react";
import { addDaysIso, isoToday, type DateRange } from "../dashboards/chartUtils";

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

export function DateRangeFilter({
  range,
  onChange,
  earliest,
  defaultPreset = "6M",
}: {
  range: DateRange;
  onChange: (range: DateRange) => void;
  earliest: string;
  defaultPreset?: string;
}) {
  const [activePreset, setActivePreset] = useState<string | null>(defaultPreset);

  return (
    <div className="filter-bar">
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
    </div>
  );
}
