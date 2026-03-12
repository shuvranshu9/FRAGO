import pool from "../../config/db.js";
import { PLACE_SCENT_MAP } from "../../utils/recommendationConstants.js";

const parseCategoryId = (category_id) => {
  if (category_id === null || typeof category_id === "undefined") return null;
  if (category_id === "") return null;

  const parsed = Number(category_id);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return parsed;
};

const getScentTypesForPlace = (place) => {
  if (!place) return [];

  const placeStr = String(place);
  const matchedKey = Object.keys(PLACE_SCENT_MAP).find(
    (k) => k.toLowerCase() === placeStr.toLowerCase(),
  );

  const scentTypes = matchedKey ? PLACE_SCENT_MAP[matchedKey] : [];
  return scentTypes.map((s) => String(s).toLowerCase());
};

const runRecommendationQuery = async ({
  mood,
  gender,
  categoryId,
  scentTypes,
  includeGender,
  includeCategory,
  includeScentTypes,
}) => {
  let query = `
    SELECT 
      p.*,
      JSON_ARRAYAGG(pi.image_url) AS images,
      JSON_ARRAYAGG(
        JSON_OBJECT(
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
      AND LOWER(p.mood) = ?
  `;

  const queryParams = [mood];

  if (includeGender && gender) {
    query += ` AND LOWER(p.gender) = ?`;
    queryParams.push(gender);
  }

  if (includeCategory && categoryId) {
    query += ` AND p.category_id = ?`;
    queryParams.push(categoryId);
  }

  if (includeScentTypes && scentTypes.length > 0) {
    query += ` AND LOWER(p.scent_type) IN (?)`;
    queryParams.push(scentTypes);
  }

  query += `
    GROUP BY p.perfume_id
    ORDER BY p.created_at DESC
    LIMIT 20
  `;

  const [rows] = await pool.query(query, queryParams);
  return rows;
};

export const getRecommendedPerfumes = async ({
  mood,
  gender,
  category_id,
  place,
}) => {
  const normalizedMood = String(mood || "").toLowerCase();
  const normalizedGender = gender ? String(gender).toLowerCase() : null;
  const categoryId = parseCategoryId(category_id);
  const scentTypes = getScentTypesForPlace(place);

  const attempts = [
    {
      includeGender: Boolean(normalizedGender),
      includeCategory: Boolean(categoryId),
      includeScentTypes: true,
    },

    {
      includeGender: Boolean(normalizedGender),
      includeCategory: false,
      includeScentTypes: true,
    },
  
    {
      includeGender: Boolean(normalizedGender),
      includeCategory: Boolean(categoryId),
      includeScentTypes: false,
    },
    {
      includeGender: Boolean(normalizedGender),
      includeCategory: false,
      includeScentTypes: false,
    },
    {
      includeGender: false,
      includeCategory: false,
      includeScentTypes: false,
    },
  ];

  for (const attempt of attempts) {
    if (!categoryId && attempt.includeCategory) continue;

    const rows = await runRecommendationQuery({
      mood: normalizedMood,
      gender: normalizedGender,
      categoryId,
      scentTypes,
      ...attempt,
    });

    if (rows.length > 0) return rows;
  }

  return [];
};
