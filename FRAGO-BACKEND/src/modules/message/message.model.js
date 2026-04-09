import pool from "../../config/db.js";

export const createMessage = async (chatId, senderId, messageText) => {
  const [result] = await pool.execute(
    "INSERT INTO message (chat_id, sender_id, message_text) VALUES (?, ?, ?)",
    [chatId, senderId, messageText],
  );

  return {
    message_id: result.insertId,
    chat_id: chatId,
    sender_id: senderId,
    message_text: messageText,
    sent_at: new Date(),
  };
};

export const getMessagesByChatId = async (chatId) => {
  const [rows] = await pool.execute(
    "SELECT * FROM message WHERE chat_id = ? ORDER BY sent_at ASC",
    [chatId],
  );
  return rows;
};

export const markMessagesAsRead = async (chatId, userId) => {
  await pool.execute(
    "UPDATE message SET is_read = 1 WHERE chat_id = ? AND sender_id != ? AND is_read = 0",
    [chatId, userId],
  );
};
