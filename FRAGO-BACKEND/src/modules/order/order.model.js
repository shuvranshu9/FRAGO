import pool from "../../config/db.js";

// Create a new order (Transactional)
export const createOrder = async ({ userId, totalAmount, items }) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Insert into order_table
    const [orderResult] = await conn.query(
      `INSERT INTO order_table (user_id, total_amount, order_status) VALUES (?, ?, 'pending')`,
      [userId, totalAmount],
    );

    const orderId = orderResult.insertId;

    // Insert order items
    if (items && items.length > 0) {
      const orderItems = items.map((item) => [
        orderId,
        item.variant_id,
        item.quantity,
        item.price,
      ]);

      await conn.query(
        `INSERT INTO order_item (order_id, variant_id, quantity, price) VALUES ?`,
        [orderItems],
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

// Get all orders for a specific user
export const getOrdersByUserId = async (userId) => {
  const [rows] = await pool.query(
    `SELECT * FROM order_table WHERE user_id = ? ORDER BY created_at DESC`,
    [userId],
  );
  return rows;
};

// Get full order details by ID
export const getOrderById = async (orderId) => {
  // Get order info
  const [order] = await pool.query(
    `SELECT * FROM order_table WHERE order_id = ?`,
    [orderId],
  );

  if (order.length === 0) return null;

  // Get items with variant and perfume details
  const [items] = await pool.query(
    `
    SELECT 
      oi.order_item_id,
      oi.quantity,
      oi.price,
      pv.size_ml,
      p.name AS perfume_name,
      p.brand,
      (SELECT image_url FROM perfume_image pi WHERE pi.perfume_id = p.perfume_id LIMIT 1) as image
    FROM order_item oi
    JOIN perfume_variant pv ON oi.variant_id = pv.variant_id
    JOIN perfume p ON pv.perfume_id = p.perfume_id
    WHERE oi.order_id = ?
    `,
    [orderId],
  );

  return {
    ...order[0],
    items,
  };
};

// Update order status (Admin/Vendor)
export const updateOrderStatus = async (orderId, status) => {
  const [result] = await pool.query(
    `UPDATE order_table SET order_status = ? WHERE order_id = ?`,
    [status, orderId],
  );
  return result.affectedRows > 0;
};

// Get all orders (for admin/dashboard - optional but good to have)
export const getAllOrders = async () => {
  const [rows] = await pool.query(
    `
    SELECT o.*, u.full_name, u.email 
    FROM order_table o
    JOIN user u ON o.user_id = u.user_id
    ORDER BY o.created_at DESC
    `,
  );
  return rows;
};
