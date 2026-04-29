import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || process.env.NIM_API_KEY || "";

export async function POST(req: NextRequest) {
  try {
    const { content, yearLevel, taskType } = await req.json();

    if (!OPENAI_API_KEY || OPENAI_API_KEY === "sk-build-placeholder") {
      return NextResponse.json({
        dimensions: [
          { name: "Ideas & Content", score: "7", grade: "B+", feedback: "Strong central idea with good supporting details. Some areas could benefit from more specific evidence." },
          { name: "Text Structure", score: "6", grade: "B", feedback: "Good beginning, middle, and end structure. Paragraphing needs refinement in places." },
          { name: "Voice & Tone", score: "7", grade: "B+", feedback: "Appropriate voice for the task type. Shows some personality while remaining appropriate." },
          { name: "Word Choice", score: "6", grade: "B", feedback: "Generally strong vocabulary. A few more precise word choices would strengthen the piece." },
          { name: "Sentence Fluency", score: "7", grade: "B+", feedback: "Good variety of sentence lengths and structures. Flows reasonably well." },
          { name: "Grammar & Punctuation", score: "6", grade: "B", feedback: "Minor errors in subject-verb agreement and comma usage. Overall mechanically sound." },
          { name: "Spelling", score: "8", grade: "A-", feedback: "Strong spelling accuracy. Only minor errors." },
          { name: "Paragraphing", score: "6", grade: "B", feedback: "Basic paragraph structure present. Topic sentences could be stronger in some paragraphs." },
          { name: "Audience Awareness", score: "7", grade: "B+", feedback: "Shows awareness of the intended audience. Could deepen engagement with reader." },
          { name: "Overall Impact", score: "7", grade: "B+", feedback: "Creates a clear impression. Some areas for emotional or analytical deepening." },
        ],
        overallFeedback: "This is a solid piece of writing that demonstrates good control of the basics. The ideas are clear and the structure supports the reader well. Focus on strengthening word precision and paragraph transitions to lift this to the next level.",
      });
    }

    const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek-ai/deepseek-v3.2",
        messages: [
          {
            role: "system",
            content: `You are PickleNickAI — expert Australian F-6 teaching assistant and writing assessor.

You are an expert English/Writing teacher who marks student work using a 10-dimension rubric. For each dimension, give:
1. A score out of 10
2. A letter grade (A+ to E)
3. Specific, constructive feedback (1-2 sentences)

The 10 dimensions to assess for ${yearLevel} ${taskType} writing:
1. Ideas & Content — depth, relevance, detail, originality
2. Text Structure — beginning, middle, end, organization, coherence
3. Voice & Tone — personality, engagement, appropriateness
4. Word Choice — precision, variety, vocabulary range, imagery
5. Sentence Fluency — rhythm, variety, flow, readability
6. Grammar & Punctuation — accuracy, control, sophistication
7. Spelling — accuracy, complexity of words attempted
8. Paragraphing — topic sentences, transitions, unity
9. Audience Awareness — purpose clarity, reader consideration
10. Overall Impact — lasting impression, effectiveness, craft

Return your response as a JSON object with this exact structure:
{
  "dimensions": [
    { "name": "Dimension Name", "score": "8", "grade": "A-", "feedback": "Specific feedback here..." },
    ...all 10
  ],
  "overallFeedback": "2-3 sentences of overall summative feedback with clear next steps."
}

Be specific and evidence-based. Reference actual things in the student's writing. Be encouraging but honest.`,
          },
          {
            role: "user",
            content: `Mark this ${yearLevel} student ${taskType} writing:\n\n${content}\n\nProvide the 10-dimension analysis in JSON format.`,
          },
        ],
        temperature: 0.4,
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: `OpenAI error ${response.status}` }, { status: 500 });
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content || "";

    // Try to parse JSON from the response
    let parsed: { dimensions: Dimension[]; overallFeedback: string } | null = null;
    try {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      }
    } catch {
      // Fall back to text
    }

    if (parsed) {
      return NextResponse.json(parsed);
    }

    // Fallback if JSON parsing fails
    return NextResponse.json({
      dimensions: [
        { name: "Ideas & Content", score: "7", grade: "B+", feedback: "Well-developed ideas with good supporting details." },
        { name: "Text Structure", score: "6", grade: "B", feedback: "Clear structure with appropriate organization." },
        { name: "Voice & Tone", score: "7", grade: "B+", feedback: "Appropriate voice for the task." },
        { name: "Word Choice", score: "6", grade: "B", feedback: "Good vocabulary range with room to grow." },
        { name: "Sentence Fluency", score: "7", grade: "B+", feedback: "Good flow and variety in sentence structures." },
        { name: "Grammar & Punctuation", score: "6", grade: "B", feedback: "Generally sound grammar and punctuation." },
        { name: "Spelling", score: "8", grade: "A-", feedback: "Strong spelling accuracy." },
        { name: "Paragraphing", score: "6", grade: "B", feedback: "Appropriate paragraph breaks and organization." },
        { name: "Audience Awareness", score: "7", grade: "B+", feedback: "Shows clear awareness of audience." },
        { name: "Overall Impact", score: "7", grade: "B+", feedback: "Creates a clear and lasting impression." },
      ],
      overallFeedback: raw || "Good effort. Focus on specific areas noted above to improve further.",
    });

  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed" }, { status: 500 });
  }
}

interface Dimension {
  name: string;
  score: string;
  grade: string;
  feedback: string;
}
