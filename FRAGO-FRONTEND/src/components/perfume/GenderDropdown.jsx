import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const GenderDropdown = ({ gender = "", setGender }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState(null);
  const buttonRef = useRef(null);
  const panelRef = useRef(null);

  const options = [
    { label: "All", value: "" },
    { label: "Men", value: "MEN" },
    { label: "Women", value: "WOMEN" },
    { label: "Unisex", value: "UNISEX" },
  ];

  const activeLabel = options.find((o) => o.value === gender)?.label || "All";

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
            className="w-56 max-w-[calc(100vw-2rem)] bg-white border border-gray-100 rounded-2xl shadow-2xl py-2"
          >
            {options.map((option) => (
              <button
                key={option.value || "all"}
                onClick={() => {
                  if (typeof setGender === "function") setGender(option.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-6 py-3 text-sm transition-colors ${
                  gender === option.value
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
    <div className="relative w-full sm:w-auto min-w-0">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full sm:w-auto min-w-0 flex items-center justify-between gap-3 px-6 py-3 bg-white hover:bg-gray-50 border border-gray-100 rounded-full transition-all duration-300 text-sm font-medium text-gray-700 shadow-sm"
      >
        <span className="text-gray-400 font-normal hidden sm:inline shrink-0">
          Gender:
        </span>
        <span className="min-w-0 flex-1 truncate text-left">{activeLabel}</span>
        <ChevronDown
          size={16}
          className={`shrink-0 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {dropdownPanel}
    </div>
  );
};

export default GenderDropdown;
