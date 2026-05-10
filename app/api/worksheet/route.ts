import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || process.env.NIM_API_KEY || "";

export async function POST(req: NextRequest) {
  try {
    const { subject, yearLevel, topic, worksheetType, additionalNotes } = await req.json();

    if (!OPENAI_API_KEY || OPENAI_API_KEY === "sk-build-placeholder") {
      return NextResponse.json({
        worksheet: `${worksheetType.toUpperCase()} — ${subject} | ${yearLevel} | ${topic}
${"═".repeat(50)}

Name: _____________________________  Date: ____________

${"─".repeat(50)}

SECTION A — Knowledge & Understanding (5 marks)
${"─".repeat(50)}

1. [2 marks] Question about ${topic}...
   a)
   b)

2. [3 marks] Explain the key concept of ${topic}...

${"─".repeat(50)}

SECTION B — Application (5 marks)
${"─".repeat(50)}

3. [3 marks] Complete the following...
   a)
   b)

4. [2 marks] Problem-solving question...

${"─".repeat(50)}

SECTION C — Extension (bonus challenge)
${"─".repeat(50)}

5. Challenge question for early finishers...

Note: Set OPENAI_API_KEY in .env for full AI worksheet generation.`,
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
            content: `You are Owlly — expert Australian F-6 teaching assistant.

Generate a structured, printable ${worksheetType} for ${yearLevel} students in ${subject} on the topic of "${topic}".

Format requirements:
- Designed for A4 printing (column layout where possible)
- Clear sections with question numbers
- Include a variety of question types: multiple choice, short answer, extended response
- ${yearLevel} age-appropriate content (8-12 year olds)
- AC9 curriculum aligned
- Mark values clearly noted
- Space for student name and date
- Section A: Knowledge & Understanding
- Section B: Application/Problem Solving
- Section C: Challenge/Extension (optional)
- Total time suggestion at the bottom
${additionalNotes ? `- Additional notes from teacher: ${additionalNotes}` : ""}

Format output as plain text with clear section headers using === and --- dividers. Make it classroom-ready and visually organized. Include a brief teacher notes section at the bottom with AC9 code reference.`,
          },
          {
            role: "user",
            content: `Generate a ${worksheetType} for ${yearLevel} ${subject} on "${topic}"${additionalNotes ? `\nTeacher notes: ${additionalNotes}` : ""}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: `OpenAI error ${response.status}` }, { status: 500 });
    }

    const data = await response.json();
    const worksheet = data.choices?.[0]?.message?.content || "";
    return NextResponse.json({ worksheet });

  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed" }, { status: 500 });
  }
}
