import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: NextRequest) {
  try {
    const { text, question, answer } = await req.json();
    const apiKey = process.env.GROQ_API_KEY;

    if (!text || !question || !answer || !apiKey) {
      return NextResponse.json({ error: "Missing required fields or server API key" }, { status: 400 });
    }

    const openai = new OpenAI({
      apiKey: apiKey,
      baseURL: "https://api.groq.com/openai/v1"
    });

    const systemPrompt = `You are an expert technical interviewer evaluating a candidate's answer to an interview question.
I will provide the candidate's resume, the question asked, and the candidate's answer.

Evaluate their answer based on:
1. Relevance to the question.
2. Use of the STAR method (Situation, Task, Action, Result).
3. Clarity and depth.

Provide constructive feedback and then generate a realistic "Ideal Answer" that the candidate could have used, citing specific facts from their resume to make it highly authentic to them.

Output purely valid JSON without markdown formatting:
{
  "critique": "Your constructive feedback on their answer.",
  "idealAnswer": "An example of a perfect answer, incorporating their actual resume experience."
}`;

    const message = await openai.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Candidate Resume:\n${text}\n\nQuestion Asked:\n${question}\n\nCandidate's Answer:\n${answer}` }
      ]
    });

    const outputText = message.choices[0].message.content || '';
    let parsedJson;
    try {
      const cleanJson = outputText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsedJson = JSON.parse(cleanJson);
    } catch {
      return NextResponse.json({ error: "Failed to parse AI evaluation format" }, { status: 500 });
    }

    return NextResponse.json(parsedJson);
  } catch (error: unknown) {
    console.error("Evaluate Answer Error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to evaluate answer" }, { status: 500 });
  }
}
