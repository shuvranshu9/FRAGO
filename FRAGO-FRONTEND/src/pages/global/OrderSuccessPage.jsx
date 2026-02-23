import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  Package,
  MapPin,
  Calendar,
  ShoppingBag,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api";
import { toast } from "react-toastify";

const OrderSuccessPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchOrderDetails = async () => {
      try {
        const response = await api.get(`/order/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrder(response.data);
      } catch (error) {
        console.error("Error fetching order:", error);
        toast.error("Failed to load order details");
        navigate("/account/orders");
      } finally {
        setLoading(false);
      }
    };

    if (orderId && token) {
      fetchOrderDetails();
    }
  }, [orderId, token, navigate]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-900 mb-4"></div>
        <p className="text-gray-500 font-medium">
          Loading your order details...
        </p>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="min-h-screen bg-[#F8F9FA] pt-12 pb-8 px-4 md:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Success Header */}
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm text-center mb-8 border border-gray-100">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-green-600 mx-auto mb-6">
            <CheckCircle2
              size={40}
              className="animate-in zoom-in duration-500 delay-150"
            />
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4 tracking-tight">
            Thank you for your order!
          </h1>
          <p className="text-gray-500 text-lg max-w-xl mx-auto mb-8 leading-relaxed">
            Your fragrant journey begins soon. We've received your order and are
            preparing it for shipment.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/perfumes"
              className="px-8 py-4 bg-green-900 text-white rounded-full font-bold hover:bg-green-800 transition-all shadow-lg shadow-green-900/20 w-full sm:w-auto"
            >
              Continue Shopping
            </Link>
            <Link
              to="/account/orders"
              className="px-8 py-4 bg-gray-50 text-gray-900 rounded-full font-bold hover:bg-gray-100 transition-colors w-full sm:w-auto border border-gray-200"
            >
              View All Orders
            </Link>
          </div>
        </div>

        {/* Order Details Card */}
        <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-gray-100 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-6 mb-8 gap-4">
            <div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">
                Order Reference
              </p>
              <h2 className="text-2xl font-serif font-bold text-gray-900">
                #{order.order_id.toString().padStart(6, "0")}
              </h2>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center text-gray-600 bg-gray-50 px-4 py-2 rounded-xl text-sm font-medium">
                <Calendar size={16} className="mr-2 text-gray-400" />
                {new Date(order.created_at).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>
              <div className="flex items-center text-green-700 bg-green-50 px-4 py-2 rounded-xl text-sm font-bold capitalize">
                <Package size={16} className="mr-2" />
                {order.order_status}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            <div>
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center">
                <MapPin size={16} className="mr-2 text-gray-300" />
                Delivery Details
              </h3>
              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                <p className="font-semibold text-gray-900 mb-1">
                  Standard Delivery (2-3 Days)
                </p>
                <p className="text-gray-500 text-sm">Khalti Payment Online</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">
                Order Summary
              </h3>
              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 space-y-3">
                <div className="flex justify-between text-gray-600 text-sm">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900">
                    Rs. {parseFloat(order.total_amount).toLocaleString()}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-3 mt-3 flex justify-between items-center">
                  <span className="font-bold text-gray-900">Total Paid</span>
                  <span className="text-xl font-bold text-green-900">
                    Rs. {parseFloat(order.total_amount).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-serif font-bold text-gray-900 mb-6 flex items-center">
              <ShoppingBag className="mr-2 text-green-900" size={20} />
              Items Ordered
            </h3>
            <div className="space-y-4">
              {order.items?.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-6 p-4 rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors bg-white"
                >
                  <div className="w-20 h-24 bg-gray-50 rounded-xl overflow-hidden shrink-0 border border-gray-100 flex items-center justify-center">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.perfume_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ShoppingBag className="text-gray-300" size={24} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mb-1">
                      {item.brand}
                    </p>
                    <p className="font-bold text-gray-900 text-lg truncate">
                      {item.perfume_name}
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="bg-gray-100 px-2 py-1 rounded-md text-xs font-semibold text-gray-700">
                        {item.size_ml}ml
                      </span>
                      <p className="text-sm text-gray-500 font-medium">
                        Qty: {item.quantity}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-900">
                      Rs. {parseFloat(item.price).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
