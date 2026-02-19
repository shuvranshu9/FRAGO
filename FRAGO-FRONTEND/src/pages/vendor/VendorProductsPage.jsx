import { useState, useEffect, useCallback } from "react";
import { Plus, Edit2, Trash2, Package, Search } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import DeleteModal from "../../components/global/DeleteModal";

const VendorProductsPage = () => {
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    product: null,
  });
  const { token } = useAuth();

  const fetchVendorProducts = useCallback(async () => {
    try {
      const response = await axios.get(
        "http://localhost:8000/api/perfume/vendor",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (response.data.success) {
        setProducts(response.data.data);
      } else {
        toast.error(response.data.message || "Failed to fetch products");
      }
    } catch (error) {
      console.error("Error fetching vendor products:", error);
      toast.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchVendorProducts();
  }, [fetchVendorProducts]);

  const handleDeleteClick = (product) => {
    setDeleteModal({ isOpen: true, product });
  };

  const confirmDelete = async () => {
    const { product } = deleteModal;
    if (!product) return;

    try {
      await axios.delete(
        `http://localhost:8000/api/perfume/${product.perfume_id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      toast.success("Product deleted successfully");
      setProducts(products.filter((p) => p.perfume_id !== product.perfume_id));
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    } finally {
      setDeleteModal({ isOpen: false, product: null });
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-10 pb-10 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold text-gray-900">
              Your Listings
            </h1>
            <p className="text-gray-500 mt-1">
              Manage and track your fragrance collection
            </p>
          </div>
          <Link
            to="/vendor/products/add"
            className="inline-flex items-center justify-center px-6 py-3 bg-green-900 text-white rounded-full font-medium hover:bg-green-800 transition-colors shadow-lg shadow-green-900/10"
          >
            <Plus size={20} className="mr-2" />
            Add New Product
          </Link>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search your products..."
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-green-900/10 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-900"></div>
            <p className="mt-4 text-gray-500">Loading your listings...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl p-20 text-center shadow-sm border border-gray-100">
            <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package size={40} className="text-gray-300" />
            </div>
            <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-2">
              No products found
            </h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              {searchTerm
                ? "No products match your search criteria."
                : "You haven't added any products yet. Start selling by adding your first fragrance!"}
            </p>
            {!searchTerm && (
              <Link
                to="/vendor/products/add"
                className="inline-flex items-center text-green-900 font-semibold hover:underline"
              >
                Add your first product
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.perfume_id}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow group"
              >
                <div className="relative aspect-4/3 overflow-hidden bg-gray-100">
                  <Link
                    to={`/product/${product.perfume_id}`}
                    state={{ from: location.pathname }}
                    className="block w-full h-full"
                  >
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Package size={48} />
                      </div>
                    )}
                  </Link>
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link
                      to={`/vendor/products/edit/${product.perfume_id}`}
                      className="p-2 bg-white/90 backdrop-blur text-gray-700 rounded-full hover:bg-green-900 hover:text-white transition-colors shadow-lg"
                    >
                      <Edit2 size={18} />
                    </Link>
                    <button
                      onClick={() => handleDeleteClick(product)}
                      className="p-2 bg-white/90 backdrop-blur text-red-600 rounded-full hover:bg-red-600 hover:text-white transition-colors shadow-lg"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-[11px] uppercase tracking-widest text-gray-400 font-bold mb-1">
                        {product.brand}
                      </p>
                      <Link
                        to={`/product/${product.perfume_id}`}
                        state={{ from: location.pathname }}
                      >
                        <h3 className="text-lg font-serif font-bold text-gray-900 group-hover:text-green-900 transition-colors">
                          {product.name}
                        </h3>
                      </Link>
                    </div>
                    <span className="bg-green-50 text-green-700 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                      {product.scent_type || "Scent"}
                    </span>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center">
                    <div className="text-sm font-medium text-gray-900">
                      <span> {product.mood || "Mood"}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Made in {product.origin || "Origin"}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, product: null })}
        onConfirm={confirmDelete}
        itemName={deleteModal.product?.name}
        title="Delete Product"
      />
    </div>
  );
};

export default VendorProductsPage;
