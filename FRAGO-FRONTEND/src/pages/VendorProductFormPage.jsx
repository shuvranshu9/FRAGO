import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import ProductForm from "../components/vendor/ProductForm";
import { ArrowLeft } from "lucide-react";

const VendorProductFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [initialData, setInitialData] = useState(null);
  const [fetching, setFetching] = useState(!!id);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/perfume/${id}`,
      );
      setInitialData(response.data);
    } catch (error) {
      console.error("Error fetching product:", error);
      toast.error("Failed to fetch product details");
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      const url = id
        ? `http://localhost:8000/api/perfume/${id}`
        : "http://localhost:8000/api/perfume";

      const method = id ? "put" : "post";

      await axios({
        method,
        url,
        data: formData,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success(`Product ${id ? "updated" : "added"} successfully!`);
      navigate("/vendor/products");
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error(error.response?.data?.message || "Failed to save product");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-20 px-4 md:px-8">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => navigate("/vendor/products")}
          className="flex items-center text-gray-500 hover:text-green-900 mb-8 font-medium transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Listings
        </button>

        <div className="mb-10 text-center">
          <h1 className="text-4xl font-serif font-bold text-gray-900 mb-2">
            {id ? "Refine Your Creation" : "Create New Scent"}
          </h1>
          <p className="text-gray-500">
            {id
              ? "Update your fragrance details and maintain your premium presence."
              : "Share your fragrance story with the world and start your journey with FRAGO."}
          </p>
        </div>

        <ProductForm
          initialData={initialData}
          onSubmit={handleSubmit}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default VendorProductFormPage;
