import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const PRIMARY_MODEL = "gpt-4o-mini-transcribe";
const FALLBACK_MODEL = "whisper-1";

function isModelError(err: unknown): boolean {
  if (err && typeof err === "object" && "status" in err) {
    const status = (err as { status?: number }).status;
    return status === 400 || status === 404;
  }
  const message = err instanceof Error ? err.message : String(err);
  return (
    message.includes("model") ||
    message.includes("Invalid") ||
    message.includes("not found")
  );
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "Missing or invalid file in form data" },
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

    let transcription: { text: string };

    try {
      transcription = await openai.audio.transcriptions.create({
        file,
        model: PRIMARY_MODEL,
        response_format: "json",
      });
    } catch (err) {
      if (isModelError(err)) {
        transcription = await openai.audio.transcriptions.create({
          file,
          model: FALLBACK_MODEL,
          response_format: "json",
        });
      } else {
        throw err;
      }
    }

    const text =
      typeof transcription === "object" && transcription !== null && "text" in transcription
        ? (transcription as { text: string }).text
        : "";

    return NextResponse.json({ text: text ?? "" });
  } catch (error) {
    console.error("Transcribe error:", error);
    return NextResponse.json(
      { error: "Transcription failed" },
      { status: 500 }
    );
  }
}
