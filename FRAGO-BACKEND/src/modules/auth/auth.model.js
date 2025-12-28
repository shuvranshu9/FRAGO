import pool from "../../config/db.js";

export const findUserByEmail = async (email) => {
    const [rows] = await pool.execute(
        "SELECT * FROM user WHERE email = ?",
        [email]
    );
    return rows[0];
};

export const createUser = async ({
    full_name,
    email,
    phone,
    address,
    password_hash,
    role
}) => {
    const sql = `
        INSERT INTO user 
        (full_name, email, phone, address, password_hash, role, is_verified)
        VALUES (?, ?, ?, ?, ?, ?, 0)
    `;
    const [result] = await pool.execute(sql, [
        full_name,
        email,
        phone,
        address,
        password_hash,
        role
    ]);
    return result;
};

export const verifyUser = async (email) => {
    await pool.execute(
        "UPDATE user SET is_verified = 1 WHERE email = ?",
        [email]
    );
};
