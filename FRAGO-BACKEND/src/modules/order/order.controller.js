import * as OrderModel from "./order.model.js";
import * as CartModel from "../cart/cart.model.js";
import { getIO } from "../../socket/socket.js";

const emitOrderUpdated = (userId, orderId, status) => {
  try {
    const io = getIO();
    io.to(`user_${userId}`).emit("orderUpdated", {
      orderId: Number(orderId),
      status,
    });
  } catch (err) {
    // Socket may not be initialized in some environments (e.g., tests)
    console.warn("Socket emit skipped (orderUpdated):", err.message);
  }
};

// Create order from cart
export const checkoutController = async (req, res) => {
  try {
    const userId = req.user.userID;

    // Get cart items
    const cart = await CartModel.getCartByUserId(userId);

    if (!cart.items || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Validation: Vendor cannot buy their own product
    const selfPurchaseItem = cart.items.find(
      (item) => item.vendor_id === userId,
    );
    if (selfPurchaseItem) {
      return res.status(400).json({
        message: `You cannot buy your own product: ${selfPurchaseItem.name}`,
      });
    }

    // Calculate total and prepare items
    let totalAmount = 0;
    const orderItems = cart.items.map((item) => {
      const itemTotal = parseFloat(item.price) * item.quantity;
      totalAmount += itemTotal;
      return {
        variant_id: item.variant_id,
        quantity: item.quantity,
        price: item.price,
      };
    });

    // Create order
    const orderId = await OrderModel.createOrder({
      userId,
      totalAmount,
      items: orderItems,
    });

    // Clear cart
    await CartModel.clearCart(userId);

    // Real-time: pending count should increase immediately
    emitOrderUpdated(userId, orderId, "pending");

    res.status(201).json({
      message: "Order placed successfully",
      orderId,
      totalAmount,
    });
  } catch (err) {
    console.error("Checkout error:", err);
    res.status(500).json({ message: "Failed to place order" });
  }
};

// Get my orders
export const getMyOrdersController = async (req, res) => {
  try {
    const userId = req.user.userID;

    const status = req.query.status ? String(req.query.status).toLowerCase() : null;
    if (status) {
      const validStatuses = [
        "pending",
        "paid",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
    }

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const rawLimit = parseInt(req.query.limit, 10);
    const limit = Math.min(50, Math.max(1, Number.isFinite(rawLimit) ? rawLimit : 10));
    const offset = (page - 1) * limit;

    const { data: orders, total_count, pending_count } =
      await OrderModel.getOrdersByUserIdPaginated(userId, { limit, offset, status });

    res.json({
      data: orders,
      currentPage: page,
      totalPages: Math.max(1, Math.ceil(total_count / limit)),
      totalOrders: total_count,
      pendingCount: pending_count,
    });
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

// Get order details
export const getOrderDetailsController = async (req, res) => {
  try {
    const userId = req.user.userID;
    const { orderId } = req.params;

    const order = await OrderModel.getOrderById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Assuming strictly user facing for now
    if (order.user_id !== userId && req.user.role !== "vendor") {
      // Allow vendors/admins too
      return res
        .status(403)
        .json({ message: "Unauthorized access to this order" });
    }

    res.json(order);
  } catch (err) {
    console.error("Error fetching order details:", err);
    res.status(500).json({ message: "Failed to fetch order details" });
  }
};

// Update order status (Vendor/Admin)
export const updateOrderStatusController = async (req, res) => {
  try {
    const { orderId } = req.params;
    const status = String(req.body?.status || "").toLowerCase();

    const validStatuses = [
      "pending",
      "paid",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    // Vendor rules (real-world): vendors can only move PAID orders forward.
    // pending/paid/cancelled are managed by code.
    const vendorId = req.user.userID;
    const allowedVendorTargets = ["processing", "shipped", "delivered"];
    if (!allowedVendorTargets.includes(status)) {
      return res.status(400).json({
        message:
          "Vendors can only update status to processing, shipped, or delivered",
      });
    }

    const currentStatus = await OrderModel.getOrderStatusById(orderId);
    if (!currentStatus) {
      return res.status(404).json({ message: "Order not found" });
    }

    const current = String(currentStatus).toLowerCase();
    const nextByStatus = {
      paid: "processing",
      processing: "shipped",
      shipped: "delivered",
    };

    const expectedNext = nextByStatus[current];
    if (!expectedNext) {
      return res.status(400).json({
        message: "Order status cannot be updated at this stage",
      });
    }
    if (status !== expectedNext) {
      return res.status(400).json({
        message: `Invalid status transition. Next status should be '${expectedNext}'.`,
      });
    }

    const scope = await OrderModel.getVendorOrderScope(vendorId, orderId);
    if (scope.vendorItemCount <= 0) {
      return res.status(403).json({ message: "Unauthorized order" });
    }
    if (scope.vendorCount !== 1) {
      return res.status(400).json({
        message:
          "This order contains items from multiple vendors and cannot be updated here",
      });
    }

    const updated = await OrderModel.updateOrderStatus(orderId, status);

    if (!updated) {
      return res.status(404).json({ message: "Order not found" });
    }

    const meta = await OrderModel.getOrderMetaById(orderId);
    if (meta?.user_id) {
      emitOrderUpdated(meta.user_id, orderId, meta.order_status);
    }

    res.json({ message: "Order status updated" });
  } catch (err) {
    console.error("Error updating order status:", err);
    res.status(500).json({ message: "Failed to update order status" });
  }
};

// Cancel order (User)
export const cancelOrderController = async (req, res) => {
  try {
    const userId = req.user.userID;
    const { orderId } = req.params;

    await OrderModel.cancelOrder(orderId, userId);

    emitOrderUpdated(userId, orderId, "cancelled");

    res.json({ message: "Order cancelled successfully" });
  } catch (err) {
    console.error("Error cancelling order:", err);
    res
      .status(err.message === "Order not found" ? 404 : 400)
      .json({ message: err.message || "Failed to cancel order" });
  }
};

// Confirm delivery (User)
export const confirmDeliveryController = async (req, res) => {
  try {
    const userId = req.user.userID;
    const { orderId } = req.params;

    await OrderModel.confirmOrderDelivered(orderId, userId);

    emitOrderUpdated(userId, orderId, "delivered");

    res.json({ message: "Order marked as delivered" });
  } catch (err) {
    console.error("Error confirming delivery:", err);
    res
      .status(err.message === "Order not found" ? 404 : 400)
      .json({ message: err.message || "Failed to confirm delivery" });
  }
};

// Update order (User)
export const updateOrderController = async (req, res) => {
  try {
    const userId = req.user.userID;
    const { orderId } = req.params;
    const { items } = req.body;

    if (!items || items.length === 0) {
      return res
        .status(400)
        .json({ message: "Order must have at least one item" });
    }

    const result = await OrderModel.updateOrder(orderId, userId, items);

    res.json({
      message: "Order updated successfully",
      newTotal: result.newTotal,
    });
  } catch (err) {
    console.error("Error updating order:", err);
    res
      .status(err.message === "Order not found" ? 404 : 400)
      .json({ message: err.message || "Failed to update order" });
  }
};

// Get vendor statistics
export const getVendorStatsController = async (req, res) => {
  try {
    const vendorId = req.user.userID;
    const stats = await OrderModel.getVendorStats(vendorId);
    res.json(stats);
  } catch (err) {
    console.error("Error fetching vendor stats:", err);
    res.status(500).json({ message: "Failed to fetch vendor statistics" });
  }
};

// Get vendor top products (for pie chart)
export const getVendorTopProductsController = async (req, res) => {
  try {
    const vendorId = req.user.userID;
    const limit = parseInt(req.query.limit) || 6;
    const products = await OrderModel.getVendorTopProducts(vendorId, limit);
    res.json(products);
  } catch (err) {
    console.error("Error fetching vendor top products:", err);
    res.status(500).json({ message: "Failed to fetch top products" });
  }
};

// Get vendor orders
export const getVendorOrdersController = async (req, res) => {
  try {
    const vendorId = req.user.userID;

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Filters & Sort
    const { status, year, month, day, sortAmount } = req.query;

    const { data: orders, total_count } = await OrderModel.getVendorOrders(
      vendorId,
      {
        limit,
        offset,
        status: status || null,
        year: year || null,
        month: month || null,
        day: day || null,
        sortAmount: sortAmount || null,
      },
    );

    res.json({
      data: orders,
      currentPage: page,
      totalPages: Math.ceil(total_count / limit),
      totalOrders: total_count,
    });
  } catch (err) {
    console.error("Error fetching vendor orders:", err);
    res.status(500).json({ message: "Failed to fetch vendor orders" });
  }
};
