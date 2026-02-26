import * as Review from "./review.model.js";

export const editReview = async (req, res) => {
  const { review_id } = req.params;
  const user_id = req.user.userID;
  const { rating, comment } = req.body;

  if (!review_id || isNaN(review_id))
    return res.status(400).json({ message: "Invalid review ID." });

  const ratingNum = Number(rating);
  if (!ratingNum || ratingNum < 1 || ratingNum > 5)
    return res.status(400).json({ message: "Rating must be between 1 and 5." });

  if (!comment || comment.trim().length < 5)
    return res
      .status(400)
      .json({ message: "Comment must be at least 5 characters." });

  if (comment.trim().length > 1000)
    return res
      .status(400)
      .json({ message: "Comment must not exceed 1000 characters." });

  try {
    const affected = await Review.updateReview(
      Number(review_id),
      user_id,
      ratingNum,
      comment.trim(),
    );
    if (affected === 0)
      return res
        .status(404)
        .json({ message: "Review not found or not authorized." });

    return res.status(200).json({ message: "Review updated successfully." });
  } catch (err) {
    console.error("editReview error:", err);
    return res.status(500).json({ message: "Failed to update review." });
  }
};

export const getReviews = async (req, res) => {
  const { perfume_id } = req.params;

  if (!perfume_id || isNaN(perfume_id)) {
    return res.status(400).json({ message: "Invalid perfume ID." });
  }

  try {
    const reviews = await Review.getReviewsByPerfume(Number(perfume_id));

    return res.status(200).json({
      reviews,
      message: reviews.length === 0 ? "No reviews yet. Be the first!" : null,
    });
  } catch (err) {
    console.error("getReviews error:", err);
    return res.status(500).json({ message: "Failed to fetch reviews." });
  }
};

export const addReview = async (req, res) => {
  const { perfume_id } = req.params;
  const user_id = req.user.userID;
  const { rating, comment } = req.body;

  // --- Validation ---
  if (!perfume_id || isNaN(perfume_id)) {
    return res.status(400).json({ message: "Invalid perfume ID." });
  }

  const ratingNum = Number(rating);
  if (!ratingNum || ratingNum < 1 || ratingNum > 5) {
    return res
      .status(400)
      .json({ message: "Rating must be a number between 1 and 5." });
  }

  if (!comment || comment.trim().length < 5) {
    return res
      .status(400)
      .json({ message: "Comment must be at least 5 characters." });
  }

  if (comment.trim().length > 1000) {
    return res
      .status(400)
      .json({ message: "Comment must not exceed 1000 characters." });
  }

  // --- Business Logic ---
  try {
    // Only buyers can review
    const hasPurchased = await Review.hasUserPurchasedPerfume(
      user_id,
      Number(perfume_id),
    );
    if (!hasPurchased) {
      return res.status(403).json({
        message: "You can only review products you have purchased.",
      });
    }

    // Prevent duplicate reviews
    const alreadyReviewed = await Review.hasUserAlreadyReviewed(
      user_id,
      Number(perfume_id),
    );
    if (alreadyReviewed) {
      return res
        .status(409)
        .json({ message: "You have already reviewed this product." });
    }

    const review_id = await Review.createReview(
      user_id,
      Number(perfume_id),
      ratingNum,
      comment.trim(),
    );

    return res.status(201).json({
      message: "Review submitted successfully.",
      review_id,
    });
  } catch (err) {
    console.error("addReview error:", err);
    return res.status(500).json({ message: "Failed to submit review." });
  }
};

export const removeReview = async (req, res) => {
  const { review_id } = req.params;
  const user_id = req.user.userID;

  if (!review_id || isNaN(review_id)) {
    return res.status(400).json({ message: "Invalid review ID." });
  }

  try {
    const affected = await Review.deleteReview(Number(review_id), user_id);

    if (affected === 0) {
      return res.status(404).json({
        message: "Review not found or you are not authorized to delete it.",
      });
    }

    return res.status(200).json({ message: "Review deleted successfully." });
  } catch (err) {
    console.error("removeReview error:", err);
    return res.status(500).json({ message: "Failed to delete review." });
  }
};
