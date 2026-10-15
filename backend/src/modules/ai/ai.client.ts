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

  // Timeout for deep reasoning or comprehensive solutions
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.AI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(45000)
    });

    if (response.ok) {
      const json = await response.json();
      const msgObj = json.choices?.[0]?.message;
      let content = msgObj?.content;
      if ((!content || content.trim().length === 0) && typeof msgObj?.reasoning_content === "string") {
        content = msgObj.reasoning_content;
      }
      if (typeof content === "string" && content.trim().length > 0) {
        // Strip router advertisement footer if present
        const cleaned = content.replace(/> Cảm ơn bạn đã sử dụng mnRouter[\s\S]*$/, "").trim();
        return cleaned;
      }
      console.error("[callAiModel] Empty or invalid content:", json);
    } else {
      const errText = await response.text();
      console.error(`[callAiModel] HTTP Error ${response.status}:`, errText);
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[callAiModel] Fetch Exception:", msg);
  }
  throw new Error("AI_UPSTREAM_UNAVAILABLE");
}
