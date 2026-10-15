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

  const cleanQuery = chapterTitle
    .replace(/[0-9IVXLCDM]+\.\s*/gi, "")
    .replace(/Chương\s+[0-9IVXLCDM]+\.?\s*/gi, "")
    .replace(/Unit\s+\d+:?\s*/gi, "")
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .trim()
    .toLowerCase();

  const keywords = cleanQuery.split(/\s+/).filter((k) => k.length >= 3);
  const sections = fullText.split(/\n(?=###|##)/g);

  let bestSection = "";
  let highestScore = 0;

  for (const sec of sections) {
    const headerLine = sec.split("\n")[0].toLowerCase();
    let score = 0;
    for (const kw of keywords) {
      if (headerLine.includes(kw)) score += 3;
      else if (sec.toLowerCase().includes(kw)) score += 1;
    }
    if (score > highestScore) {
      highestScore = score;
      bestSection = sec;
    }
  }

  if (bestSection && highestScore >= 1) {
    return bestSection.slice(0, 1500).trim();
  }

  return fullText.slice(0, 1500).trim();
}
