// Supabase Edge Function: Send Web Push Notifications
// Deploy: supabase functions deploy send-push --no-verify-jwt

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY");
const VAPID_PUBLIC_KEY =
  Deno.env.get("VITE_VAPID_PUBLIC_KEY") ||
  Deno.env.get("VAPID_PUBLIC_KEY") ||
  "BPJz0kuqzs4iPDltF5yrZCuD70_G7q5SPSfWx6mvIRnRd1pYaDgW6BzhPMDHcAx5i2m0S0xenjckkj7x76elxw4";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("SUPABASE_PUBLISHABLE_KEY") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_SECRET_KEY") || "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (!VAPID_PRIVATE_KEY) {
      console.error("VAPID_PRIVATE_KEY is missing from Edge Function secrets.");
      return new Response(
        JSON.stringify({
          success: false,
          error: { code: "CONFIG_ERROR", message: "Push notification service is not configured." },
        }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Configure VAPID details
    try {
      webpush.setVapidDetails(
        "mailto:notifications@teachora.com",
        VAPID_PUBLIC_KEY,
        VAPID_PRIVATE_KEY
      );
    } catch (vapidErr) {
      console.error("VAPID configuration error:", vapidErr);
    }

    // 1. Authenticate user from authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({
          success: false,
          error: { code: "UNAUTHORIZED", message: "Unauthorized. Please log in to send notifications." },
        }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAuthClient = createClient(
      SUPABASE_URL,
      SUPABASE_ANON_KEY || SUPABASE_SERVICE_ROLE_KEY,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseAuthClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({
          success: false,
          error: { code: "UNAUTHORIZED", message: "Invalid session or authentication token." },
        }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Parse request body
    const body = await req.json().catch(() => ({}));
    const title = body.title || "Teachora Notification 📚";
    const notificationBody = body.body || "Your classroom material is ready.";
    const targetUrl = body.url || "/app/workspace";
    const icon = body.icon || "/favicon.svg";
    const badge = body.badge || "/favicon.svg";
    const extraData = body.data || {};
    const targetUserId = body.userId || user.id;

    // Security check: normal teachers can only notify themselves
    if (targetUserId !== user.id) {
      // Allow only self-targeted pushes
      return new Response(
        JSON.stringify({
          success: false,
          error: { code: "FORBIDDEN", message: "You can only send notifications to your own devices." },
        }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Service client to query push_subscriptions table
    const dbClient = createClient(
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY,
      { auth: { persistSession: false } }
    );

    const { data: subscriptions, error: subError } = await dbClient
      .from("push_subscriptions")
      .select("id, endpoint, p256dh, auth")
      .eq("user_id", targetUserId);

    if (subError) {
      console.error("Error querying push_subscriptions:", subError);
      return new Response(
        JSON.stringify({
          success: false,
          error: { code: "DATABASE_ERROR", message: "Failed to retrieve push subscriptions." },
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          sent: 0,
          message: "No active push subscriptions found for this user.",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4. Construct Web Push payload
    const pushPayload = JSON.stringify({
      title,
      body: notificationBody,
      url: targetUrl,
      icon,
      badge,
      data: {
        url: targetUrl,
        ...extraData,
      },
    });

    let sentCount = 0;
    let failedCount = 0;
    const deadSubscriptionIds: string[] = [];

    // 5. Send push notification to all user endpoints
    await Promise.all(
      subscriptions.map(async (sub) => {
        const pushSubscriptionObj = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        };

        try {
          await webpush.sendNotification(pushSubscriptionObj, pushPayload);
          sentCount++;
        } catch (err: any) {
          failedCount++;
          console.warn(`Push failed for endpoint ${sub.endpoint.slice(0, 30)}...:`, err.statusCode || err.message);

          // Expired or invalid subscription (404 Not Found or 410 Gone) -> mark for deletion
          if (err.statusCode === 404 || err.statusCode === 410) {
            deadSubscriptionIds.push(sub.id);
          }
        }
      })
    );

    // Clean up dead subscriptions
    if (deadSubscriptionIds.length > 0) {
      try {
        await dbClient
          .from("push_subscriptions")
          .delete()
          .in("id", deadSubscriptionIds);
        console.log(`Cleaned up ${deadSubscriptionIds.length} expired subscriptions.`);
      } catch (cleanErr) {
        console.warn("Notice: Dead subscription cleanup notice:", cleanErr);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        sent: sentCount,
        failed: failedCount,
        totalSubscriptions: subscriptions.length,
        cleaned: deadSubscriptionIds.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("send-push Edge Function error:", err);
    return new Response(
      JSON.stringify({
        success: false,
        error: { code: "SERVER_ERROR", message: err.message || "Internal server error." },
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
