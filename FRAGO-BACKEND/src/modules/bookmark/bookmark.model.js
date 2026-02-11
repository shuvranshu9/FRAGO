import pool from "../../config/db.js";

// Add a bookmark
export const addBookmark = async (userId, perfumeId) => {
    // Check if already bookmarked to avoid duplicates (though unique constraint is better)
    const [existing] = await pool.query(
        "SELECT bookmark_id FROM bookmark WHERE user_id = ? AND perfume_id = ?",
        [userId, perfumeId]
    );

    if (existing.length > 0) {
        return existing[0].bookmark_id; // Return existing ID
    }

    const [result] = await pool.query(
        "INSERT INTO bookmark (user_id, perfume_id) VALUES (?, ?)",
        [userId, perfumeId]
    );

    return result.insertId;
};

// Remove a bookmark
export const removeBookmark = async (userId, perfumeId) => {
    const [result] = await pool.query(
        "DELETE FROM bookmark WHERE user_id = ? AND perfume_id = ?",
        [userId, perfumeId]
    );
    return result.affectedRows;
};

// Get all bookmarks for a user with perfume details
export const getBookmarks = async (userId) => {
    const [rows] = await pool.query(
        `
        SELECT 
            b.bookmark_id,
            b.created_at,
            p.perfume_id,
            p.name,
            p.brand,
            p.description,
            p.scent_type,
            p.mood,
            (SELECT image_url FROM perfume_image pi WHERE pi.perfume_id = p.perfume_id LIMIT 1) as image,
            (SELECT MIN(price) FROM perfume_variant pv WHERE pv.perfume_id = p.perfume_id) as start_price
        FROM bookmark b
        JOIN perfume p ON b.perfume_id = p.perfume_id
        WHERE b.user_id = ?
        ORDER BY b.bookmark_id DESC
        `,
        [userId]
    );
    return rows;
};

// Check if a specific perfume is bookmarked
export const isBookmarked = async (userId, perfumeId) => {
    const [rows] = await pool.query(
        "SELECT 1 FROM bookmark WHERE user_id = ? AND perfume_id = ?",
        [userId, perfumeId]
    );
    return rows.length > 0;
};
