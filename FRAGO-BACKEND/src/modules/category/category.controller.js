import * as Category from "./category.model.js";

// Create category
export const createCategoryController = async (req, res) => {
  try {
    const { category_name, description } = req.body;

    if (!category_name || category_name.trim().length < 2) {
      return res.status(400).json({
        message: "Category name must be at least 2 characters",
      });
    }

    // Check for existing category by name
    const existing = await Category.getCategoryByName(category_name);
    if (existing) {
      return res.status(200).json({
        message: "Category already exists",
        category_id: existing.category_id,
        isExisting: true,
      });
    }

    const category_id = await Category.createCategory({
      category_name,
      description,
    });

    res.status(201).json({
      message: "Category created successfully",
      category_id,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//Get all categories
export const getAllCategoriesController = async (req, res) => {
  try {
    const data = await Category.getAllCategories();
    res.json(data || []);
  } catch (err) {
    res.status(200).json([]);
  }
};

//Get category by ID
export const getCategoryByIdController = async (req, res) => {
  try {
    const data = await Category.getCategoryById(req.params.id);
    res.status(200).json(data || null);
  } catch (err) {
    res.status(200).json(null);
  }
};

// Update category
export const updateCategoryController = async (req, res) => {
  try {
    const { category_name, description } = req.body;

    if (!category_name || category_name.trim().length < 2) {
      return res.status(400).json({
        message: "Category name must be at least 2 characters",
      });
    }

    const updated = await Category.updateCategory(req.params.id, {
      category_name,
      description,
    });

    if (!updated) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json({ message: "Category updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete category
export const deleteCategoryController = async (req, res) => {
  try {
    const deleted = await Category.deleteCategory(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json({ message: "Category deleted successfully" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
