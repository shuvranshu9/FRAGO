import { useState, useEffect, useRef } from "react";
import {
  Link,
  useParams,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import {
  CheckCircle2,
  Package,
  MapPin,
  Calendar,
  ShoppingBag,
  Minus,
  Plus,
  Trash2,
  Save,
  X,
  AlertTriangle,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api";
import { toast } from "react-toastify";
import ConfirmationModal from "../../components/global/ConfirmationModal";

const OrderSuccessPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [searchParams] = useSearchParams();
  const isEditModeParam = searchParams.get("edit") === "true";

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editItems, setEditItems] = useState([]);
  const [updating, setUpdating] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const hasVerified = useRef(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchOrderDetails = async () => {
      try {
        const pidx = searchParams.get("pidx");
        if (pidx && !hasVerified.current) {
          hasVerified.current = true;
          setLoading(true);
          try {
            await api.post(
              "/payment/verify",
              { pidx },
              { headers: { Authorization: `Bearer ${token}` } },
            );
            toast.success("Payment verified successfully!");
          } catch (error) {
            console.error("Verification error:", error);
            const status = error.response?.data?.status;
            toast.error(
              status
                ? `Payment Status: ${status}`
                : "Payment verification failed. Please check your account.",
            );
          }
        }

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
  }, [orderId, token, navigate, searchParams]);

  useEffect(() => {
    if (order && isEditModeParam && order.order_status === "pending") {
      setIsEditing(true);
      setEditItems(order.items.map((item) => ({ ...item })));
    } else {
      setIsEditing(false);
    }
  }, [isEditModeParam, order]);

  const handleUpdateQuantity = (index, delta) => {
    const updatedItems = [...editItems];
    const newQuantity = updatedItems[index].quantity + delta;

    if (newQuantity > 0) {
      updatedItems[index].quantity = newQuantity;
      setEditItems(updatedItems);
    }
  };

  const handleRemoveItem = (index) => {
    if (editItems.length <= 1) {
      toast.warn(
        "Orders must have at least one item. You can cancel the order instead.",
      );
      return;
    }
    const updatedItems = editItems.filter((_, i) => i !== index);
    setEditItems(updatedItems);
  };

  const calculateEditTotal = () => {
    return editItems.reduce(
      (total, item) => total + parseFloat(item.price) * item.quantity,
      0,
    );
  };

  const handleConfirmSave = () => {
    setIsSaveModalOpen(true);
  };

  const handleSaveEdit = async () => {
    setIsSaveModalOpen(false);
    setUpdating(true);
    try {
      const payload = {
        items: editItems.map((item) => ({
          variant_id: item.variant_id,
          quantity: item.quantity,
          price: item.price,
        })),
      };

      const response = await api.put(`/order/${orderId}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Order updated successfully");
      setOrder({
        ...order,
        items: [...editItems],
        total_amount: response.data.newTotal,
      });
      setIsEditing(false);
      navigate(`/order-success/${orderId}`);
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error(error.response?.data?.message || "Failed to update order");
    } finally {
      setUpdating(false);
    }
  };

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
              {order.order_status === "paid" && (
                <div className="flex items-center text-blue-700 bg-blue-50 px-4 py-2 rounded-xl text-sm font-bold">
                  <ShieldCheck size={16} className="mr-2" />
                  Payment Received
                </div>
              )}
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
                    Rs.{" "}
                    {(isEditing
                      ? calculateEditTotal()
                      : parseFloat(order.total_amount)
                    ).toLocaleString()}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-3 mt-3 flex justify-between items-center">
                  <span className="font-bold text-gray-900">
                    {isEditing ? "New Total" : "Total Paid"}
                  </span>
                  <span className="text-xl font-bold text-green-900">
                    Rs.{" "}
                    {(isEditing
                      ? calculateEditTotal()
                      : parseFloat(order.total_amount)
                    ).toLocaleString()}
                  </span>
                </div>
              </div>
              {isEditing && (
                <div className="mt-6 flex flex-col gap-3">
                  <button
                    onClick={handleConfirmSave}
                    disabled={updating}
                    className="w-full py-3 bg-green-900 text-white rounded-xl font-bold hover:bg-green-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {updating ? (
                      <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                    ) : (
                      <Save size={18} />
                    )}
                    Save Changes
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      navigate(`/order-success/${orderId}`);
                    }}
                    disabled={updating}
                    className="w-full py-3 bg-white text-gray-600 rounded-xl font-bold hover:bg-gray-50 border border-gray-200 transition-all flex items-center justify-center gap-2"
                  >
                    <X size={18} />
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-serif font-bold text-gray-900 mb-6 flex items-center">
              <ShoppingBag className="mr-2 text-green-900" size={20} />
              Items Ordered
            </h3>
            <div className="space-y-4">
              {(isEditing ? editItems : order.items)?.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-6 p-4 rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors bg-white relative group"
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
                      {isEditing ? (
                        <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1 border border-gray-100">
                          <button
                            onClick={() => handleUpdateQuantity(index, -1)}
                            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white hover:shadow-sm text-gray-500 transition-all"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-6 text-center text-sm font-bold text-gray-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleUpdateQuantity(index, 1)}
                            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white hover:shadow-sm text-gray-500 transition-all"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 font-medium">
                          Qty: {item.quantity}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-2">
                    <p className="text-lg font-bold text-green-900">
                      Rs.{" "}
                      {(
                        parseFloat(item.price) * item.quantity
                      ).toLocaleString()}
                    </p>
                    {isEditing && (
                      <button
                        onClick={() => handleRemoveItem(index)}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                        title="Remove Item"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onConfirm={handleSaveEdit}
        title="Save Changes"
        description="Are you sure you want to save these changes to your order? This will update the total amount and product stock."
        confirmText="Confirm Changes"
        confirmColor="bg-green-900"
        icon={<Save size={24} />}
      />
    </div>
  );
};

export default OrderSuccessPage;
