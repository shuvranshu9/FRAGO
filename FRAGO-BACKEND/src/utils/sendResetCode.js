import transporter from "../config/mailer.js";

export const sendResetCodeMail = async (email, code) => {
    await transporter.sendMail({
        from: `"FRAGO" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "FRAGO Reset Password Verification OTP",
        html: `
        <div style="font-family: Arial, sans-serif; background:#f6f8fb; padding:30px;">
            <div style="max-width:600px; margin:auto; background:#ffffff; padding:30px; border-radius:8px;">
             <!-- Logo -->
                <div style="text-align: center; padding: 2px;">
                    <img src="https://res.cloudinary.com/de0tzovrb/image/upload/v1767807348/FRAGO_wkefyi.png" alt="Frago Logo" style="width: 300px;">
                </div>
                <h2 style="color:#222;">Password Reset Request</h2>
                <p>Hello,</p>
                <p>We received a request to reset your password.</p>

                <div style="text-align:center; margin:30px 0;">
                    <span style="
                        font-size:32px;
                        letter-spacing:6px;
                        font-weight:bold;
                        color:#1a73e8;
                    ">
                        ${code}
                    </span>
                </div>

                <p>This code is valid for <strong>10 minutes</strong>.</p>
                <p>If you did not request this, you can safely ignore this email.</p>

                <hr style="margin:30px 0;" />
                <p style="font-size:12px; color:#777;">
                    © ${new Date().getFullYear()} FRAGO. All rights reserved.
                </p>
            </div>
        </div>
    `
    });
};
