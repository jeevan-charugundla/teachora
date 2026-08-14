// Supabase Edge Function: Branded Email Service (Resend / Custom SMTP)
// Deploy: supabase functions deploy send-email --no-verify-jwt

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_EMAIL = Deno.env.get("SEND_EMAIL_FROM") || "Teachora <onboarding@resend.dev>";

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
  type: "welcome" | "otp" | "reset";
  name?: string;
  otp?: string;
  link?: string;
}): { subject: string; html: string } {
  const brandColor = "#0d9488"; // Emerald 600

  if (type === "welcome") {
    return {
      subject: "Welcome to Teachora — Your AI Teaching Assistant",
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"/></head>
        <body style="font-family: Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b;">
          <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
            <div style="background-color: ${brandColor}; padding: 24px; text-align: center; color: white;">
              <h1 style="margin: 0; font-size: 22px; font-weight: bold; letter-spacing: 1px;">TEACHORA</h1>
              <p style="margin: 4px 0 0 0; font-size: 12px; opacity: 0.9;">AI Educational Studio for Teachers</p>
            </div>
            <div style="padding: 32px 24px;">
              <h2 style="font-size: 18px; color: #0f172a; margin-top: 0;">Welcome, ${name}! 👋</h2>
              <p style="font-size: 14px; line-height: 1.6; color: #475569;">
                We are thrilled to welcome you to <strong>Teachora</strong>. Your new AI-powered teaching workspace is ready to help you generate lesson plans, quizzes, worksheets, diagrams, and presentations in seconds.
              </p>
              <div style="text-align: center; margin: 32px 0;">
                <a href="${link || "https://teachora.app"}" style="background-color: ${brandColor}; color: white; text-decoration: none; padding: 12px 28px; font-size: 14px; font-weight: bold; border-radius: 10px; display: inline-block;">
                  Open Teachora Studio
                </a>
              </div>
              <p style="font-size: 13px; color: #64748b; line-height: 1.5;">
                If you ever have questions or feedback, our support team is always here to assist you.
              </p>
            </div>
            <div style="background-color: #f1f5f9; padding: 16px 24px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
              Teachora Educational AI Studio • Empowers Teachers Worldwide
            </div>
          </div>
        </body>
        </html>
      `,
    };
  }

  if (type === "otp") {
    return {
      subject: `Teachora Verification Code: ${otp || "OTP"}`,
      html: `
        <!DOCTYPE html>
        <html>
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
      `,
    };
  }

  // Password Reset Link
  return {
    subject: "Reset your Teachora account password",
    html: `
      <!DOCTYPE html>
      <html>
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
    `,
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { to, type = "welcome", name, otp, link } = body;

    if (!to || typeof to !== "string") {
      return new Response(
        JSON.stringify({ success: false, error: "Recipient 'to' email address is required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { subject, html } = renderEmailTemplate({ type, name, otp, link });

    // If Resend API key is available, dispatch email
    if (RESEND_API_KEY) {
      const resendRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: [to],
          subject,
          html,
        }),
      });

      if (!resendRes.ok) {
        const errText = await resendRes.text();
        console.error("Resend API error:", resendRes.status, errText);
        return new Response(
          JSON.stringify({ success: false, error: "Failed to dispatch email via Resend provider." }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const resendData = await resendRes.json();
      return new Response(
        JSON.stringify({ success: true, message: "Email dispatched via Resend.", id: resendData.id }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fallback: Return simulated email response for testing
    console.log(`[Email Service Mock] To: ${to} | Subject: ${subject}`);
    return new Response(
      JSON.stringify({
        success: true,
        mock: true,
        message: "Email logged. To send live emails, set RESEND_API_KEY in Environment.",
        subject,
      }),
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
