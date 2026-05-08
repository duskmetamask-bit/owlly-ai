import { NextRequest, NextResponse } from "next/server";
import { streamMiniMaxSSE } from "@/lib/ai";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `You are Owlly — expert Australian F-6 teaching assistant with full AC9 knowledge.

Follow the JOHN BUTLER PRIMARY COLLEGE INSTRUCTIONAL MODEL:

1. DAILY REVIEW (5-10 min)
2. INTRODUCTION — WALT + TIB + WILF, hook
3. I DO — Focussed Instruction (10-15 min)
4. WE DO — Guided Practice (10-15 min)
5. YOU DO (TOGETHER) — Collaborative Learning (10 min)
6. YOU DO (INDEPENDENTLY) — Independent Learning (10-15 min)
7. PLENARY — Review & Reflect (5-10 min)

CRITICAL: Every lesson must include WALT, TIB, WILF, timing for each phase, CFU in every phase, materials, differentiation, exit ticket.

Output format:
---
WALT: ...
TIB: ...
WILF: ...
AC9 Code: ...
Year Level: | Subject: | Duration: X min | Lesson Type: ...

MATERIALS & RESOURCES:
-

LESSON SEQUENCE:
| Phase | Duration | Teacher Does | Students Do | CFU Strategy |

DIFFERENTIATION:
- EAL: ...
- Gifted: ...
- Additional Needs: ...

ASSESSMENT:
- CFU checkpoints: ...
- Exit ticket: ...

FOLLOW-UP: Ask me to generate a quiz, exit ticket, differentiation version, or extension task.
---

Format as markdown. Be specific and classroom-ready.`;

const UNIT_PLAN_SYSTEM_PROMPT = `You are PickleNickAI — expert Australian F-6 teaching assistant with full AC9 knowledge.

Follow the JOHN BUTLER PRIMARY COLLEGE INSTRUCTIONAL MODEL for unit planning.

== UNIT PLANNING REQUIREMENTS ==
Every unit plan must include:
- Unit title, year level, subject, duration (number of weeks)
- AC9 content descriptors with codes
- Week-by-week overview table (Week | Focus | Learning Intentions | Resources | Assessment)
- Detailed lesson sequences for each week (at least 3 lessons per week)
- Individual lesson plans per week with: WALT, TIB, WILF, timing, CFU, materials, differentiation, exit ticket
- Assessment tasks with success criteria (cold task and hot task)
- Differentiation overview (EAL/D, gifted, additional needs)
- Resource list

Output format:
---
# Unit Plan: [Title]
**Subject:** | **Year Level:** | **Duration:** | **AC9 Codes:**

## Week-by-Week Overview
| Week | Focus | Learning Intentions | Resources | Assessment |

## Week 1: [Focus]
### Lesson 1: [Title]
**WALT:** ...
**TIB:** ...
**WILF:** ...
| Phase | Duration | Teacher Does | Students Do | CFU |

---

Format as detailed markdown. Be specific and classroom-ready.`;

const DIFF_SYSTEM_PROMPT = `Given an original lesson plan, generate 3 differentiated versions as JSON only. No markdown, no code blocks, just plain JSON:

{
  "eal": "## EAL/ESL Version...",
  "gifted": "## Extension/Gifted Version...",
  "additional": "## Additional Needs Version..."
}`;

const MAX_INPUT_CHARS = 8000;
const MAX_OUTPUT_TOKENS_LESSON = 2500;
const MAX_OUTPUT_TOKENS_UNIT = 4000;
const MAX_OUTPUT_TOKENS_DIFF = 3000;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { subject, yearLevel, topic, duration, lessonType, objectives, differentiate, originalPlan, weeks } = body;

    // ── Guard rails ─────────────────────────────────────────────────────────
    if (subject && subject.length > 200) {
      return NextResponse.json({ error: "Subject too long (max 200 chars)" }, { status: 400 });
    }
    if (yearLevel && yearLevel.length > 50) {
      return NextResponse.json({ error: "Year level too long (max 50 chars)" }, { status: 400 });
    }
    if (topic && topic.length > 300) {
      return NextResponse.json({ error: "Topic too long (max 300 chars)" }, { status: 400 });
    }
    if (objectives && objectives.length > 2000) {
      return NextResponse.json({ error: "Objectives too long (max 2000 chars)" }, { status: 400 });
    }
    if (originalPlan && originalPlan.length > MAX_INPUT_CHARS) {
      return NextResponse.json({ error: `Original plan too long (max ${MAX_INPUT_CHARS} chars)` }, { status: 400 });
    }
    if (duration && (isNaN(Number(duration)) || Number(duration) > 180 || Number(duration) < 1)) {
      return NextResponse.json({ error: "Duration must be 1–180 minutes" }, { status: 400 });
    }
    if (weeks && (isNaN(Number(weeks)) || Number(weeks) > 12 || Number(weeks) < 1)) {
      return NextResponse.json({ error: "Weeks must be 1–12" }, { status: 400 });
    }
    if (lessonType && lessonType.length > 100) {
      return NextResponse.json({ error: "Lesson type too long (max 100 chars)" }, { status: 400 });
    }

    if (differentiate && originalPlan) {
      // Differentiation — stream SSE
      const messages = [
        { role: "system" as const, content: DIFF_SYSTEM_PROMPT },
        { role: "user" as const, content: `Original lesson plan:\n\n${originalPlan}\n\nGenerate 3 differentiated versions as JSON.` },
      ];

      const stream = await streamMiniMaxSSE(messages, { temperature: 0.5, max_tokens: MAX_OUTPUT_TOKENS_DIFF });

      const encoder = new TextEncoder();
      const readable = new ReadableStream({
        async start(controller) {
          const reader = stream.getReader();
          const decoder = new TextDecoder();
          let buffer = "";

          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split("\n");
              buffer = lines.pop() || "";

              for (const line of lines) {
                if (!line.startsWith("data: ")) continue;
                const data = line.slice(6);
                if (data === "[DONE]") {
                  controller.enqueue(encoder.encode(`data: {"type":"done"}\n\n`));
                  break;
                }
                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content || "";
                  if (content) {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "text", content })}\n\n`));
                  }
                } catch { /* skip malformed */ }
              }
            }
            controller.close();
          } catch (err) {
            controller.error(err);
          }
        },
      });

      return new NextResponse(readable, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
        },
      });
    }

    // Unit plan generation
    if (weeks) {
      const unitMessages = [
        { role: "system" as const, content: UNIT_PLAN_SYSTEM_PROMPT },
        {
          role: "user" as const,
          content: `Generate a ${weeks}-week unit plan:\n- Subject: ${subject || "General"}\n- Year Level: ${yearLevel || "Year 4"}\n- Topic: ${topic || "TBD"}\n- Weeks: ${weeks}\n\nMust include: week-by-week overview table, detailed lesson sequences for each week, WALT/TIB/WILF per lesson, AC9 codes, assessment tasks, differentiation.`,
        },
      ];
      const stream = await streamMiniMaxSSE(unitMessages, { temperature: 0.7, max_tokens: MAX_OUTPUT_TOKENS_UNIT });
      const encoder = new TextEncoder();
      const readable = new ReadableStream({
        async start(controller) {
          const reader = stream.getReader();
          const decoder = new TextDecoder();
          let buffer = "";
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split("\n");
              buffer = lines.pop() || "";
              for (const line of lines) {
                if (!line.startsWith("data: ")) continue;
                const data = line.slice(6);
                if (data === "[DONE]") { controller.enqueue(encoder.encode(`data: {"type":"done"}\n\n`)); break; }
                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content || "";
                  if (content) controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "text", content })}\n\n`));
                } catch { /* skip */ }
              }
            }
            controller.close();
          } catch (err) { controller.error(err); }
        },
      });
      return new NextResponse(readable, { headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" } });
    }

    // Normal lesson plan generation — stream SSE
    const messages = [
      { role: "system" as const, content: SYSTEM_PROMPT },
      {
        role: "user" as const,
        content: `Generate a lesson plan:\n- Subject: ${subject || "General"}\n- Year Level: ${yearLevel || "Year 4"}\n- Topic: ${topic || "TBD"}\n- Duration: ${duration || 60} min\n- Lesson Type: ${lessonType || "Explicit Teaching"}\n${objectives ? `- Objectives:\n${objectives}` : ""}\n\nMust include: WALT, TIB, WILF, timing for every phase, CFU in every phase, materials, differentiation, exit ticket.`,
      },
    ];

    const stream = await streamMiniMaxSSE(messages, { temperature: 0.7, max_tokens: MAX_OUTPUT_TOKENS_LESSON });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        const reader = stream.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              if (!line.startsWith("data: ")) continue;
              const data = line.slice(6);
              if (data === "[DONE]") {
                controller.enqueue(encoder.encode(`data: {"type":"done"}\n\n`));
                break;
              }
              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content || "";
                if (content) {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "text", content })}\n\n`));
                }
              } catch { /* skip */ }
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new NextResponse(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed" },
      { status: 500 }
    );
  }
}
