import { db } from "@/db/client";
import { callAiModel, ChatMessage } from "@/modules/ai/ai.client";
import {
  DebateGenerateQuestionDto,
  DebateGenerateSessionDto,
  DebateEvaluateAnswerDto,
  SocraticChatDto
} from "./socratic.schemas";
import { SUBJECT_SYLLABUS_MAP, SyllabusChapter } from "./socratic.syllabus";
import { evaluateDebateAnswer, DebateEvaluationResult } from "./socratic.evaluator";
import { buildSocraticChatPrompt } from "./socratic.prompt";
import { cleanLanguageGlitches } from "@/common/language-sanitizer";
import { getTheoryContent } from "./socratic.knowledge";
import {
  DebateQuestionResult,
  generateDebateQuestionHelper,
  generateDebateSessionHelper
} from "./socratic.generator";

export type { DebateQuestionResult, DebateEvaluationResult };

export class SocraticService {
  getSyllabus(subject?: string): Record<string, SyllabusChapter[]> {
    if (subject && SUBJECT_SYLLABUS_MAP[subject]) {
      return { [subject]: SUBJECT_SYLLABUS_MAP[subject] };
    }
    return SUBJECT_SYLLABUS_MAP;
  }

  async generateDebateQuestion(dto: DebateGenerateQuestionDto): Promise<DebateQuestionResult> {
    return generateDebateQuestionHelper(dto);
  }

  async generateDebateSession(dto: DebateGenerateSessionDto): Promise<DebateQuestionResult[]> {
    return generateDebateSessionHelper(dto);
  }

  async evaluateStudentAnswer(dto: DebateEvaluateAnswerDto): Promise<DebateEvaluationResult> {
    const result = await evaluateDebateAnswer(dto);
    try {
      db.run(
        `INSERT INTO student_debate_attempts (
          student_id, subject, question, student_answer, sample_answer,
          verdict, is_correct, feedback
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          dto.student_id,
          dto.subject,
          dto.question,
          dto.student_answer,
          result.sample_answer || dto.sample_answer,
          result.verdict,
          result.is_correct ? 1 : 0,
          result.feedback || result.explanation
        ]
      );
    } catch {}
    return result;
  }

  async chat(dto: SocraticChatDto): Promise<{ response: string; question_prompt: string }> {
    const isEnglish = dto.subject === "Tiếng Anh" || dto.subject.toLowerCase().includes("english");
    const systemPrompt = buildSocraticChatPrompt(dto);
    const messages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      ...dto.history.slice(-6),
      { role: "user", content: dto.message }
    ];

    try {
      const reply = await callAiModel({ messages, temperature: 0.45, maxTokens: 800 });
      const promptText = dto.mode === "solver"
        ? (isEnglish ? "Do you need clarification on any specific step?" : "Bạn có băn khoăn ở bước giải nào không?")
        : (isEnglish ? "What is your next reasoning step?" : "Bước suy luận tiếp theo của bạn là gì?");
      return {
        response: cleanLanguageGlitches(reply),
        question_prompt: promptText
      };
    } catch {
      const isSolver = dto.mode === "solver";
      const focusChapter = dto.selected_chapters?.[0] || dto.message.slice(0, 30);
      const theory = getTheoryContent(dto.subject, focusChapter);
      const theorySnippet = theory ? theory.split("\n").filter((l) => l.trim().length > 20).slice(0, 2).join(" ") : "";

      const fallbackPrompt = isSolver
        ? (isEnglish ? "Do you need clarification on any specific step?" : "Bạn có băn khoăn ở bước giải nào không?")
        : (isEnglish ? "What is your next reasoning step?" : "Theo bạn bước lập luận tiếp theo là gì?");

      let fallbackResponse = "";
      if (isEnglish) {
        fallbackResponse = `Regarding your inquiry on ${dto.subject}: ${theorySnippet ? `"${theorySnippet.slice(0, 250)}..." ` : ""}Let us review the core definition. What rule or theorem applies to this scenario?`;
      } else if (isSolver) {
        fallbackResponse = `Để giải quyết bài toán ${dto.subject} này, chúng ta cần phân tích các điều kiện đã cho và áp dụng định lý cơ bản.${theorySnippet ? `\n\nKiến thức trọng tâm: ${theorySnippet.slice(0, 280)}...` : ""}\n\nHãy bắt đầu từ bước xác định giả thiết và công thức liên quan.`;
      } else {
        fallbackResponse = `Về vấn đề môn ${dto.subject} em đang tìm hiểu: hãy chú ý đến bản chất lý thuyết cốt lõi.${theorySnippet ? `\n\nKiến thức tham chiếu: ${theorySnippet.slice(0, 280)}...` : ""}\n\nTheo em, dấu hiệu nhận biết hoặc điều kiện tiên quyết ở đây là gì?`;
      }

      return {
        response: cleanLanguageGlitches(fallbackResponse),
        question_prompt: fallbackPrompt
      };
    }
  }
}
