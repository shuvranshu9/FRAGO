import { ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const SortDropdown = ({ sortBy, setSortBy }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const options = [
    { label: "Newest Arrivals", value: "newest" },
    { label: "Price: Low to High", value: "price-asc" },
    { label: "Price: High to Low", value: "price-desc" },
    { label: "Alphabetical: A-Z", value: "name-asc" },
  ];

  const activeLabel = options.find((o) => o.value === sortBy)?.label;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-6 py-3 bg-white hover:bg-gray-50 border border-gray-100 rounded-full transition-all duration-300 text-sm font-medium text-gray-700 shadow-sm"
      >
        <span className="text-gray-400 font-normal">Sort by:</span>
        {activeLabel}
        <ChevronDown
          size={16}
          className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-100 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                setSortBy(option.value);
                setIsOpen(false);
              }}
              className={`w-full text-left px-6 py-3 text-sm transition-colors ${
                sortBy === option.value
                  ? "bg-green-50 text-green-900 font-bold"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SortDropdown;
