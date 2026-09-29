const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, html }) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"VolunteerSphere" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log(`📧 Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`❌ Email error: ${error.message}`);
    // Don't throw — email failure should not break the main flow
  }
};

const welcomeEmailTemplate = (name) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Inter, sans-serif; background: #050816; color: #F8FAFC; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: rgba(255,255,255,0.05); border: 1px solid rgba(124,58,237,0.3); border-radius: 16px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #7C3AED, #06B6D4); padding: 40px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; color: white; }
    .body { padding: 40px; }
    .body p { color: #94A3B8; line-height: 1.7; }
    .btn { display: inline-block; background: linear-gradient(135deg, #7C3AED, #06B6D4); color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #475569; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🌍 VolunteerSphere</h1>
    </div>
    <div class="body">
      <h2 style="color:#F8FAFC">Welcome, ${name}! 🎉</h2>
      <p>You've officially joined the VolunteerSphere community. Your journey to make a real difference starts now.</p>
      <p>Explore upcoming events, connect with your community, and start logging your volunteer hours today.</p>
      <a href="${process.env.CLIENT_URL}/events" class="btn">Browse Events →</a>
      <p>If you have any questions, reach out to our support team anytime.</p>
    </div>
    <div class="footer">© ${new Date().getFullYear()} VolunteerSphere. All rights reserved.</div>
  </div>
</body>
</html>
`;

const resetPasswordTemplate = (name, resetUrl) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Inter, sans-serif; background: #050816; color: #F8FAFC; margin: 0; }
    .container { max-width: 600px; margin: 40px auto; background: rgba(255,255,255,0.05); border: 1px solid rgba(124,58,237,0.3); border-radius: 16px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #EC4899, #7C3AED); padding: 40px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; color: white; }
    .body { padding: 40px; }
    .body p { color: #94A3B8; line-height: 1.7; }
    .btn { display: inline-block; background: linear-gradient(135deg, #EC4899, #7C3AED); color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #475569; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>🔐 Password Reset</h1></div>
    <div class="body">
      <h2 style="color:#F8FAFC">Hi, ${name}</h2>
      <p>You requested a password reset. Click the button below to reset your password. This link expires in 1 hour.</p>
      <a href="${resetUrl}" class="btn">Reset Password →</a>
      <p>If you didn't request this, you can safely ignore this email.</p>
    </div>
    <div class="footer">© ${new Date().getFullYear()} VolunteerSphere</div>
  </div>
</body>
</html>
`;

module.exports = { sendEmail, welcomeEmailTemplate, resetPasswordTemplate };
