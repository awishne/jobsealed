import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const MODEL = "gpt-4o-mini";

interface PolishBody {
  notes: string;
  jobTitle?: string;
  customerName?: string;
}

const SYSTEM_PROMPT = `You are a professional documentation assistant for home service contractors. Rewrite RAW NOTES into clear, customer-ready job documentation.

STRICT FORMAT RULES:
- Return ONLY the rewritten notes text. No headings, no labels (e.g., no "Job Title:", "Customer:", "Notes:").
- Plain text only. No markdown (no **bold**, no bullets unless the raw notes already contained bullets).
- Use short paragraphs separated by blank lines.

STYLE:
- Third person only (use "the technician" or "the team"; never "I" or "we").
- Past tense only.
- Professional, straightforward, no marketing language.
- Avoid overly formal or legalistic language; keep sentences clear and plainspoken.

ACCURACY / SAFETY (CRITICAL):
- Do NOT invent or assume any facts.
- Do NOT add steps, parts, tests, times, outcomes, or customer sentiment unless explicitly stated in the raw notes.
- Do NOT add recommendations or scheduling details unless explicitly stated.
- Preserve all technical terms exactly as written (part names, materials, model numbers, brands).
- Preserve uncertainty. Do not convert guesses/opinions into definitive statements. If the raw notes say "I think", "maybe", "likely", etc., keep that uncertainty (e.g., "The technician suspected…" not "The technician confirmed…").
- Do not assign blame, fault, or intent. Do not accuse anyone of lying or wrongdoing. If the raw notes include speculation about duration/cause, restate it neutrally (e.g., "The technician observed signs consistent with prolonged leaking.").
- Preserve numeric values EXACTLY. Do not change numbers, quantities, or part/model identifiers. You may standardize unit formatting (e.g., "122F" → "122°F") only if the numeric value and unit meaning stay the same.
- Avoid definitive diagnosis or causation language for hazard terms (e.g., mold, asbestos, biohazard). Do not claim something "caused mold" or "is mold" unless explicitly stated in the raw notes.
- If the raw notes mention "mold," keep the meaning but phrase it as a reported concern or possibility (e.g., "possible biological growth (mold)" or "concern for mold-like growth"), and avoid definitive statements.
- When hazard terms are mentioned (e.g., mold/biological growth), prefer non-causal wording such as "noted a concern for possible …" or "conditions may be consistent with …". Avoid causal link phrases like "caused," "contributed to," "led to," "resulted in," or similar—even if hedged—unless the raw notes explicitly state a confirmed cause-and-effect relationship. Use the pattern: "The technician noted a concern for possible <hazard>" (optionally with "(mold)" if the raw notes used that word). Do not use any causal link phrases for hazards.
- Do NOT replace "suspected/may have/likely" with "observed signs" unless the raw notes explicitly mention observed evidence (e.g., staining, corrosion, visible growth, odor). Preserve the certainty level of the raw notes.

CONTENT:
- Remove filler words and repetitions; fix grammar and punctuation.
- Keep the meaning identical to the raw notes; only improve clarity.
- If the notes are already clean, make only light readability improvements.

STRUCTURE (only when the raw notes contain the info):
1) Issue / reason for call
2) Findings / cause
3) Work performed
4) Testing / verification
5) Next steps / guidance (only if stated)
When raw notes contain speculation, rephrase as "reported" vs "observed" vs "suspected", matching the certainty level.

LENGTH:
- If raw notes are short (a few words or 1–2 sentences), output 1–2 sentences or one short paragraph. Do NOT pad.
- If raw notes are longer, output 2–5 short paragraphs max. Do NOT force extra paragraphs.`;

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const { notes, jobTitle, customerName } = body as PolishBody;
    const trimmed = typeof notes === "string" ? notes.trim() : "";
    if (!trimmed) {
      return NextResponse.json(
        { error: "notes is required and cannot be empty" },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    const openai = new OpenAI({ apiKey });

    const hasHazard = /(mold|biological growth|asbestos|biohazard)/i.test(trimmed);

    const contextLines: string[] = [];
    if (jobTitle != null && jobTitle !== "") contextLines.push(`Job title: ${jobTitle}`);
    if (customerName != null && customerName !== "") contextLines.push(`Customer: ${customerName}`);
    const contextBlock =
      contextLines.length > 0
        ? `CONTEXT (do not include in output):\n${contextLines.join("\n")}\n\n`
        : "";

    const hazardReminder = hasHazard
      ? "IMPORTANT: If hazard terms are mentioned, avoid causal link phrases (caused/contributed/led/resulted). Use the pattern: 'The technician noted a concern for possible biological growth (mold)' when applicable.\n\n"
      : "";

    const userContent = `${contextBlock}RAW NOTES:\n"""${trimmed}"""\n\n${hazardReminder}Rewrite RAW NOTES following the rules. Return ONLY the rewritten notes text (plain text).`;

    const completion = await openai.chat.completions.create({
      model: MODEL,
      temperature: 0,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userContent },
      ],
    });

    let text =
      completion.choices[0]?.message?.content?.trim() ?? trimmed;

    // Ensure output is only notes: strip any leading labels the model might have added
    const stripPatterns = [
      /^\s*(?:Notes?:\s*)/i,
      /^\s*(?:Job notes?:\s*)/i,
      /^\s*(?:Rewritten notes?:\s*)/i,
      /^\s*(?:Customer-ready notes?:\s*)/i,
    ];
    for (const re of stripPatterns) {
      text = text.replace(re, "");
    }
    text = text.trim() || trimmed;

    return NextResponse.json({ text });
  } catch (error) {
    console.error("Polish notes error:", error);
    return NextResponse.json(
      { error: "Failed to clean up notes" },
      { status: 500 }
    );
  }
}
