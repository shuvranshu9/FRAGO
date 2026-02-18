import { useState, useEffect } from "react";
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
    ...initialData,
  });

  const [variants, setVariants] = useState(
    initialData?.variants || [{ size_ml: "", price: "", stock_quantity: "" }],
  );
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState(
    initialData?.images || [],
  );
  const [categories, setCategories] = useState([]);
  const [previews, setPreviews] = useState([]);

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
      });
      setVariants(
        initialData.variants?.length > 0
          ? initialData.variants
          : [{ size_ml: "", price: "", stock_quantity: "" }],
      );
      setExistingImages(initialData.images || []);
    }
    fetchCategories();
  }, [initialData]);

  const fetchCategories = async () => {
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

      // Check for missing categories (case-insensitive)
      const existingNames = fetchedCategories.map((c) =>
        c.category_name.toLowerCase().trim(),
      );

      const missingCategories = topCategories.filter(
        (cat) => !existingNames.includes(cat.toLowerCase().trim()),
      );

      // Only seed if there are missing categories AND we have a token
      if (missingCategories.length > 0 && token) {
        // Use a flag in localStorage to prevent multiple seeding attempts
        const seedingAttempted = localStorage.getItem("categories_seeded");

        if (!seedingAttempted) {
          // Set flag immediately to prevent parallel attempts
          localStorage.setItem("categories_seeded", "true");

          // Seed missing categories
          await Promise.all(
            missingCategories.map((cat) =>
              axios
                .post(
                  "http://localhost:8000/api/category",
                  {
                    category_name: cat,
                    description: `${cat} fragrance family`,
                  },
                  { headers: { Authorization: `Bearer ${token}` } },
                )
                .catch((err) => {
                  // If error is 409 (Conflict), category already exists - ignore
                  if (err.response?.status === 409) {
                    console.log(`Category ${cat} already exists`);
                  } else {
                    console.error(`Error creating category ${cat}:`, err);
                  }
                }),
            ),
          );

          // Re-fetch after seeding to get full list with IDs
          const secondResponse = await axios.get(
            "http://localhost:8000/api/category",
          );
          fetchedCategories = secondResponse.data;
        }
      }

      setCategories(fetchedCategories);
    } catch (error) {
      console.error("Error fetching/seeding categories:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleVariantChange = (index, field, value) => {
    const newVariants = [...variants];
    newVariants[index][field] = value;
    setVariants(newVariants);
  };

  const addVariant = () => {
    setVariants([...variants, { size_ml: "", price: "", stock_quantity: "" }]);
  };

  const removeVariant = (index) => {
    if (variants.length === 1) return;
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + previews.length + existingImages.length > 5) {
      toast.warning("Maximum 5 images allowed");
      return;
    }

    setImages((prev) => [...prev, ...files]);

    // Create previews
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...newPreviews]);
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

    // Validation
    if (!formData.name || !formData.brand || !formData.category_id) {
      toast.error("Please fill in all required fields");
      return;
    }

    const validVariants = variants.filter(
      (v) => v.size_ml && v.price && v.stock_quantity,
    );
    if (validVariants.length === 0) {
      toast.error("At least one valid variant is required");
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
    <form onSubmit={handleSubmit} className="space-y-8">
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
                className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-green-900/10"
                placeholder="e.g. Oud Royale"
                required
              />
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
                className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-green-900/10"
                placeholder="e.g. Frago Signature"
                required
              />
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
                  className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-green-900/10"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.category_id} value={cat.category_id}>
                      {cat.category_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Scent Type
                </label>
                <input
                  type="text"
                  name="scent_type"
                  value={formData.scent_type}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-green-900/10"
                  placeholder="e.g. Woody, Floral"
                />
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
              ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Mood
                </label>
                <input
                  type="text"
                  name="mood"
                  value={formData.mood}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-green-900/10"
                  placeholder="e.g. Romantic, Energetic"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Origin
                </label>
                <input
                  type="text"
                  name="origin"
                  value={formData.origin}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-green-900/10"
                  placeholder="e.g. France, UAE"
                />
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
                      type="number"
                      value={variant.size_ml}
                      onChange={(e) =>
                        handleVariantChange(index, "size_ml", e.target.value)
                      }
                      className="w-full px-3 py-2 bg-white border-none rounded-lg focus:ring-2 focus:ring-green-900/10"
                      placeholder="ml"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">
                      Price (NPR)
                    </label>
                    <input
                      type="number"
                      value={variant.price}
                      onChange={(e) =>
                        handleVariantChange(index, "price", e.target.value)
                      }
                      className="w-full px-3 py-2 bg-white border-none rounded-lg focus:ring-2 focus:ring-green-900/10"
                      placeholder="NPR"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">
                      Stock
                    </label>
                    <input
                      type="number"
                      value={variant.stock_quantity}
                      onChange={(e) =>
                        handleVariantChange(
                          index,
                          "stock_quantity",
                          e.target.value,
                        )
                      }
                      className="w-full px-3 py-2 bg-white border-none rounded-lg focus:ring-2 focus:ring-green-900/10"
                      placeholder="Qty"
                    />
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
                    accept="image/*"
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
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-4">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="px-8 py-3 rounded-full font-bold text-gray-500 hover:text-gray-900 transition-colors"
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
    </form>
  );
};

export default ProductForm;
