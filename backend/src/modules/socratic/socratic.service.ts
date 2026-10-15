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
    const chaptersContext = dto.selected_chapters?.length ? ` (${dto.selected_chapters.join(", ")})` : "";
    const systemPrompt = `Gia Sư Tranh Luận môn ${dto.subject}${chaptersContext}. Phản biện ngắn gọn, bọc công thức trong $...$.`;
    const messages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      ...dto.history.slice(-6),
      { role: "user", content: dto.message }
    ];

    try {
      const reply = await callAiModel({ messages, temperature: 0.5, maxTokens: 800 });
      return {
        response: reply,
        question_prompt: "Luận cứ phản biện tiếp theo của bạn là gì?"
      };
    } catch {
      return {
        response: `Về câu hỏi môn ${dto.subject}, luận điểm của bạn rất đáng chú ý. Hãy đưa ra dẫn chứng để cùng trao đổi tiếp nhé!`,
        question_prompt: "Luận cứ phản biện của bạn là gì?"
      };
    }
  }
}
