import * as OrderModel from "./order.model.js";
import * as CartModel from "../cart/cart.model.js";

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
    const orders = await OrderModel.getOrdersByUserId(userId);
    res.json(orders);
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
    const { status } = req.body;

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

    const updated = await OrderModel.updateOrderStatus(orderId, status);

    if (!updated) {
      return res.status(404).json({ message: "Order not found" });
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

    res.json({ message: "Order cancelled successfully" });
  } catch (err) {
    console.error("Error cancelling order:", err);
    res
      .status(err.message === "Order not found" ? 404 : 400)
      .json({ message: err.message || "Failed to cancel order" });
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
