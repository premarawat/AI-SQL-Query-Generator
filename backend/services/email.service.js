const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT, 10),
  secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify SMTP configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('SMTP Configuration Error:', error);
  } else {
    console.log('SMTP Server is configured and ready');
  }
});

/**
 * Sends an OTP email to the user for password reset.
 * @param {string} toEmail 
 * @param {string} userName 
 * @param {string} otp 
 */
const sendPasswordResetEmail = async (toEmail, userName, otp) => {
  const mailOptions = {
    from: `"AI SQL Assistant" <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
    to: toEmail,
    subject: 'AI SQL Assistant Password Reset OTP',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #1a1a1a; color: #ffffff; padding: 20px; border-radius: 8px;">
        <h2 style="color: #3b82f6;">Password Reset</h2>
        <p>Hello ${userName},</p>
        <p>Use the following OTP to reset your password.</p>
        <div style="background-color: #2d2d2d; padding: 15px; font-size: 24px; font-weight: bold; text-align: center; letter-spacing: 5px; border-radius: 4px; margin: 20px 0;">
          ${otp}
        </div>
        <p style="color: #ef4444; font-size: 14px;">This OTP expires in 10 minutes.</p>
        <hr style="border-color: #333; margin: 20px 0;" />
        <p style="font-size: 12px; color: #888;">If you didn't request this, please ignore this email.</p>
        <p style="font-size: 12px; color: #888;">AI SQL Assistant Team</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${toEmail}`);
  } catch (error) {
    console.error('SMTP Error sending email:', error);
    throw new Error('SMTP_ERROR');
  }
};

module.exports = {
  sendPasswordResetEmail,
};
