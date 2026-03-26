import pool from "../../config/db.js";

export const findOrCreateChat = async (buyerId, vendorId) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Check if chat exists with FOR UPDATE to lock potential existing rows (though new inserts aren't blocked)
    const [existing] = await connection.execute(
      "SELECT * FROM chat WHERE (buyer_id = ? AND vendor_id = ?) OR (buyer_id = ? AND vendor_id = ?) FOR UPDATE",
      [buyerId, vendorId, vendorId, buyerId],
    );

    if (existing.length > 0) {
      await connection.commit();
      return existing[0];
    }

    // Create new chat
    const [result] = await connection.execute(
      "INSERT INTO chat (buyer_id, vendor_id) VALUES (?, ?)",
      [buyerId, vendorId],
    );

    await connection.commit();
    return {
      chat_id: result.insertId,
      buyer_id: buyerId,
      vendor_id: vendorId,
    };
  } catch (error) {
    await connection.rollback();
    // If it's a duplicate entry error (in case a unique index IS added later), handle it
    if (error.code === 'ER_DUP_ENTRY') {
      const [existing] = await connection.execute(
        "SELECT * FROM chat WHERE (buyer_id = ? AND vendor_id = ?) OR (buyer_id = ? AND vendor_id = ?)",
        [buyerId, vendorId, vendorId, buyerId],
      );
      return existing[0];
    }
    throw error;
  } finally {
    connection.release();
  }
};

export const getChatsByUserId = async (userId) => {
  // Get chats where user is buyer or vendor, and join with user info
  const sql = `
    SELECT 
      c.*, 
      u1.full_name as buyer_name, 
      u2.full_name as vendor_name,
      (SELECT message_text FROM message WHERE chat_id = c.chat_id ORDER BY sent_at DESC LIMIT 1) as last_message,
      (SELECT sent_at FROM message WHERE chat_id = c.chat_id ORDER BY sent_at DESC LIMIT 1) as last_message_time,
      (SELECT COUNT(*) FROM message WHERE chat_id = c.chat_id AND sender_id != ? AND is_read = 0) as unread_count
    FROM chat c
    LEFT JOIN user u1 ON c.buyer_id = u1.user_id
    LEFT JOIN user u2 ON c.vendor_id = u2.user_id
    WHERE c.buyer_id = ? OR c.vendor_id = ?
    ORDER BY last_message_time DESC
  `;

  const [rows] = await pool.execute(sql, [userId, userId, userId]);
  return rows;
};

export const getChatById = async (chatId) => {
  const [rows] = await pool.execute("SELECT * FROM chat WHERE chat_id = ?", [
    chatId,
  ]);
  return rows[0];
};
