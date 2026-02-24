import pool from "../../config/db.js";

export const createPaymentRecord = async ({
  order_id,
  amount,
  pidx,
  status = "pending",
}) => {
  const [result] = await pool.query(
    "INSERT INTO payment (order_id, payment_method, pidx, payment_status) VALUES (?, 'khalti', ?, ?)",
    [order_id, pidx, status],
  );
  return result.insertId;
};

// Update payment status and order status upon verification
export const updatePaymentAndOrder = async (
  pidx,
  status,
  transaction_id = null,
) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Update payment record
    const [payment] = await conn.query(
      "SELECT order_id FROM payment WHERE pidx = ?",
      [pidx],
    );

    if (payment.length === 0) {
      throw new Error("Payment record not found");
    }

    const orderId = payment[0].order_id;

    const dbStatus = status === "Completed" ? "completed" : "failed";

    await conn.query(
      "UPDATE payment SET payment_status = ?, transaction_id = ?, paid_at = NOW() WHERE pidx = ?",
      [dbStatus, transaction_id, pidx],
    );

    // Update order status if payment is completed
    if (dbStatus === "completed") {
      await conn.query(
        "UPDATE order_table SET order_status = 'paid' WHERE order_id = ?",
        [orderId],
      );
    }

    await conn.commit();
    return orderId;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

// Get order details for Khalti initiation
export const getOrderForPayment = async (orderId) => {
  const [rows] = await pool.query(
    `SELECT o.order_id, o.total_amount, u.full_name, u.email, u.phone 
     FROM order_table o
     JOIN user u ON o.user_id = u.user_id
     WHERE o.order_id = ?`,
    [orderId],
  );
  return rows[0];
};
