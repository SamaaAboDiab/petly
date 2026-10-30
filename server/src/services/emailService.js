// Sends transactional email through Resend's HTTP API when RESEND_API_KEY is
// set. Without a key (local development) the email is printed to the server
// console instead, so flows like "forgot password" still work end to end.
const RESEND_URL = "https://api.resend.com/emails";
const TIMEOUT_MS = 10000;

const sendEmail = async ({ to, subject, html, text }) => {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.log(`\n[email:dev] To: ${to}\n[email:dev] Subject: ${subject}\n${text}\n`);
    return { delivered: false, dev: true };
  }

  try {
    const response = await fetch(RESEND_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || "Petly <onboarding@resend.dev>",
        to,
        subject,
        html,
        text,
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!response.ok) {
      console.error("Email failed:", response.status, await response.text());
      return { delivered: false };
    }
    return { delivered: true };
  } catch (error) {
    // A mail outage must never crash the request that triggered it.
    console.error("Email failed:", error.message);
    return { delivered: false };
  }
};

const resetPasswordEmail = ({ name, link, minutes }) => ({
  subject: "Reset your Petly password",
  text: `Hi ${name},\n\nUse this link to choose a new password (valid for ${minutes} minutes):\n${link}\n\nIf you didn't ask for this, you can ignore this email.`,
  html: `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:24px;color:#1e1b16">
      <h2 style="margin:0 0 16px">🐾 Petly</h2>
      <p>Hi ${name},</p>
      <p>We received a request to reset your password. This link is valid for ${minutes} minutes.</p>
      <p style="margin:28px 0">
        <a href="${link}" style="background:#fbc02d;color:#1e1b16;padding:12px 22px;border-radius:12px;text-decoration:none;font-weight:bold">Reset password</a>
      </p>
      <p style="color:#8a8274;font-size:13px">If you didn't ask for this, you can safely ignore this email.</p>
    </div>`,
});

module.exports = { sendEmail, resetPasswordEmail };
