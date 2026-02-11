import pool from "../../config/db.js";

//Create category
export const createCategory = async ({ category_name, description }) => {
  const [result] = await pool.query(
    `
    INSERT INTO category (category_name, description)
    VALUES (?, ?)
    `,
    [category_name.trim(), description || null]
  );

  return result.insertId;
};


//  Get all categories
export const getAllCategories = async () => {
  const [rows] = await pool.query(
    `
    SELECT category_id, category_name, description
    FROM category
    ORDER BY category_name ASC
    `
  );

  return rows;
};

//  Get category by ID
export const getCategoryById = async (category_id) => {
  const [rows] = await pool.query(
    `
    SELECT category_id, category_name, description
    FROM category
    WHERE category_id = ?
    `,
    [category_id]
  );

  return rows[0];
};

//Update category

export const updateCategory = async (category_id, { category_name, description }) => {
  const [result] = await pool.query(
    `
    UPDATE category
    SET category_name = ?, description = ?
    WHERE category_id = ?
    `,
    [category_name.trim(), description || null, category_id]
  );

  return result.affectedRows;
};

//Delete category
export const deleteCategory = async (category_id) => {
  // Prevent delete if category is used
  const [[used]] = await pool.query(
    `SELECT COUNT(*) AS count FROM perfume WHERE category_id = ?`,
    [category_id]
  );

  if (used.count > 0) {
    throw new Error("Category is in use and cannot be deleted");
  }

  const [result] = await pool.query(
    `DELETE FROM category WHERE category_id = ?`,
    [category_id]
  );

  return result.affectedRows;
};
