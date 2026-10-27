// Sanitizer to detect and eliminate any Chinese/Japanese/Korean (CJK) or unintended foreign glyphs
// that may bleed from base LLM tokenizers (e.g. Qwen/DeepSeek/Llama models)

const CJK_REGEX = /[\u3040-\u309f\u30a0-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uac00-\ud7af]/g;

// Common CJK leakage translation dictionary for academic terminology
const CJK_TRANSLATION_MAP: Record<string, string> = {
  "圆形": "hình tròn",
  "圆": "hình tròn",
  "矩形": "hình chữ nhật",
  "三角形": "hình tam giác",
  "椭圆": "hình elip",
  "球": "hình cầu",
  "柱": "hình trụ",
  "函数": "hàm số",
  "导数": "đạo hàm",
  "积分": "tích phân",
  "方程": "phương trình",
  "定理": "định lý",
  "假设": "giả sử",
  "证明": "chứng minh",
  "定义": "định nghĩa",
  "结论": "kết luận",
  "正确": "chính xác",
  "错误": "sai",
  "法": "",
  "未": "chưa"
};

export function hasCjkGlitch(text?: string | null): boolean {
  if (!text) return false;
  return CJK_REGEX.test(text);
}

export function cleanLanguageGlitches(text?: string | null): string {
  if (!text) return "";
  let cleaned = text;
  // 1. Replace known academic domain CJK leakages with space padding if attached to alphanumeric chars
  for (const [cjk, viet] of Object.entries(CJK_TRANSLATION_MAP)) {
    cleaned = cleaned.replaceAll(cjk, ` ${viet} `);
  }


  // 2. Remove any remaining stray CJK ideographs
  cleaned = cleaned.replace(CJK_REGEX, "");

  // 3. Normalize multiple spaces
  cleaned = cleaned.replace(/[ \t]{2,}/g, " ").trim();

  return cleaned;
}

export function sanitizeLanguageDeep<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === "string") {
    return cleanLanguageGlitches(obj) as unknown as T;
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeLanguageDeep(item)) as unknown as T;
  }
  if (typeof obj === "object") {
    const res: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
      res[k] = sanitizeLanguageDeep(v);
    }
    return res as unknown as T;
  }
  return obj;
}
