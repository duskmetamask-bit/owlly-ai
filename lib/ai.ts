const MINIMAX_API_KEY = process.env.MINIMAX_API_KEY || "";
const MINIMAX_MODEL = process.env.MINIMAX_MODEL || "MiniMax-M2.7";

interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

/** Streaming MiniMax SSE — for generate route (avoids Vercel timeout on long outputs) */
export async function streamMiniMaxSSE(
  messages: Message[],
  options?: { temperature?: number; max_tokens?: number }
): Promise<ReadableStream> {
  if (!MINIMAX_API_KEY) throw new Error("MiniMax API key not configured");

  const response = await fetch("https://api.minimax.io/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${MINIMAX_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MINIMAX_MODEL,
      messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.max_tokens ?? 2000,
      stream: true,
    }),
  });

  if (!response.ok) throw new Error(`MiniMax error ${response.status}`);
  return response.body!;
}

/** Non-streaming MiniMax — only for short responses (max ~500 tokens) */
export async function callMiniMax(
  messages: Message[],
  options?: { temperature?: number; max_tokens?: number }
): Promise<string> {
  if (!MINIMAX_API_KEY) throw new Error("MiniMax API key not configured");

  const response = await fetch("https://api.minimax.io/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${MINIMAX_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MINIMAX_MODEL,
      messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: Math.min(options?.max_tokens ?? 500, 800),
    }),
  });

  if (!response.ok) throw new Error(`MiniMax error ${response.status}`);
  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}
