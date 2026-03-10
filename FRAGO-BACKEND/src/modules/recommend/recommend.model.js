import pool from "../../config/db.js";
import { PLACE_SCENT_MAP } from "../../utils/recommendationConstants.js";

export const getRecommendedPerfumes = async ({
  mood,
  gender,
  category_id,
  place,
}) => {
  let scentTypes = PLACE_SCENT_MAP[place] || [];
  scentTypes = scentTypes.map((s) => s.toLowerCase());

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

  const queryParams = [mood.toLowerCase()];

  if (gender) {
    query += ` AND LOWER(p.gender) = ?`;
    queryParams.push(gender.toLowerCase());
  }

  if (category_id) {
    query += ` AND p.category_id = ?`;
    queryParams.push(Number(category_id));
  }

  if (scentTypes.length > 0) {
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
