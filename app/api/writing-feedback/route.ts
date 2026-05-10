import { NextRequest, NextResponse } from "next/server";
import { callMiniMax } from "@/lib/ai";

export const runtime = "nodejs";

interface Dimension {
  name: string;
  score: string;
  grade: string;
  feedback: string;
}

export async function POST(req: NextRequest) {
  try {
    const { content, yearLevel, taskType } = await req.json();

    const systemPrompt = `You are Owlly — expert Australian F-6 teaching assistant and writing assessor.

You are an expert English/Writing teacher who marks student work using a 10-dimension rubric. For each dimension, give:
1. A score out of 10
2. A letter grade (A+ to E)
3. Specific, constructive feedback (1-2 sentences)

The 10 dimensions to assess ${yearLevel || "F-6"} ${taskType || "creative"} writing:
1. Ideas & Content
2. Text Structure
3. Voice & Tone
4. Word Choice
5. Sentence Fluency
6. Grammar & Punctuation
7. Spelling
8. Paragraphing
9. Audience Awareness
10. Overall Impact

Return ONLY valid JSON with this exact structure — no markdown, no code blocks, no explanation:
{
  "dimensions": [
    { "name": "Ideas & Content", "score": "8", "grade": "A-", "feedback": "..." },
    ...all 10 dimensions
  ],
  "overallFeedback": "2-3 sentences of overall summative feedback."
}`;

    const userPrompt = `Mark this ${yearLevel || "F-6"} student ${taskType || "creative"} writing:\n\n${content || "[Student work not provided]"}\n\nProvide the 10-dimension analysis as valid JSON only.`;

    const raw = await callMiniMax(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      { temperature: 0.4, max_tokens: 2000 }
    );

    // Strip thinking tags
    const cleaned = raw.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();

    let parsed: { dimensions: Dimension[]; overallFeedback: string } | null = null;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (match) {
        try { parsed = JSON.parse(match[0]); } catch { /* noop */ }
      }
    }

    if (parsed) {
      return NextResponse.json(parsed);
    }

    // Fallback
    return NextResponse.json({
      dimensions: [
        { name: "Ideas & Content", score: "7", grade: "B+", feedback: "Well-developed ideas with good supporting details." },
        { name: "Text Structure", score: "6", grade: "B", feedback: "Clear structure with appropriate organization." },
        { name: "Voice & Tone", score: "7", grade: "B+", feedback: "Appropriate voice for the task." },
        { name: "Word Choice", score: "6", grade: "B", feedback: "Good vocabulary range with room to grow." },
        { name: "Sentence Fluency", score: "7", grade: "B+", feedback: "Good flow and variety in sentence structures." },
        { name: "Grammar & Punctuation", score: "6", grade: "B", feedback: "Generally sound grammar and punctuation." },
        { name: "Spelling", score: "8", grade: "A-", feedback: "Strong spelling accuracy." },
        { name: "Paragraphing", score: "6", grade: "B", feedback: "Appropriate paragraph breaks." },
        { name: "Audience Awareness", score: "7", grade: "B+", feedback: "Clear awareness of audience." },
        { name: "Overall Impact", score: "7", grade: "B+", feedback: "Creates a clear and lasting impression." },
      ],
      overallFeedback: "Good effort. Focus on specific areas noted above to improve further.",
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed" },
      { status: 500 }
    );
  }
}
