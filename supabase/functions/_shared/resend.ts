// Shared Resend Email Service for Teachora Supabase Edge Functions

export interface SendEmailPayload {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
}

export interface SendEmailResult {
  success: boolean;
  id?: string;
  error?: string;
  status?: number;
}

export const DEFAULT_FROM_EMAIL = Deno.env.get("SEND_EMAIL_FROM") || "Teachora <onboarding@resend.dev>";

export async function sendResendEmail(payload: SendEmailPayload): Promise<SendEmailResult> {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) {
    return {
      success: false,
      error: "RESEND_API_KEY environment variable is not configured server-side.",
      status: 500,
    };
  }

  const recipients = Array.isArray(payload.to) ? payload.to : [payload.to];
  const from = payload.from || DEFAULT_FROM_EMAIL;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: recipients,
        subject: payload.subject,
        html: payload.html,
        ...(payload.text ? { text: payload.text } : {}),
        ...(payload.replyTo ? { reply_to: payload.replyTo } : {}),
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMessage = data?.message || data?.error?.message || `Resend API returned status ${response.status}`;
      return {
        success: false,
        error: errorMessage,
        status: response.status,
      };
    }

    return {
      success: true,
      id: data.id,
      status: response.status,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Network or system error occurred while contacting email service.";
    return {
      success: false,
      error: errorMsg,
      status: 500,
    };
  }
}
