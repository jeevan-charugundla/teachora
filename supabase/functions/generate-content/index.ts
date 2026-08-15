// Supabase Edge Function: Generate Educational Content (Groq AI)
// Deploy: supabase functions deploy generate-content --no-verify-jwt

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { buildCreationPrompt } from "./prompts.ts";
import { validateAndNormalize } from "./validators.ts";

const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
const GROQ_MODEL = Deno.env.get("GROQ_MODEL") || "llama-3.3-70b-versatile";
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const PEXELS_API_KEY = Deno.env.get("PEXELS_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("SUPABASE_PUBLISHABLE_KEY") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_SECRET_KEY") || "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Helper: Query Pexels for media suggestions
async function searchPexelsMedia(query: string, type: "photo" | "video" = "photo", perPage: number = 3) {
  if (!PEXELS_API_KEY || !query) return [];
  try {
    const cleanQuery = encodeURIComponent(query.trim());
    const url = type === "video"
      ? `https://api.pexels.com/videos/search?query=${cleanQuery}&per_page=${perPage}&orientation=landscape`
      : `https://api.pexels.com/v1/search?query=${cleanQuery}&per_page=${perPage}&orientation=landscape`;

    const res = await fetch(url, { headers: { Authorization: PEXELS_API_KEY } });
    if (!res.ok) return [];
    const data = await res.json();

    if (type === "video") {
      return (data.videos || []).map((v: any) => ({
        id: String(v.id),
        type: "video",
        url: v.url,
        thumbnailUrl: v.image,
        duration: v.duration,
        photographer: v.user?.name || "Pexels Creator",
        files: (v.video_files || []).map((f: any) => ({ link: f.link, quality: f.quality, width: f.width, height: f.height })),
      }));
    } else {
      return (data.photos || []).map((p: any) => ({
        id: String(p.id),
        type: "photo",
        url: p.src?.large || p.src?.medium || p.src?.original,
        thumbnailUrl: p.src?.small || p.src?.tiny,
        photographer: p.photographer || "Pexels Photographer",
        photographerUrl: p.photographer_url || "",
        alt: p.alt || query,
      }));
    }
  } catch (err) {
    console.warn("Pexels search non-blocking error:", err);
    return [];
  }
}

// Call Groq API with structured JSON output
async function callGroqGeneration(systemPrompt: string, userPrompt: string): Promise<any> {
  const payload = {
    model: GROQ_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.5,
    max_tokens: 4096,
    response_format: { type: "json_object" },
  };

  let res = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok && res.status === 429) {
    console.warn("Groq 429 rate limit hit, backing off for 2.5s before retry...");
    await new Promise((r) => setTimeout(r, 2500));
    res = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  }

  if (!res.ok) {
    const errText = await res.text();
    console.error("Groq API error:", res.status, errText);
    if (res.status === 429) {
      const error: any = new Error("Teachora is temporarily busy. Please try again in a moment.");
      error.status = 429;
      throw error;
    }
    const error: any = new Error("Generation service temporarily unavailable.");
    error.status = res.status;
    throw error;
  }

  const data = await res.json();
  const rawContent = data.choices?.[0]?.message?.content;
  if (!rawContent) {
    throw new Error("No content received from AI generator.");
  }

  try {
    const cleaned = rawContent.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    return JSON.parse(cleaned);
  } catch (parseErr) {
    console.error("Groq JSON parse error:", parseErr, "Raw Content:", rawContent.slice(0, 300));
    throw new Error("Generated content was malformed.");
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  let jobId: string | null = null;
  let dbClient: any = null;

  try {
    if (!GROQ_API_KEY) {
      return new Response(
        JSON.stringify({
          success: false,
          error: { code: "PROVIDER_CONFIG_ERROR", message: "AI content generation service is not configured." },
        }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1. Authenticate user from authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({
          success: false,
          error: { code: "UNAUTHORIZED", message: "Unauthorized. Please log in to create educational content." },
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
    const { creationType, form } = body;

    if (!creationType || !form || !form.topic) {
      return new Response(
        JSON.stringify({
          success: false,
          error: { code: "BAD_REQUEST", message: "Creation type and topic are required." },
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize service client for database persistence
    dbClient = createClient(
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY,
      { auth: { persistSession: false } }
    );

    // 3. Create a generation_job record
    try {
      const { data: jobData } = await dbClient
        .from("generation_jobs")
        .insert({
          user_id: user.id,
          generation_type: creationType,
          provider: "groq",
          model: GROQ_MODEL,
          status: "processing",
          input: { creationType, form },
          started_at: new Date().toISOString(),
        })
        .select("id")
        .single();

      if (jobData) {
        jobId = jobData.id;
      }
    } catch (jobErr) {
      console.warn("Notice: generation_job insert non-blocking:", jobErr);
    }

    // 4. Build prompt for specific creation type
    const { systemPrompt, userPrompt } = buildCreationPrompt(creationType, form);

    // 5. Call Groq with one retry on failure
    let rawResult: any = null;
    try {
      rawResult = await callGroqGeneration(systemPrompt, userPrompt);
    } catch (firstErr: any) {
      console.warn("First generation attempt failed, attempting corrective retry...", firstErr.message);
      if (firstErr.status === 429) {
        throw firstErr;
      }
      // Retry once with emphasis on clean JSON structure
      rawResult = await callGroqGeneration(
        systemPrompt + "\nCRITICAL: Return ONLY a valid JSON object matching the schema. No markdown formatting.",
        userPrompt
      );
    }

    // 6. Validate and normalize the result
    const validation = validateAndNormalize(creationType, rawResult, form);
    if (!validation.isValid) {
      throw new Error("Generated content could not be validated against required schema.");
    }

    let normalizedResult = validation.normalizedData;

    // 7. Optional Media Enhancement via Pexels (Non-blocking)
    if (creationType === "presentation" && Array.isArray(normalizedResult.slides)) {
      const visualSource = (form.presentationVisualSource || "Auto").toLowerCase();
      if (visualSource !== "none") {
        for (let i = 0; i < normalizedResult.slides.length; i++) {
          const slide = normalizedResult.slides[i];
          const query = slide.visualQuery || slide.visualSuggestion || `${form.subject} ${form.topic} ${slide.title}`;

          if (visualSource !== "ai") {
            const media = await searchPexelsMedia(query, "photo", 2);
            if (media && media.length > 0) {
              slide.mediaSuggestions = media.map((m: any) => ({
                ...m,
                attribution: "Stock (Pexels)",
              }));
            } else {
              slide.needsAiVisual = true;
            }
          } else {
            slide.needsAiVisual = true;
          }
        }
      }
    } else if (creationType === "video" && Array.isArray(normalizedResult.scenes)) {
      // Find supporting video clips for storyboard scenes
      for (let i = 0; i < Math.min(normalizedResult.scenes.length, 3); i++) {
        const scene = normalizedResult.scenes[i];
        if (scene.visualDescription && !scene.videoSuggestions) {
          const vids = await searchPexelsMedia(scene.visualDescription, "video", 2);
          if (vids.length > 0) {
            scene.videoSuggestions = vids;
          }
        }
      }
    } else if (creationType === "infographic" && Array.isArray(normalizedResult.sections)) {
      // Find supporting illustration for top section
      if (normalizedResult.sections[0]?.visualSuggestion) {
        const media = await searchPexelsMedia(normalizedResult.sections[0].visualSuggestion, "photo", 1);
        if (media.length > 0) {
          normalizedResult.sections[0].media = media[0];
        }
      }
    }

    // 8. Update generation_job status to completed
    if (jobId && dbClient) {
      try {
        await dbClient
          .from("generation_jobs")
          .update({
            status: "completed",
            output: normalizedResult,
            completed_at: new Date().toISOString(),
          })
          .eq("id", jobId);
      } catch (upErr) {
        console.warn("Notice: generation_jobs update non-blocking:", upErr);
      }
    }

    // 9. Increment usage tracking
    if (dbClient) {
      try {
        await dbClient.rpc("increment_usage", {
          p_user_id: user.id,
          p_field: "ai_generations",
          p_amount: 1,
        });
      } catch (uErr) {
        console.warn("Notice: increment_usage non-blocking:", uErr);
      }
    }

    // 10. Return standard common response envelope
    return new Response(
      JSON.stringify({
        success: true,
        creationType,
        result: normalizedResult,
        metadata: {
          provider: "groq",
          model: GROQ_MODEL,
          generatedAt: new Date().toISOString(),
          jobId,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err: any) {
    const status = err.status || 500;
    const message = err.message || "An unexpected error occurred during content generation.";

    // Update job status if failed
    if (jobId && dbClient) {
      try {
        await dbClient
          .from("generation_jobs")
          .update({
            status: "failed",
            error: message,
            completed_at: new Date().toISOString(),
          })
          .eq("id", jobId);
      } catch {
        // ignore
      }
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: {
          code: status === 429 ? "RATE_LIMITED" : (status === 401 ? "UNAUTHORIZED" : "GENERATION_ERROR"),
          message: status === 429
            ? "Teachora is temporarily busy. Please try again in a moment."
            : (status === 401
                ? "Unauthorized. Please log in to create educational content."
                : "We couldn't prepare this material correctly. Please try again."),
        },
      }),
      { status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
