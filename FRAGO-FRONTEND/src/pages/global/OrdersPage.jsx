import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  Calendar,
  ArrowRight,
  ExternalLink,
  XCircle,
  Edit,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api";
import { toast } from "react-toastify";
import ConfirmationModal from "../../components/global/ConfirmationModal";
import { AlertTriangle } from "lucide-react";

const OrdersPage = () => {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchOrders = async () => {
      try {
        const response = await api.get("/order", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(response.data);
      } catch (error) {
        console.error("Error fetching orders:", error);
        toast.error("Failed to load your orders");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchOrders();
    }
  }, [token]);

  const handleCancelOrder = async () => {
    if (!orderToCancel) return;

    try {
      await api.patch(
        `/order/${orderToCancel}/cancel`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      toast.success("Order cancelled successfully");
      // Update local state
      setOrders(
        orders.map((order) =>
          order.order_id === orderToCancel
            ? { ...order, order_status: "cancelled" }
            : order,
        ),
      );
    } catch (error) {
      console.error("Error cancelling order:", error);
      toast.error(error.response?.data?.message || "Failed to cancel order");
    } finally {
      setIsCancelModalOpen(false);
      setOrderToCancel(null);
    }
  };

  const getStatusStyle = (status) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "bg-green-100 text-green-700 border-green-200";
      case "shipped":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "processing":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "cancelled":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200"; // pending
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-900 mb-4"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-serif font-bold text-gray-900 mb-2">
            Order History
          </h1>
          <p className="text-gray-500 text-lg">
            Manage and track your recent fragrance purchases.
          </p>
        </div>
        <div className="bg-white px-4 py-2 rounded-2xl border border-gray-100 shadow-sm self-start">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Total Orders
          </p>
          <p className="text-xl font-bold text-green-900">{orders.length}</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-gray-100 flex flex-col items-center">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-8 ring-8 ring-gray-50/50">
            <Package size={42} />
          </div>
          <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">
            No orders found
          </h2>
          <p className="text-gray-500 max-w-md mx-auto mb-10 leading-relaxed">
            Discovery awaits. Start your fragrant journey by exploring our
            exclusive collection of premium perfumes.
          </p>
          <Link
            to="/perfumes"
            className="px-10 py-4 bg-green-900 text-white rounded-full font-bold hover:bg-green-800 transition-all shadow-xl shadow-green-900/20 active:scale-95"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-8 py-6 text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">
                    Order ID
                  </th>
                  <th className="px-8 py-6 text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">
                    Date
                  </th>
                  <th className="px-8 py-6 text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">
                    Status
                  </th>
                  <th className="px-8 py-6 text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">
                    Total Amount
                  </th>
                  <th className="px-8 py-6 text-xs font-bold text-gray-400 uppercase tracking-[0.2em] text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map((order) => (
                  <tr
                    key={order.order_id}
                    className="hover:bg-gray-50/30 transition-colors group"
                  >
                    <td className="px-8 py-6">
                      <span className="font-bold text-gray-900 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                        #{order.order_id.toString().padStart(6, "0")}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-gray-900 font-medium">
                          {new Date(order.created_at).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            },
                          )}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(order.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span
                        className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold capitalize border ${getStatusStyle(order.order_status)}`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current mr-2 animate-pulse"></span>
                        {order.order_status}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-lg font-bold text-green-900 tracking-tight">
                        Rs. {parseFloat(order.total_amount).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-4">
                        {order.order_status.toLowerCase() === "pending" && (
                          <>
                            <button
                              onClick={() => {
                                setOrderToCancel(order.order_id);
                                setIsCancelModalOpen(true);
                              }}
                              className="text-red-400 hover:text-red-600 transition-colors p-1"
                              title="Cancel Order"
                            >
                              <XCircle size={18} />
                            </button>
                            <Link
                              to={`/order-success/${order.order_id}?edit=true`}
                              className="text-blue-400 hover:text-blue-600 transition-colors p-1"
                              title="Edit Order"
                            >
                              <Edit size={18} />
                            </Link>
                          </>
                        )}
                        <Link
                          to={`/order-success/${order.order_id}`}
                          className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-green-900 transition-colors group"
                        >
                          View Details
                          <ExternalLink
                            size={16}
                            className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                          />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-gray-100">
            {orders.map((order) => (
              <div
                key={order.order_id}
                className="p-6 bg-white active:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-gray-50 px-3 py-1 rounded-lg border border-gray-100">
                    <span className="text-sm font-bold text-gray-900 tracking-tight">
                      #{order.order_id.toString().padStart(6, "0")}
                    </span>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusStyle(order.order_status)}`}
                  >
                    {order.order_status}
                  </span>
                </div>

                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <div className="flex items-center text-gray-500 text-sm">
                      <Calendar size={14} className="mr-2" />
                      {new Date(order.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                    <div className="text-lg font-bold text-green-900">
                      Rs. {parseFloat(order.total_amount).toLocaleString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {order.order_status.toLowerCase() === "pending" && (
                      <>
                        <button
                          onClick={() => {
                            setOrderToCancel(order.order_id);
                            setIsCancelModalOpen(true);
                          }}
                          className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-400 hover:bg-red-100 transition-all border border-red-100"
                        >
                          <XCircle size={18} />
                        </button>
                        <Link
                          to={`/order-success/${order.order_id}?edit=true`}
                          className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-400 hover:bg-blue-100 transition-all border border-blue-100"
                        >
                          <Edit size={18} />
                        </Link>
                      </>
                    )}
                    <Link
                      to={`/order-success/${order.order_id}`}
                      className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 hover:bg-green-900 hover:text-white transition-all shadow-sm border border-gray-100"
                    >
                      <ArrowRight size={20} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleCancelOrder}
        title="Cancel Order"
        description="Are you sure you want to cancel this order? This action will restore product stock and cannot be undone."
        confirmText="Yes, Cancel Order"
        confirmColor="bg-red-600"
        icon={<AlertTriangle size={24} />}
      />
    </div>
  );
};

export default OrdersPage;
