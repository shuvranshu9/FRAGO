import * as BookmarkModel from "./bookmark.model.js";

export const addBookmarkController = async (req, res) => {
  try {
    const { perfumeId } = req.body;
    const userId = req.user.userID;

    if (!perfumeId) {
      return res.status(400).json({ message: "Perfume ID is required" });
    }

    await BookmarkModel.addBookmark(userId, perfumeId);
    res.status(201).json({ message: "Bookmark added successfully" });
  } catch (err) {
    console.error("Error adding bookmark:", err);
    res.status(500).json({ message: "Failed to add bookmark" });
  }
};

export const removeBookmarkController = async (req, res) => {
  try {
    const { perfumeId } = req.params;
    const userId = req.user.userID;

    if (!perfumeId) {
      return res.status(400).json({ message: "Perfume ID is required" });
    }

    const deleted = await BookmarkModel.removeBookmark(userId, perfumeId);

    if (!deleted) {
      return res.status(404).json({ message: "Bookmark not found" });
    }

    res.json({ message: "Bookmark removed successfully" });
  } catch (err) {
    console.error("Error removing bookmark:", err);
    res.status(500).json({ message: "Failed to remove bookmark" });
  }
};

export const getBookmarksController = async (req, res) => {
  try {
    const userId = req.user.userID;
    const bookmarks = await BookmarkModel.getBookmarks(userId);

    if (!bookmarks || bookmarks.length === 0) {
      return res.status(200).json({
        message: "No bookmarks found",
        bookmarks: [],
      });
    }

    return res.status(200).json({
      message: "Bookmarks fetched successfully",
      bookmarks,
    });
  } catch (err) {
    console.error("Error fetching bookmarks:", err);
    res.status(500).json({ message: "Failed to fetch bookmarks" });
  }
};
