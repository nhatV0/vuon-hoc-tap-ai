import fs from "node:fs";
import path from "node:path";

const SUBJECT_FILE_MAP: Record<string, string> = {
  "Toán học": "Math.txt",
  "Vật lí": "physics.txt",
  "Hóa học": "chemistry.txt",
  "Sinh học": "Biology.txt",
  "Tin học": "Computer.txt",
  "Ngữ văn": "literature.txt",
  "Tiếng Anh": "English.txt",
  "Lịch sử": "history.txt",
  "Địa lí": "Geography.txt",
  "GDKT & PL": "economics and law.txt",
  "Công nghệ": "Technology.txt"
};

const cache: Record<string, string> = {};
export function clearTheoryCache(): void {
  for (const k of Object.keys(cache)) {
    delete cache[k];
  }
}

function readTheoryFile(fileName: string): string {
  if (cache[fileName]) return cache[fileName];
  const candidates = [
    path.resolve(process.cwd(), "hoc_lieu/tai_lieu_huong_dan", fileName),
    path.resolve(process.cwd(), "../hoc_lieu/tai_lieu_huong_dan", fileName),
    path.resolve(process.cwd(), "../../hoc_lieu/tai_lieu_huong_dan", fileName)
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) {
      const content = fs.readFileSync(p, "utf-8");
      cache[fileName] = content;
      return content;
    }
  }
  return "";
}

export function getTheoryContent(subject: string, chapterTitle?: string): string {
  const fileName = SUBJECT_FILE_MAP[subject];
  if (!fileName) return "";
  const fullText = readTheoryFile(fileName);
  if (!fullText) return "";
  if (!chapterTitle) return fullText.slice(0, 2000);

  const rawLower = chapterTitle.toLowerCase();
  const cleanQuery = chapterTitle
    .replace(/Chương\s+[0-9IVXLCDM]+:?\s*/gi, "")
    .replace(/Unit\s+\d+:?\s*/gi, "")
    .replace(/[0-9IVXLCDM]+\.\s*/gi, "")
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .trim()
    .toLowerCase();

  // Support words >= 2 chars so essential terms like "từ", "ai", "kí" are preserved
  const keywords = cleanQuery.split(/\s+/).filter((k) => k.length >= 2);
  // Split only on major headers (## or ###, never ####) to keep full subtopics together
  const sections = fullText.split(/\r?\n(?=#{2,3}\s+)/g);

  let bestSection = "";
  let highestScore = 0;

  for (const sec of sections) {
    const headerLine = (sec.split(/\r?\n/)[0] || "").toLowerCase();
    let score = 0;

    // Direct phrase match in header gets huge boost
    if (cleanQuery && headerLine.includes(cleanQuery)) {
      score += 20;
    }

    for (const kw of keywords) {
      if (headerLine.includes(kw)) score += 6;
      else if (sec.toLowerCase().includes(kw)) score += 1;
    }
    if (score > highestScore) {
      highestScore = score;
      bestSection = sec;
    }
  }

  if (bestSection && highestScore >= 1) {
    return bestSection.slice(0, 1800).trim();
  }

  return fullText.slice(0, 1800).trim();
}
