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

async function callGeminiModel(modelName: string, options: AiChatOptions): Promise<string> {
  const model = modelName.replace(/^models\//, "");
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.AI_API_KEY}`;
  const contents = options.messages.map((m) => {
    const role = m.role === "assistant" ? "model" : "user";
    const text = typeof m.content === "string" ? m.content : JSON.stringify(m.content);
    return { role, parts: [{ text }] };
  });

  const payload: Record<string, unknown> = {
    contents,
    generationConfig: {
      temperature: options.temperature ?? 0.7,
      maxOutputTokens: options.maxTokens ?? 1024,
      ...(options.jsonMode ? { responseMimeType: "application/json" } : {})
    }
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(30000)
  });

  if (res.ok) {
    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (typeof text === "string" && text.trim().length > 0) {
      return text
        .replace(/>\s*Cảm ơn bạn đã sử dụng[\s\S]*$/gi, "")
        .replace(/https:\/\/[^\s]+issues[\s\S]*$/gi, "")
        .trim();
    }
  }
  const errText = await res.text();
  throw new Error(`GEMINI_NATIVE_FAILED (${model}): ${res.status} ${errText}`);
}

async function callGeminiNativeWithFallback(options: AiChatOptions): Promise<string> {
  const modelsToTry = [
    "gemini-3.5-flash-lite",
    "gemini-3.1-flash-lite",
    env.AI_MODEL,
    "gemini-3.1-flash-lite-preview",
    "gemini-3.5-flash"
  ];
  const uniqueModels: string[] = [];
  for (const m of modelsToTry) {
    if (!uniqueModels.includes(m)) uniqueModels.push(m);
  }

  let lastError: unknown;
  for (const model of uniqueModels) {
    try {
      return await callGeminiModel(model, options);
    } catch (err) {
      lastError = err;
      const errStr = String(err);
      // If rate limited or model not found, cascade to next available lighter model
      if (errStr.includes("429") || errStr.includes("404") || errStr.includes("RESOURCE_EXHAUSTED")) {
        console.warn(`[callGeminiNative] Model ${model} exceeded quota/unavailable, cascading to next model...`);
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}
export async function callAiModel(options: AiChatOptions): Promise<string> {
  // If configured with Google Gemini, try native endpoint directly for optimal speed & json formatting
  if (env.AI_BASE_URL.includes("generativelanguage.googleapis.com") || env.AI_API_KEY.startsWith("AQ.") || env.AI_API_KEY.startsWith("AIzaSy")) {
    try {
      return await callGeminiNativeWithFallback(options);
    } catch (nativeErr) {
      console.warn("[callAiModel] Native Gemini failed, attempting OpenAI compatible endpoint:", nativeErr);
    }
  }

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
        return content
          .replace(/>\s*Cảm ơn bạn đã sử dụng[\s\S]*$/gi, "")
          .replace(/https:\/\/[^\s]+issues[\s\S]*$/gi, "")
          .trim();
      }
    } else {
      const errText = await response.text();
      console.warn(`[callAiModel] OpenAI compatible endpoint failed: ${response.status} ${errText}`);
    }
  } catch (err: unknown) {
    console.error("[callAiModel] Fetch Exception:", err);
  }
  throw new Error("AI_UPSTREAM_UNAVAILABLE");
}
