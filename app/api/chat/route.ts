import { NextRequest, NextResponse } from "next/server";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

async function chatWithAI(messages: ChatMessage[]): Promise<string> {
  if (!OPENAI_API_KEY || OPENAI_API_KEY === "sk-build-placeholder") {
    // Demo mode — return a helpful placeholder
    const lastMsg = messages[messages.length - 1]?.content || "";
    return `I'm ready to help with your teaching question about "${lastMsg.slice(0, 50)}..."\n\n**To enable full AI responses:**\n1. Get an OpenAI API key from https://platform.openai.com/api-keys\n2. Add it to the \`.env\` file: \`OPENAI_API_KEY=sk-...\`\n3. Restart the server with \`pm2 restart pickle-nick\`\n\nIn the meantime, I can help with:\n- Lesson planning (tell me year level, subject, topic)\n- Assessment design (rubrics, success criteria)\n- Behaviour strategies\n- Differentiation approaches\n- Australian Curriculum (AC9) codes`;
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: messages.map(m => ({ role: m.role, content: m.content })),
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI error: ${response.status} — ${err}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || "No response received.";
}

function buildSystemPrompt(profile: { name: string; yearLevels: string[]; subjects: string[] }): string {
  return `You are PickleNickAI — an expert AI teaching assistant for Australian F-6 teachers.

CONTEXT:
- Teacher: ${profile.name}
- Year levels: ${profile.yearLevels.join(", ")}
- Subjects: ${profile.subjects.join(", ")}
- Curriculum: Australian Curriculum v9 (AC9)

GUIDELINES:
- Give practical, actionable responses grounded in the Australian Curriculum
- Suggest specific AC9 codes where relevant (format: AC9[E/M/S/H/T][F/1-6][L/M/S/etc][01-99])
- Include timing, activities, resources, and differentiation in lesson plans
- Be specific to the teacher's context — don't give generic advice
- Be honest about limitations and uncertainties

TOPICS you can help with:
- Lesson planning and unit design
- Assessment and rubric creation
- Formative and summative assessment strategies
- Feedback techniques
- Behaviour management
- Differentiation and scaffold strategies
- Classroom setup and routines
- Parent communication
- Reporting
- Australian Curriculum content descriptors and achievement standards

Remember: ${profile.name} is a real teacher. Give real, useful, specific advice.`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, sessionId, profile } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "messages array required" }, { status: 400 });
    }

    if (!sessionId) {
      return NextResponse.json({ error: "sessionId required" }, { status: 400 });
    }

    const teacherProfile = profile || { name: "Teacher", yearLevels: ["Year 3-6"], subjects: ["General"] };
    const systemPrompt: ChatMessage = {
      role: "system",
      content: buildSystemPrompt(teacherProfile),
    };

    const allMessages: ChatMessage[] = [systemPrompt, ...messages];

    const reply = await chatWithAI(allMessages);
    return NextResponse.json({ reply });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Chat failed";
    console.error("[chat/route]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
