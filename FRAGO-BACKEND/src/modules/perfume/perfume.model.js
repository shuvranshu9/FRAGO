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
  gender,
  variants,
  images,
}) => {
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const [perfumeResult] = await conn.query(
      `
      INSERT INTO perfume
      (vendor_id, category_id, name, brand, description, scent_type, mood, origin, gender, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
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
        gender,
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

const normalizeStringArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map((v) => String(v).trim()).filter(Boolean);
  }
  return String(value)
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
};

const buildPerfumeWhere = ({
  search,
  scentTypes,
  moods,
  brands,
  gender,
  minPrice,
  maxPrice,
}) => {
  const clauses = ["p.is_active = 1"];
  const params = [];

  if (search && String(search).trim()) {
    const term = `%${String(search).trim()}%`;
    clauses.push("(p.name LIKE ? OR p.brand LIKE ?)");
    params.push(term, term);
  }

  const scent = normalizeStringArray(scentTypes);
  if (scent.length) {
    clauses.push("p.scent_type IN (?)");
    params.push(scent);
  }

  const mood = normalizeStringArray(moods);
  if (mood.length) {
    clauses.push("p.mood IN (?)");
    params.push(mood);
  }

  const brand = normalizeStringArray(brands);
  if (brand.length) {
    clauses.push("p.brand IN (?)");
    params.push(brand);
  }

  const genders = normalizeStringArray(gender).map((g) => g.toUpperCase());
  if (genders.length) {
    clauses.push("p.gender IN (?)");
    params.push(genders);
  }

  const min = Number(minPrice);
  if (Number.isFinite(min)) {
    clauses.push("COALESCE(mp.min_price, 0) >= ?");
    params.push(min);
  }

  const max = Number(maxPrice);
  if (Number.isFinite(max)) {
    clauses.push("COALESCE(mp.min_price, 0) <= ?");
    params.push(max);
  }

  return {
    whereSql: clauses.length ? `WHERE ${clauses.join(" AND ")}` : "",
    params,
  };
};

export const getAllPerfumesCount = async (filters = {}) => {
  const { whereSql, params } = buildPerfumeWhere(filters);

  const [[row]] = await pool.query(
    `
    SELECT COUNT(*) AS total
    FROM perfume p
    LEFT JOIN (
      SELECT perfume_id, MIN(price) AS min_price
      FROM perfume_variant
      GROUP BY perfume_id
    ) mp ON p.perfume_id = mp.perfume_id
    ${whereSql}
    `,
    params,
  );

  return row?.total ?? 0;
};

export const getAllPerfumes = async ({
  page = 1,
  limit = 12,
  sortBy = "newest",
  ...filters
} = {}) => {
  const safePage = Number.isFinite(Number(page)) ? Number(page) : 1;
  const safeLimit = Number.isFinite(Number(limit)) ? Number(limit) : 12;
  const normalizedPage = Math.max(1, Math.floor(safePage));
  const normalizedLimit = Math.max(1, Math.floor(safeLimit));
  const offset = (normalizedPage - 1) * normalizedLimit;

  const { whereSql, params } = buildPerfumeWhere(filters);

  let orderBy = "p.created_at DESC";
  switch (sortBy) {
    case "price-asc":
      orderBy = "COALESCE(mp.min_price, 0) ASC, p.created_at DESC";
      break;
    case "price-desc":
      orderBy = "COALESCE(mp.min_price, 0) DESC, p.created_at DESC";
      break;
    case "name-asc":
      orderBy = "p.name ASC";
      break;
    case "newest":
    default:
      orderBy = "p.created_at DESC";
      break;
  }

  const [rows] = await pool.query(
    `
    SELECT 
        p.*,
        COALESCE(img.images, JSON_ARRAY()) AS images,
        COALESCE(var.variants, JSON_ARRAY()) AS variants
      FROM perfume p

      LEFT JOIN (
        SELECT perfume_id, MIN(price) AS min_price
        FROM perfume_variant
        GROUP BY perfume_id
      ) mp ON p.perfume_id = mp.perfume_id

      LEFT JOIN (
        SELECT 
          perfume_id,
          JSON_ARRAYAGG(image_url) AS images
        FROM perfume_image
        GROUP BY perfume_id
      ) img ON p.perfume_id = img.perfume_id

      LEFT JOIN (
        SELECT 
          perfume_id,
          JSON_ARRAYAGG(
            JSON_OBJECT(
              'variant_id', variant_id,
              'size_ml', size_ml,
              'price', price,
              'stock_quantity', stock_quantity
            )
          ) AS variants
        FROM perfume_variant
        GROUP BY perfume_id
      ) var ON p.perfume_id = var.perfume_id

      ${whereSql}
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
    `,
    [...params, normalizedLimit, offset],
  );

  return rows;
};

export const getPerfumeFilterOptions = async () => {
  const [scentRows] = await pool.query(
    `
    SELECT DISTINCT scent_type
    FROM perfume
    WHERE is_active = 1 AND scent_type IS NOT NULL AND scent_type <> ''
    ORDER BY scent_type ASC
    `,
  );

  const [moodRows] = await pool.query(
    `
    SELECT DISTINCT mood
    FROM perfume
    WHERE is_active = 1 AND mood IS NOT NULL AND mood <> ''
    ORDER BY mood ASC
    `,
  );

  const [brandRows] = await pool.query(
    `
    SELECT DISTINCT brand
    FROM perfume
    WHERE is_active = 1 AND brand IS NOT NULL AND brand <> ''
    ORDER BY brand ASC
    `,
  );

  const [[minMax]] = await pool.query(
    `SELECT MIN(price) AS minPrice, MAX(price) AS maxPrice FROM perfume_variant`,
  );

  return {
    scent_types: scentRows.map((r) => r.scent_type).filter(Boolean),
    moods: moodRows.map((r) => r.mood).filter(Boolean),
    brands: brandRows.map((r) => r.brand).filter(Boolean),
    minPrice: Number(minMax?.minPrice ?? 0),
    maxPrice: Number(minMax?.maxPrice ?? 0),
  };
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
      p.gender,
      p.vendor_id,
      p.category_id,
      (
        SELECT pi.image_url
        FROM perfume_image pi
        WHERE pi.perfume_id = p.perfume_id
        ORDER BY pi.image_id ASC
        LIMIT 1
      ) AS image_url
    FROM perfume p
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
          c.category_name AS category_name,
          u.full_name AS vendor_name,
          u.email AS vendor_email,
          u.phone AS vendor_phone,
          u.address AS vendor_address,
          (
            SELECT COALESCE(JSON_ARRAYAGG(pi.image_url), JSON_ARRAY())
            FROM perfume_image pi
            WHERE pi.perfume_id = p.perfume_id
          ) AS images,

          (
            SELECT COALESCE(
              JSON_ARRAYAGG(
                JSON_OBJECT(
                  'variant_id', pv.variant_id,
                  'size_ml', pv.size_ml,
                  'price', pv.price,
                  'stock_quantity', pv.stock_quantity
                )
              ),
              JSON_ARRAY()
            )
            FROM perfume_variant pv
            WHERE pv.perfume_id = p.perfume_id
          ) AS variants

        FROM perfume p
        LEFT JOIN user u ON p.vendor_id = u.user_id
        LEFT JOIN category c ON p.category_id = c.category_id
        WHERE p.perfume_id = ?;
    `,
    [perfume_id],
  );

  return rows.length ? rows[0] : null;
};

export const updatePerfume = async (perfume_id, data) => {
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // Update basic info
    const [result] = await conn.query(
      `
      UPDATE perfume
      SET name = ?, brand = ?, description = ?, scent_type = ?, mood = ?, origin = ?, gender = ?, category_id = ?
      WHERE perfume_id = ?
      `,
      [
        data.name,
        data.brand,
        data.description,
        data.scent_type,
        data.mood,
        data.origin,
        data.gender,
        data.category_id,
        perfume_id,
      ],
    );

    // Handle variants with safe UPSERT
    if (data.variants) {
      const variants = JSON.parse(
        typeof data.variants === "string" ? data.variants : "[]",
      );

      for (const v of variants) {
        if (v.variant_id) {
          await conn.query(
            `UPDATE perfume_variant SET size_ml = ?, price = ?, stock_quantity = ? WHERE variant_id = ? AND perfume_id = ?`,
            [v.size_ml, v.price, v.stock_quantity, v.variant_id, perfume_id],
          );
        } else {
          // INSERT brand-new variant
          await conn.query(
            `INSERT INTO perfume_variant (perfume_id, size_ml, price, stock_quantity) VALUES (?, ?, ?, ?)`,
            [perfume_id, v.size_ml, v.price, v.stock_quantity],
          );
        }
      }

      // Only delete variants that are NOT referenced by any order_item
      const incomingIds = variants
        .filter((v) => v.variant_id)
        .map((v) => v.variant_id);

      const [existingVariants] = await conn.query(
        `SELECT variant_id FROM perfume_variant WHERE perfume_id = ?`,
        [perfume_id],
      );

      const toDelete = existingVariants
        .map((v) => v.variant_id)
        .filter((id) => !incomingIds.includes(id));

      for (const variantId of toDelete) {
        const [[{ count }]] = await conn.query(
          `SELECT COUNT(*) as count FROM order_item WHERE variant_id = ?`,
          [variantId],
        );
        if (count === 0) {
          await conn.query(`DELETE FROM perfume_variant WHERE variant_id = ?`, [
            variantId,
          ]);
        }
      }
    }

    // Handle images
    const [currentImages] = await conn.query(
      "SELECT image_url FROM perfume_image WHERE perfume_id = ?",
      [perfume_id],
    );

    const keptImages = JSON.parse(
      typeof data.existingImages === "string" ? data.existingImages : "[]",
    );

    // Identify images to delete from DB and Cloudinary
    const imagesToDelete = currentImages.filter(
      (img) => !keptImages.includes(img.image_url),
    );

    if (imagesToDelete.length > 0) {
      const urlsToDelete = imagesToDelete.map((img) => img.image_url);
      await conn.query(
        "DELETE FROM perfume_image WHERE perfume_id = ? AND image_url IN (?)",
        [perfume_id, urlsToDelete],
      );
      for (const url of urlsToDelete) {
        await deleteFromCloudinaryByUrl(url);
      }
    }

    // Add new images
    if (data.images && data.images.length > 0) {
      const imageValues = data.images.map((url) => [perfume_id, url]);
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
    return result.affectedRows;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

export const deletePerfume = async (perfume_id) => {
  const conn = await pool.getConnection();

  try {
    // Get all images associated with the perfume
    const [images] = await conn.query(
      "SELECT image_url FROM perfume_image WHERE perfume_id = ?",
      [perfume_id],
    );

    await conn.beginTransaction();

    // Delete from bookmark
    await conn.query("DELETE FROM bookmark WHERE perfume_id = ?", [perfume_id]);

    // Delete from cart_item
    await conn.query(
      `
      DELETE ci FROM cart_item ci
      JOIN perfume_variant pv ON ci.variant_id = pv.variant_id
      WHERE pv.perfume_id = ?
      `,
      [perfume_id],
    );

    // Delete perfume_image
    await conn.query("DELETE FROM perfume_image WHERE perfume_id = ?", [
      perfume_id,
    ]);

    // Delete perfume_variant
    await conn.query("DELETE FROM perfume_variant WHERE perfume_id = ?", [
      perfume_id,
    ]);

    // Finally delete the perfume
    const [result] = await conn.query(
      "DELETE FROM perfume WHERE perfume_id = ?",
      [perfume_id],
    );

    await conn.commit();

    // Delete from Cloudinary after DB success
    if (images.length > 0) {
      for (const img of images) {
        await deleteFromCloudinaryByUrl(img.image_url);
      }
    }

    return result.affectedRows;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
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
