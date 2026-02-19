import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Tag, Search, X } from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import DeleteModal from "../../components/global/DeleteModal";

const VendorCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    category: null,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formState, setFormState] = useState({
    category_name: "",
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/category");
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormState({
        category_name: category.category_name,
        description: category.description || "",
      });
    } else {
      setEditingCategory(null);
      setFormState({ category_name: "", description: "" });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formState.category_name.trim()) {
      toast.error("Category name is required");
      return;
    }

    setSubmitting(true);
    try {
      if (editingCategory) {
        await axios.put(
          `http://localhost:8000/api/category/${editingCategory.category_id}`,
          formState,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        toast.success("Category updated successfully");
      } else {
        await axios.post("http://localhost:8000/api/category", formState, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Category created successfully");
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (error) {
      console.error("Error saving category:", error);
      toast.error(error.response?.data?.message || "Failed to save category");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (category) => {
    setDeleteModal({ isOpen: true, category });
  };

  const confirmDelete = async () => {
    const { category } = deleteModal;
    if (!category) return;

    try {
      await axios.delete(
        `http://localhost:8000/api/category/${category.category_id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      toast.success("Category deleted");
      setCategories(
        categories.filter((c) => c.category_id !== category.category_id),
      );
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error(error.response?.data?.message || "Failed to delete category");
    } finally {
      setDeleteModal({ isOpen: false, category: null });
    }
  };

  const filteredCategories = categories.filter((c) =>
    c.category_name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-16 pb-16 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold text-gray-900">
              Manage Categories
            </h1>
            <p className="text-gray-500 mt-1">
              Organize your fragrances by scents and families
            </p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center justify-center px-6 py-3 bg-green-900 text-white rounded-full font-medium hover:bg-green-800 transition-colors shadow-lg shadow-green-900/10"
          >
            <Plus size={20} className="mr-2" />
            Add Category
          </button>
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-8">
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search categories..."
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-green-900/10 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-900"></div>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-gray-100">
            <Tag size={40} className="text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-serif font-semibold text-gray-900">
              No categories found
            </h2>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredCategories.map((category) => (
              <div
                key={category.category_id}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow group"
              >
                <div>
                  <h3 className="text-lg font-serif font-bold text-gray-900">
                    {category.category_name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {category.description || "No description provided"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenModal(category)}
                    className="p-2 text-gray-400 hover:text-green-900 hover:bg-green-50 rounded-lg transition-colors"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(category)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-200 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-serif font-bold text-gray-900">
                  {editingCategory ? "Edit Category" : "New Category"}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-green-900/10"
                    value={formState.category_name}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        category_name: e.target.value,
                      })
                    }
                    placeholder="e.g. Woody Oriental"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-green-900/10 min-h-25"
                    value={formState.description}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        description: e.target.value,
                      })
                    }
                    placeholder="Briefly describe this category"
                  />
                </div>
                <div className="flex gap-4 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3 border border-gray-200 rounded-full font-bold text-gray-500 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-3 bg-green-900 text-white rounded-full font-bold hover:bg-green-800 transition-colors disabled:opacity-50"
                  >
                    {submitting
                      ? "Saving..."
                      : editingCategory
                        ? "Update"
                        : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, category: null })}
        onConfirm={confirmDelete}
        itemName={deleteModal.category?.category_name}
        title="Delete Category"
        description="Are you sure you want to delete this category? This will fail if there are products currently assigned to it."
      />
    </div>
  );
};

export default VendorCategoriesPage;
