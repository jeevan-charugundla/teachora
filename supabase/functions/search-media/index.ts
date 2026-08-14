// Supabase Edge Function: Media Search Proxy (Pexels)
// Deploy: supabase functions deploy search-media --no-verify-jwt

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const PEXELS_API_KEY = Deno.env.get("PEXELS_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("SUPABASE_PUBLISHABLE_KEY") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_SECRET_KEY") || "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (!PEXELS_API_KEY) {
      return new Response(
        JSON.stringify({
          success: false,
          error: { code: "PROVIDER_CONFIG_ERROR", message: "Media search service is not configured. PEXELS_API_KEY is missing." },
        }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({
          success: false,
          error: { code: "UNAUTHORIZED", message: "Unauthorized. Please log in to search educational media." },
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
          error: { code: "UNAUTHORIZED", message: "Invalid session." },
        }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json().catch(() => ({}));
    const {
      query,
      type = "photos",
      per_page = 12,
      perPage,
      page = 1,
      orientation = "landscape",
    } = body;

    const count = perPage || per_page || 12;

    if (!query || typeof query !== "string" || !query.trim()) {
      return new Response(
        JSON.stringify({
          success: false,
          error: { code: "BAD_REQUEST", message: "Search query is required." },
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const cleanQuery = encodeURIComponent(query.trim());
    const isVideo = type === "video" || type === "videos";
    const apiUrl = isVideo
      ? `https://api.pexels.com/videos/search?query=${cleanQuery}&per_page=${count}&page=${page}&orientation=${orientation}`
      : `https://api.pexels.com/v1/search?query=${cleanQuery}&per_page=${count}&page=${page}&orientation=${orientation}`;

    const pexelsRes = await fetch(apiUrl, {
      headers: {
        Authorization: PEXELS_API_KEY,
      },
    });

    if (!pexelsRes.ok) {
      const errText = await pexelsRes.text();
      console.error("Pexels API error:", pexelsRes.status, errText);
      return new Response(
        JSON.stringify({
          success: false,
          error: { code: "PROVIDER_ERROR", message: "Failed to fetch media from provider." },
        }),
        { status: pexelsRes.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const pexelsData = await pexelsRes.json();

    // Map to clean, sanitized normalized response
    const results = isVideo
      ? (pexelsData.videos || []).map((v: any) => ({
          id: String(v.id),
          type: "video",
          url: v.url,
          thumbnailUrl: v.image,
          duration: v.duration,
          width: v.width,
          height: v.height,
          photographer: v.user?.name || "Pexels Creator",
          photographerUrl: v.user?.url || "",
          attribution: "Videos by Pexels",
          files: (v.video_files || []).map((f: any) => ({
            link: f.link,
            quality: f.quality,
            width: f.width,
            height: f.height,
          })),
        }))
      : (pexelsData.photos || []).map((p: any) => ({
          id: String(p.id),
          type: "photo",
          url: p.src?.large || p.src?.medium || p.src?.original,
          thumbnailUrl: p.src?.small || p.src?.tiny,
          width: p.width,
          height: p.height,
          photographer: p.photographer,
          photographerUrl: p.photographer_url,
          alt: p.alt || query,
          attribution: "Photos by Pexels",
          src: p.src,
        }));

    return new Response(
      JSON.stringify({
        success: true,
        query: query.trim(),
        type: isVideo ? "video" : "photo",
        total_results: pexelsData.total_results || results.length,
        page: pexelsData.page || page,
        media: results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error occurred.";
    console.error("Search media error:", message);
    return new Response(
      JSON.stringify({
        success: false,
        error: { code: "SERVER_ERROR", message: "Failed to search media." },
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
