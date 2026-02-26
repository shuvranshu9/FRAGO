import pool from "../../config/db.js";

export const getReviewsByPerfume = async (perfume_id) => {
  const [rows] = await pool.query(
    `SELECT
       r.review_id,
       r.rating,
       r.comment,
       r.created_at,
       u.full_name AS reviewer_name,
       r.user_id
     FROM review r
     JOIN user u ON r.user_id = u.user_id
     WHERE r.perfume_id = ?
     ORDER BY r.created_at DESC`,
    [perfume_id],
  );
  return rows;
};

export const hasUserPurchasedPerfume = async (user_id, perfume_id) => {
  const [[row]] = await pool.query(
    `SELECT COUNT(*) AS count
     FROM order_item oi
     JOIN order_table o ON oi.order_id = o.order_id
     JOIN perfume_variant pv ON oi.variant_id = pv.variant_id
     WHERE o.user_id = ?
       AND pv.perfume_id = ?
       AND o.order_status NOT IN ('cancelled')`,
    [user_id, perfume_id],
  );
  return row.count > 0;
};

export const hasUserAlreadyReviewed = async (user_id, perfume_id) => {
  const [[row]] = await pool.query(
    `SELECT COUNT(*) AS count FROM review WHERE user_id = ? AND perfume_id = ?`,
    [user_id, perfume_id],
  );
  return row.count > 0;
};

export const createReview = async (user_id, perfume_id, rating, comment) => {
  const [result] = await pool.query(
    `INSERT INTO review (user_id, perfume_id, rating, comment) VALUES (?, ?, ?, ?)`,
    [user_id, perfume_id, rating, comment],
  );
  return result.insertId;
};

export const deleteReview = async (review_id, user_id) => {
  const [result] = await pool.query(
    `DELETE FROM review WHERE review_id = ? AND user_id = ?`,
    [review_id, user_id],
  );
  return result.affectedRows;
};

export const updateReview = async (review_id, user_id, rating, comment) => {
  const [result] = await pool.query(
    `UPDATE review SET rating = ?, comment = ? WHERE review_id = ? AND user_id = ?`,
    [rating, comment, review_id, user_id],
  );
  return result.affectedRows;
};
