import { useState, useEffect, useMemo } from "react";
import { Filter, Search, SlidersHorizontal, Package } from "lucide-react";
import api from "../../utils/api";
import ProductCard from "../../components/global/ProductCard";
import FilterSidebar from "../../components/global/FilterSidebar";
import SortDropdown from "../../components/global/SortDropdown";

const PerfumesPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [filters, setFilters] = useState({
    scent_type: [],
    mood: [],
    brand: [],
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchPerfumes = async () => {
      try {
        const response = await api.get("/perfume");
        if (response.data.success) {
          setProducts(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching perfumes:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPerfumes();
  }, []);

  const availableOptions = useMemo(() => {
    return {
      scent_types: [
        ...new Set(products.map((p) => p.scent_type).filter(Boolean)),
      ],
      moods: [...new Set(products.map((p) => p.mood).filter(Boolean))],
      brands: [...new Set(products.map((p) => p.brand).filter(Boolean))],
    };
  }, [products]);

  const filteredAndSortedProducts = useMemo(() => {
    let result = products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesScent =
        filters.scent_type.length === 0 ||
        filters.scent_type.includes(product.scent_type);
      const matchesMood =
        filters.mood.length === 0 || filters.mood.includes(product.mood);
      const matchesBrand =
        filters.brand.length === 0 || filters.brand.includes(product.brand);

      return matchesSearch && matchesScent && matchesMood && matchesBrand;
    });

    // Sort result
    result.sort((a, b) => {
      const priceA = a.variants?.[0]?.price || 0;
      const priceB = b.variants?.[0]?.price || 0;

      switch (sortBy) {
        case "price-asc":
          return priceA - priceB;
        case "price-desc":
          return priceB - priceA;
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "newest":
          return new Date(b.created_at) - new Date(a.created_at);
        default:
          return 0;
      }
    });

    return result;
  }, [products, searchTerm, filters, sortBy]);

  return (
    <div className="min-h-screen bg-[#FCFBFA] pt-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Toolbar Section */}
        <div className="flex flex-col md:flex-row gap-6 mb-4 items-center justify-between sticky top-[80px] z-40 bg-[#FCFBFA]/80 backdrop-blur-md py-4 transition-all duration-300">
          <div className="relative w-full md:w-[400px]">
            <Search
              className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search by name or house..."
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
            ) : filteredAndSortedProducts.length === 0 ? (
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
                    setFilters({ scent_type: [], mood: [], brand: [] });
                    setSearchTerm("");
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
                      {filteredAndSortedProducts.length}
                    </span>{" "}
                    fragrances
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8 md:gap-10">
                  {filteredAndSortedProducts.map((product) => (
                    <ProductCard key={product.perfume_id} product={product} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerfumesPage;
