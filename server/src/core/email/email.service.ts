import { Resend } from "resend";
import { env } from "@/core/config/env";

export interface SendPasswordResetOptions {
  to: string;
  name?: string;
  resetUrl: string;
}

let resendClient: Resend | null = null;

function getResendClient(): Resend | null {
  if (!resendClient && env.RESEND_API_KEY) {
    resendClient = new Resend(env.RESEND_API_KEY);
  }
  return resendClient;
}

export function generatePasswordResetHtml(name: string, resetUrl: string): string {
  const recipientName = name ? name.trim() : "Candidate";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your SKILLEZO Password</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #0c1024;
      color: #e2e8f0;
      margin: 0;
      padding: 24px;
    }
    .container {
      max-width: 540px;
      margin: 0 auto;
      background-color: #131b3e;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 32px 28px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
    }
    .logo {
      display: inline-block;
      font-size: 20px;
      font-weight: 800;
      color: #ffffff;
      letter-spacing: 0.5px;
      margin-bottom: 24px;
    }
    .logo-accent {
      color: #3D5AFE;
    }
    h1 {
      font-size: 22px;
      font-weight: 700;
      color: #ffffff;
      margin-top: 0;
      margin-bottom: 16px;
    }
    p {
      font-size: 14px;
      line-height: 1.6;
      color: #cbd5e1;
      margin-bottom: 20px;
    }
    .button-container {
      margin: 28px 0;
      text-align: center;
    }
    .reset-button {
      display: inline-block;
      background-color: #3D5AFE;
      color: #ffffff !important;
      text-decoration: none;
      font-weight: 600;
      font-size: 15px;
      padding: 14px 32px;
      border-radius: 10px;
      box-shadow: 0 4px 14px rgba(61, 90, 254, 0.4);
    }
    .fallback-url {
      font-size: 12px;
      color: #94a3b8;
      word-break: break-all;
      background-color: rgba(0, 0, 0, 0.2);
      padding: 10px 12px;
      border-radius: 8px;
      margin-top: 24px;
      border: 1px solid rgba(255, 255, 255, 0.05);
    }
    .footer {
      margin-top: 32px;
      padding-top: 20px;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      font-size: 12px;
      color: #64748b;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">
      SKILLEZO<span class="logo-accent">.AI</span>
    </div>
    <h1>Reset Your Password 🔑</h1>
    <p>Hi ${recipientName},</p>
    <p>We received a request to reset your password for your SKILLEZO account. Click the button below to set up a new password:</p>
    
    <div class="button-container">
      <a href="${resetUrl}" target="_blank" class="reset-button">Reset My Password</a>
    </div>

    <p style="font-size: 13px; color: #94a3b8;">
      ⏳ This link will automatically expire in <strong>1 hour</strong>. If you did not request a password reset, you can safely ignore this email — your account remains completely secure.
    </p>

    <div class="fallback-url">
      If the button above doesn't work, copy and paste this link into your browser:<br>
      <a href="${resetUrl}" style="color: #60a5fa;">${resetUrl}</a>
    </div>

    <div class="footer">
      © ${new Date().getFullYear()} SKILLEZO AI • The Intelligent Career & Hiring Platform<br>
      Automated system message — please do not reply directly to this email.
    </div>
  </div>
</body>
</html>
  `.trim();
}

export async function sendPasswordResetEmail(options: SendPasswordResetOptions): Promise<boolean> {
  const { to, name = "Candidate", resetUrl } = options;

  // Always output direct clickable link to development terminal for frictionless testing
  console.log("\n========================================================");
  console.log("🔑 [SKILLEZO AUTH] Password Reset Request Generated");
  console.log(`✉️  Recipient: ${to}`);
  console.log(`🔗 Reset Link: ${resetUrl}`);
  console.log("========================================================\n");

  const resend = getResendClient();
  if (!resend) {
    console.warn("[EmailService] No RESEND_API_KEY provided. Email delivery skipped (link logged above).");
    return true;
  }

  try {
    const html = generatePasswordResetHtml(name, resetUrl);
    const result = await resend.emails.send({
      from: env.EMAIL_FROM || "SKILLEZO <onboarding@resend.dev>",
      to: [to],
      subject: "Reset your SKILLEZO password 🔑",
      html,
    });

    if (result.error) {
      console.error("[EmailService] Resend API rejected message:", result.error);
      return false;
    }

    console.log(`[EmailService] Password reset email dispatched via Resend to ${to} (ID: ${result.data?.id})`);
    return true;
  } catch (error: any) {
    console.error("[EmailService] Unexpected error sending email via Resend:", error?.message || error);
    return false;
  }
}
