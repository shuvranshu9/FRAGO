import { useState, useEffect, useCallback } from "react";
import { X, Plus, Trash2, Upload, AlertCircle } from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

const ProductForm = ({ initialData, onSubmit, loading }) => {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    description: "",
    category_id: "",
    scent_type: "",
    mood: "",
    origin: "",
    gender: "UNISEX",
  });

  const [variants, setVariants] = useState([
    { size_ml: "", price: "", stock_quantity: "" },
  ]);
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [variantTouched, setVariantTouched] = useState([
    { size_ml: false, price: false, stock_quantity: false },
  ]);
  const [variantErrors, setVariantErrors] = useState([
    { size_ml: "", price: "", stock_quantity: "" },
  ]);

  // Initialize form with initialData when component mounts or initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        brand: initialData.brand || "",
        description: initialData.description || "",
        category_id: initialData.category_id || "",
        scent_type: initialData.scent_type || "",
        mood: initialData.mood || "",
        origin: initialData.origin || "",
        gender: initialData.gender || "UNISEX",
      });

      setVariants(
        initialData.variants?.length > 0
          ? initialData.variants
          : [{ size_ml: "", price: "", stock_quantity: "" }],
      );

      setVariantTouched(
        initialData.variants?.length > 0
          ? initialData.variants.map(() => ({
            size_ml: false,
            price: false,
            stock_quantity: false,
          }))
          : [{ size_ml: false, price: false, stock_quantity: false }],
      );

      setVariantErrors(
        initialData.variants?.length > 0
          ? initialData.variants.map(() => ({
            size_ml: "",
            price: "",
            stock_quantity: "",
          }))
          : [{ size_ml: "", price: "", stock_quantity: "" }],
      );

      setExistingImages(initialData.images || []);
    }
  }, [initialData]);

  const validateField = (name, value) => {
    if (name === "name" && !String(value || "").trim()) {
      return "Product name is required";
    }
    if (name === "brand" && !String(value || "").trim()) {
      return "Brand name is required";
    }
    if (name === "category_id" && !String(value || "").trim()) {
      return "Category is required";
    }
    if (name === "scent_type" && !String(value || "").trim()) {
      return "Scent type is required";
    }
    if (name === "mood" && !String(value || "").trim()) {
      return "Mood is required";
    }
    if (name === "origin" && !String(value || "").trim()) {
      return "Origin is required";
    }
    return "";
  };

  const validateVariantField = (field, value) => {
    if (!String(value || "").trim()) {
      if (field === "size_ml") return "Size is required";
      if (field === "price") return "Price is required";
      if (field === "stock_quantity") return "Stock is required";
    }
    return "";
  };

  const validateAll = () => {
    const newErrors = {
      name: validateField("name", formData.name),
      brand: validateField("brand", formData.brand),
      category_id: validateField("category_id", formData.category_id),
      scent_type: validateField("scent_type", formData.scent_type),
      mood: validateField("mood", formData.mood),
      origin: validateField("origin", formData.origin),
    };

    const newVariantErrors = variants.map((v) => {
      const isCompletelyEmpty =
        !String(v.size_ml || "").trim() &&
        !String(v.price || "").trim() &&
        !String(v.stock_quantity || "").trim();

      // If user hasn't started this row (and there are other rows), don't force errors.
      // But when submitting with nothing filled, we still want the first row errors.
      if (isCompletelyEmpty) {
        return { size_ml: "", price: "", stock_quantity: "" };
      }

      return {
        size_ml: validateVariantField("size_ml", v.size_ml),
        price: validateVariantField("price", v.price),
        stock_quantity: validateVariantField("stock_quantity", v.stock_quantity),
      };
    });

    const validVariants = variants.filter(
      (v) =>
        String(v.size_ml || "").trim() &&
        String(v.price || "").trim() &&
        String(v.stock_quantity || "").trim(),
    );

    // If nothing valid, enforce required errors on the first row.
    if (validVariants.length === 0) {
      newVariantErrors[0] = {
        size_ml: "Size is required",
        price: "Price is required",
        stock_quantity: "Stock is required",
      };
    }

    setErrors(newErrors);
    setVariantErrors(newVariantErrors);

    const hasAtLeastOneImage = existingImages.length + images.length > 0;
    if (!hasAtLeastOneImage) {
      setErrors((prev) => ({ ...prev, images: "At least one image is required" }));
    } else {
      setErrors((prev) => {
        if (!prev.images) return prev;
        const { images: _images, ...rest } = prev;
        return rest;
      });
    }

    const basicValid =
      !newErrors.name &&
      !newErrors.brand &&
      !newErrors.category_id &&
      !newErrors.scent_type &&
      !newErrors.mood &&
      !newErrors.origin;
    const variantsValid = validVariants.length > 0;
    return {
      basicValid: basicValid && hasAtLeastOneImage,
      variantsValid,
      validVariants,
    };
  };

  const fetchCategories = useCallback(async () => {
    if (isLoadingCategories) return;

    setIsLoadingCategories(true);
    try {
      const response = await axios.get("http://localhost:8000/api/category");
      let fetchedCategories = response.data;

      const topCategories = [
        "Floral",
        "Woody",
        "Oriental",
        "Fresh",
        "Citrus",
        "Gourmand",
        "Aromatic",
        "Chypre",
        "Fougere",
        "Leather",
      ];

      const existingNames = fetchedCategories.map((c) =>
        c.category_name.toLowerCase().trim(),
      );

      const missingCategories = topCategories.filter(
        (cat) => !existingNames.includes(cat.toLowerCase().trim()),
      );

      if (missingCategories.length > 0 && token) {
        const seedingAttempted = localStorage.getItem("categories_seeded");

        if (!seedingAttempted) {
          localStorage.setItem("categories_seeded", "true");

          for (const cat of missingCategories) {
            try {
              await axios.post(
                "http://localhost:8000/api/category",
                {
                  category_name: cat,
                  description: `${cat} fragrance family`,
                },
                { headers: { Authorization: `Bearer ${token}` } },
              );
            } catch (err) {
              if (err.response?.status !== 409) {
                console.error(`Error creating category ${cat}:`, err);
              }
            }
          }

          const secondResponse = await axios.get(
            "http://localhost:8000/api/category",
          );
          fetchedCategories = secondResponse.data;
        }
      }

      setCategories(fetchedCategories);
    } catch (error) {
      console.error("Error fetching/seeding categories:", error);
      toast.error("Failed to load categories");
    } finally {
      setIsLoadingCategories(false);
    }
  }, [token, isLoadingCategories]);

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (touched[name]) {
      const nextError = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: nextError }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const nextError = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: nextError }));
  };

  const handleVariantChange = (index, field, value) => {
    const newVariants = [...variants];
    newVariants[index][field] = value;
    setVariants(newVariants);

    if (variantTouched[index]?.[field]) {
      const next = [...variantErrors];
      next[index] = {
        ...next[index],
        [field]: validateVariantField(field, value),
      };
      setVariantErrors(next);
    }
  };

  const handleVariantBlur = (index, field, value) => {
    const nextTouched = [...variantTouched];
    nextTouched[index] = {
      ...(nextTouched[index] || {
        size_ml: false,
        price: false,
        stock_quantity: false,
      }),
      [field]: true,
    };
    setVariantTouched(nextTouched);

    const nextErrors = [...variantErrors];
    nextErrors[index] = {
      ...(nextErrors[index] || { size_ml: "", price: "", stock_quantity: "" }),
      [field]: validateVariantField(field, value),
    };
    setVariantErrors(nextErrors);
  };

  const addVariant = () => {
    setVariants([...variants, { size_ml: "", price: "", stock_quantity: "" }]);
    setVariantTouched([
      ...variantTouched,
      { size_ml: false, price: false, stock_quantity: false },
    ]);
    setVariantErrors([
      ...variantErrors,
      { size_ml: "", price: "", stock_quantity: "" },
    ]);
  };

  const removeVariant = (index) => {
    if (variants.length === 1) return;
    setVariants(variants.filter((_, i) => i !== index));
    setVariantTouched(variantTouched.filter((_, i) => i !== index));
    setVariantErrors(variantErrors.filter((_, i) => i !== index));
  };

  const handleImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);

    const allowedMimeTypes = new Set([
      "image/jpeg",
      "image/png",
      "image/avif",
    ]);

    const validFiles = selectedFiles.filter((file) =>
      allowedMimeTypes.has(file.type),
    );

    const invalidCount = selectedFiles.length - validFiles.length;
    if (invalidCount > 0) {
      toast.error("Only JPG, PNG, or AVIF images are allowed");
    }

    if (validFiles.length === 0) {
      e.target.value = "";
      return;
    }

    if (validFiles.length + previews.length + existingImages.length > 5) {
      toast.warning("Maximum 5 images allowed");
      e.target.value = "";
      return;
    }

    setImages((prev) => [...prev, ...validFiles]);

    // Create previews
    const newPreviews = validFiles.map((file) => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...newPreviews]);

    e.target.value = "";
  };

  const removePreview = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);

    const newPreviews = [...previews];
    URL.revokeObjectURL(newPreviews[index]);
    newPreviews.splice(index, 1);
    setPreviews(newPreviews);
  };

  const removeExistingImage = (url) => {
    setExistingImages((prev) => prev.filter((img) => img !== url));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Mark required fields as touched on submit
    setTouched((prev) => ({
      ...prev,
      name: true,
      brand: true,
      category_id: true,
      scent_type: true,
      mood: true,
      origin: true,
      images: true,
    }));
    setVariantTouched((prev) => {
      const next = [...prev];
      if (!next[0]) next[0] = { size_ml: false, price: false, stock_quantity: false };
      next[0] = { size_ml: true, price: true, stock_quantity: true };
      return next;
    });

    const { basicValid, variantsValid, validVariants } = validateAll();
    if (!basicValid || !variantsValid) {
      toast.error("Please fill all the required fields in the form");
      return;
    }

    const submitData = new FormData();
    Object.keys(formData).forEach((key) => {
      submitData.append(key, formData[key]);
    });
    submitData.append("variants", JSON.stringify(validVariants));

    images.forEach((image) => {
      submitData.append("images", image);
    });

    submitData.append("existingImages", JSON.stringify(existingImages));

    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8" noValidate>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Basic Info */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
          <h2 className="text-xl font-serif font-bold text-gray-900 border-b pb-4">
            Basic Information
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-4 py-3 bg-gray-50 rounded-xl focus:ring-2 focus:ring-green-900/10 ${touched.name && errors.name ? "ring-2 ring-red-500/30" : ""
                  }`}
                placeholder="e.g. Oud Royale"
              />
              {touched.name && errors.name && (
                <p className="mt-1 text-xs text-red-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Brand Name *
              </label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-4 py-3 bg-gray-50 rounded-xl focus:ring-2 focus:ring-green-900/10 ${touched.brand && errors.brand ? "ring-2 ring-red-500/30" : ""
                  }`}
                placeholder="e.g. Frago Signature"
              />
              {touched.brand && errors.brand && (
                <p className="mt-1 text-xs text-red-600">{errors.brand}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full px-4 py-3 bg-gray-50 rounded-xl focus:ring-2 focus:ring-green-900/10 ${touched.category_id && errors.category_id
                      ? "ring-2 ring-red-500/30"
                      : ""
                    }`}
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.category_id} value={cat.category_id}>
                      {cat.category_name}
                    </option>
                  ))}
                </select>
                {touched.category_id && errors.category_id && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.category_id}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Scent Type *
                </label>
                <input
                  type="text"
                  name="scent_type"
                  value={formData.scent_type}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full px-4 py-3 bg-gray-50 rounded-xl focus:ring-2 focus:ring-green-900/10 ${touched.scent_type && errors.scent_type
                      ? "ring-2 ring-red-500/30"
                      : ""
                    }`}
                  placeholder="e.g. Woody, Floral"
                />
                {touched.scent_type && errors.scent_type && (
                  <p className="mt-1 text-xs text-red-600">{errors.scent_type}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Gender *
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-green-900/10"
                >
                  <option value="MEN">Men</option>
                  <option value="WOMEN">Women</option>
                  <option value="UNISEX">Unisex</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-green-900/10 min-h-30"
                placeholder="Describe your fragrance story..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Mood *
                </label>
                <input
                  type="text"
                  name="mood"
                  value={formData.mood}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full px-4 py-3 bg-gray-50 rounded-xl focus:ring-2 focus:ring-green-900/10 ${touched.mood && errors.mood ? "ring-2 ring-red-500/30" : ""
                    }`}
                  placeholder="e.g. Romantic, Energetic"
                />
                {touched.mood && errors.mood && (
                  <p className="mt-1 text-xs text-red-600">{errors.mood}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Origin *
                </label>
                <input
                  type="text"
                  name="origin"
                  value={formData.origin}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full px-4 py-3 bg-gray-50 rounded-xl focus:ring-2 focus:ring-green-900/10 ${touched.origin && errors.origin
                      ? "ring-2 ring-red-500/30"
                      : ""
                    }`}
                  placeholder="e.g. France, UAE"
                />
                {touched.origin && errors.origin && (
                  <p className="mt-1 text-xs text-red-600">{errors.origin}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Variants */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <h2 className="text-xl font-serif font-bold text-gray-900">
                Variants & Pricing
              </h2>
              <button
                type="button"
                onClick={addVariant}
                className="text-sm font-bold text-green-900 flex items-center hover:underline"
              >
                <Plus size={16} className="mr-1" /> Add Variant
              </button>
            </div>

            <div className="space-y-4">
              {variants.map((variant, index) => (
                <div
                  key={index}
                  className="flex gap-3 items-end p-4 bg-gray-50 rounded-2xl relative"
                >
                  <div className="flex-1">
                    <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">
                      Size (ml)
                    </label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={variant.size_ml}
                      onChange={(e) =>
                        handleVariantChange(index, "size_ml", e.target.value)
                      }
                      onBlur={(e) =>
                        handleVariantBlur(index, "size_ml", e.target.value)
                      }
                      className={`w-full px-3 py-2 bg-white rounded-lg focus:ring-2 focus:ring-green-900/10 ${variantTouched[index]?.size_ml &&
                          variantErrors[index]?.size_ml
                          ? "ring-2 ring-red-500/30"
                          : ""
                        }`}
                      placeholder="ml"
                    />
                    {variantTouched[index]?.size_ml &&
                      variantErrors[index]?.size_ml && (
                        <p className="mt-1 text-[10px] text-red-600">
                          {variantErrors[index].size_ml}
                        </p>
                      )}
                  </div>
                  <div className="flex-1">
                    <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">
                      Price (NPR)
                    </label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={variant.price}
                      onChange={(e) =>
                        handleVariantChange(index, "price", e.target.value)
                      }
                      onBlur={(e) =>
                        handleVariantBlur(index, "price", e.target.value)
                      }
                      className={`w-full px-3 py-2 bg-white rounded-lg focus:ring-2 focus:ring-green-900/10 ${variantTouched[index]?.price && variantErrors[index]?.price
                          ? "ring-2 ring-red-500/30"
                          : ""
                        }`}
                      placeholder="NPR"
                    />
                    {variantTouched[index]?.price && variantErrors[index]?.price && (
                      <p className="mt-1 text-[10px] text-red-600">
                        {variantErrors[index].price}
                      </p>
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">
                      Stock
                    </label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={variant.stock_quantity}
                      onChange={(e) =>
                        handleVariantChange(
                          index,
                          "stock_quantity",
                          e.target.value,
                        )
                      }
                      onBlur={(e) =>
                        handleVariantBlur(index, "stock_quantity", e.target.value)
                      }
                      className={`w-full px-3 py-2 bg-white rounded-lg focus:ring-2 focus:ring-green-900/10 ${variantTouched[index]?.stock_quantity &&
                          variantErrors[index]?.stock_quantity
                          ? "ring-2 ring-red-500/30"
                          : ""
                        }`}
                      placeholder="Qty"
                    />
                    {variantTouched[index]?.stock_quantity &&
                      variantErrors[index]?.stock_quantity && (
                        <p className="mt-1 text-[10px] text-red-600">
                          {variantErrors[index].stock_quantity}
                        </p>
                      )}
                  </div>
                  {variants.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeVariant(index)}
                      className="p-2 text-red-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Media */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
            <h2 className="text-xl font-serif font-bold text-gray-900 border-b pb-4">
              Product Media
            </h2>

            <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
              {/* Existing Images */}
              {existingImages.map((url, index) => (
                <div
                  key={`exist-${index}`}
                  className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 group"
                >
                  <img
                    src={url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(url)}
                    className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={20} />
                  </button>
                </div>
              ))}

              {/* New Previews */}
              {previews.map((url, index) => (
                <div
                  key={`prev-${index}`}
                  className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 group"
                >
                  <img
                    src={url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removePreview(index)}
                    className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={20} />
                  </button>
                </div>
              ))}

              {/* Upload Button */}
              {previews.length + existingImages.length < 5 && (
                <label className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-green-300 transition-all group">
                  <Upload
                    size={24}
                    className="text-gray-400 group-hover:text-green-900 mb-2"
                  />
                  <span className="text-[10px] font-bold text-gray-500 uppercase">
                    Upload
                  </span>
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            <p className="text-[10px] text-gray-400 flex items-center">
              <AlertCircle size={12} className="mr-1" />
              Maximum 5 high-quality images. First image will be your cover
              image.
            </p>

            {touched.images && errors.images && (
              <p className="text-xs text-red-600">{errors.images}</p>
            )}
          </div>
          <div className="flex justify-end gap-4 md:pt-8">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="px-8 rounded-full font-bold text-gray-500 hover:text-gray-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-10 py-3 bg-green-900 text-white rounded-full font-bold hover:bg-green-800 transition-all shadow-lg shadow-green-900/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? "Saving..."
                : initialData
                  ? "Update Product"
                  : "Launch Product"}
            </button>
          </div>
        </div>
      </div>


    </form>
  );
};

export default ProductForm;
