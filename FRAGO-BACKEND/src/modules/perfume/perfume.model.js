import pool from "../../config/db.js";
import { deleteFromCloudinaryByUrl } from "../../utils/deleteCloudinaryImage.js";

export const createPerfume = async ({
  vendor_id,
  category_id,
  name,
  brand,
  description,
  scent_type,
  mood,
  origin,
  variants,
  images,
}) => {
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const [perfumeResult] = await conn.query(
      `
      INSERT INTO perfume
      (vendor_id, category_id, name, brand, description, scent_type, mood, origin, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
      `,
      [
        vendor_id,
        category_id,
        name,
        brand,
        description,
        scent_type,
        mood,
        origin,
      ],
    );

    const perfume_id = perfumeResult.insertId;

    // Insert variants
    if (variants?.length) {
      const variantValues = variants.map((v) => [
        perfume_id,
        v.size_ml,
        v.price,
        v.stock_quantity,
      ]);

      await conn.query(
        `
        INSERT INTO perfume_variant
        (perfume_id, size_ml, price, stock_quantity)
        VALUES ?
        `,
        [variantValues],
      );
    }

    // Insert images
    if (images?.length) {
      const imageValues = images.map((url) => [perfume_id, url]);

      await conn.query(
        `
        INSERT INTO perfume_image
        (perfume_id, image_url)
        VALUES ?
        `,
        [imageValues],
      );
    }

    await conn.commit();
    return perfume_id;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

export const getAllPerfumes = async () => {
  const [rows] = await pool.query(
    `
    SELECT 
      p.*,
      JSON_ARRAYAGG(DISTINCT pi.image_url) AS images,
      JSON_ARRAYAGG(
        DISTINCT JSON_OBJECT(
          'variant_id', pv.variant_id,
          'size_ml', pv.size_ml,
          'price', pv.price,
          'stock_quantity', pv.stock_quantity
        )
      ) AS variants
    FROM perfume p
    LEFT JOIN perfume_image pi ON p.perfume_id = pi.perfume_id
    LEFT JOIN perfume_variant pv ON p.perfume_id = pv.perfume_id
    WHERE p.is_active = 1
    GROUP BY p.perfume_id
    ORDER BY p.created_at DESC
    `,
  );

  return rows;
};

export const getPerfumesByVendor = async (vendor_id) => {
  const [rows] = await pool.query(
    `
    SELECT 
    p.perfume_id,
    p.name,
    p.brand,
    p.description,
    p.scent_type,
    p.mood,
    p.origin,
    p.vendor_id,
    p.category_id,
    pi.image_url,
    pv.variant_id,
    pv.size_ml,
    pv.price,
    pv.stock_quantity
FROM perfume p
LEFT JOIN perfume_image pi ON p.perfume_id = pi.perfume_id
LEFT JOIN perfume_variant pv ON p.perfume_id = pv.perfume_id
WHERE p.vendor_id = ? AND p.is_active = 1
ORDER BY p.created_at DESC
    `,
    [vendor_id],
  );

  return rows;
};

export const getPerfumeById = async (perfume_id) => {
  const [rows] = await pool.query(
    `
    SELECT 
      p.*,
      JSON_ARRAYAGG(DISTINCT pi.image_url) AS images,
      JSON_ARRAYAGG(
        DISTINCT JSON_OBJECT(
          'variant_id', pv.variant_id,
          'size_ml', pv.size_ml,
          'price', pv.price,
          'stock_quantity', pv.stock_quantity
        )
      ) AS variants
    FROM perfume p
    LEFT JOIN perfume_image pi ON p.perfume_id = pi.perfume_id
    LEFT JOIN perfume_variant pv ON p.perfume_id = pv.perfume_id
    WHERE p.perfume_id = ?
    GROUP BY p.perfume_id
    `,
    [perfume_id],
  );

  return rows[0];
};

export const updatePerfume = async (perfume_id, data) => {
  const [result] = await pool.query(
    `
    UPDATE perfume
    SET name = ?, brand = ?, description = ?, scent_type = ?, mood = ?, origin = ?
    WHERE perfume_id = ?
    `,
    [
      data.name,
      data.brand,
      data.description,
      data.scent_type,
      data.mood,
      data.origin,
      perfume_id,
    ],
  );

  return result.affectedRows;
};

export const deletePerfume = async (perfume_id) => {
  const [result] = await pool.query(
    `UPDATE perfume SET is_active = 0 WHERE perfume_id = ?`,
    [perfume_id],
  );

  return result.affectedRows;
};

export const deletePerfumeImageByID = async (imageID) => {
  const conn = await pool.getConnection();

  try {
    const [rows] = await conn.query(
      "SELECT image_url FROM perfume_image WHERE image_id = ?",
      [imageID],
    );

    if (rows.length === 0) return false;

    const imageUrl = rows[0].image_url;

    await conn.beginTransaction();
    await conn.query("DELETE FROM perfume_image WHERE image_id = ?", [imageID]);
    await conn.commit();

    // Delete from Cloudinary AFTER DB success
    await deleteFromCloudinaryByUrl(imageUrl);

    return true;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};
