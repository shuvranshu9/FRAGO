import { findOrCreateChat, getChatsByUserId } from "./chat.model.js";

export const createChat = async (req, res, next) => {
  try {
    const { vendorId } = req.body;
    const buyerId = req.user.userID;

    if (!vendorId) {
      return res.status(400).json({ message: "Vendor ID is required" });
    }

    if (buyerId === vendorId) {
      return res.status(400).json({ message: "You cannot chat with yourself" });
    }

    const chat = await findOrCreateChat(buyerId, vendorId);
    res.status(200).json(chat);
  } catch (err) {
    next(err);
  }
};

export const getUserChats = async (req, res, next) => {
  try {
    const userId = req.user.userID;
    const chats = await getChatsByUserId(userId);
    res.status(200).json(chats);
  } catch (err) {
    next(err);
  }
};
