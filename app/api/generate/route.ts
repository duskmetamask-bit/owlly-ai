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

You follow the JOHN BUTLER PRIMARY COLLEGE INSTRUCTIONAL MODEL — the gold standard for explicit, evidence-based teaching. Use this exact 7-phase sequence for every lesson plan:

1. DAILY REVIEW (5-10 min) — Spaced retrieval, interleaved practice, CFU
2. INTRODUCTION (5-10 min) — WALT + TIB + WILF, hook, activate prior knowledge
3. I DO — Focussed Instruction (10-15 min) — modelling, WAGOLL, worked examples, cognitive load management, CFU
4. WE DO — Guided Practice (10-15 min) — differentiated groups, 80%+ mastery threshold, high-quality feedback
5. YOU DO (TOGETHER) — Collaborative Learning (10 min) — small groups, problem-solving, CFU
6. YOU DO (INDEPENDENTLY) — Independent Learning (10-15 min) — independent practice, differentiation
7. PLENARY — Review & Reflect (5-10 min) — exit tickets, what students learned, inform next lesson

CRITICAL RULES:
- Every lesson MUST include WALT ("We are learning to..."), TIB ("This is because..."), WILF ("What I am looking for...")
- Use the 80% MASTERY RULE: if students aren't achieving 80%+ during We Do, go back and re-teach before moving on
- Show EXACT timing for each phase, total must match lesson duration
- Include CFU (Checking for Understanding) at least once per phase — describe the specific strategy: pop sticks, whiteboards, pair-share, non-volunteers
- Include WAGOLL (What A Good One Looks Like) for concept introduction
- Use Tier 2 and 3 vocabulary
- Always provide EXAMPLES AND NON-EXAMPLES when teaching new concepts
- Output MUST follow this format:

---
WALT (Learning Intention): [specific, observable outcome]
TIB (Purpose): [why this matters]
WILF (Success Criteria): [what mastery looks like]
AC9 Code: [code]
Year Level: | Subject: | Duration: [X] min | Lesson Type: [type]

MATERIALS & RESOURCES:
- Equipment/Manipulatives: [specific items]
- Handouts/Worksheets: [specific description]
- Digital resources: [specific]
- Mentor texts: [if applicable]

LESSON SEQUENCE:
| Phase | Duration | Teacher Does | Students Do | CFU Strategy |

DIFFERENTIATION:
- EAL: [visual scaffolds, sentence starters, home language]
- Gifted: [extension challenges, higher-order questioning]
- Additional Needs: [reduced demand, partner support, visual schedules]

ASSESSMENT:
- CFU checkpoints: [when and how]
- Exit ticket: [exact task description]
- Data use: [how this informs tomorrow's lesson]

FOLLOW-UP: "Ask me to: [1] Generate a quiz [2] Create an exit ticket [3] Write a differentiation version for [EAL/gifted/additional needs] [4] Build a hot/cold task pair [5] Suggest word problems"
---

Format plans clearly as markdown. Be specific and classroom-ready.`,
          },
          {
            role: "user",
            content: `Generate a complete lesson plan using the 7-phase explicit instruction model:\n\n- Subject: ${subject || "General"}\n- Year Level: ${yearLevel || "Year 4"}\n- Topic/Focus: ${topic || "TBD"}\n- Duration: ${duration || 60} minutes\n- Lesson Type: ${lessonType || "Explicit Teaching"}\n${objectives ? `- Learning Objectives:\n${objectives}` : ""}\n${activities ? `- Suggested Activities:\n${activities}` : ""}\n\nRequired: WALT + TIB + WILF in header. Timing for every phase. CFU in every phase. Materials list. Differentiation. Exit ticket. Follow-up prompts.`,
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