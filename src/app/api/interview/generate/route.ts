import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    const apiKey = process.env.GROQ_API_KEY;

    if (!text || !apiKey) {
      return NextResponse.json({ error: "Missing resume text or server API key" }, { status: 400 });
    }

    const openai = new OpenAI({
      apiKey: apiKey,
      baseURL: "https://api.groq.com/openai/v1"
    });

    const systemPrompt = `You are a strict, expert technical and behavioral interviewer. I will provide you with a candidate's resume.
Your task is to generate EXACTLY 5 highly personalized interview questions based explicitly on the candidate's claims in their resume.

Include:
- 2 Deep-Dive Experience Questions (e.g., "You mentioned reducing latency by 40% using Redis. Can you walk me through that specific architectural change?")
- 1 Technical or Domain Skill Question based on a listed hard skill.
- 2 Behavioral Questions tailored to their apparent seniority.

Output purely valid JSON without markdown formatting, matching EXACTLY:
{
  "questions": [
    "Question 1 string",
    "Question 2 string",
    "Question 3 string",
    "Question 4 string",
    "Question 5 string"
  ]
}`;

    const message = await openai.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Candidate Resume:\n\n${text}` }
      ]
    });

    const outputText = message.choices[0].message.content || '';
    const cleanJson = outputText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsedJson = JSON.parse(cleanJson);

    return NextResponse.json(parsedJson);
  } catch (error: unknown) {
    console.error("Generate Questions Error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to generate questions" }, { status: 500 });
  }
}
