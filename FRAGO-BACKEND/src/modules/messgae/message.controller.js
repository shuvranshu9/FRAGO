import { createMessage, getMessagesByChatId, markMessagesAsRead } from "./message.model.js";
import { getChatById } from "../chat/chat.model.js";
import { getIO } from "../../socket/socket.js";

export const sendMessage = async (req, res, next) => {
  try {
    const { chat_id, message_text } = req.body;
    const sender_id = req.user.userID;

    if (!chat_id || !message_text) {
      return res.status(400).json({ message: "Chat ID and message text are required" });
    }

    // Verify chat exists and user is a participant
    const chat = await getChatById(chat_id);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    if (chat.buyer_id !== sender_id && chat.vendor_id !== sender_id) {
      return res.status(403).json({ message: "You are not a participant in this chat" });
    }

    // Save message
    const message = await createMessage(chat_id, sender_id, message_text);

    // Identify receiver
    const receiver_id = chat.buyer_id === sender_id ? chat.vendor_id : chat.buyer_id;

    // Emit real-time message via socket
    const io = getIO();
    io.to(`user_${receiver_id}`).emit("newMessage", message);

    res.status(201).json(message);
  } catch (err) {
    next(err);
  }
};

export const getMessages = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.userID;

    // Verify chat participants
    const chat = await getChatById(chatId);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    if (chat.buyer_id !== userId && chat.vendor_id !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    const messages = await getMessagesByChatId(chatId);
    
    // Mark messages as read asynchronously
    markMessagesAsRead(chatId, userId).catch(err => console.error("Error marking messages as read:", err));

    res.status(200).json(messages);
  } catch (err) {
    next(err);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.userID;

    await markMessagesAsRead(chatId, userId);
    
    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
};
