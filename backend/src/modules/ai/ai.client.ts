import { env } from "@/config/env";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string | Array<{ type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }>;
}

export interface AiChatOptions {
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
}

function delay(ms: number): Promise<void> {
  const { promise, resolve } = Promise.withResolvers<void>();
  setTimeout(resolve, ms);
  return promise;
}

export async function callAiModel(options: AiChatOptions): Promise<string> {
  const url = `${env.AI_BASE_URL}/chat/completions`;
  const body: Record<string, unknown> = {
    model: env.AI_MODEL,
    messages: options.messages,
    temperature: options.temperature ?? 0.7,
    max_tokens: options.maxTokens ?? 1024
  };

  if (options.jsonMode) {
    body.response_format = { type: "json_object" };
  }

  // Fast-fail timeout (2500ms) to ensure lightning response & instant fallback
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.AI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(2500)
    });

    if (response.ok) {
      const json = await response.json();
      const content = json.choices?.[0]?.message?.content;
      if (typeof content === "string" && content.trim().length > 0) {
        return content;
      }
    }
  } catch {}

  throw new Error("AI_UPSTREAM_UNAVAILABLE");
}
