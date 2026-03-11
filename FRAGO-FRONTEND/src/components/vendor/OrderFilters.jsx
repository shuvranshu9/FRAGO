import { useMemo } from "react";
import { FiX, FiFilter, FiArrowUp, FiArrowDown } from "react-icons/fi";

const STATUSES = ["pending", "paid", "processing", "shipped", "delivered", "cancelled"];

const MONTHS = [
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

const selectClass =
  "h-9 px-3 pr-8 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed appearance-none cursor-pointer";

/**
 * Reusable order filter bar.
 *
 * Props:
 *  filters  – { status, year, month, day, sortAmount }
 *  onChange – (updatedFilters) => void
 *  onReset  – () => void
 */
const OrderFilters = ({ filters, onChange, onReset }) => {
  const currentYear = new Date().getFullYear();
  const years = useMemo(
    () => Array.from({ length: 5 }, (_, i) => String(currentYear - i)),
    [currentYear],
  );

  const activeCount = [
    filters.status,
    filters.year,
    filters.month,
    filters.day,
    filters.sortAmount,
  ].filter(Boolean).length;

  const handleChange = (field, value) => {
    const updated = { ...filters, [field]: value || "" };
    // Reset dependent fields if parent is cleared
    if (field === "year" && !value) updated.month = "";
    if ((field === "year" || field === "month") && !value) updated.day = "";
    onChange(updated);
  };

  const cycleSortAmount = () => {
    const next =
      filters.sortAmount === "" ? "asc" : filters.sortAmount === "asc" ? "desc" : "";
    onChange({ ...filters, sortAmount: next });
  };

  return (
    <div className="flex flex-wrap items-center gap-2 px-6 py-3 bg-gray-50/60 border-b border-gray-100">
      {/* Icon label */}
      <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider mr-1">
        <FiFilter size={13} /> Filters
        {activeCount > 0 && (
          <span className="ml-1 bg-indigo-600 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 leading-none">
            {activeCount}
          </span>
        )}
      </span>

      {/* Status */}
      <div className="relative">
        <select
          value={filters.status}
          onChange={(e) => handleChange("status", e.target.value)}
          className={selectClass}
          style={{ minWidth: 130 }}
        >
          <option value="">All Statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-gray-400">▾</span>
      </div>

      {/* Year */}
      <div className="relative">
        <select
          value={filters.year}
          onChange={(e) => handleChange("year", e.target.value)}
          className={selectClass}
          style={{ minWidth: 100 }}
        >
          <option value="">Year</option>
          {years.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
        <span className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-gray-400">▾</span>
      </div>

      {/* Month — only active if year selected */}
      <div className="relative">
        <select
          value={filters.month}
          onChange={(e) => handleChange("month", e.target.value)}
          disabled={!filters.year}
          className={selectClass}
          style={{ minWidth: 130 }}
        >
          <option value="">Month</option>
          {MONTHS.map((m) => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>
        <span className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-gray-400">▾</span>
      </div>

      {/* Day — only active if month selected */}
      <input
        type="number"
        min={1}
        max={31}
        placeholder="Day"
        value={filters.day}
        disabled={!filters.month}
        onChange={(e) => {
          const v = e.target.value;
          if (v === "" || (Number(v) >= 1 && Number(v) <= 31)) {
            handleChange("day", v);
          }
        }}
        className="h-9 w-20 px-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      />

      {/* Sort by amount cycle button */}
      <button
        onClick={cycleSortAmount}
        title="Sort by Amount"
        className={`flex items-center gap-1.5 h-9 px-3 rounded-xl border text-sm font-medium transition-all ${
          filters.sortAmount
            ? "border-indigo-500 bg-indigo-50 text-indigo-700"
            : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
        }`}
      >
        {filters.sortAmount === "asc" ? (
          <><FiArrowUp size={14} /> Amount: Low→High</>
        ) : filters.sortAmount === "desc" ? (
          <><FiArrowDown size={14} /> Amount: High→Low</>
        ) : (
          <>Sort by Amount</>
        )}
      </button>

      {/* Reset */}
      {activeCount > 0 && (
        <button
          onClick={onReset}
          className="flex items-center gap-1 h-9 px-3 rounded-xl border border-red-200 bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 transition-all"
        >
          <FiX size={14} /> Reset
        </button>
      )}
    </div>
  );
};

export default OrderFilters;
