// Supabase Edge Function: AI Image Generation (Cloudflare FLUX + Pexels stock)
// Deploy: supabase functions deploy generate-image --no-verify-jwt

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// ── Server-side credentials (never exposed to frontend) ──────────────────────
const CLOUDFLARE_ACCOUNT_ID = Deno.env.get("CLOUDFLARE_ACCOUNT_ID") || "";
const CLOUDFLARE_API_TOKEN = Deno.env.get("CLOUDFLARE_API_TOKEN") || "";
const PEXELS_API_KEY = Deno.env.get("PEXELS_API_KEY") || "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_ANON_KEY =
  Deno.env.get("SUPABASE_ANON_KEY") ||
  Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ||
  "";
const SUPABASE_SERVICE_ROLE_KEY =
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ||
  Deno.env.get("SUPABASE_SECRET_KEY") ||
  "";

const CLOUDFLARE_FLUX_MODEL = "@cf/black-forest-labs/flux-1-schnell";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Aspect ratio → pixel dimensions
const DIMENSION_MAP: Record<string, { width: number; height: number }> = {
  landscape: { width: 1280, height: 720 },
  square: { width: 1024, height: 1024 },
  portrait: { width: 720, height: 1280 },
};

// ── Prompt Engineering ────────────────────────────────────────────────────────
function buildEducationalImagePrompt(params: {
  prompt?: string;
  topic?: string;
  subject?: string;
  grade?: string;
  style?: string;
  creationType?: string;
  additionalInstructions?: string;
  diagramType?: string;
  visualStyle?: string;
  requiredElements?: string[];
  orientation?: string;
}): string {
  const topic = (params.topic || params.prompt || "Educational Concept").trim();
  const subject = params.subject || "General Science";
  const grade = params.grade || "Grade 8";
  const visualStyle = params.visualStyle || params.style || "Realistic Scientific";
  const diagramType = params.diagramType || "Scientific Diagram";
  const extra = params.additionalInstructions ? ` ${params.additionalInstructions}.` : "";
  const orientation = params.orientation || "landscape";
  const orientationDesc =
    orientation === "portrait" ? "portrait orientation" : "landscape / horizontal orientation";

  const reqElements =
    Array.isArray(params.requiredElements) && params.requiredElements.length > 0
      ? params.requiredElements
      : [];
  const elementsSentence =
    reqElements.length > 0
      ? ` Clearly show all of the following structures/components: ${reqElements.join(", ")}.`
      : "";

  const styleInstructions: Record<string, string> = {
    "Realistic Scientific":
      "photorealistic scientific illustration, highly detailed, accurate proportions, professional textbook-quality rendering",
    "Textbook Illustration":
      "classic educational textbook illustration style, clean lines, muted educational color palette, suitable for printed textbooks",
    "Detailed Educational":
      "highly detailed educational diagram style, annotatable, clear structural features, suitable for classroom projection",
    "3D Educational":
      "3D rendered educational illustration, depth and shading, realistic materials, suitable for high school classroom",
    "Clean Vector Illustration":
      "clean flat vector educational illustration, bright educational colors, crisp outlines, modern infographic style",
    "Medical Illustration":
      "professional medical illustration style, accurate anatomy, clinical detail, clean white background",
  };
  const styleDesc =
    styleInstructions[visualStyle] ||
    "educational scientific illustration, high detail, professional quality";

  return `Create a high-quality ${styleDesc} showing: ${topic}. Subject: ${subject}. Audience: ${grade} students. ${orientationDesc}. Diagram type: ${diagramType}.${elementsSentence} Use a clean white or very light neutral background. No text labels, no callouts, no watermarks, no annotations written on the image — labels will be overlaid separately by the educational platform. Focus on scientific accuracy, realistic textures, clear structural definition, and educational clarity.${extra} Style: ${visualStyle}.`;
}

// ── Pexels Stock Photo Logic ──────────────────────────────────────────────────
function sanitizeSearchQuery(query: string): string {
  if (!query) return "science";
  let cleaned = query
    .replace(/grade\s*\d+/gi, "")
    .replace(/class\s*\d+/gi, "")
    .replace(
      /(educational|worksheet|activity|diagram|lesson plan|presentation|infographic|unit|chapter|middle school|high school)/gi,
      ""
    )
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned || query;
}

function scorePhotoRelevance(
  photo: Record<string, unknown>,
  topic: string,
  _subQueries: string[]
): number {
  const alt = (photo.alt as string || "").toLowerCase();
  const topicTokens = topic.toLowerCase().split(/\s+/).filter((t) => t.length > 2);

  let score = 0.5;
  let matches = 0;
  topicTokens.forEach((token) => { if (alt.includes(token)) matches++; });
  score += (matches / Math.max(1, topicTokens.length)) * 0.35;

  const negativeTerms = [
    "portrait", "smile", "fashion", "girl", "boy", "model", "selfie",
    "shopping", "party", "car", "wedding", "business suit",
  ];
  negativeTerms.forEach((term) => { if (alt.includes(term)) score -= 0.25; });

  return Math.min(1.0, Math.max(0.0, score));
}

async function searchPexels(
  query: string,
  perPage: number = 6,
  minScore: number = 0.65
): Promise<Record<string, unknown>[]> {
  if (!PEXELS_API_KEY || !query) return [];
  try {
    const cleaned = sanitizeSearchQuery(query);
    const subQueries = [cleaned];

    if (cleaned.toLowerCase().includes("newton")) {
      subQueries.push("Newton's laws of motion physics demonstration");
      subQueries.push("inertia force acceleration physics experiment");
    } else if (cleaned.toLowerCase().includes("photosynthesis")) {
      subQueries.push("photosynthesis plant biology experiment");
      subQueries.push("leaf structure chloroplast biology");
    }

    const candidateMap = new Map<string, Record<string, unknown>>();

    for (const q of subQueries) {
      const res = await fetch(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(q)}&per_page=8&orientation=landscape`,
        { headers: { Authorization: PEXELS_API_KEY } }
      );
      if (res.ok) {
        const data = await res.json();
        (data.photos || []).forEach((p: Record<string, unknown>) => {
          const src = p.src as Record<string, string>;
          if (!candidateMap.has(String(p.id))) {
            const item: Record<string, unknown> = {
              id: String(p.id),
              type: "photo",
              url: src?.large || src?.medium || src?.original,
              thumbnailUrl: src?.small || src?.tiny,
              width: p.width,
              height: p.height,
              photographer: p.photographer,
              photographerUrl: p.photographer_url,
              alt: p.alt || query,
              attribution: "Stock Photo",
              source: "stock",
            };
            const score = scorePhotoRelevance(item, query, subQueries);
            if (score >= minScore) {
              candidateMap.set(String(p.id), { ...item, relevanceScore: score });
            }
          }
        });
      }
    }

    return Array.from(candidateMap.values())
      .sort((a, b) => (b.relevanceScore as number) - (a.relevanceScore as number))
      .slice(0, perPage);
  } catch (err) {
    console.warn("Pexels search error:", err);
    return [];
  }
}

// ── Cloudflare Workers AI — FLUX Image Generation ────────────────────────────
async function generateCloudflareFluxImage(
  enhancedPrompt: string
): Promise<{ buffer: ArrayBuffer; contentType: string; modelUsed: string }> {
  if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_API_TOKEN) {
    throw new Error(
      "Cloudflare credentials not configured. Set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN in Edge Function secrets."
    );
  }

  const endpoint = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/ai/run/${CLOUDFLARE_FLUX_MODEL}`;

  // Note: flux-1-schnell only accepts { prompt } — no num_steps/width/height
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt: enhancedPrompt }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error("Cloudflare FLUX API error:", res.status, errText);

    if (res.status === 429) {
      const err: Error & { status?: number } = new Error(
        "Image generation is temporarily busy. Please try again in a moment."
      );
      err.status = 429;
      throw err;
    }
    if (res.status === 403 || res.status === 401) {
      const err: Error & { status?: number } = new Error(
        "AI image generation authentication failed. Please contact support."
      );
      err.status = 403;
      throw err;
    }
    throw new Error(`Cloudflare FLUX returned ${res.status}: ${errText.slice(0, 200)}`);
  }

  const contentType = res.headers.get("content-type") || "";

  // FLUX returns either raw image bytes or a JSON wrapper with base64
  if (contentType.startsWith("image/")) {
    // Direct binary image response
    const buffer = await res.arrayBuffer();
    return { buffer, contentType, modelUsed: CLOUDFLARE_FLUX_MODEL };
  }

  // JSON response — may contain base64-encoded image
  const json = await res.json();

  // Handle Workers AI typical response: { result: { image: "<base64>" } }
  const base64Image: string | undefined =
    json?.result?.image ??      // standard path
    json?.image ??              // alternate path
    json?.result ??             // sometimes bare base64
    undefined;

  if (base64Image && typeof base64Image === "string") {
    // Decode base64 → ArrayBuffer
    const binary = atob(base64Image);
    const uint8 = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      uint8[i] = binary.charCodeAt(i);
    }
    return {
      buffer: uint8.buffer,
      contentType: "image/png",
      modelUsed: CLOUDFLARE_FLUX_MODEL,
    };
  }

  // Unexpected response shape
  console.error("Unexpected Cloudflare FLUX response shape:", JSON.stringify(json).slice(0, 300));
  throw new Error("Cloudflare FLUX returned an unexpected response format.");
}

// ── Main Handler ─────────────────────────────────────────────────────────────
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1. Authenticate teacher via Supabase JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({
          success: false,
          error: { code: "UNAUTHORIZED", message: "Unauthorized. Please log in." },
        }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAuthClient = createClient(
      SUPABASE_URL,
      SUPABASE_ANON_KEY || SUPABASE_SERVICE_ROLE_KEY,
      { global: { headers: { Authorization: authHeader } } }
    );

    const {
      data: { user },
      error: authError,
    } = await supabaseAuthClient.auth.getUser();

    if (authError || !user) {
      return new Response(
        JSON.stringify({
          success: false,
          error: { code: "UNAUTHORIZED", message: "Invalid session or authentication token." },
        }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Parse request parameters
    const body = await req.json().catch(() => ({}));
    const {
      prompt,
      topic,
      subject = "Science",
      grade = "Grade 8",
      style = "educational illustration",
      aspectRatio = "landscape",
      creationType = "diagram",
      additionalInstructions,
      // "auto" | "stock" | "ai"
      // "auto" = smart routing: photograph topics → Pexels first, AI illustration topics → FLUX
      // "stock" = Pexels only
      // "ai"   = FLUX only
      visualSource = "auto",
      width: customWidth,
      height: customHeight,
      diagramType,
      visualStyle,
      requiredElements,
      orientation,
    } = body;

    const effectiveTopic = topic || prompt;
    if (!effectiveTopic || typeof effectiveTopic !== "string" || !effectiveTopic.trim()) {
      return new Response(
        JSON.stringify({
          success: false,
          error: { code: "BAD_REQUEST", message: "Topic or prompt is required." },
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const dims = DIMENSION_MAP[aspectRatio] || DIMENSION_MAP.landscape;
    const finalWidth = customWidth || dims.width;
    const finalHeight = customHeight || dims.height;

    // Service client for DB & Storage persistence
    const dbClient = createClient(
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY,
      { auth: { persistSession: false } }
    );

    // ──────────────────────────────────────────────────────────────────────────
    // STRATEGY 1 — Stock Only (Pexels)
    // ──────────────────────────────────────────────────────────────────────────
    if (visualSource === "stock") {
      const stockPhotos = await searchPexels(effectiveTopic, 6);
      return new Response(
        JSON.stringify({
          success: true,
          provider: "pexels",
          source: "stock",
          found: stockPhotos.length > 0,
          message: stockPhotos.length === 0 ? "No suitable stock visual found." : undefined,
          media: stockPhotos,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ──────────────────────────────────────────────────────────────────────────
    // STRATEGY 2 — Auto Routing
    // Structured visuals (diagram, chart, mind-map, infographic) → skip Pexels → FLUX
    // Photograph-type topics → try Pexels first, fallback to FLUX
    // ──────────────────────────────────────────────────────────────────────────
    if (visualSource === "auto") {
      const structuredTypes = ["diagram", "infographic", "mind-map", "chart"];
      const skipPexels = structuredTypes.includes(creationType);

      if (!skipPexels) {
        const stockPhotos = await searchPexels(effectiveTopic, 4);
        if (stockPhotos.length > 0) {
          return new Response(
            JSON.stringify({
              success: true,
              provider: "pexels",
              source: "stock",
              found: true,
              media: stockPhotos,
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }
      console.log(
        `Auto mode${skipPexels ? " (structured type — skipping Pexels)" : " (no qualifying stock photos)"}: proceeding to Cloudflare FLUX...`
      );
    }

    // ──────────────────────────────────────────────────────────────────────────
    // STRATEGY 3 — Cloudflare Workers AI FLUX
    // ──────────────────────────────────────────────────────────────────────────
    const enhancedPrompt = buildEducationalImagePrompt({
      prompt,
      topic: effectiveTopic,
      subject,
      grade,
      style,
      creationType,
      additionalInstructions,
      diagramType,
      visualStyle,
      requiredElements,
      orientation,
    });

    const { buffer, contentType, modelUsed } = await generateCloudflareFluxImage(
      enhancedPrompt
    );

    // Upload to Supabase Storage (teacher-files) for CDN-backed permanent URL
    const assetId = crypto.randomUUID();
    const ext = contentType.includes("png") ? "png" : "jpg";
    const storagePath = `${user.id}/visuals/${assetId}.${ext}`;

    let finalImageUrl = "";
    try {
      const { error: uploadError } = await dbClient.storage
        .from("teacher-files")
        .upload(storagePath, buffer, {
          contentType: contentType || "image/png",
          upsert: true,
        });

      if (!uploadError) {
        const { data: signedData } = await dbClient.storage
          .from("teacher-files")
          .createSignedUrl(storagePath, 31_536_000); // 1-year signed URL

        if (signedData?.signedUrl) {
          finalImageUrl = signedData.signedUrl;
        }
      } else {
        console.warn("Storage upload error (non-blocking):", uploadError.message);
      }
    } catch (sErr) {
      console.warn("Storage upload exception (non-blocking):", sErr);
    }

    // Fallback: embed as data URI when storage is unavailable
    if (!finalImageUrl) {
      const uint8 = new Uint8Array(buffer);
      let binary = "";
      for (let i = 0; i < uint8.length; i++) {
        binary += String.fromCharCode(uint8[i]);
      }
      finalImageUrl = `data:${contentType};base64,${btoa(binary)}`;
    }

    // Track usage (non-blocking)
    try {
      await dbClient.rpc("increment_usage", {
        p_user_id: user.id,
        p_field: "ai_generations",
        p_amount: 1,
      });
    } catch (uErr) {
      console.warn("Usage tracking notice:", uErr);
    }

    return new Response(
      JSON.stringify({
        success: true,
        provider: "cloudflare-flux",
        source: "ai",
        found: true,
        image: {
          id: assetId,
          url: finalImageUrl,
          width: finalWidth,
          height: finalHeight,
          prompt: enhancedPrompt,
          model: modelUsed,
          attribution: "AI Generated (Cloudflare Workers AI — FLUX)",
          createdAt: new Date().toISOString(),
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: unknown) {
    const typedErr = err as Error & { status?: number };
    const status = typedErr.status || 500;

    const errorCodeMap: Record<number, string> = {
      429: "RATE_LIMITED",
      402: "INSUFFICIENT_QUOTA",
      403: "AUTH_FAILED",
    };
    const errorMsgMap: Record<number, string> = {
      429: "Image generation is temporarily busy. Please try again in a moment.",
      402: "AI image generation quota exceeded. Please contact support.",
      403: "AI image generation authentication failed. Please contact support.",
    };

    return new Response(
      JSON.stringify({
        success: false,
        error: {
          code: errorCodeMap[status] || "GENERATION_ERROR",
          message:
            errorMsgMap[status] ||
            "AI image generation is temporarily unavailable. Try again shortly.",
        },
      }),
      {
        status: status > 500 ? 500 : status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
