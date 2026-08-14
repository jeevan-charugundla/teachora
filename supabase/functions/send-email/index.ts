// Supabase Edge Function: Branded Email Service (Resend)
// Deploy: supabase functions deploy send-email --no-verify-jwt

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { sendResendEmail } from "../_shared/resend.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Generates beautiful responsive HTML email templates
function renderEmailTemplate({
  type,
  name = "Teacher",
  otp,
  link,
}: {
  type: "welcome" | "otp" | "reset" | "confirm";
  name?: string;
  otp?: string;
  link?: string;
}): { subject: string; html: string; text: string } {
  const brandColor = "#0d9488"; // Emerald 600

  if (type === "welcome" || type === "confirm") {
    const subject = "Welcome to Teachora — Confirm Your Teacher Account";
    const text = `Welcome, ${name}!\n\nThank you for signing up for Teachora. Click the link below to confirm your account:\n${link || "https://teachora.app"}`;
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head><meta charset="utf-8"/></head>
      <body style="font-family: Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b;">
        <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
          <div style="background-color: ${brandColor}; padding: 24px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 22px; font-weight: bold; letter-spacing: 1px;">TEACHORA</h1>
            <p style="margin: 4px 0 0 0; font-size: 12px; opacity: 0.9;">AI Educational Studio for Teachers</p>
          </div>
          <div style="padding: 32px 24px;">
            <h2 style="font-size: 18px; color: #0f172a; margin-top: 0;">Welcome to Teachora, ${name}! 👋</h2>
            <p style="font-size: 14px; line-height: 1.6; color: #475569;">
              We are thrilled to welcome you. Your new AI-powered teaching workspace is ready to help you generate lesson plans, quizzes, worksheets, diagrams, and presentations in seconds.
            </p>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${link || "http://localhost:5173"}" style="background-color: ${brandColor}; color: white; text-decoration: none; padding: 12px 28px; font-size: 14px; font-weight: bold; border-radius: 10px; display: inline-block;">
                Confirm Account & Get Started
              </a>
            </div>
            <p style="font-size: 13px; color: #64748b; line-height: 1.5;">
              If you did not sign up for Teachora, you can safely ignore this email.
            </p>
          </div>
          <div style="background-color: #f1f5f9; padding: 16px 24px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
            Teachora Educational AI Studio • Empowers Teachers Worldwide
          </div>
        </div>
      </body>
      </html>
    `;
    return { subject, html, text };
  }

  if (type === "otp") {
    const subject = `Teachora Verification Code: ${otp || "OTP"}`;
    const text = `Teachora Security Verification Code: ${otp || "123456"}\nThis code will expire in 10 minutes.`;
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head><meta charset="utf-8"/></head>
      <body style="font-family: Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b;">
        <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
          <div style="background-color: ${brandColor}; padding: 24px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 22px; font-weight: bold; letter-spacing: 1px;">TEACHORA</h1>
            <p style="margin: 4px 0 0 0; font-size: 12px; opacity: 0.9;">Security Verification</p>
          </div>
          <div style="padding: 32px 24px; text-align: center;">
            <h2 style="font-size: 18px; color: #0f172a; margin-top: 0;">Your Security Code</h2>
            <p style="font-size: 14px; color: #475569;">
              Use the following 6-digit OTP code to complete your security verification.
            </p>
            <div style="margin: 24px 0; background: #f0fdf4; border: 2px dashed ${brandColor}; border-radius: 12px; padding: 16px;">
              <span style="font-family: monospace; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: ${brandColor};">${otp || "123456"}</span>
            </div>
            <p style="font-size: 12px; color: #94a3b8;">This code will expire in 10 minutes. Do not share this code with anyone.</p>
          </div>
          <div style="background-color: #f1f5f9; padding: 16px 24px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
            Teachora Educational AI Studio
          </div>
        </div>
      </body>
      </html>
    `;
    return { subject, html, text };
  }

  // Password Reset Link
  const subject = "Reset your Teachora account password";
  const text = `Password Reset Request\n\nClick the link below to choose a new password:\n${link || "#"}`;
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head><meta charset="utf-8"/></head>
    <body style="font-family: Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b;">
      <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden;">
        <div style="background-color: ${brandColor}; padding: 24px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 22px; font-weight: bold;">TEACHORA</h1>
          <p style="margin: 4px 0 0 0; font-size: 12px;">Password Recovery</p>
        </div>
        <div style="padding: 32px 24px;">
          <h2 style="font-size: 18px; color: #0f172a;">Password Reset Request</h2>
          <p style="font-size: 14px; color: #475569; line-height: 1.6;">
            We received a request to reset the password for your Teachora teacher account. Click the button below to choose a new password:
          </p>
          <div style="text-align: center; margin: 28px 0;">
            <a href="${link || "#"}" style="background-color: ${brandColor}; color: white; text-decoration: none; padding: 12px 28px; font-size: 14px; font-weight: bold; border-radius: 10px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p style="font-size: 12px; color: #94a3b8;">If you did not request a password reset, you can safely ignore this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  return { subject, html, text };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { to, type = "welcome", name, otp, link } = body;

    if (!to || typeof to !== "string" || !to.includes("@")) {
      return new Response(
        JSON.stringify({ success: false, error: "Recipient 'to' email address is required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { subject, html, text } = renderEmailTemplate({ type, name, otp, link });

    const result = await sendResendEmail({
      to,
      subject,
      html,
      text,
    });

    if (!result.success) {
      const status = result.status && result.status >= 400 && result.status < 600 ? result.status : 502;
      return new Response(
        JSON.stringify({ success: false, error: result.error || "Failed to dispatch email." }),
        { status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: "Email dispatched via Resend.", id: result.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
