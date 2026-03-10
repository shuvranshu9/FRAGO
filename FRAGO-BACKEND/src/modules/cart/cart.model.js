import pool from "../../config/db.js";

// Get user's cart with items and details
export const getCartByUserId = async (userId) => {
  // Ensure a cart exists for the user
  let [cartRows] = await pool.query(
    "SELECT cart_id FROM cart WHERE user_id = ?",
    [userId],
  );

  let cartId;
  if (cartRows.length === 0) {
    const [result] = await pool.query("INSERT INTO cart (user_id) VALUES (?)", [
      userId,
    ]);
    cartId = result.insertId;
  } else {
    cartId = cartRows[0].cart_id;
  }

  // Fetch items with perfume and variant details
  const [items] = await pool.query(
    `
        SELECT 
            ci.cart_item_id,
            ci.quantity,
            pv.variant_id,
            pv.size_ml,
            pv.price,
            pv.stock_quantity,
            p.perfume_id,
            p.name,
            p.brand,
            p.scent_type,
            p.vendor_id,
            (SELECT image_url FROM perfume_image pi WHERE pi.perfume_id = p.perfume_id LIMIT 1) as image
        FROM cart_item ci
        JOIN perfume_variant pv ON ci.variant_id = pv.variant_id
        JOIN perfume p ON pv.perfume_id = p.perfume_id
        WHERE ci.cart_id = ?
        `,
    [cartId],
  );

  return {
    cart_id: cartId,
    items,
  };
};

// Add item to cart
export const addToCart = async (userId, variantId, quantity) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // create cart
    let [cartRows] = await conn.query(
      "SELECT cart_id FROM cart WHERE user_id = ?",
      [userId],
    );

    let cartId;
    if (cartRows.length === 0) {
      const [res] = await conn.query("INSERT INTO cart (user_id) VALUES (?)", [
        userId,
      ]);
      cartId = res.insertId;
    } else {
      cartId = cartRows[0].cart_id;
    }

    // Check if item already exists in cart
    const [existingItem] = await conn.query(
      "SELECT cart_item_id, quantity FROM cart_item WHERE cart_id = ? AND variant_id = ?",
      [cartId, variantId],
    );

    if (existingItem.length > 0) {
      // Update quantity
      const newQuantity = existingItem[0].quantity + quantity;
      await conn.query(
        "UPDATE cart_item SET quantity = ? WHERE cart_item_id = ?",
        [newQuantity, existingItem[0].cart_item_id],
      );
    } else {
      // Insert new item
      await conn.query(
        "INSERT INTO cart_item (cart_id, variant_id, quantity) VALUES (?, ?, ?)",
        [cartId, variantId, quantity],
      );
    }

    await conn.commit();
    return { success: true };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

// Update item quantity
export const updateCartItemQuantity = async (userId, cartItemId, quantity) => {
  // Verify cart item belongs to user's cart
  const [valid] = await pool.query(
    `
        SELECT ci.cart_item_id 
        FROM cart_item ci
        JOIN cart c ON ci.cart_id = c.cart_id
        WHERE ci.cart_item_id = ? AND c.user_id = ?
        `,
    [cartItemId, userId],
  );

  if (valid.length === 0) {
    return false;
  }

  if (quantity <= 0) {
    // Remove item if quantity is 0 or less
    await pool.query("DELETE FROM cart_item WHERE cart_item_id = ?", [
      cartItemId,
    ]);
  } else {
    await pool.query(
      "UPDATE cart_item SET quantity = ? WHERE cart_item_id = ?",
      [quantity, cartItemId],
    );
  }
  return true;
};

// Remove item from cart
export const removeFromCart = async (userId, cartItemId) => {
  const [result] = await pool.query(
    `
        DELETE ci FROM cart_item ci
        JOIN cart c ON ci.cart_id = c.cart_id
        WHERE ci.cart_item_id = ? AND c.user_id = ?
        `,
    [cartItemId, userId],
  );
  return result.affectedRows > 0;
};

// Clear cart
export const clearCart = async (userId) => {
  // Get cart id
  const [cart] = await pool.query(
    "SELECT cart_id FROM cart WHERE user_id = ?",
    [userId],
  );
  if (cart.length === 0) return true;

  await pool.query("DELETE FROM cart_item WHERE cart_id = ?", [
    cart[0].cart_id,
  ]);
  return true;
};
