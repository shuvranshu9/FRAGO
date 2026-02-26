import { useState, useEffect, useCallback } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Wind,
  Activity,
  Droplet,
  Clock,
  ShieldCheck,
  Package,
  ChevronLeft,
  ChevronRight,
  Heart,
  Plus,
  Minus,
  ShoppingBag,
  Store,
  Mail,
  Phone,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  Star,
  Trash2,
  Pencil,
} from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { useWishlist } from "../../context/WishlistContext";
import { useCart } from "../../context/CartContext";
import api from "../../utils/api";
import { extractIdFromSlug } from "../../utils/slug";

const ProductDetailsPage = () => {
  const { slug } = useParams();
  const id = extractIdFromSlug(slug);
  const location = useLocation();
  const from = location.state?.from || "/perfumes";
  const { token, user } = useAuth();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  // Review State
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewMsg, setReviewMsg] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [canReview, setCanReview] = useState(false); // buyer check result
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);

  // Edit Review State
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editRating, setEditRating] = useState(0);
  const [editHoverRating, setEditHoverRating] = useState(0);
  const [editComment, setEditComment] = useState("");
  const [updatingReview, setUpdatingReview] = useState(false);

  const handleNextImage = useCallback(() => {
    if (!product?.images) return;
    setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
  }, [product?.images]);

  const handlePrevImage = useCallback(() => {
    if (!product?.images) return;
    setCurrentImageIndex(
      (prev) => (prev - 1 + product.images.length) % product.images.length,
    );
  }, [product?.images]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight") handleNextImage();
      if (e.key === "ArrowLeft") handlePrevImage();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNextImage, handlePrevImage]);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const response = await api.get(`/perfume/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data.success) {
          const fetchedProduct = response.data.data;
          setProduct(fetchedProduct);
          if (fetchedProduct.variants && fetchedProduct.variants.length > 0) {
            setSelectedVariantId(fetchedProduct.variants[0].variant_id);
          }
        } else {
          toast.error(
            response.data.message || "Failed to load perfume details",
          );
        }
      } catch (error) {
        console.error("Error fetching product details:", error);
        toast.error("Failed to load perfume details");
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id, token]);

  // Fetch reviews
  useEffect(() => {
    if (!id) return;
    const fetchReviews = async () => {
      setReviewsLoading(true);
      try {
        const res = await api.get(`/review/${id}`);
        setReviews(res.data.reviews || []);
        setReviewMsg(res.data.message || "");

        // Check if current buyer can review
        if (token && user) {
          const myReview = res.data.reviews?.find(
            (r) => r.user_id === user.userID,
          );
          if (myReview) setAlreadyReviewed(true);
          else {
            // Buyer check via order presence (server handles this on POST, but we can optimistically check)
            setCanReview(true); // Will be denied by server if not a buyer
          }
        }
      } catch {
        setReviewMsg("Failed to load reviews.");
      } finally {
        setReviewsLoading(false);
      }
    };
    fetchReviews();
  }, [id, token, user]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!rating) {
      return;
    }
    if (!comment.trim() || comment.trim().length < 5) {
      return;
    }
    setSubmittingReview(true);
    try {
      await api.post(
        `/review/${id}`,
        { rating, comment: comment.trim() },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      // Refresh reviews
      const res = await api.get(`/review/${id}`);
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

  const handleAddToCart = async () => {
    if (!selectedVariantId) {
      toast.error("Please select a size first");
      return;
    }

    setAddingToCart(true);
    const result = await addToCart(selectedVariantId, quantity);

    if (result.success) {
      toast.success(result.message || "Added to cart!");
      // Reset quantity after successful add if desired
      setQuantity(1);
    } else {
      toast.error(result.message || "Failed to add to cart");
    }
    setAddingToCart(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-900"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-600">
        <h2 className="text-2xl font-serif font-bold mb-4">
          Perfume Not Found
        </h2>
        <Link to="/" className="text-green-900 hover:underline">
          Return Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-0 pb-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <Link
          to={from}
          className="inline-flex items-center text-gray-500 hover:text-green-900 transition-colors mb-8 group"
        >
          <ArrowLeft
            size={20}
            className="mr-2 group-hover:-translate-x-1 transition-transform"
          />
          {from.includes("vendor")
            ? "Back to My Listings"
            : from.includes("wishlist")
              ? "Back to Wishlist"
              : "Back to Perfumes"}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Image Section */}
          <div className="relative group/gallery">
            <div className="aspect-[4/5] bg-gray-50 rounded-3xl overflow-hidden shadow-2xl relative">
              {product.images && product.images.length > 0 ? (
                <>
                  <img
                    src={product.images[currentImageIndex]}
                    alt={product.name}
                    className="w-full h-full object-cover transition-opacity duration-500"
                    key={currentImageIndex}
                  />

                  {/* Navigation Arrows */}
                  {product.images.length > 1 && (
                    <>
                      <button
                        onClick={handlePrevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/80 backdrop-blur rounded-full text-gray-800 opacity-0 group-hover/gallery:opacity-100 transition-all hover:bg-white hover:scale-110 shadow-lg z-10"
                        aria-label="Previous image"
                      >
                        <ChevronLeft size={24} />
                      </button>
                      <button
                        onClick={handleNextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/80 backdrop-blur rounded-full text-gray-800 opacity-0 group-hover/gallery:opacity-100 transition-all hover:bg-white hover:scale-110 shadow-lg z-10"
                        aria-label="Next image"
                      >
                        <ChevronRight size={24} />
                      </button>

                      {/* Dot Indicator */}
                      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                        {product.images.map((_, idx) => (
                          <div
                            key={idx}
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                              idx === currentImageIndex
                                ? "w-6 bg-green-900"
                                : "w-1.5 bg-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                  <Package size={80} />
                  <span className="mt-4 text-sm font-medium">
                    No Image Available
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnail Gallery (if multiple images) */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-4 mt-6 scrollbar-hide overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`relative w-24 h-24 flex-shrink-0 rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
                      idx === currentImageIndex
                        ? "border-green-900 ring-4 ring-green-900/10 scale-95"
                        : "border-transparent hover:border-gray-200"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} ${idx + 1}`}
                      className={`w-full h-full object-cover transition-opacity duration-300 ${
                        idx === currentImageIndex
                          ? "opacity-100"
                          : "opacity-60 hover:opacity-100"
                      }`}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="flex flex-col">
            <div className="mb-8">
              <p className="text-xs md:text-sm uppercase tracking-[0.3em] text-gray-400 font-bold mb-3">
                {product.brand}
              </p>
              <div className="flex justify-between items-start mb-4">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-gray-900 leading-tight">
                  {product.name}
                </h1>
                <button
                  onClick={() => toggleWishlist(product.perfume_id)}
                  className={`p-4 rounded-2xl shadow-sm transition-all duration-300 active:scale-95 border ${
                    isInWishlist(product.perfume_id)
                      ? "bg-green-50 border-green-200 text-green-900"
                      : "bg-white border-gray-100 text-gray-400 hover:text-red-500 hover:bg-red-50 hover:border-red-100"
                  }`}
                >
                  <Heart
                    size={28}
                    fill={
                      isInWishlist(product.perfume_id) ? "currentColor" : "none"
                    }
                  />
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-gray-500 text-sm">
                <div className="flex items-center">
                  <Wind size={16} className="mr-2 text-green-800" />
                  {product.scent_type || "Signature Scent"}
                </div>
                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                <div className="flex items-center">
                  <Activity size={16} className="mr-2 text-green-800" />
                  {product.mood || "Elevating"}
                </div>
              </div>
            </div>

            <div className="space-y-8">
              {/* Variants / Pricing Section */}
              {product.variants && product.variants.length > 0 && (
                <div className="pb-8 border-b border-gray-100">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-6">
                    Available Sizes
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {product.variants.map((v) => (
                      <button
                        key={v.variant_id}
                        onClick={() => {
                          setSelectedVariantId(v.variant_id);
                          setQuantity(1);
                        }}
                        className={`flex items-center justify-between p-6 rounded-2xl border-2 transition-all duration-300 ${
                          selectedVariantId === v.variant_id
                            ? "border-green-900 bg-green-50 shadow-md scale-[1.02]"
                            : "border-gray-100 hover:border-gray-200 bg-white"
                        } ${v.stock_quantity === 0 ? "opacity-60 grayscale-[0.5]" : ""}`}
                      >
                        <div className="flex flex-col items-start gap-1">
                          <p
                            className={`text-[10px] font-bold uppercase tracking-widest ${
                              selectedVariantId === v.variant_id
                                ? "text-green-800"
                                : "text-gray-400"
                            }`}
                          >
                            Size
                          </p>
                          <p className="text-lg font-serif font-bold text-gray-900">
                            {v.size_ml}ml
                          </p>
                          {/* Stock Badge */}
                          <div className="mt-1">
                            {v.stock_quantity > 10 ? (
                              <span className="flex items-center text-[10px] font-bold text-green-700 uppercase bg-green-100/50 px-2 py-0.5 rounded-full">
                                <CheckCircle2 size={10} className="mr-1" />
                                In Stock: {v.stock_quantity}
                              </span>
                            ) : v.stock_quantity > 0 ? (
                              <span className="flex items-center text-[10px] font-bold text-orange-700 uppercase bg-orange-100/50 px-2 py-0.5 rounded-full">
                                <AlertTriangle size={10} className="mr-1" />
                                In Stock: {v.stock_quantity}
                              </span>
                            ) : (
                              <span className="flex items-center text-[10px] font-bold text-red-700 uppercase bg-red-100/50 px-2 py-0.5 rounded-full">
                                <XCircle size={10} className="mr-1" />
                                Out of Stock
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p
                            className={`text-xs font-bold uppercase tracking-tighter mb-1 ${
                              selectedVariantId === v.variant_id
                                ? "text-green-800"
                                : "text-gray-400"
                            }`}
                          >
                            Price
                          </p>
                          <p className="text-xl font-bold text-green-900">
                            Rs. {v.price.toLocaleString()}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Quantity and Add to Cart */}
                  <div className="mt-8 flex flex-col sm:flex-row gap-4 mb-4">
                    <div className="flex items-center bg-gray-50 rounded-full border border-gray-100 p-2 sm:w-1/3">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={
                          product.variants.find(
                            (v) => v.variant_id === selectedVariantId,
                          )?.stock_quantity === 0
                        }
                        className="p-3 rounded-full text-gray-600 hover:bg-white hover:shadow-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Minus size={20} />
                      </button>
                      <span className="flex-1 text-center font-bold text-lg select-none text-gray-900">
                        {product.variants.find(
                          (v) => v.variant_id === selectedVariantId,
                        )?.stock_quantity === 0
                          ? 0
                          : quantity}
                      </span>
                      <button
                        onClick={() => {
                          const selectedVariant = product.variants.find(
                            (v) => v.variant_id === selectedVariantId,
                          );
                          const maxStock = selectedVariant
                            ? selectedVariant.stock_quantity
                            : 99;
                          setQuantity(Math.min(maxStock, quantity + 1));
                        }}
                        disabled={
                          product.variants.find(
                            (v) => v.variant_id === selectedVariantId,
                          )?.stock_quantity === 0 ||
                          quantity >=
                            (product.variants.find(
                              (v) => v.variant_id === selectedVariantId,
                            )?.stock_quantity || 0)
                        }
                        className="p-3 rounded-full text-gray-600 hover:bg-white hover:shadow-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Plus size={20} />
                      </button>
                    </div>
                    <button
                      onClick={handleAddToCart}
                      disabled={
                        addingToCart ||
                        product.variants.find(
                          (v) => v.variant_id === selectedVariantId,
                        )?.stock_quantity === 0
                      }
                      className={`flex-1 flex items-center justify-center py-4 rounded-full font-bold text-lg transition-all shadow-xl ${
                        addingToCart ||
                        product.variants.find(
                          (v) => v.variant_id === selectedVariantId,
                        )?.stock_quantity === 0
                          ? "bg-gray-400 text-white cursor-not-allowed grayscale"
                          : "bg-green-900 text-white hover:bg-green-800 hover:shadow-green-900/30"
                      }`}
                    >
                      <ShoppingBag className="mr-3" size={24} />
                      {product.variants.find(
                        (v) => v.variant_id === selectedVariantId,
                      )?.stock_quantity === 0
                        ? "Sold Out"
                        : addingToCart
                          ? "Adding to Cart..."
                          : `Add to Cart - Rs. ${((product.variants.find((v) => v.variant_id === selectedVariantId)?.price || 0) * quantity).toLocaleString()}`}
                    </button>
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="pb-8 border-b border-gray-100">
                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-4">
                  About this Fragrance
                </h3>
                <p className="text-gray-600 leading-relaxed text-lg">
                  {product.description ||
                    "No description available for this exquisite fragrance."}
                </p>
              </div>

              {/* Attributes Grid */}
              <div className="grid grid-cols-2 gap-y-8 gap-x-4">
                <div className="flex items-start">
                  <div className="bg-green-50 p-3 rounded-xl mr-4">
                    <Droplet size={20} className="text-green-900" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                      Concentration
                    </h4>
                    <p className="font-medium text-gray-900">
                      {product.concentration || "Parfum"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-green-50 p-3 rounded-xl mr-4">
                    <MapPin size={20} className="text-green-900" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                      Origin
                    </h4>
                    <p className="font-medium text-gray-900">
                      {product.origin || "France"}
                    </p>
                  </div>
                </div>

                {product.long_lasting && (
                  <div className="flex items-start">
                    <div className="bg-green-50 p-3 rounded-xl mr-4">
                      <Clock size={20} className="text-green-900" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                        Longevity
                      </h4>
                      <p className="font-medium text-gray-900">8+ Hours</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Notes Section (if available) */}
              {product.top_notes ||
              product.middle_notes ||
              product.base_notes ? (
                <div className="bg-gray-50 rounded-3xl p-8 space-y-6">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-2 flex items-center">
                    <Wind size={18} className="mr-2" />
                    Scent Profile
                  </h3>
                  <div className="space-y-4">
                    {product.top_notes && (
                      <div>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter">
                          Top Notes
                        </span>
                        <p className="text-gray-700">{product.top_notes}</p>
                      </div>
                    )}
                    {product.middle_notes && (
                      <div>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter">
                          Heart Notes
                        </span>
                        <p className="text-gray-700">{product.middle_notes}</p>
                      </div>
                    )}
                    {product.base_notes && (
                      <div>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter">
                          Base Notes
                        </span>
                        <p className="text-gray-700">{product.base_notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : null}

              {/* Security/Trust Banner */}
              <div className="bg-green-900 text-white rounded-3xl p-8 flex items-center justify-between">
                <div className="flex items-center">
                  <ShieldCheck size={32} className="text-green-400 mr-4" />
                  <div>
                    <h4 className="font-bold text-lg">Fragrance Guarantee</h4>
                    <p className="text-green-100/70 text-sm">
                      Verified authentic & quality checked
                    </p>
                  </div>
                </div>
                <div className="hidden md:block">
                  <Link
                    to="/contact-us"
                    className="px-6 py-2 bg-white text-green-900 rounded-full font-bold text-sm hover:bg-green-50 transition-colors"
                  >
                    Inquire
                  </Link>
                </div>
              </div>

              {/* Vendor Information Section */}
              <div className="pt-12 mt-12 border-t border-gray-100">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-900 border border-green-100">
                    <Store size={20} />
                  </div>
                  <h3 className="text-xl font-serif font-bold text-gray-900">
                    Vendor Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-gray-50 rounded-[2rem] p-8 border border-gray-100/50">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                      Sold By
                    </p>
                    <h4 className="text-2xl font-serif font-bold text-gray-900 mb-2">
                      {product.vendor_name || "Official Store"}
                    </h4>
                    <div className="flex items-center text-gray-500 text-sm italic">
                      <ShieldCheck size={14} className="mr-2 text-green-700" />
                      Verified Professional Vendor
                    </div>
                  </div>

                  <div className="space-y-6 flex flex-col justify-center">
                    <div className="flex items-center group">
                      <div className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 group-hover:text-green-900 group-hover:border-green-100 group-hover:bg-green-50 transition-all mr-4 shadow-sm">
                        <MapPin size={18} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          Location
                        </p>
                        <p className="text-gray-900 font-medium capitalize">
                          {product.vendor_address || "Nepal"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center group">
                      <div className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 group-hover:text-green-900 group-hover:border-green-100 group-hover:bg-green-50 transition-all mr-4 shadow-sm">
                        <Phone size={18} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          Contact
                        </p>
                        <p className="text-gray-900 font-medium">
                          {product.vendor_phone || "+977-98XXXXXXXX"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center group">
                      <div className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 group-hover:text-green-900 group-hover:border-green-100 group-hover:bg-green-50 transition-all mr-4 shadow-sm">
                        <Mail size={18} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          Email
                        </p>
                        <p className="text-gray-900 font-medium">
                          {product.vendor_email || "contact@frago.com"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ======================= REVIEW SECTION ======================= */}
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
                        stroke={
                          s <= Math.round(avgRating) ? "#15803d" : "#d1d5db"
                        }
                      />
                    ))}
                  </div>
                  <span className="text-xl font-bold text-green-900">
                    {avgRating}
                  </span>
                  <span className="text-sm text-gray-400">
                    ({reviews.length}{" "}
                    {reviews.length === 1 ? "review" : "reviews"})
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Review Form — shown to logged-in potential buyers only */}
          {token && user && !alreadyReviewed && canReview && (
            <form
              onSubmit={handleSubmitReview}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-8"
            >
              <h3 className="text-lg font-serif font-bold text-gray-900 mb-4">
                Write a Review
              </h3>

              {/* Star Picker */}
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
                      stroke={
                        (hoverRating || rating) >= s ? "#15803d" : "#d1d5db"
                      }
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

              {/* Comment Box */}
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
                <span className="text-xs text-gray-400">
                  {comment.length}/1000
                </span>
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

          {alreadyReviewed && (
            <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-6 text-sm font-medium">
              <CheckCircle2 size={16} />
              You've already reviewed this product.
            </div>
          )}

          {/* Reviews List */}
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
                    /* Edit Form */
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
                    /* Review View */
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
                                stroke={
                                  s <= review.rating ? "#15803d" : "#d1d5db"
                                }
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
                                onClick={() =>
                                  handleDeleteReview(review.review_id)
                                }
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
        {/* ==================== END REVIEW SECTION ==================== */}
      </div>
    </div>
  );
};

export default ProductDetailsPage;
