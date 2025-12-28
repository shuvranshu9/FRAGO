import transporter from "../config/mailer";

export const sendOtpMail = async (email, otp) => {

    await transporter.sendMail({
        from: `"FRAGO" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "FRAGO Email Verification OTP",
        html: `<p>Your OTP is <b>${otp}</b>. It is valid for 5 minutes.</p>`
    });
};
