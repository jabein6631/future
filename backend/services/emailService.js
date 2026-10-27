/**
 * SkillSwap Platform - Email Dispatch Service
 * Handles SMTP delivery of dynamic 6-digit OTP verification codes via Nodemailer.
 * Supports Gmail, custom SMTP, and graceful development console fallback.
 */

const nodemailer = require('nodemailer');

function createTransporter() {
  const user = process.env.EMAIL_USER || process.env.SMTP_USER;
  const pass = process.env.EMAIL_PASS || process.env.SMTP_PASS;

  if (!user || !pass) {
    return null;
  }

  // Custom SMTP Host support (e.g., mail.vignan.ac.in, sendgrid, etc.)
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user, pass }
    });
  }

  // Default: Gmail with App Password or predefined service
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: { user, pass }
  });
}

const emailService = {
  /**
   * Send Dynamic 6-Digit Password Reset OTP to student's email
   * @param {string} toEmail - Recipient email address
   * @param {string} recipientName - Student name
   * @param {string} otp - Dynamic 6-digit code
   */
  async sendPasswordResetOtp(toEmail, recipientName = 'Student', otp) {
    const transporter = createTransporter();
    const sender = process.env.EMAIL_FROM || process.env.EMAIL_USER || 'SkillSwap Hub <noreply@skillswap.edu>';

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SkillSwap Password Reset Code</title>
</head>
<body style="margin: 0; padding: 24px; background-color: #f4f6fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #eaedf5; overflow: hidden; box-shadow: 0 4px 14px rgba(0, 0, 0, 0.05);">
    
    <!-- Header Banner -->
    <tr>
      <td style="background: linear-gradient(135deg, #0d233a 0%, #1e3a8a 100%); padding: 28px 24px; text-align: center;">
        <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">
          🎓 SkillSwap
        </h1>
        <p style="margin: 6px 0 0 0; color: #cbd5e1; font-size: 13px; font-weight: 500;">
          Vignan University Peer Exchange &amp; Certification Hub
        </p>
      </td>
    </tr>

    <!-- Body Content -->
    <tr>
      <td style="padding: 32px 28px 24px 28px;">
        <h2 style="margin: 0 0 12px 0; color: #111827; font-size: 18px; font-weight: 700;">
          Password Reset Verification
        </h2>
        
        <p style="margin: 0 0 18px 0; color: #475569; font-size: 14px; line-height: 1.55;">
          Hello <strong>${recipientName}</strong>,<br>
          We received a request to reset your password for your SkillSwap account. Use the dynamic 6-digit verification code below to authorize this change:
        </p>

        <!-- Big 6-Digit OTP Box -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 20px 0;">
          <tr>
            <td align="center" style="background: #f0f4ff; border: 2px dashed #6366f1; border-radius: 10px; padding: 20px;">
              <span style="font-family: 'Courier New', Courier, monospace; font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #4338ca; display: inline-block;">
                ${otp}
              </span>
            </td>
          </tr>
        </table>

        <!-- Security Disclaimers -->
        <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px 14px; border-radius: 4px; margin-bottom: 20px;">
          <p style="margin: 0; color: #92400e; font-size: 12.5px; line-height: 1.45; font-weight: 600;">
            ⏱️ <strong>Time-Sensitive:</strong> This code is single-use and expires in <strong>10 minutes</strong>. A new code is generated on every request.
          </p>
        </div>

        <p style="margin: 0; color: #64748b; font-size: 13px; line-height: 1.5;">
          If you did not request a password reset, no further action is required. Your current password remains secure.
        </p>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="background: #f8fafc; border-top: 1px solid #eaedf5; padding: 18px 24px; text-align: center;">
        <p style="margin: 0; color: #94a3b8; font-size: 12px;">
          © ${new Date().getFullYear()} SkillSwap Platform • Vignan University Vadlamudi
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
`;

    // 1. If credentials are not present in .env, log fallback info
    if (!transporter) {
      console.log(`\n========================================================`);
      console.log(`📨 [Email Service Fallback - Credentials Not in .env]`);
      console.log(`📬 Recipient: ${toEmail}`);
      console.log(`🔢 Dynamic 6-Digit OTP: ${otp}`);
      console.log(`ℹ️ To enable real inbox delivery, add to your .env:`);
      console.log(`   EMAIL_USER=your_email@gmail.com`);
      console.log(`   EMAIL_PASS=your_16_char_google_app_password`);
      console.log(`========================================================\n`);
      return { success: true, simulated: true };
    }

    // 2. Real SMTP Delivery
    try {
      const info = await transporter.sendMail({
        from: sender,
        to: toEmail,
        subject: `🔑 ${otp} is your SkillSwap Password Reset Code`,
        text: `Hello ${recipientName},\n\nYour SkillSwap 6-digit password reset verification code is: ${otp}\n\nThis code is valid for 10 minutes.\n\nSkillSwap Team - Vignan University`,
        html: htmlContent
      });

      console.log(`✅ [Real Email Delivered] Message ID: ${info.messageId} to ${toEmail}`);
      return { success: true, messageId: info.messageId };
    } catch (err) {
      console.error(`❌ [Email Delivery Failed] to ${toEmail}:`, err.message);
      // Graceful return so the user's flow doesn't crash
      return { success: false, error: err.message };
    }
  }
};

module.exports = emailService;
