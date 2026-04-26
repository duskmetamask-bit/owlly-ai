import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function POST(req: NextRequest) {
  try {
    const { subject, yearLevel, topic, duration, lessonType, objectives, activities } = await req.json();

    if (!OPENAI_API_KEY || OPENAI_API_KEY === "sk-build-placeholder") {
      return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are PickleNickAI — expert Australian F-6 teaching assistant with full AC9 knowledge.

Generate lesson plans that match or exceed MyLesson.ai quality. STRICT REQUIREMENTS:

1. TIMING COLUMNS — Every phase must have explicit duration:
   - Hook: X min
   - Explicit Teaching (I Do): X min
   - Guided Practice (We Do): X min
   - Independent Practice (You Do): X min
   - Share & Reflect: X min
   Total must equal the lesson duration.

2. MATERIALS & RESOURCES — Required section at top:
   - Manipulatives / equipment needed
   - Handouts / worksheets
   - Digital resources (links or descriptions)
   - Mentor texts if relevant

3. ASSESSMENT OPPORTUNITIES:
   - Formative checks throughout (thin slices, exit tickets, thumbs check)
   - Success criteria linked to learning objectives

4. DIFFERENTIATION — Must cover:
   - EAL students: visual scaffolds, sentence starters, home language support
   - Gifted students: extension challenges, higher-order questioning
   - Students with additional needs: reduced demand, visual schedules, partner support

5. AC9 CODES — Embed in lesson header and content descriptors

6. AT THE END — Always include follow-up suggestions:
   "Ask me to: [1] Generate a quiz for this lesson [2] Create an exit ticket [3] Write a differentiation version for [EAL/gifted/additional needs] [4] Build a hot/cold task for pre-post assessment"

Format output with clear markdown headers. Be specific and classroom-ready.`,
          },
          {
            role: "user",
            content: `Generate a complete lesson plan:\n\n- Subject: ${subject || "General"}\n- Year Level: ${yearLevel || "Year 4"}\n- Topic/Focus: ${topic || "TBD"}\n- Duration: ${duration || 60} minutes\n- Lesson Type: ${lessonType || "Explicit Teaching"}\n${objectives ? `- Learning Objectives:\n${objectives}` : ""}\n${activities ? `- Suggested Activities:\n${activities}` : ""}\n\nRequired output sections:\n1. Lesson Header (topic, year level, duration, date, AC9 codes)\n2. Learning Objectives (numbered, with AC9 codes)\n3. Materials & Resources (bulleted list — be specific)\n4. Lesson Structure with TIMING COLUMN (table format: Phase | Duration | Teacher Action | Student Action)\n5. Differentiation (EAL / Gifted / Additional Needs)\n6. Assessment Opportunities (formative + success criteria)\n7. Follow-up Suggestions (what teacher can ask me next)`,
          },
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: `OpenAI error ${response.status}` }, { status: 500 });
    }

    const data = await response.json();
    const plan = data.choices?.[0]?.message?.content || "";
    return NextResponse.json({ plan });

  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed" }, { status: 500 });
  }
}