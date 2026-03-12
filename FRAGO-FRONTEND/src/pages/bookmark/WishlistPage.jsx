import { Link, useLocation } from "react-router-dom";
import { Heart, ShoppingBag, Trash2, ArrowRight, Package } from "lucide-react";
import { useWishlist } from "../../context/WishlistContext";
import { generateSlug } from "../../utils/slug";
import NumberFormat from "../../components/global/NumberFormat";

const WishlistPage = () => {
  const { wishlist, removeFromWishlist, loading } = useWishlist();
  const location = useLocation();

  if (loading && wishlist.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-900"></div>
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
        <div className="bg-gray-50 p-8 rounded-full mb-8">
          <Heart size={64} className="text-gray-300" strokeWidth={1} />
        </div>
        <h1 className="text-3xl font-serif font-bold text-gray-900 mb-4">
          Your Wishlist is Empty
        </h1>
        <p className="text-gray-500 text-center max-w-md mb-10 leading-relaxed">
          Looks like you haven't added any fragrances to your wishlist yet.
          Explore our collection and find your perfect scent.
        </p>
        <Link
          to="/perfumes"
          className="flex items-center gap-2 px-8 py-4 bg-green-900 text-white rounded-full font-bold hover:bg-green-800 transition-all hover:shadow-xl hover:shadow-green-900/20 active:scale-95"
        >
          Explore Perfumes
          <ArrowRight size={20} />
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4">
              My Wishlist
            </h1>
            <p className="text-gray-500 font-medium">
              You Have {wishlist.length}{" "}
              {wishlist.length === 1 ? "Item" : "Items"} Saved
            </p>
          </div>
          <Link
            to="/perfumes"
            className="text-green-900 font-bold flex items-center gap-2 hover:translate-x-1 transition-transform"
          >
            Continue Shopping <ArrowRight size={18} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {wishlist.map((item) => {
            const productSlug = generateSlug(item.name, item.perfume_id);
            return (
              <div
                key={item.bookmark_id}
                className="group bg-white rounded-3xl border border-gray-100 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-gray-200/50 hover:border-transparent flex flex-col"
              >
                {/* Image Section */}
                <Link
                  to={`/product/${productSlug}`}
                  state={{ from: location.pathname }}
                  className="relative aspect-[4/5] overflow-hidden bg-gray-50 block"
                >
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <Package size={60} strokeWidth={1} />
                    </div>
                  )}

                  {/* Actions Overlay */}
                  <div className="absolute top-4 right-4 flex flex-col gap-2 transform translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500 z-10">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        removeFromWishlist(item.perfume_id);
                      }}
                      className="p-3 bg-white/90 backdrop-blur text-red-500 rounded-full shadow-lg hover:bg-red-500 hover:text-white transition-colors"
                      title="Remove from wishlist"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>

                  {item.scent_type && (
                    <div className="absolute bottom-4 left-4">
                      <span className="px-3 py-1 bg-white/90 backdrop-blur rounded-full text-[10px] font-bold uppercase tracking-widest text-green-900 shadow-sm border border-green-900/10">
                        {item.scent_type}
                      </span>
                    </div>
                  )}
                </Link>

                {/* Content Section */}
                <div className="p-6 flex flex-col flex-grow">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mb-2">
                    {item.brand}
                  </p>
                  <Link
                    to={`/product/${productSlug}`}
                    state={{ from: location.pathname }}
                  >
                    <h3 className="text-xl font-serif font-bold text-gray-900 mb-2 truncate group-hover:text-green-900 transition-colors">
                      {item.name}
                    </h3>
                  </Link>

                  <div className="mt-auto pt-4 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase tracking-tighter text-gray-400 font-bold">
                        Starts from
                      </span>
                      <span className="text-lg font-bold text-gray-900">
                        Rs. {item.start_price ? <NumberFormat value={item.start_price} /> : "N/A"}
                      </span>
                    </div>

                    <Link
                      to={`/product/${productSlug}`}
                      state={{ from: location.pathname }}
                      className="p-3 bg-green-50 text-green-900 rounded-xl hover:bg-green-900 hover:text-white transition-all duration-300 group-hover:shadow-lg group-hover:shadow-green-900/10"
                    >
                      <ShoppingBag size={20} />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WishlistPage;
