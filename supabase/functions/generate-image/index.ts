// Supabase Edge Function: AI Image Generation & Visual Fallback (Pollinations AI + Pexels)
// Deploy: supabase functions deploy generate-image --no-verify-jwt

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const POLLINATIONS_API_KEY = Deno.env.get("POLLINATIONS_API_KEY");
const PEXELS_API_KEY = Deno.env.get("PEXELS_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("SUPABASE_PUBLISHABLE_KEY") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_SECRET_KEY") || "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Aspect ratio mapping to safe provider dimensions
const DIMENSION_MAP: Record<string, { width: number; height: number }> = {
  landscape: { width: 1280, height: 720 },
  square: { width: 1024, height: 1024 },
  portrait: { width: 720, height: 1280 },
};

// Construct a rich, specific educational image prompt
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
  const orientationDesc = orientation === "portrait" ? "portrait orientation" : "landscape / horizontal orientation";

  // Build an element list sentence when specific parts are provided
  const reqElements = Array.isArray(params.requiredElements) && params.requiredElements.length > 0
    ? params.requiredElements
    : [];
  const elementsSentence = reqElements.length > 0
    ? ` Clearly show all of the following structures/components: ${reqElements.join(", ")}.`
    : "";

  // Style-specific visual instructions
  const styleInstructions: Record<string, string> = {
    "Realistic Scientific": "photorealistic scientific illustration, highly detailed, accurate proportions, professional textbook-quality rendering",
    "Textbook Illustration": "classic educational textbook illustration style, clean lines, muted educational color palette, suitable for printed textbooks",
    "Detailed Educational": "highly detailed educational diagram style, annotatable, clear structural features, suitable for classroom projection",
    "3D Educational": "3D rendered educational illustration, depth and shading, realistic materials, suitable for high school classroom",
    "Clean Vector Illustration": "clean flat vector educational illustration, bright educational colors, crisp outlines, modern infographic style",
    "Medical Illustration": "professional medical illustration style, accurate anatomy, clinical detail, clean white background",
  };
  const styleDesc = styleInstructions[visualStyle] || "educational scientific illustration, high detail, professional quality";

  return `Create a high-quality ${styleDesc} showing: ${topic}. Subject: ${subject}. Audience: ${grade} students. ${orientationDesc}. Diagram type: ${diagramType}.${elementsSentence} Use a clean white or very light neutral background. No text labels, no callouts, no watermarks, no annotations written on the image — labels will be overlaid separately by the educational platform. Focus on scientific accuracy, realistic textures, clear structural definition, and educational clarity.${extra} Style: ${visualStyle}.`;
}

function sanitizeSearchQuery(query: string): string {
  if (!query) return "science";
  let cleaned = query
    .replace(/grade\s*\d+/gi, "")
    .replace(/class\s*\d+/gi, "")
    .replace(/(educational|worksheet|activity|diagram|lesson plan|presentation|infographic|unit|chapter|middle school|high school)/gi, "")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned || query;
}

// Relevance scoring algorithm for educational Pexels photos
function scorePhotoRelevance(photo: any, topic: string, requiredTerms: string[]): number {
  const alt = (photo.alt || "").toLowerCase();
  const lowerTopic = topic.toLowerCase();
  const topicTokens = lowerTopic.split(/\s+/).filter((t) => t.length > 2);

  let score = 0.5;

  let matches = 0;
  topicTokens.forEach((token) => {
    if (alt.includes(token)) matches++;
  });
  score += (matches / Math.max(1, topicTokens.length)) * 0.35;

  requiredTerms.forEach((term) => {
    if (alt.includes(term.toLowerCase())) score += 0.15;
  });

  const negativeTerms = [
    "portrait", "smile", "fashion", "girl", "boy", "model", "selfie",
    "shopping", "party", "car", "wedding", "business suit"
  ];
  negativeTerms.forEach((term) => {
    if (alt.includes(term)) score -= 0.25;
  });

  return Math.min(1.0, Math.max(0.0, score));
}

// Search Pexels for stock photos using multi-query strategy & relevance threshold
async function searchPexels(query: string, perPage: number = 6, minScore: number = 0.65) {
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

    const candidateMap = new Map<string, any>();

    for (const q of subQueries) {
      const cleanQuery = encodeURIComponent(q);
      const res = await fetch(
        `https://api.pexels.com/v1/search?query=${cleanQuery}&per_page=8&orientation=landscape`,
        { headers: { Authorization: PEXELS_API_KEY } }
      );
      if (res.ok) {
        const data = await res.json();
        (data.photos || []).forEach((p: any) => {
          if (!candidateMap.has(String(p.id))) {
            const item = {
              id: String(p.id),
              type: "photo",
              url: p.src?.large || p.src?.medium || p.src?.original,
              thumbnailUrl: p.src?.small || p.src?.tiny,
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
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, perPage);
  } catch (err) {
    console.warn("Pexels search error:", err);
    return [];
  }
}

// Call Pollinations AI to generate image binary
async function generatePollinationsImage(
  enhancedPrompt: string,
  width: number,
  height: number,
  model: string = "flux"
): Promise<{ buffer: ArrayBuffer; contentType: string; modelUsed: string }> {
  const seed = Math.floor(Math.random() * 1000000);
  const cleanPrompt = encodeURIComponent(enhancedPrompt.trim());

  const headers: Record<string, string> = {};
  if (POLLINATIONS_API_KEY) {
    headers["Authorization"] = `Bearer ${POLLINATIONS_API_KEY}`;
  }

  // 1. Try gen.pollinations.ai
  let keyParam = POLLINATIONS_API_KEY ? `&key=${POLLINATIONS_API_KEY}` : "";
  let url = `https://gen.pollinations.ai/image/${cleanPrompt}?width=${width}&height=${height}&model=${model}&nologo=true&seed=${seed}${keyParam}`;
  let res = await fetch(url, { headers });

  // 2. If not ok, try image.pollinations.ai/prompt
  if (!res.ok) {
    console.warn(`Pollinations gen endpoint returned ${res.status}, trying image.pollinations.ai...`);
    url = `https://image.pollinations.ai/prompt/${cleanPrompt}?width=${width}&height=${height}&model=${model}&nologo=true&seed=${seed}${keyParam}`;
    res = await fetch(url, { headers });
  }

  // 3. If model 'flux' failed, fallback to 'turbo'
  if (!res.ok && model !== "turbo") {
    console.warn(`Pollinations ${model} failed with ${res.status}, retrying with turbo model...`);
    url = `https://image.pollinations.ai/prompt/${cleanPrompt}?width=${width}&height=${height}&model=turbo&nologo=true&seed=${seed}${keyParam}`;
    res = await fetch(url, { headers });
    if (res.ok) {
      model = "turbo";
    }
  }

  if (!res.ok) {
    const errText = await res.text();
    console.error("Pollinations API error:", res.status, errText);
    if (res.status === 429) {
      const err: any = new Error("Image generation is temporarily busy. Please try again in a moment.");
      err.status = 429;
      throw err;
    }
    if (res.status === 402 || res.status === 403) {
      const err: any = new Error("AI image generation is currently unavailable. Please use a stock visual or try again later.");
      err.status = 402;
      throw err;
    }
    throw new Error("Failed to generate AI visual from provider.");
  }

  const contentType = res.headers.get("content-type") || "image/jpeg";
  const buffer = await res.arrayBuffer();
  return { buffer, contentType, modelUsed: model };
}

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
          error: { code: "UNAUTHORIZED", message: "Unauthorized. Please log in to generate educational visuals." },
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
      visualSource = "auto", // "auto" | "stock" | "ai"
      width: customWidth,
      height: customHeight,
      model = "flux",
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
          error: { code: "BAD_REQUEST", message: "Topic or prompt is required for visual generation." },
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

    // ============================================================
    // STRATEGY 1: Stock Only (Pexels)
    // ============================================================
    if (visualSource === "stock") {
      const stockPhotos = await searchPexels(effectiveTopic, 6);
      if (stockPhotos.length === 0) {
        return new Response(
          JSON.stringify({
            success: true,
            provider: "pexels",
            source: "stock",
            found: false,
            message: "No suitable stock visual found.",
            media: [],
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

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

    // ============================================================
    // STRATEGY 2: Auto (For diagrams/illustrations → go straight to AI.
    //             For general content → try Pexels first, fallback to AI)
    // ============================================================
    if (visualSource === "auto") {
      // For educational diagrams and scientific illustrations, AI generation
      // produces far better results than stock photos. Skip Pexels.
      const diagramTypes = ["diagram", "infographic", "mind-map", "chart"];
      const skipPexels = diagramTypes.includes(creationType);

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
      console.log(`Auto mode${skipPexels ? " (diagram type — skipping Pexels)" : " (no stock found)"}: proceeding to Pollinations AI...`);
    }

    // ============================================================
    // STRATEGY 3: AI Generation (Pollinations AI)
    // NOTE: Pollinations is a public API that works without a key.
    // POLLINATIONS_API_KEY is optional and only increases rate limits.
    // We proceed even without a key — keyless generation is supported.
    // ============================================================
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


    const { buffer, contentType, modelUsed } = await generatePollinationsImage(
      enhancedPrompt,
      finalWidth,
      finalHeight,
      model
    );

    // Save image to Supabase Storage (teacher-files bucket) for permanent, high-speed CDN delivery
    const assetId = crypto.randomUUID();
    const storagePath = `${user.id}/visuals/${assetId}.jpg`;

    let finalImageUrl = "";
    try {
      const { error: uploadError } = await dbClient.storage
        .from("teacher-files")
        .upload(storagePath, buffer, {
          contentType: contentType || "image/jpeg",
          upsert: true,
        });

      if (!uploadError) {
        // Create signed URL for private teacher asset (valid for 1 year)
        const { data: signedData } = await dbClient.storage
          .from("teacher-files")
          .createSignedUrl(storagePath, 31536000);

        if (signedData?.signedUrl) {
          finalImageUrl = signedData.signedUrl;
        }
      }
    } catch (sErr) {
      console.warn("Storage upload non-blocking notice:", sErr);
    }

    // Fallback if storage upload failed: create data URI
    if (!finalImageUrl) {
      const uint8 = new Uint8Array(buffer);
      let binary = "";
      for (let i = 0; i < uint8.length; i++) {
        binary += String.fromCharCode(uint8[i]);
      }
      finalImageUrl = `data:${contentType};base64,${btoa(binary)}`;
    }

    // Increment usage tracking
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
        provider: "pollinations",
        source: "ai",
        found: true,
        image: {
          id: assetId,
          url: finalImageUrl,
          width: finalWidth,
          height: finalHeight,
          prompt: enhancedPrompt,
          model: modelUsed,
          attribution: "AI Generated",
          createdAt: new Date().toISOString(),
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    const status = err.status || 500;

    return new Response(
      JSON.stringify({
        success: false,
        error: {
          code: status === 429 ? "RATE_LIMITED" : (status === 402 ? "INSUFFICIENT_QUOTA" : "GENERATION_ERROR"),
          message: status === 429
            ? "Image generation is temporarily busy. Please try again in a moment."
            : (status === 402
                ? "AI image generation is currently unavailable. Please use a stock visual or try again later."
                : "AI image generation is temporarily unavailable. Try again shortly."),
        },
      }),
      { status: status > 500 ? 500 : status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
