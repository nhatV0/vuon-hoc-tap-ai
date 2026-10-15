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

export function getTheoryContent(subject: string, chapterTitle?: string): string {
  const fileName = SUBJECT_FILE_MAP[subject];
  if (!fileName) return "";

  let fullText = cache[fileName];
  if (!fullText) {
    const candidates = [
      path.resolve(process.cwd(), "hoc_lieu/tai_lieu_huong_dan", fileName),
      path.resolve(process.cwd(), "../hoc_lieu/tai_lieu_huong_dan", fileName),
      path.resolve(process.cwd(), "../../hoc_lieu/tai_lieu_huong_dan", fileName)
    ];
    for (const p of candidates) {
      if (fs.existsSync(p)) {
        fullText = fs.readFileSync(p, "utf-8");
        cache[fileName] = fullText;
        break;
      }
    }
  }

  if (!fullText) return "";
  if (!chapterTitle) return fullText.slice(0, 2500);

  const cleanQuery = chapterTitle
    .replace(/\(Lớp\s*\d+\)/gi, "")
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .trim()
    .toLowerCase();

  const keywords = cleanQuery.split(/\s+/).filter((k) => k.length >= 3);
  const paragraphs = fullText.split(/\n(?=###|##)/g);

  let bestMatch = "";
  let highestScore = 0;

  for (const para of paragraphs) {
    const lowerPara = para.toLowerCase();
    let score = 0;
    for (const kw of keywords) {
      if (lowerPara.includes(kw)) score += 1;
    }
    if (score > highestScore) {
      highestScore = score;
      bestMatch = para;
    }
  }

  if (bestMatch && highestScore >= 1) {
    return bestMatch.slice(0, 1600).trim();
  }

  return fullText.slice(0, 1600).trim();
}
