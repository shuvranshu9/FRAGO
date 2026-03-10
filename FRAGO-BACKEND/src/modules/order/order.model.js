import pool from "../../config/db.js";

// Create a new order
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

    // Insert order items and update stock
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

      // Decrement stock for each variant
      for (const item of items) {
        const [variant] = await conn.query(
          "SELECT stock_quantity FROM perfume_variant WHERE variant_id = ?",
          [item.variant_id],
        );

        if (variant.length === 0 || variant[0].stock_quantity < item.quantity) {
          throw new Error(
            `Insufficient stock for variant ID ${item.variant_id}`,
          );
        }

        await conn.query(
          "UPDATE perfume_variant SET stock_quantity = stock_quantity - ? WHERE variant_id = ?",
          [item.quantity, item.variant_id],
        );
      }
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
      oi.variant_id,
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
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // If cancelling, restore stock
    if (status === "cancelled") {
      const [order] = await conn.query(
        "SELECT order_status FROM order_table WHERE order_id = ?",
        [orderId],
      );

      if (order.length > 0 && order[0].order_status !== "cancelled") {
        const [items] = await conn.query(
          "SELECT variant_id, quantity FROM order_item WHERE order_id = ?",
          [orderId],
        );

        for (const item of items) {
          await conn.query(
            "UPDATE perfume_variant SET stock_quantity = stock_quantity + ? WHERE variant_id = ?",
            [item.quantity, item.variant_id],
          );
        }
      }
    }

    const [result] = await conn.query(
      `UPDATE order_table SET order_status = ? WHERE order_id = ?`,
      [status, orderId],
    );

    await conn.commit();
    return result.affectedRows > 0;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

// Cancel order (User)
export const cancelOrder = async (orderId, userId) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Check if order exists and belongs to user
    const [order] = await conn.query(
      "SELECT order_status FROM order_table WHERE order_id = ? AND user_id = ?",
      [orderId, userId],
    );

    if (order.length === 0) {
      throw new Error("Order not found");
    }

    if (order[0].order_status !== "pending") {
      throw new Error("Only pending orders can be cancelled");
    }

    // Restore stock
    const [items] = await conn.query(
      "SELECT variant_id, quantity FROM order_item WHERE order_id = ?",
      [orderId],
    );

    for (const item of items) {
      await conn.query(
        "UPDATE perfume_variant SET stock_quantity = stock_quantity + ? WHERE variant_id = ?",
        [item.quantity, item.variant_id],
      );
    }

    // Update status
    await conn.query(
      "UPDATE order_table SET order_status = 'cancelled' WHERE order_id = ?",
      [orderId],
    );

    await conn.commit();
    return true;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

// Update order
export const updateOrder = async (orderId, userId, updatedItems) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Check if order exists and belongs to user
    const [order] = await conn.query(
      "SELECT order_status FROM order_table WHERE order_id = ? AND user_id = ?",
      [orderId, userId],
    );

    if (order.length === 0) {
      throw new Error("Order not found");
    }

    if (order[0].order_status !== "pending") {
      throw new Error("Only pending orders can be edited");
    }

    // Get current items to restore stock before updating
    const [currentItems] = await conn.query(
      "SELECT variant_id, quantity FROM order_item WHERE order_id = ?",
      [orderId],
    );

    for (const item of currentItems) {
      await conn.query(
        "UPDATE perfume_variant SET stock_quantity = stock_quantity + ? WHERE variant_id = ?",
        [item.quantity, item.variant_id],
      );
    }

    // Delete old items
    await conn.query("DELETE FROM order_item WHERE order_id = ?", [orderId]);

    // Insert new items and re-decrement stock
    let newTotal = 0;
    if (updatedItems && updatedItems.length > 0) {
      const orderItemsData = updatedItems.map((item) => {
        const itemTotal = parseFloat(item.price) * item.quantity;
        newTotal += itemTotal;
        return [orderId, item.variant_id, item.quantity, item.price];
      });

      await conn.query(
        `INSERT INTO order_item (order_id, variant_id, quantity, price) VALUES ?`,
        [orderItemsData],
      );

      for (const item of updatedItems) {
        // Re-check stock (since we restored it, it should be fine if common items, but new items or increased quantity need check)
        const [variant] = await conn.query(
          "SELECT stock_quantity FROM perfume_variant WHERE variant_id = ?",
          [item.variant_id],
        );

        if (variant.length === 0 || variant[0].stock_quantity < item.quantity) {
          throw new Error(
            `Insufficient stock for variant ID ${item.variant_id}`,
          );
        }

        await conn.query(
          "UPDATE perfume_variant SET stock_quantity = stock_quantity - ? WHERE variant_id = ?",
          [item.quantity, item.variant_id],
        );
      }
    } else {
      throw new Error("Order must have at least one item");
    }

    // Update order total
    await conn.query(
      "UPDATE order_table SET total_amount = ? WHERE order_id = ?",
      [newTotal, orderId],
    );

    await conn.commit();
    return { success: true, newTotal };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

// Get all orders
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
// Get vendor stats
export const getVendorStats = async (vendorId) => {
  const [[revenue]] = await pool.query(
    `SELECT COALESCE(SUM(oi.price * oi.quantity), 0) as totalRevenue
     FROM order_item oi
     JOIN perfume_variant pv ON oi.variant_id = pv.variant_id
     JOIN perfume p ON pv.perfume_id = p.perfume_id
     JOIN order_table o ON oi.order_id = o.order_id
     WHERE p.vendor_id = ? AND o.order_status != 'cancelled'`,
    [vendorId]
  );

  const [[ordersCount]] = await pool.query(
    `SELECT COUNT(DISTINCT oi.order_id) as totalOrders
     FROM order_item oi
     JOIN perfume_variant pv ON oi.variant_id = pv.variant_id
     JOIN perfume p ON pv.perfume_id = p.perfume_id
     WHERE p.vendor_id = ?`,
    [vendorId]
  );

  const [statusBreakdown] = await pool.query(
    `SELECT o.order_status, COUNT(DISTINCT oi.order_id) as count
     FROM order_item oi
     JOIN perfume_variant pv ON oi.variant_id = pv.variant_id
     JOIN perfume p ON pv.perfume_id = p.perfume_id
     JOIN order_table o ON oi.order_id = o.order_id
     WHERE p.vendor_id = ?
     GROUP BY o.order_status`,
    [vendorId]
  );

  const [[paidAmount]] = await pool.query(
    `SELECT COALESCE(SUM(oi.price * oi.quantity), 0) as totalPaid
     FROM order_item oi
     JOIN perfume_variant pv ON oi.variant_id = pv.variant_id
     JOIN perfume p ON pv.perfume_id = p.perfume_id
     JOIN order_table o ON oi.order_id = o.order_id
     WHERE p.vendor_id = ? AND o.order_status IN ('paid', 'delivered', 'shipped')`,
    [vendorId]
  );

  return {
    revenue: revenue.totalRevenue,
    orders: ordersCount.totalOrders,
    paid: paidAmount.totalPaid,
    statusBreakdown
  };
};

// Get vendor-specific orders
export const getVendorOrders = async (vendorId) => {
  const [rows] = await pool.query(
    `SELECT 
        o.order_id, 
        o.order_status, 
        o.created_at,
        u.full_name as customer_name,
        SUM(oi.price * oi.quantity) as vendor_total_amount
     FROM order_table o
     JOIN user u ON o.user_id = u.user_id
     JOIN order_item oi ON o.order_id = oi.order_id
     JOIN perfume_variant pv ON oi.variant_id = pv.variant_id
     JOIN perfume p ON pv.perfume_id = p.perfume_id
     WHERE p.vendor_id = ?
     GROUP BY o.order_id
     ORDER BY o.created_at DESC`,
    [vendorId]
  );
  return rows;
};
