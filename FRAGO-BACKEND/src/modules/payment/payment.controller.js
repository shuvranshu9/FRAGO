import axios from "axios";
import * as PaymentModel from "./payment.model.js";
import dotenv from "dotenv";
import { getIO } from "../../socket/socket.js";

dotenv.config();

const emitOrderUpdated = (userId, orderId, status) => {
  try {
    const io = getIO();
    io.to(`user_${userId}`).emit("orderUpdated", {
      orderId: Number(orderId),
      status,
    });
  } catch (err) {
    console.warn("Socket emit skipped (orderUpdated):", err.message);
  }
};

const KHALTI_SECRET_KEY = process.env.KHALTI_SECRET_KEY;
const KHALTI_INITIATE_URL = "https://a.khalti.com/api/v2/epayment/initiate/";
const KHALTI_VERIFY_URL = "https://a.khalti.com/api/v2/epayment/lookup/";

// Initiate Khalti Payment
export const initiatePaymentController = async (req, res) => {
  try {
    const { orderId, website_url } = req.body;

    if (!orderId) {
      return res.status(400).json({ message: "Order ID is required" });
    }

    const order = await PaymentModel.getOrderForPayment(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const payload = {
      return_url: `${website_url}/order-success/${orderId}`,
      website_url: website_url,
      amount: order.total_amount * 100, // Khalti expects amount in paisa
      purchase_order_id: orderId.toString(),
      purchase_order_name: `Order #${orderId}`,
      customer_info: {
        name: order.full_name,
        email: order.email,
        phone: order.phone || "9800000000",
      },
    };

    const response = await axios.post(KHALTI_INITIATE_URL, payload, {
      headers: {
        Authorization: `Key ${KHALTI_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (response.data && response.data.pidx) {
      // Save payment record in our DB
      await PaymentModel.createPaymentRecord({
        order_id: orderId,
        amount: order.total_amount,
        pidx: response.data.pidx,
        status: "pending",
      });

      return res.json({
        payment_url: response.data.payment_url,
        pidx: response.data.pidx,
      });
    } else {
      throw new Error("Failed to initiate payment with Khalti");
    }
  } catch (err) {
    console.error("Khalti Initiate Error:", err.response?.data || err.message);
    res.status(500).json({
      message: "Internal server error during payment initiation",
      error: err.response?.data || err.message,
    });
  }
};

// Verify Khalti Payment
export const verifyPaymentController = async (req, res) => {
  try {
    const { pidx } = req.body;

    if (!pidx) {
      return res.status(400).json({ message: "pidx is required" });
    }

    const response = await axios.post(
      KHALTI_VERIFY_URL,
      { pidx },
      {
        headers: {
          Authorization: `Key ${KHALTI_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (response.data && response.data.status === "Completed") {
      // Update payment and order status in DB
      const orderId = await PaymentModel.updatePaymentAndOrder(
        pidx,
        "Completed",
        response.data.transaction_id,
      );

      // Real-time: pending count should decrease (pending -> paid)
      const order = await PaymentModel.getOrderForPayment(orderId);
      if (order?.user_id) {
        emitOrderUpdated(order.user_id, orderId, "paid");
      }

      return res.json({
        message: "Payment verified successfully",
        orderId,
        status: "Completed",
      });
    } else {
      // Update as failed or whatever status Khalti returns
      await PaymentModel.updatePaymentAndOrder(
        pidx,
        response.data.status || "Failed",
      );

      return res.status(400).json({
        message: "Payment verification failed",
        status: response.data.status || "Failed",
      });
    }
  } catch (err) {
    console.error("Khalti Verify Error:", err.response?.data || err.message);
    res.status(500).json({
      message: "Internal server error during payment verification",
      error: err.response?.data || err.message,
    });
  }
};
