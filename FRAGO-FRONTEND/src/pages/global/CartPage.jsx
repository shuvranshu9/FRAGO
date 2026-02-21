import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  ShoppingBag,
  ShieldCheck,
} from "lucide-react";
import { useCart } from "../../context/CartContext";
import { generateSlug } from "../../utils/slug";
import { toast } from "react-toastify";
import DeleteModal from "../../components/global/DeleteModal";

const CartPage = () => {
  const { cart, loading, updateQuantity, removeFromCart, clearCart } =
    useCart();
  const [updatingItems, setUpdatingItems] = useState(new Set());
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleUpdateQuantity = async (cartItemId, currentQuantity, change) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity < 1) return;

    setUpdatingItems((prev) => new Set(prev).add(cartItemId));
    try {
      const result = await updateQuantity(cartItemId, newQuantity);
      if (!result.success) {
        toast.error(result.message || "Failed to update quantity");
      }
    } finally {
      setUpdatingItems((prev) => {
        const next = new Set(prev);
        next.delete(cartItemId);
        return next;
      });
    }
  };

  const handleRemove = async (cartItemId) => {
    setUpdatingItems((prev) => new Set(prev).add(cartItemId));
    try {
      const result = await removeFromCart(cartItemId);
      if (result.success) {
        toast.success("Item removed from cart");
      } else {
        toast.error(result.message || "Failed to remove item");
      }
    } finally {
      setUpdatingItems((prev) => {
        const next = new Set(prev);
        next.delete(cartItemId);
        return next;
      });
    }
  };

  const handleClearCart = async () => {
    setIsClearModalOpen(false);
    const result = await clearCart();
    if (result.success) {
      toast.success("Cart cleared");
    } else {
      toast.error(result.message || "Failed to clear cart");
    }
  };

  if (loading && !cart) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-900"></div>
      </div>
    );
  }

  const cartItems = cart?.items || [];
  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );
  const tax = subtotal * 0.13; // 13% VAT
  const total = subtotal + tax;

  return (
    <div className="min-h-screen bg-[#F8F9FA] pt-8 pb-20 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <Link
          to="/perfumes"
          className="inline-flex items-center text-gray-500 hover:text-green-900 transition-colors mb-8 group"
        >
          <ArrowLeft
            size={20}
            className="mr-2 group-hover:-translate-x-1 transition-transform"
          />
          Continue Shopping
        </Link>

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center shadow-sm flex flex-col items-center">
            <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center text-green-900 mb-6">
              <ShoppingBag size={40} />
            </div>
            <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">
              Your cart is empty
            </h2>
            <p className="text-gray-500 mb-8 max-w-md">
              Looks like you haven't added any fragrances to your cart yet.
              Discover our collection of premium scents.
            </p>
            <Link
              to="/perfumes"
              className="px-8 py-4 bg-green-900 text-white rounded-full font-bold hover:bg-green-800 transition-colors shadow-lg shadow-green-900/20"
            >
              Explore Perfumes
            </Link>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-end mb-8">
              <div>
                <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900">
                  Your Cart
                </h1>
                <p className="text-gray-500 mt-2">
                  {cartItems.length} {cartItems.length === 1 ? "item" : "items"}
                </p>
              </div>
              <button
                onClick={() => setIsClearModalOpen(true)}
                className="text-sm font-bold text-gray-400 uppercase tracking-widest hover:text-red-500 transition-colors"
              >
                Clear Cart
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 xl:gap-12">
              {/* Cart Items List */}
              <div className="lg:col-span-2 space-y-4">
                {cartItems.map((item) => {
                  const productSlug = generateSlug(item.name, item.perfume_id);
                  const isUpdating = updatingItems.has(item.cart_item_id);

                  return (
                    <div
                      key={item.cart_item_id}
                      className={`bg-white rounded-3xl p-4 md:p-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center relative shadow-sm transition-opacity duration-300 ${isUpdating ? "opacity-50 pointer-events-none" : "opacity-100"}`}
                    >
                      {/* Product Image */}
                      <Link
                        to={`/product/${productSlug}`}
                        className="shrink-0 group"
                      >
                        <div className="w-24 h-32 md:w-32 md:h-40 bg-gray-50 rounded-2xl overflow-hidden flex items-center justify-center">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                          ) : (
                            <ShoppingBag className="text-gray-300" size={32} />
                          )}
                        </div>
                      </Link>

                      {/* Product Details */}
                      <div className="flex-grow w-full">
                        <div className="flex justify-between items-start mb-1">
                          <div>
                            <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mb-1">
                              {item.brand}
                            </p>
                            <Link to={`/product/${productSlug}`}>
                              <h3 className="text-lg md:text-xl font-serif font-bold text-gray-900 hover:text-green-900 transition-colors">
                                {item.name}
                              </h3>
                            </Link>
                          </div>
                          <button
                            onClick={() => handleRemove(item.cart_item_id)}
                            className="text-gray-300 hover:text-red-500 transition-colors p-2 -mr-2 -mt-2 sm:mt-0"
                            aria-label="Remove item"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>

                        <div className="text-sm text-gray-500 mb-4 flex items-center gap-2">
                          <span className="bg-gray-100 px-2 py-1 rounded-md text-xs font-semibold text-gray-700">
                            {item.size_ml}ml
                          </span>
                          {item.scent_type && <span>• {item.scent_type}</span>}
                        </div>

                        {/* Price & Quantity Control */}
                        <div className="flex items-center justify-between w-full mt-auto pt-4 border-t border-gray-50">
                          <p className="text-lg font-bold text-green-900 tracking-tight">
                            Rs. {item.price.toLocaleString()}
                          </p>

                          <div className="flex items-center bg-gray-50 rounded-full border border-gray-100 p-1">
                            <button
                              onClick={() =>
                                handleUpdateQuantity(
                                  item.cart_item_id,
                                  item.quantity,
                                  -1,
                                )
                              }
                              disabled={item.quantity <= 1}
                              className={`p-1.5 rounded-full transition-colors flex items-center justify-center ${item.quantity <= 1 ? "text-gray-300 cursor-not-allowed" : "text-gray-600 hover:bg-white hover:text-black hover:shadow-sm"}`}
                            >
                              <Minus size={16} />
                            </button>
                            <span className="w-8 text-center font-bold text-sm select-none">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                handleUpdateQuantity(
                                  item.cart_item_id,
                                  item.quantity,
                                  1,
                                )
                              }
                              disabled={item.quantity >= item.stock_quantity}
                              className={`p-1.5 rounded-full transition-colors flex items-center justify-center ${item.quantity >= item.stock_quantity ? "text-gray-300 cursor-not-allowed" : "text-gray-600 hover:bg-white hover:text-black hover:shadow-sm"}`}
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm lg:sticky lg:top-32">
                  <h3 className="text-lg font-serif font-bold text-gray-900 mb-6">
                    Order Summary
                  </h3>

                  <div className="space-y-4 mb-6 border-b border-gray-100 pb-6">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span className="font-semibold text-gray-900">
                        Rs. {subtotal.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Estimated Tax (13%)</span>
                      <span className="font-semibold text-gray-900">
                        Rs. {tax.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Shipping</span>
                      <span className="text-green-600 font-medium">Free</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mb-8">
                    <span className="text-lg font-bold text-gray-900">
                      Total
                    </span>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-green-900 tracking-tight">
                        Rs. {total.toLocaleString()}
                      </span>
                      <p className="text-xs text-gray-400 mt-1">inkl. taxes</p>
                    </div>
                  </div>

                  <button className="w-full py-4 bg-black text-white rounded-full font-bold text-lg hover:bg-green-900 transition-colors shadow-lg shadow-black/10 flex items-center justify-center group mb-4">
                    Proceed to Checkout
                    <ArrowLeft
                      size={20}
                      className="ml-2 rotate-180 group-hover:translate-x-1 transition-transform"
                    />
                  </button>

                  <div className="flex items-center justify-center text-gray-400 text-xs">
                    <ShieldCheck size={16} className="mr-1.5" />
                    Secure Checkout Guarantee
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <DeleteModal
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        onConfirm={handleClearCart}
        title="Clear Cart"
        description="Are you sure you want to remove all items from your cart? This action cannot be undone."
      />
    </div>
  );
};

export default CartPage;
