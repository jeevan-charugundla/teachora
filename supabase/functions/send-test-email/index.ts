// Supabase Edge Function: Send Test Email (Resend Verification)
// Deploy: supabase functions deploy send-test-email --no-verify-jwt

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { sendResendEmail } from "../_shared/resend.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function renderTestEmailTemplate(): { subject: string; html: string; text: string } {
  const brandColor = "#0d9488"; // Emerald 600

  const subject = "Teachora Email Service Test";
  const text = `Teachora\n\nYour email delivery system is working correctly.\n\nThis is a development test email generated through the Teachora email service.`;
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8"/>
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>${subject}</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 32px 16px; color: #1e293b;">
      <div style="max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        <div style="background-color: ${brandColor}; padding: 28px 24px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 1px;">TEACHORA</h1>
          <p style="margin: 6px 0 0 0; font-size: 13px; opacity: 0.95; font-weight: 500;">Transactional Email System</p>
        </div>
        <div style="padding: 32px 28px;">
          <div style="display: inline-block; padding: 6px 12px; background-color: #ecfdf5; border-radius: 20px; color: #047857; font-size: 12px; font-weight: 600; margin-bottom: 20px;">
            ✓ Delivery Test Passed
          </div>
          <h2 style="font-size: 20px; font-weight: 700; color: #0f172a; margin: 0 0 16px 0;">System Verification Complete</h2>
          <p style="font-size: 15px; line-height: 1.6; color: #334155; margin: 0 0 16px 0;">
            Your email delivery system is working correctly.
          </p>
          <p style="font-size: 14px; line-height: 1.6; color: #64748b; margin: 0 0 24px 0;">
            This is a development test email generated through the Teachora email service.
          </p>
          <div style="border-top: 1px dashed #cbd5e1; padding-top: 20px; margin-top: 20px;">
            <p style="font-size: 12px; color: #94a3b8; margin: 0;">
              Sent via Teachora Edge Function & Resend API
            </p>
          </div>
        </div>
        <div style="background-color: #f1f5f9; padding: 16px 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;">
          Teachora Educational Platform
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

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ success: false, error: "Method not allowed. Use POST." }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { to } = body;

    if (!to || typeof to !== "string" || !to.includes("@")) {
      return new Response(
        JSON.stringify({ success: false, error: "Please provide a valid recipient email address in 'to'." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { subject, html, text } = renderTestEmailTemplate();

    const result = await sendResendEmail({
      to,
      subject,
      html,
      text,
    });

    if (!result.success) {
      // Map error status code appropriately
      const status = result.status && result.status >= 400 && result.status < 600 ? result.status : 502;
      return new Response(
        JSON.stringify({
          success: false,
          error: result.error || "Email delivery failed via provider.",
        }),
        { status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Test email dispatched successfully.",
        id: result.id,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal edge function error.";
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
