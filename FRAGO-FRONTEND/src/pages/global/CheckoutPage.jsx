import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ShieldCheck,
  MapPin,
  CreditCard,
  ShoppingBag,
} from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api";
import { toast } from "react-toastify";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cart, loading: cartLoading, fetchCart } = useCart();
  const { user, token } = useAuth();

  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [shippingAddress, setShippingAddress] = useState(user?.address || "");
  const [phone, setPhone] = useState(user?.phone || "");

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Redirect if cart is empty
  useEffect(() => {
    if (!cartLoading && (!cart?.items || cart.items.length === 0)) {
      toast.error("Your cart is empty");
      navigate("/cart");
    }
  }, [cart, cartLoading, navigate]);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (!shippingAddress.trim() || !phone.trim()) {
      toast.error("Please provide shipping details");
      return;
    }

    setIsPlacingOrder(true);
    try {
      const response = await api.post(
        "/order",
        {
          shippingAddress, // Even though backend doesn't explicitly save it yet, we pass it for the future
          phone,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      // Force context cart refresh since backend cleared it
      await fetchCart();

      toast.success("Order placed successfully!");

      // Initiate Khalti Payment
      try {
        const paymentResponse = await api.post(
          "/payment/initiate",
          {
            orderId: response.data.orderId,
            website_url: window.location.origin,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (paymentResponse.data.payment_url) {
          window.location.href = paymentResponse.data.payment_url;
        } else {
          navigate(`/order-success/${response.data.orderId}`);
        }
      } catch (payError) {
        console.error("Payment initiation error:", payError);
        toast.error(
          "Order placed but payment initiation failed. Please contact support.",
        );
        navigate(`/order-success/${response.data.orderId}`);
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error(error.response?.data?.message || "Failed to place order");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (cartLoading || !cart?.items) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-900"></div>
      </div>
    );
  }

  const cartItems = cart.items;
  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );
  const total = subtotal;

  return (
    <div className="min-h-screen bg-[#F8F9FA] pt-10 pb-14 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <Link
          to="/cart"
          className="inline-flex items-center text-gray-500 hover:text-green-900 transition-colors mb-8 group"
        >
          <ArrowLeft
            size={20}
            className="mr-2 group-hover:-translate-x-1 transition-transform"
          />
          Back to Cart
        </Link>

        <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-8">
          Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 xl:gap-12">
          {/* Left Column: Forms */}
          <div className="lg:col-span-2 space-y-8">
            {/* Contact Information */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 pb-12">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-green-900 mr-4">
                  <span className="font-bold">1</span>
                </div>
                <h2 className="text-2xl font-serif font-bold text-gray-900">
                  Contact Information
                </h2>
              </div>

              <div className="pl-14">
                <p className="text-gray-900 font-medium mb-1">
                  {user?.full_name}
                </p>
                <p className="text-gray-500 mb-6">{user?.email}</p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Enter your phone number"
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-900/20 focus:border-green-900 transition-all font-medium text-gray-900"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Details */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 pb-12">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-green-900 mr-4">
                  <span className="font-bold">2</span>
                </div>
                <h2 className="text-2xl font-serif font-bold text-gray-900">
                  Shipping Address
                </h2>
              </div>

              <div className="pl-14">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Delivery Address *
                    </label>
                    <textarea
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      placeholder="e.g. Kathmandu, Thamel, House 123"
                      rows={3}
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-900/20 focus:border-green-900 transition-all font-medium text-gray-900 resize-none"
                      required
                    ></textarea>
                  </div>
                  <div className="flex items-center text-sm text-gray-500 mt-2 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                    <MapPin size={16} className="text-blue-500 mr-2 shrink-0" />
                    Delivery available across all major cities in Nepal. Usually
                    arrives in 2-3 business days.
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 pb-12">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-green-900 mr-4">
                  <span className="font-bold">3</span>
                </div>
                <h2 className="text-2xl font-serif font-bold text-gray-900">
                  Payment Method
                </h2>
              </div>

              <div className="pl-14">
                <div className="border border-green-900 bg-green-50/30 rounded-2xl p-4 flex items-center cursor-pointer relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4">
                    <div className="w-5 h-5 rounded-full border-4 border-green-900 bg-white"></div>
                  </div>
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-green-900 shadow-sm mr-4">
                    <CreditCard size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Online</h3>
                    <p className="text-sm text-gray-500 mt-1">Khalti Payment</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 lg:sticky lg:top-32">
              <h3 className="text-lg font-serif font-bold text-gray-900 mb-6 flex items-center">
                <ShoppingBag className="mr-2 text-green-900" size={20} />
                Order Summary
              </h3>

              {/* Items Preview */}
              <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {cartItems.map((item) => (
                  <div
                    key={item.cart_item_id}
                    className="flex items-center gap-4"
                  >
                    <div className="w-16 h-16 bg-gray-50 rounded-xl overflow-hidden shrink-0 border border-gray-100">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <ShoppingBag size={20} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 text-sm truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Qty: {item.quantity} × Rs. {item.price.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4 mb-6 border-y border-gray-100 py-6">
                <div className="flex justify-between text-gray-600 text-sm">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900">
                    Rs. {subtotal.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between text-gray-600 text-sm">
                  <span>Shipping</span>
                  <span className="text-green-600 font-medium tracking-tight">
                    Free
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-end mb-8">
                <span className="text-lg font-bold text-gray-900">Total</span>
                <div className="text-right">
                  <span className="text-3xl font-bold text-green-900 tracking-tight">
                    Rs. {total.toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder || cartItems.length === 0}
                className={`w-full py-4 text-white rounded-full font-bold text-lg transition-all shadow-lg flex items-center justify-center group mb-4 ${
                  isPlacingOrder
                    ? "bg-green-800 opacity-80 cursor-wait shadow-green-900/20"
                    : "bg-black hover:bg-green-900 shadow-black/10 hover:shadow-green-900/30"
                }`}
              >
                {isPlacingOrder ? "Processing..." : "Place Order"}
                {!isPlacingOrder && (
                  <ArrowLeft
                    size={20}
                    className="ml-2 rotate-180 group-hover:translate-x-1 transition-transform"
                  />
                )}
              </button>

              <div className="flex items-center justify-center text-gray-400 text-xs">
                <ShieldCheck size={16} className="mr-1.5" />
                Encrypted & Secure Checkout
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
