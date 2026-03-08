import { useState, useEffect } from "react";
import { Star, Trash2, Pencil, CheckCircle2, ShoppingBag } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";

const ReviewSection = ({ perfumeId }) => {
  const { token, user } = useAuth();
  const location = useLocation();

  // Review State
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewMsg, setReviewMsg] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);

  // Edit Review State
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editRating, setEditRating] = useState(0);
  const [editHoverRating, setEditHoverRating] = useState(0);
  const [editComment, setEditComment] = useState("");
  const [updatingReview, setUpdatingReview] = useState(false);

  // Fetch reviews
  useEffect(() => {
    if (!perfumeId) return;
    const fetchReviews = async () => {
      setReviewsLoading(true);
      try {
        const res = await api.get(`/review/${perfumeId}`);
        setReviews(res.data.reviews || []);
        setReviewMsg(res.data.message || "");

        if (token && user) {
          const myReview = res.data.reviews?.find(
            (r) => r.user_id === user.userID,
          );
          if (myReview) setAlreadyReviewed(true);
          else {
            setCanReview(true);
          }
        }
      } catch {
        setReviewMsg("Failed to load reviews.");
      } finally {
        setReviewsLoading(false);
      }
    };
    fetchReviews();
  }, [perfumeId, token, user]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!rating) return;
    if (!comment.trim() || comment.trim().length < 5) return;

    setSubmittingReview(true);
    try {
      await api.post(
        `/review/${perfumeId}`,
        { rating, comment: comment.trim() },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const res = await api.get(`/review/${perfumeId}`);
      setReviews(res.data.reviews || []);
      setReviewMsg(res.data.message || "");
      setAlreadyReviewed(true);
      setRating(0);
      setComment("");
      toast.success("Review submitted!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit review.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (review_id) => {
    try {
      await api.delete(`/review/${review_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReviews((prev) => prev.filter((r) => r.review_id !== review_id));
      if (editingReviewId === review_id) setEditingReviewId(null);
      setAlreadyReviewed(false);
      setCanReview(true);
      toast.success("Review deleted.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete review.");
    }
  };

  const handleStartEdit = (review) => {
    setEditingReviewId(review.review_id);
    setEditRating(review.rating);
    setEditComment(review.comment);
  };

  const handleUpdateReview = async (e) => {
    e.preventDefault();
    if (!editRating) return;
    if (!editComment.trim() || editComment.trim().length < 5) return;

    setUpdatingReview(true);
    try {
      await api.put(
        `/review/${editingReviewId}`,
        { rating: editRating, comment: editComment.trim() },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setReviews((prev) =>
        prev.map((r) =>
          r.review_id === editingReviewId
            ? { ...r, rating: editRating, comment: editComment.trim() }
            : r,
        ),
      );
      setEditingReviewId(null);
      toast.success("Review updated!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update review.");
    } finally {
      setUpdatingReview(false);
    }
  };

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div className="mt-16 mb-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-serif font-bold text-gray-900">
            Customer Reviews
          </h2>
          {avgRating && (
            <div className="flex items-center mt-2 gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={18}
                    fill={s <= Math.round(avgRating) ? "#15803d" : "none"}
                    stroke={s <= Math.round(avgRating) ? "#15803d" : "#d1d5db"}
                  />
                ))}
              </div>
              <span className="text-xl font-bold text-green-900">
                {avgRating}
              </span>
              <span className="text-sm text-gray-400">
                ({reviews.length} {reviews.length === 1 ? "review" : "reviews"})
              </span>
            </div>
          )}
        </div>
      </div>

      {token && user && !alreadyReviewed && canReview && (
        <form
          onSubmit={handleSubmitReview}
          className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-8"
        >
          <h3 className="text-lg font-serif font-bold text-gray-900 mb-4">
            Write a Review
          </h3>
          <div className="flex items-center gap-1 mb-4">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                type="button"
                onMouseEnter={() => setHoverRating(s)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(s)}
                className="focus:outline-none"
              >
                <Star
                  size={28}
                  fill={(hoverRating || rating) >= s ? "#15803d" : "none"}
                  stroke={(hoverRating || rating) >= s ? "#15803d" : "#d1d5db"}
                  className="transition-all"
                />
              </button>
            ))}
            {rating > 0 && (
              <span className="text-sm text-gray-500 ml-2">
                {
                  ["Terrible", "Poor", "Average", "Good", "Excellent"][
                    rating - 1
                  ]
                }
              </span>
            )}
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this fragrance..."
            rows={4}
            minLength={5}
            maxLength={1000}
            required
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-900/20 focus:border-green-900 resize-none transition-all"
          />
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-gray-400">{comment.length}/1000</span>
            <button
              type="submit"
              disabled={
                submittingReview || !rating || comment.trim().length < 5
              }
              className="px-6 py-2 bg-green-900 text-white rounded-full text-sm font-bold hover:bg-green-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submittingReview ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </form>
      )}

      {!token && !user && (
        <div className="bg-gray-50 rounded-2xl p-8 border border-dashed border-gray-200 text-center mb-8">
          <ShoppingBag size={40} className="mx-auto text-gray-300 mb-3" />
          <h3 className="text-lg font-serif font-bold text-gray-900 mb-2">
            Share Your Experience
          </h3>
          <p className="text-gray-500 mb-4 max-w-sm mx-auto">
            Only verified purchasers can leave reviews. Please sign in to share
            your thoughts on this fragrance.
          </p>
          <Link
            to="/login"
            state={{ from: location.pathname }}
            className="inline-flex items-center px-6 py-2 bg-green-900 text-white rounded-full text-sm font-bold hover:bg-green-800 transition-all shadow-lg hover:shadow-green-900/20"
          >
            Sign In to Review
          </Link>
        </div>
      )}

      {alreadyReviewed && (
        <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-6 text-sm font-medium">
          <CheckCircle2 size={16} />
          You've already reviewed this product.
        </div>
      )}

      {reviewsLoading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-900"></div>
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <Star size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">
            {reviewMsg || "No reviews yet."}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            Be the first to share your experience!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.review_id}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative"
            >
              {editingReviewId === review.review_id ? (
                <form onSubmit={handleUpdateReview} className="space-y-4">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onMouseEnter={() => setEditHoverRating(s)}
                        onMouseLeave={() => setEditHoverRating(0)}
                        onClick={() => setEditRating(s)}
                        className="focus:outline-none"
                      >
                        <Star
                          size={24}
                          fill={
                            (editHoverRating || editRating) >= s
                              ? "#15803d"
                              : "none"
                          }
                          stroke={
                            (editHoverRating || editRating) >= s
                              ? "#15803d"
                              : "#d1d5db"
                          }
                          className="transition-all"
                        />
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={editComment}
                    onChange={(e) => setEditComment(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-900 resize-none"
                    required
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingReviewId(null)}
                      className="px-4 py-2 text-gray-500 text-sm font-bold hover:bg-gray-50 rounded-full"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={updatingReview}
                      className="px-6 py-2 bg-green-900 text-white rounded-full text-sm font-bold hover:bg-green-800 disabled:opacity-50"
                    >
                      {updatingReview ? "Updating..." : "Update Review"}
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-900 font-bold text-sm shrink-0">
                        {review.reviewer_name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">
                          {review.reviewer_name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(review.created_at).toLocaleDateString(
                            "en-US",
                            {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            },
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            size={14}
                            fill={s <= review.rating ? "#15803d" : "none"}
                            stroke={s <= review.rating ? "#15803d" : "#d1d5db"}
                          />
                        ))}
                      </div>
                      {user && review.user_id === user.userID && (
                        <div className="flex items-center ml-2 border-l border-gray-100 pl-2 gap-1">
                          <button
                            onClick={() => handleStartEdit(review)}
                            className="p-1.5 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
                            title="Edit Review"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteReview(review.review_id)}
                            className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                            title="Delete Review"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed mt-3">
                    {review.comment}
                  </p>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewSection;
