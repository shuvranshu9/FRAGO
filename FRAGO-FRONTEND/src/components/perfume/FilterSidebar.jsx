import { X, Filter } from "lucide-react";

const FilterSidebar = ({
  filters,
  setFilters,
  availableOptions,
  isOpen,
  onClose,
}) => {
  const toggleFilter = (type, value) => {
    setFilters((prev) => {
      const current = prev[type] || [];
      const updated = current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value];
      return { ...prev, [type]: updated };
    });
  };

  const clearFilters = () => {
    setFilters({
      scent_type: [],
      mood: [],
      brand: [],
      gender: "",
      priceRange: { min: "", max: "" },
    });
  };

  const activeCount =
    (filters.scent_type?.length || 0) +
    (filters.mood?.length || 0) +
    (filters.brand?.length || 0) +
    (filters.gender ? 1 : 0) +
    (filters.priceRange?.min ? 1 : 0) +
    (filters.priceRange?.max ? 1 : 0);

  const setPriceRange = (key, value) => {
    const digitsOnly = String(value ?? "").replace(/[^0-9]/g, "");
    setFilters((prev) => ({
      ...prev,
      priceRange: {
        ...(prev.priceRange || { min: "", max: "" }),
        [key]: digitsOnly,
      },
    }));
  };

  return (
    <>
      {/* Mobile Drawer Overlay */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] transition-opacity lg:hidden ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Sidebar Content */}
      <aside
        className={`fixed inset-y-0 left-0 w-[300px] bg-white z-[70] shadow-2xl transition-transform duration-500 lg:sticky lg:top-24 lg:h-fit lg:shadow-none lg:z-0 lg:translate-x-0 lg:bg-transparent ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col p-8 lg:p-0">
          <div className="flex items-center justify-between mb-8 lg:hidden">
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-green-900" />
              <h2 className="text-xl font-serif font-bold">Filters</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X size={24} />
            </button>
          </div>

          <div className="space-y-10 lg:bg-white lg:p-8 lg:rounded-3xl lg:border lg:border-gray-50 lg:shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900">
                Refine by
              </h3>
              {activeCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-[10px] font-bold uppercase tracking-tighter text-red-500 hover:text-red-600 underline"
                >
                  Clear All ({activeCount})
                </button>
              )}
            </div>

            {/* Scent Type Filter */}
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                Scent Family
              </h4>
              <div className="space-y-3">
                {availableOptions.scent_types.map((type) => (
                  <label
                    key={type}
                    className="flex items-center group cursor-pointer"
                  >
                    <div className="relative flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={filters.scent_type.includes(type)}
                        onChange={() => toggleFilter("scent_type", type)}
                        className="peer appearance-none w-5 h-5 border-2 border-gray-200 rounded-md checked:bg-green-900 checked:border-green-900 transition-all cursor-pointer"
                      />
                      <svg
                        className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <span className="ml-3 text-sm text-gray-600 group-hover:text-green-900 transition-colors font-medium">
                      {type}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Mood Filter */}
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                The Mood
              </h4>
              <div className="space-y-3">
                {availableOptions.moods.map((mood) => (
                  <label
                    key={mood}
                    className="flex items-center group cursor-pointer"
                  >
                    <div className="relative flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={filters.mood.includes(mood)}
                        onChange={() => toggleFilter("mood", mood)}
                        className="peer appearance-none w-5 h-5 border-2 border-gray-200 rounded-md checked:bg-green-900 checked:border-green-900 transition-all cursor-pointer"
                      />
                      <svg
                        className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <span className="ml-3 text-sm text-gray-600 group-hover:text-green-900 transition-colors font-medium">
                      {mood}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Brand Filter */}
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                Fragrance Houses
              </h4>
              <div className="space-y-3">
                {availableOptions.brands.map((brand) => (
                  <label
                    key={brand}
                    className="flex items-center group cursor-pointer"
                  >
                    <div className="relative flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={filters.brand.includes(brand)}
                        onChange={() => toggleFilter("brand", brand)}
                        className="peer appearance-none w-5 h-5 border-2 border-gray-200 rounded-md checked:bg-green-900 checked:border-green-900 transition-all cursor-pointer"
                      />
                      <svg
                        className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <span className="ml-3 text-sm text-gray-600 group-hover:text-green-900 transition-colors font-medium">
                      {brand}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                Price Range
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">
                    Min (NPR)
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={filters.priceRange?.min || ""}
                    onChange={(e) => setPriceRange("min", e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-green-900/10"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">
                    Max (NPR)
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={filters.priceRange?.max || ""}
                    onChange={(e) => setPriceRange("max", e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-green-900/10"
                    placeholder="99999"
                  />
                </div>
              </div>

              <p className="mt-2 text-[10px] text-gray-400">
                Filters by the lowest price of each perfume.
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default FilterSidebar;
