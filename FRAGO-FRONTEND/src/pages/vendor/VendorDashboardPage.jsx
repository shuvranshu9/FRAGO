import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FiShoppingBag,
  FiDollarSign,
  FiCheckCircle,
  FiClock,
  FiTrendingUp,
  FiBox,
} from "react-icons/fi";

const VendorDashboardPage = () => {
  const [stats, setStats] = useState({
    revenue: 0,
    orders: 0,
    paid: 0,
    statusBreakdown: [],
  });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const [statsRes, ordersRes] = await Promise.all([
        axios.get(`http://localhost:8000/api/order/vendor/stats`, config),
        axios.get(`http://localhost:8000/api/order/vendor/orders`, config),
      ]);

      setStats({
        revenue: statsRes.data?.revenue || 0,
        orders: statsRes.data?.orders || 0,
        paid: statsRes.data?.paid || 0,
        statusBreakdown: Array.isArray(statsRes.data?.statusBreakdown)
          ? statsRes.data.statusBreakdown
          : [],
      });
      setOrders(Array.isArray(ordersRes.data) ? ordersRes.data : []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      // Ensure state remains valid on error
      setStats((prev) => ({ ...prev, statusBreakdown: [] }));
      setOrders([]);
    } finally {
      setLoading(false);
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
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
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
            <button className="text-primary text-sm font-semibold hover:underline">
              View All
            </button>
          </div>
          <div className="overflow-x-auto">
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
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.length > 0 ? (
                  orders.map((order) => (
                    <tr
                      key={order.order_id}
                      className="hover:bg-gray-50/30 transition-colors"
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
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-10 text-center text-gray-400"
                    >
                      No orders found yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
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
                          ? "bg-blue-500"
                          : item.order_status === "pending"
                            ? "bg-amber-500"
                            : "bg-gray-400"
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
        </div>
      </div>
    </div>
  );
};

export default VendorDashboardPage;
