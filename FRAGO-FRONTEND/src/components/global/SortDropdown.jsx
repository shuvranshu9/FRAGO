import { ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

const SortDropdown = ({ sortBy, setSortBy }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState(null);
  const buttonRef = useRef(null);
  const panelRef = useRef(null);

  const options = [
    { label: "Newest Arrivals", value: "newest" },
    { label: "Price: Low to High", value: "price-asc" },
    { label: "Price: High to Low", value: "price-desc" },
    { label: "Alphabetical: A-Z", value: "name-asc" },
  ];

  const activeLabel = options.find((o) => o.value === sortBy)?.label;

  // Recalculate dropdown position whenever it opens
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + window.scrollY + 8,
        right: window.innerWidth - rect.right,
      });
    } else {
      setDropdownPos(null);
    }
  }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(e.target) &&
        panelRef.current &&
        !panelRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const dropdownPanel =
    isOpen && dropdownPos
      ? createPortal(
          <div
            ref={panelRef}
            style={{
              position: "absolute",
              top: dropdownPos.top,
              right: dropdownPos.right,
              zIndex: 9999,
            }}
            className="w-64 bg-white border border-gray-100 rounded-2xl shadow-2xl py-2"
          >
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
          </div>,
          document.body,
        )
      : null;

  return (
    <div className="relative">
      <button
        ref={buttonRef}
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

      {dropdownPanel}
    </div>
  );
};

export default SortDropdown;
