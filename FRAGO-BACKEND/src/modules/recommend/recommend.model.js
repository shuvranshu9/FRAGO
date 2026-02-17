import pool from "../../config/db.js";
import { PLACE_SCENT_MAP } from "../../utils/recommendationConstants.js";

export const getRecommendedPerfumes = async ({ mood, category_id, place }) => {
  let scentTypes = PLACE_SCENT_MAP[place] || [];

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
      AND p.mood = ?
      AND p.category_id = ?
      AND p.scent_type IN (?)
    GROUP BY p.perfume_id
    ORDER BY p.created_at DESC
    LIMIT 20
    `,
    [mood, category_id, scentTypes],
  );

  return rows;
};
