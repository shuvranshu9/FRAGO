import * as OrderModel from "./order.model.js";
import * as CartModel from "../cart/cart.model.js";

// Create order from cart
export const checkoutController = async (req, res) => {
  try {
    const userId = req.user.userID;

    // Get cart items
    const cart = await CartModel.getCartByUserId(userId);

    if (!cart.iems || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
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
