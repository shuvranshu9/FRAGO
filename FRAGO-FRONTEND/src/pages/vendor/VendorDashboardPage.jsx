import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import OrderFilters from "../../components/vendor/OrderFilters";
import Pagination from "@mui/material/Pagination";
import { alpha } from "@mui/material/styles";
import { theme } from "../../styles/theme";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import {
  FiShoppingBag,
  FiDollarSign,
  FiCheckCircle,
  FiClock,
  FiTrendingUp,
  FiBox,
  FiEye,
  FiX,
} from "react-icons/fi";

const getFullImageUrl = (imageUrl) => {
  if (!imageUrl) return "";

  if (imageUrl.startsWith("http")) {
    return imageUrl;
  }

  const normalizedPath = imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`;

  return `http://localhost:8000${normalizedPath}`;
};

const OrderDetailsModal = ({ order, onClose }) => {
  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (order) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [order]);

  if (!order) return null;

  let items = order.items;
  if (typeof items === "string") {
    try {
      items = JSON.parse(items);
    } catch {
      items = [];
    }
  }

  const isItemsValid = Array.isArray(items) && items.length > 0;

  return (
    <div className="fixed inset-0 z-200 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in duration-300">
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              Order #{order.order_id}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Placed by {order.customer_name} on{" "}
              {new Date(order.created_at).toLocaleDateString()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
            Items Purchased
          </h4>
          <div className="space-y-4">
            {isItemsValid ? (
              items.map((item, idx) => (
                <div
                  key={item.item_id || idx}
                  className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 bg-white"
                >
                  <div className="w-16 h-16 md:w-40 md:h-40 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 shrink-0 overflow-hidden border border-gray-200/50">
                    {item.image_url ? (
                      <img
                        src={getFullImageUrl(item.image_url)}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = "none";
                          e.target.parentElement.classList.add("fallback-icon");
                        }}
                      />
                    ) : (
                      <FiBox size={24} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                      {item.brand}
                    </p>
                    <h5 className="text-base font-bold text-gray-900 truncate">
                      {item.name}
                    </h5>
                    <p className="text-sm text-gray-500">{item.size_ml}ml</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      {item.quantity} x Rs. {item.price}
                    </p>
                    <p className="text-base font-bold text-gray-900 mt-1">
                      Rs. {item.quantity * item.price}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 italic text-center py-4">
                Item details not available.
              </p>
            )}
          </div>
        </div>

        <div className="px-6 py-5 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
          <span className="text-sm font-medium text-gray-500">
            Total Vendor Earning
          </span>
          <span className="text-xl font-bold text-gray-900">
            Rs. {order.vendor_total_amount}
          </span>
        </div>
      </div>
    </div>
  );
};

const EMPTY_FILTERS = { status: "", year: "", month: "", day: "", sortAmount: "" };

const VendorDashboardPage = () => {
  const [stats, setStats] = useState({
    revenue: 0,
    orders: 0,
    paid: 0,
    statusBreakdown: [],
  });
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 8;
  const [loading, setLoading] = useState(true);   // initial full-page load
  const [isFetching, setIsFetching] = useState(false); // filter/page soft refresh
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [topProducts, setTopProducts] = useState([]);
  const isFirstLoad = useRef(true);

  const buildOrdersUrl = useCallback(
    (currentPage, currentFilters) => {
      const params = new URLSearchParams({
        page: currentPage,
        limit,
      });
      if (currentFilters.status) params.set("status", currentFilters.status);
      if (currentFilters.year) params.set("year", currentFilters.year);
      if (currentFilters.month) params.set("month", currentFilters.month);
      if (currentFilters.day) params.set("day", currentFilters.day);
      if (currentFilters.sortAmount) params.set("sortAmount", currentFilters.sortAmount);
      return `http://localhost:8000/api/order/vendor/orders?${params.toString()}`;
    },
    [limit],
  );

  useEffect(() => {
    fetchDashboardData(page, filters);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filters]);

  const handleFiltersChange = (updatedFilters) => {
    setFilters(updatedFilters);
    setPage(1); // reset to first page on any filter change
  };

  const handleFiltersReset = () => {
    setFilters(EMPTY_FILTERS);
    setPage(1);
  };

  const fetchDashboardData = async (currentPage, currentFilters) => {
    try {
      if (isFirstLoad.current) {
        setLoading(true);
      } else {
        setIsFetching(true);
      }

      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const [statsRes, ordersRes, topProductsRes] = await Promise.all([
        axios.get(`http://localhost:8000/api/order/vendor/stats`, config),
        axios.get(buildOrdersUrl(currentPage, currentFilters), config),
        axios.get(`http://localhost:8000/api/order/vendor/top-products`, config),
      ]);

      setStats({
        revenue: statsRes.data?.revenue || 0,
        orders: statsRes.data?.orders || 0,
        paid: statsRes.data?.paid || 0,
        statusBreakdown: Array.isArray(statsRes.data?.statusBreakdown)
          ? statsRes.data.statusBreakdown
          : [],
      });
      setOrders(Array.isArray(ordersRes.data?.data) ? ordersRes.data.data : []);
      setTotalPages(ordersRes.data?.totalPages || 1);
      setTopProducts(Array.isArray(topProductsRes.data) ? topProductsRes.data : []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setStats((prev) => ({ ...prev, statusBreakdown: [] }));
      setOrders([]);
      setTopProducts([]);
    } finally {
      if (isFirstLoad.current) {
        isFirstLoad.current = false;
        setLoading(false);
      } else {
        setIsFetching(false);
      }
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, suffix = "" }) => (
    <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 transition-all hover:shadow-md hover:-translate-y-1">
      <div className={`p-4 rounded-xl ${color} text-white`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-gray-500 text-sm font-medium">{title}</p>
        <h3 className="text-2xl font-bold mt-1 text-gray-800">
          {suffix}
          {value.toLocaleString()}
        </h3>
      </div>
    </div>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "paid":
        return "bg-blue-100 text-blue-600";
      case "delivered":
        return "bg-green-100 text-green-600";
      case "pending":
        return "bg-yellow-100 text-yellow-600";
      case "cancelled":
        return "bg-red-100 text-red-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">
          Vendor Dashboard
        </h1>
        <p className="mt-2 text-gray-600">
          Analyze your sales performance and manage incoming orders.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard
          title="Total Revenue"
          value={stats.revenue}
          icon={FiDollarSign}
          color="bg-indigo-600"
          suffix="Rs. "
        />
        <StatCard
          title="Total Orders"
          value={stats.orders}
          icon={FiShoppingBag}
          color="bg-sky-500"
        />
        <StatCard
          title="Paid Amount"
          value={stats.paid}
          icon={FiCheckCircle}
          color="bg-emerald-500"
          suffix="Rs. "
        />
        <StatCard
          title="Pending Share"
          value={stats.revenue - stats.paid}
          icon={FiClock}
          color="bg-amber-500"
          suffix="Rs. "
        />
      </div>

      {/* Main Content Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-50 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-800">Recent Orders</h2>
          </div>

          {/* Filters */}
          <OrderFilters
            filters={filters}
            onChange={handleFiltersChange}
            onReset={handleFiltersReset}
          />
          <div className={`overflow-x-auto transition-opacity duration-200 ${isFetching ? "opacity-50 pointer-events-none" : "opacity-100"}`}>
            <table className="w-full text-left">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {orders.length > 0 ? (
                  orders.map((order) => (
                    <tr
                      key={order.order_id}
                      className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50/30 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        #{order.order_id}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {order.customer_name}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        Rs.{order.vendor_total_amount}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase ${getStatusColor(order.order_status)}`}
                        >
                          {order.order_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors inline-flex items-center gap-1 text-xs font-semibold"
                          title="View Details"
                        >
                          <FiEye size={16} /> Details
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-10 text-center text-gray-400"
                    >
                      No orders found yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center p-4 border-t border-gray-50 bg-gray-50/30">
              <Pagination
                count={totalPages}
                page={page}
                onChange={(event, value) => setPage(value)}
                shape="rounded"
                size="medium"
                sx={{
                  "& .MuiPaginationItem-root": {
                    color: theme.colors.text.primary,
                    fontWeight: 600,
                  },
                  "& .MuiPaginationItem-root.Mui-selected": {
                    backgroundColor: theme.colors.primary,
                    color: theme.colors.text.inverse,
                    "&:hover": {
                      backgroundColor: theme.colors.secondary,
                    },
                  },
                  "& .MuiPaginationItem-root:hover": {
                    backgroundColor: alpha(theme.colors.primary, 0.08),
                  },
                }}
              />
            </div>
          )}
        </div>

        {/* Status Breakdown / Analytics */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <FiTrendingUp className="text-primary" />
            Order Analytics
          </h2>
          <div className="space-y-6">
            {stats.statusBreakdown.map((item) => (
              <div key={item.order_status} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="capitalize text-gray-600 font-medium">
                    {item.order_status}
                  </span>
                  <span className="text-gray-900 font-bold">
                    {item.count} orders
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className={`h-full rounded-full ${
                      item.order_status === "delivered"
                        ? "bg-emerald-500"
                        : item.order_status === "paid"
                          ? "bg-blue-900"
                          : item.order_status === "pending"
                            ? "bg-amber-600"
                            : "bg-gray-500"
                    }`}
                    style={{ width: `${(item.count / stats.orders) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
            {stats.statusBreakdown.length === 0 && (
              <div className="text-center py-10 text-gray-400 border-2 border-dashed border-gray-100 rounded-xl">
                <FiBox size={32} className="mx-auto mb-2 opacity-20" />
                <p>No data to visualize yet.</p>
              </div>
            )}
          </div>

          {/* Product Sales Pie Chart */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
              <FiShoppingBag className="text-[#2f5e3a]" />
              Top Selling Products
            </h2>
            {topProducts.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={topProducts.map((p) => ({ name: p.name, value: Number(p.total_sold) }))}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                    >
                      {topProducts.map((_, i) => (
                        <Cell
                          key={i}
                          fill={[
                            "#2f5e3a",
                            "#4ade80",
                            "#f59e0b",
                            "#1a3824",
                            "#10b981",
                            "#d97706",
                          ][i % 6]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name) => [`${value} units`, name]}
                      contentStyle={{ borderRadius: 12, fontSize: 13 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {topProducts.map((p, i) => (
                    <div key={p.perfume_id} className="flex items-center gap-2 text-sm">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{
                          backgroundColor: [
                            "#2f5e3a",
                            "#4ade80",
                            "#f59e0b",
                            "#1a3824",
                            "#10b981",
                            "#d97706",
                          ][i % 6],
                        }}
                      />
                      <span className="text-gray-700 font-medium truncate flex-1">{p.name}</span>
                      <span className="text-gray-900 font-bold shrink-0">{p.total_sold} sold</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-10 text-gray-400 border-2 border-dashed border-gray-100 rounded-xl">
                <FiBox size={32} className="mx-auto mb-2 opacity-20" />
                <p>No product sales data yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <OrderDetailsModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </div>
  );
};

export default VendorDashboardPage;
