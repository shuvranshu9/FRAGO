import { Link, useLocation } from "react-router-dom";
import {
  Eye,
  Package,
  Heart,
  ShoppingBag,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { useWishlist } from "../../context/WishlistContext";
import { useCart } from "../../context/CartContext";
import { generateSlug } from "../../utils/slug";
import { toast } from "react-toastify";
import { useState } from "react";

const ProductCard = ({ product }) => {
  const [addingToCart, setAddingToCart] = useState(false);
  const location = useLocation();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const isBookmarked = isInWishlist(product.perfume_id);
  const productSlug = generateSlug(product.name, product.perfume_id);

  // Get initial price from variants if available
  const getStartingPrice = () => {
    if (!product.variants || product.variants.length === 0) return null;
    const prices = product.variants.map((v) => v.price);
    return Math.min(...prices);
  };

  const getCheapestVariantId = () => {
    if (!product.variants || product.variants.length === 0) return null;
    return product.variants.reduce((prev, curr) =>
      prev.price < curr.price ? prev : curr,
    ).variant_id;
  };

  const startingPrice = getStartingPrice();

  const getTotalStock = () => {
    if (!product.variants || product.variants.length === 0) return 0;
    return product.variants.reduce(
      (sum, v) => sum + (v.stock_quantity || 0),
      0,
    );
  };

  const totalStock = getTotalStock();

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const variantId = getCheapestVariantId();
    if (!variantId) {
      toast.error("Product currently unavailable");
      return;
    }

    setAddingToCart(true);
    const result = await addToCart(variantId, 1);
    if (result.success) {
      toast.success("Added to cart!");
    } else {
      toast.error(result.message || "Failed to add to cart");
    }
    setAddingToCart(false);
  };

  return (
    <div className="group flex flex-col items-center bg-white rounded-3xl p-4 transition-all duration-500 hover:shadow-xl hover:shadow-gray-200/50 border border-transparent hover:border-gray-50">
      <div className="relative w-full aspect-[4/5] overflow-hidden rounded-xl bg-[#F8F8F8] mb-4">
        {product.images && product.images.length > 0 ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <Package size={40} strokeWidth={1} />
          </div>
        )}

        {/* Quick Action Overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 backdrop-blur-[2px] flex items-center justify-center gap-3">
          <Link
            to={`/product/${productSlug}`}
            state={{ from: location.pathname }}
            className="p-3 bg-white text-gray-900 rounded-full shadow-2xl transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 hover:bg-green-900 hover:text-white"
          >
            <Eye size={20} />
          </Link>
          <button
            onClick={handleQuickAdd}
            disabled={addingToCart}
            title="Quick Add to Cart (Default Size)"
            className={`p-3 rounded-full shadow-2xl transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-75 ${
              addingToCart
                ? "bg-green-800 text-white cursor-wait"
                : "bg-white text-gray-900 hover:bg-green-900 hover:text-white"
            }`}
          >
            <ShoppingBag
              size={20}
              className={addingToCart ? "animate-pulse" : ""}
            />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWishlist(product.perfume_id);
            }}
            className={`p-3 rounded-full shadow-2xl transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-100 ${
              isBookmarked
                ? "bg-green-900 text-white"
                : "bg-white text-gray-900 hover:bg-red-50 hover:text-red-500"
            }`}
          >
            <Heart size={20} fill={isBookmarked ? "currentColor" : "none"} />
          </button>
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

      <div className="text-center w-full px-1">
        <p className="text-[8px] sm:text-[9px] uppercase tracking-[0.2em] text-gray-400 font-bold mb-1 sm:mb-2">
          {product.brand}
        </p>
        <Link
          to={`/product/${productSlug}`}
          state={{ from: location.pathname }}
        >
          <h3 className="text-sm sm:text-base lg:text-lg font-serif font-bold text-gray-900 mb-1 sm:mb-2 group-hover:text-green-900 transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="flex flex-col items-center justify-center gap-1 sm:gap-2">
          {startingPrice ? (
            <p className="text-xs sm:text-sm font-bold text-gray-800 tracking-tight">
              <span className="text-[10px] sm:text-xs text-gray-400 mr-1 font-normal italic">
                Starts at
              </span>
              Rs. {startingPrice.toLocaleString()}
            </p>
          ) : (
            <p className="text-[10px] text-gray-400 italic">Price on request</p>
          )}

          {/* Stock Status Badge */}
          <div className="mt-0.5 sm:mt-1">
            {totalStock > 0 ? (
              <span
                className={`flex items-center text-[7px] sm:text-[9px] font-bold uppercase px-1.5 sm:px-2 py-0.5 rounded-full ${
                  totalStock > 5
                    ? "text-green-700 bg-green-100/50"
                    : "text-orange-700 bg-orange-100/50"
                }`}
              >
                {totalStock > 5 ? (
                  <CheckCircle2 size={8} className="mr-1" />
                ) : (
                  <AlertTriangle size={8} className="mr-1" />
                )}
                In Stock: {totalStock}
              </span>
            ) : (
              <span className="flex items-center text-[7px] sm:text-[9px] font-bold text-red-700 uppercase bg-red-100/50 px-1.5 sm:px-2 py-0.5 rounded-full">
                Sold Out
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
