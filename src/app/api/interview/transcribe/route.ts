import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const fileNode = formData.get("file") as File | null;
    const apiKey = process.env.GROQ_API_KEY;

    if (!fileNode || !apiKey) {
      return NextResponse.json({ error: "Missing audio file or server API key" }, { status: 400 });
    }

    const openai = new OpenAI({
      apiKey: apiKey,
      baseURL: "https://api.groq.com/openai/v1"
    });

    const response = await openai.audio.transcriptions.create({
      file: fileNode,
      model: "whisper-large-v3"
    });

    return NextResponse.json({ text: response.text });
  } catch (error: unknown) {
    console.error("Transcribe Error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to transcribe audio" }, { status: 500 });
  }
}
