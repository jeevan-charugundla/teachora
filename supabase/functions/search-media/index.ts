// Helper to extract key concepts and multi-queries from topic/context
function buildMediaQueries(topic: string, subject?: string): string[] {
  const cleanTopic = topic.trim();
  const lower = cleanTopic.toLowerCase();

  const queries: string[] = [cleanTopic];

  if (lower.includes("newton")) {
    queries.push("Newton's laws of motion physics demonstration");
    queries.push("inertia force acceleration physics experiment");
    queries.push("action reaction demonstration physics");
  } else if (lower.includes("photosynthesis")) {
    queries.push("photosynthesis plant biology experiment");
    queries.push("leaf structure chloroplast biology");
    queries.push("plant light photosynthesis process");
  } else if (lower.includes("fraction") || lower.includes("math")) {
    queries.push("mathematical fraction visual diagram");
    queries.push("geometry shapes mathematics education");
  } else if (subject) {
    queries.push(`${cleanTopic} ${subject} educational demonstration`);
  }

  return [...new Set(queries)];
}

// Relevance scoring algorithm for Pexels media candidates
function calculateRelevanceScore(item: any, topic: string, requiredConcepts: string[]): number {
  const alt = (item.alt || "").toLowerCase();
  const photographer = (item.photographer || "").toLowerCase();
  const topicTokens = topic.toLowerCase().split(/\s+/).filter((t) => t.length > 2);

  let score = 0.5; // Base score

  // 1. Topic Token Matches
  let tokenMatches = 0;
  topicTokens.forEach((token) => {
    if (alt.includes(token)) tokenMatches++;
  });
  score += (tokenMatches / Math.max(1, topicTokens.length)) * 0.35;

  // 2. Required Concept Matches
  requiredConcepts.forEach((concept) => {
    if (alt.includes(concept.toLowerCase())) score += 0.15;
  });

  // 3. Negative Signals (Irrelevant stock clutter)
  const negativeTerms = [
    "portrait", "smile", "fashion", "girl", "boy", "model", "selfie",
    "shopping", "party", "car", "wedding", "business suit", "desk work"
  ];
  negativeTerms.forEach((term) => {
    if (alt.includes(term)) score -= 0.25;
  });

  return Math.min(1.0, Math.max(0.0, score));
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (!PEXELS_API_KEY) {
      return new Response(
        JSON.stringify({
          success: false,
          error: { code: "PROVIDER_CONFIG_ERROR", message: "Media search service is not configured." },
        }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({
          success: false,
          error: { code: "UNAUTHORIZED", message: "Unauthorized." },
        }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { query, subject, type = "photos", per_page = 12, minScore = 0.65 } = body;

    if (!query || typeof query !== "string" || !query.trim()) {
      return new Response(
        JSON.stringify({
          success: false,
          error: { code: "BAD_REQUEST", message: "Search query is required." },
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const searchQueries = buildMediaQueries(query, subject);
    const candidateMap = new Map<string, any>();

    for (const q of searchQueries) {
      const apiUrl = `https://api.pexels.com/v1/search?query=${encodeURIComponent(q)}&per_page=8&orientation=landscape`;
      const pexelsRes = await fetch(apiUrl, { headers: { Authorization: PEXELS_API_KEY } });

      if (pexelsRes.ok) {
        const pexelsData = await pexelsRes.json();
        (pexelsData.photos || []).forEach((p: any) => {
          if (!candidateMap.has(String(p.id))) {
            const item = {
              id: String(p.id),
              type: "photo",
              url: p.src?.large || p.src?.medium,
              thumbnailUrl: p.src?.small || p.src?.tiny,
              width: p.width,
              height: p.height,
              photographer: p.photographer,
              alt: p.alt || query,
              attribution: "Stock Photo",
            };
            const score = calculateRelevanceScore(item, query, searchQueries);
            if (score >= minScore) {
              candidateMap.set(String(p.id), { ...item, relevanceScore: score });
            }
          }
        });
      }
    }

    const sortedResults = Array.from(candidateMap.values())
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, per_page);

    return new Response(
      JSON.stringify({
        success: true,
        query: query.trim(),
        found: sortedResults.length > 0,
        total_results: sortedResults.length,
        media: sortedResults,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error.";
    return new Response(
      JSON.stringify({
        success: false,
        error: { code: "SERVER_ERROR", message },
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
