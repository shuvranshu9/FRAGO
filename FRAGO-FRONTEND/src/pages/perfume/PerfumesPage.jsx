import { useState, useEffect, useRef } from "react";
import { Search, SlidersHorizontal, Package } from "lucide-react";
import api from "../../utils/api";
import ProductCard from "../../components/perfume/ProductCard";
import FilterSidebar from "../../components/perfume/FilterSidebar";
import SortDropdown from "../../components/perfume/SortDropdown";
import CustomPagination from "../../components/global/CustomPagination";

const PerfumesPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [limit] = useState(12);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [filters, setFilters] = useState({
    scent_type: [],
    mood: [],
    brand: [],
    priceRange: { min: "", max: "" },
  });
  const [availableOptions, setAvailableOptions] = useState({
    scent_types: [],
    moods: [],
    brands: [],
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const lastCriteriaKeyRef = useRef("");

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await api.get("/perfume/options");
        if (response.data?.success && response.data?.data) {
          setAvailableOptions({
            scent_types: response.data.data.scent_types || [],
            moods: response.data.data.moods || [],
            brands: response.data.data.brands || [],
          });
        }
      } catch {
        // non-blocking
      }
    };

    fetchOptions();
  }, []);

  useEffect(() => {
    const fetchPerfumes = async () => {
      setLoading(true);
      try {
        const criteriaKey = JSON.stringify({
          searchTerm: searchTerm.trim(),
          sortBy,
          filters,
        });

        if (lastCriteriaKeyRef.current !== criteriaKey) {
          lastCriteriaKeyRef.current = criteriaKey;
          if (page !== 1) {
            setLoading(false);
            setPage(1);
            return;
          }
        }

        const params = {
          page,
          limit,
          sortBy,
        };

        if (searchTerm.trim()) params.search = searchTerm.trim();
        if (filters.scent_type?.length)
          params.scent_type = filters.scent_type.join(",");
        if (filters.mood?.length) params.mood = filters.mood.join(",");
        if (filters.brand?.length) params.brand = filters.brand.join(",");

        if (filters.priceRange?.min !== "") params.minPrice = filters.priceRange.min;
        if (filters.priceRange?.max !== "") params.maxPrice = filters.priceRange.max;

        const response = await api.get("/perfume", {
          params,
        });
        if (response.data.success) {
          setProducts(response.data.data);
          setTotalPages(response.data.totalPages || 1);
          setTotalItems(response.data.totalItems || 0);
        }
      } catch (error) {
        console.error("Error fetching perfumes:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPerfumes();
  }, [page, limit, searchTerm, sortBy, filters]);

  return (
    <div className="min-h-screen bg-[#FCFBFA] pb-10 px-4 md:px-8 -mt-8 md:mt-0">
      <div className="max-w-7xl mx-auto">
        {/* Toolbar Section */}
        <div className="flex flex-col md:flex-row gap-6 mb-4 items-center justify-between  top-[80px] z-40 bg-[#FCFBFA]/80 backdrop-blur-md py-4 transition-all duration-300">
          <div className="relative w-full md:w-[400px]">
            <Search
              className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search by name or brands..."
              className="w-full pl-14 pr-6 py-4 bg-white border border-gray-100 rounded-full focus:ring-4 focus:ring-green-900/5 focus:border-green-900/20 transition-all shadow-sm text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden flex-1 md:flex-none flex items-center justify-center gap-3 px-6 py-3 bg-white border border-gray-100 rounded-full text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
            >
              <SlidersHorizontal size={18} />
              Filters
            </button>
            <div className="hidden lg:block">
              <SortDropdown sortBy={sortBy} setSortBy={setSortBy} />
            </div>
            <div className="lg:hidden flex-1">
              <SortDropdown sortBy={sortBy} setSortBy={setSortBy} />
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar */}
          <FilterSidebar
            filters={filters}
            setFilters={setFilters}
            availableOptions={availableOptions}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />

          {/* Product Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                {[...Array(6)].map((_, idx) => (
                  <div
                    key={idx}
                    className="bg-gray-100 animate-pulse rounded-3xl aspect-[3/4]"
                  ></div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-[40px] p-20 text-center border border-gray-100 shadow-sm">
                <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 text-gray-200">
                  <Package size={48} strokeWidth={1} />
                </div>
                <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">
                  No Scents Found
                </h2>
                <p className="text-gray-500 max-w-sm mx-auto mb-10">
                  We couldn't find any fragrances matching your current
                  selection. Try adjusting your filters or search term.
                </p>
                <button
                  onClick={() => {
                    setFilters({
                      scent_type: [],
                      mood: [],
                      brand: [],
                      priceRange: { min: "", max: "" },
                    });
                    setSearchTerm("");
                    setSortBy("newest");
                  }}
                  className="px-10 py-4 bg-green-900 text-white rounded-full font-bold hover:bg-green-800 transition-colors shadow-xl shadow-green-900/10"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-8">
                  <p className="text-sm text-gray-500 font-medium">
                    Showing{" "}
                    <span className="text-gray-900 font-bold">
                      {products.length}
                    </span>{" "}
                    fragrances{totalItems ? ` of ${totalItems}` : ""}
                  </p>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
                  {products.map((product) => (
                    <ProductCard key={product.perfume_id} product={product} />
                  ))}
                </div>

                <CustomPagination
                  page={page}
                  totalPages={totalPages}
                  onChange={(nextPage) => setPage(nextPage)}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerfumesPage;
