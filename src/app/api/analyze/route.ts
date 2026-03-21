import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: NextRequest) {
  try {
    const { text, jobDescription } = await req.json();
    const apiKey = process.env.GROQ_API_KEY;

    if (!text) {
      return NextResponse.json({ error: "Resume text is required" }, { status: 400 });
    }

    if (!apiKey) {
      return NextResponse.json({ error: "GROQ_API_KEY is not configured on the server." }, { status: 500 });
    }

    const openai = new OpenAI({
      apiKey: apiKey,
      baseURL: "https://api.groq.com/openai/v1"
    });

    const jdContext = jobDescription ? `Here is the target Job Description:\n${jobDescription}\n\nPlease tailor your skill gap analysis and improvement suggestions to this job description.` : "No target job description was provided. Provide general best-practice improvements and identify universally valuable skills for their apparent field.";

    const systemPrompt = `You are an expert technical recruiter and resume writer. I will provide you with the raw parsed text from a candidate's resume.
Your task is to analyze it, extract key components, and provide highly actionable improvements.

${jdContext}

You MUST output your response purely as valid JSON without any markdown formatting, matching exactly this structure:
{
  "summary": "A 2-3 sentence summary of the candidate's profile.",
  "linkedinSummaries": ["Story-driven version...", "Metric-driven version...", "Concise version..."],
  "skills": ["List", "of", "extracted", "skills"],
  "missingSkills": ["List", "of", "skills", "from", "JD", "that", "are", "missing"],
  "experienceImprovements": [
    {
      "originalBullet": "The exact original bullet point from the resume that is weak or lacks impact.",
      "improvedBullet": "Your suggested rewrite using the STAR method and strong action verbs.",
      "reason": "Why this improvement is better."
    }
  ]
}
Return only the JSON object. Do not include \`\`\`json wrappers.`;

    const message = await openai.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Please analyze the following resume:\n\n${text}` }
      ]
    });

    const outputText = message.choices[0].message.content || '';
    let parsedJson;
    try {
      // Clean potential JSON markdown wrappers if Claude ignores the instruction
      const cleanJson = outputText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsedJson = JSON.parse(cleanJson);
    } catch {
      console.error("Failed to parse JSON from Claude:", outputText);
      return NextResponse.json({ error: "AI produced invalid format. Try again." }, { status: 500 });
    }

    return NextResponse.json(parsedJson);

  } catch (error: unknown) {
    console.error("Analysis Error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to analyze document" }, { status: 500 });
  }
}
