// Use a Deno-compatible ESM build for Supabase client
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CATEGORIES = ["History", "Science", "Media", "Sports", "Geography", "Art"];

type GeneratedQuestion = {
  question: string;
  options: string[];
  correct_index: number;
  category: string;
};

Deno.serve(async (req) => {
  // Only callable with the service-role key — this is triggered by pg_cron, not end users.
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const authHeader = req.headers.get("Authorization")?.replace("Bearer ", "") ?? req.headers.get("apiKey");
  if (authHeader !== serviceRoleKey) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, serviceRoleKey);

  const url = new URL(req.url);
  const targetDate =
    url.searchParams.get("date") ??
    (() => {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      return d.toISOString().split("T")[0];
    })();

  try {
    const { count } = await supabase
      .from("trivia_questions")
      .select("*", { count: "exact", head: true })
      .eq("date", targetDate);

    if (count && count > 0) {
      return Response.json({ skipped: true, reason: "Questions already exist", date: targetDate });
    }

    const cutoff30d = new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0];
    const cutoff7d  = new Date(Date.now() -  7 * 86400000).toISOString().split("T")[0];

    const { data: recentRows } = await supabase
      .from("trivia_questions")
      .select("category, question, date")
      .gte("date", cutoff30d);

    const recentCategories = [...new Set(
      (recentRows ?? []).filter((r) => r.date >= cutoff7d).map((r) => r.category).filter(Boolean)
    )];

    const recentQuestions = (recentRows ?? []).map((r) => r.question).filter(Boolean);

    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": Deno.env.get("ANTHROPIC_API_KEY")!,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 2000,
        messages: [
          {
            role: "user",
            content: `Generate 10 trivia questions for a daily Wordle-style trivia game.
Return ONLY a raw JSON array — no markdown, no backticks, no explanation.

Format:
[{
  "question": "...",
  "options": ["option A", "option B", "option C", "option D"],
  "correct_index": 0,
  "category": "Science"
}]

Rules:
- correct_index is the 0-based index into options pointing at the correct answer
- category must be exactly one of: ${CATEGORIES.join(", ")}
- mix of difficulties across the 10 questions, from easy to hard
- avoid these recently used categories where possible: ${recentCategories.join(", ") || "none"}
- questions should be answerable in under 60 seconds
- no repeated questions${recentQuestions.length > 0
  ? `\n- do NOT generate questions similar to any of these recent questions:\n${recentQuestions.map((q, i) => `  ${i + 1}. ${q}`).join("\n")}`
  : ""}`,
          },
        ],
      }),
    });

    if (!anthropicRes.ok) {
      const err = await anthropicRes.text();
      return Response.json({ error: `Anthropic API error: ${err}` }, { status: 502 });
    }

    const aiData = await anthropicRes.json();
    const raw = aiData.content[0].text.trim();
    const questions: GeneratedQuestion[] = JSON.parse(raw);

    if (!Array.isArray(questions) || questions.length === 0) {
      return Response.json({ error: "Invalid questions format returned from AI" }, { status: 502 });
    }

    const rows = questions.map((q, i) => ({ ...q, date: targetDate, order: i + 1 }));
    const { error: insertError } = await supabase.from("trivia_questions").insert(rows);

    if (insertError) {
      return Response.json({ error: insertError.message }, { status: 500 });
    }

    return Response.json({ success: true, date: targetDate, count: rows.length });
  } catch (err) {
    console.error("generate-trivia error:", err);
    return Response.json({ error: String(err) }, { status: 500 });
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request with the service-role key:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/generate-trivia' \
    --header 'Authorization: Bearer <service-role-key>'

  Backfill a specific date:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/generate-trivia?date=2026-06-12' \
    --header 'Authorization: Bearer <service-role-key>'

*/
