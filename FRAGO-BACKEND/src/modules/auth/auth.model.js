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
    role,
    otp
}) => {
    const sql = `
        INSERT INTO user 
        (full_name, email, phone, address, password_hash, role, is_verified, otp, otp_expires_at)
        VALUES (?, ?, ?, ?, ?, ?, 0, ?, DATE_ADD(NOW(), INTERVAL 10 MINUTE))
    `;

    const [result] = await pool.execute(sql, [
        full_name,
        email,
        phone,
        address,
        password_hash,
        role,
        otp
    ]);

    return result;
};


export const verifyUserOtp = async (email, otp) => {
    // Fetch OTP info
    const [rows] = await pool.execute(
        "SELECT otp, otp_expires_at FROM user WHERE email = ?",
        [email]
    );

    if (!rows.length) {
        return {
            success: false,
            status: 404,
            message: "User not found"
        };
    }

    const user = rows[0];

    // OTP mismatch
    if (user.otp !== String(otp)) {
        return {
            success: false,
            status: 400,
            message: "Invalid OTP"
        };
    }

    // OTP expired
    if (user.otp_expires_at && new Date(user.otp_expires_at) < new Date()) {
        return {
            success: false,
            status: 400,
            message: "OTP expired"
        };
    }

    // Verify user
    await pool.execute(
        "UPDATE user SET is_verified = 1, otp = NULL, otp_expires_at = NULL WHERE email = ?",
        [email]
    );

    return {
        success: true
    };
};
