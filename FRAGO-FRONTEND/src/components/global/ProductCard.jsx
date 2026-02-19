import { Link, useLocation } from "react-router-dom";
import { Eye, Package } from "lucide-react";

const ProductCard = ({ product }) => {
  const location = useLocation();
  // Get initial price from variants if available
  const getStartingPrice = () => {
    if (!product.variants || product.variants.length === 0) return null;
    const prices = product.variants.map((v) => v.price);
    return Math.min(...prices);
  };

  const startingPrice = getStartingPrice();

  return (
    <div className="group flex flex-col items-center bg-white rounded-3xl p-4 transition-all duration-500 hover:shadow-xl hover:shadow-gray-200/50 border border-transparent hover:border-gray-50">
      <div className="relative w-full aspect-[4/5] overflow-hidden rounded-2xl bg-[#F8F8F8] mb-6">
        {product.images && product.images.length > 0 ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <Package size={60} strokeWidth={1} />
          </div>
        )}

        {/* Quick Action Overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 backdrop-blur-[2px] flex items-center justify-center">
          <Link
            to={`/product/${product.perfume_id}`}
            state={{ from: location.pathname }}
            className="p-4 bg-white text-gray-900 rounded-full shadow-2xl transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 hover:bg-green-900 hover:text-white"
          >
            <Eye size={24} />
          </Link>
        </div>

        {/* Badge */}
        {product.scent_type && (
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 bg-white/90 backdrop-blur rounded-full text-[10px] font-bold uppercase tracking-widest text-[#5C4033] shadow-sm">
              {product.scent_type}
            </span>
          </div>
        )}
      </div>

      <div className="text-center w-full px-2">
        <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mb-2">
          {product.brand}
        </p>
        <Link
          to={`/product/${product.perfume_id}`}
          state={{ from: location.pathname }}
        >
          <h3 className="text-xl font-serif font-bold text-gray-900 mb-2 group-hover:text-green-900 transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center justify-center gap-2">
          {startingPrice ? (
            <p className="font-bold text-gray-800 tracking-tight">
              <span className="text-xs text-gray-400 mr-1 font-normal italic">
                Starts at
              </span>
              Rs. {startingPrice.toLocaleString()}
            </p>
          ) : (
            <p className="text-xs text-gray-400 italic">Price on request</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
