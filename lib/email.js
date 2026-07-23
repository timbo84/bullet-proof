import { Resend } from "resend";

let client = null;
function getClient() {
  if (!process.env.RESEND_API_KEY) return null;
  if (!client) client = new Resend(process.env.RESEND_API_KEY);
  return client;
}

// Never let email delivery problems (sandbox restrictions, bad API key, rate
// limits, etc.) break the forgot-password flow — the caller falls back to
// the dev-token response when this reports sent: false.
export async function sendPasswordResetEmail({ to, resetUrl }) {
  const resend = getClient();
  if (!resend) return { sent: false };

  try {
    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
      to,
      subject: "Reset your Bulletproof Cop password",
      html: `
        <p>Someone requested a password reset for your Bulletproof Cop account.</p>
        <p><a href="${resetUrl}">Click here to set a new password</a>. This link expires in 30 minutes.</p>
        <p>If you didn't request this, you can safely ignore this email.</p>
      `,
    });
    if (error) {
      console.error("Resend send failed:", error);
      return { sent: false };
    }
    return { sent: true };
  } catch (err) {
    console.error("Resend send threw:", err);
    return { sent: false };
  }
}
