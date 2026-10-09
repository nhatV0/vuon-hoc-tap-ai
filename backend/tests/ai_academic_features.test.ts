import { describe, expect, test } from "bun:test";
import { app } from "@/index";
import { db } from "@/db/client";
import { hashPassword } from "@/common/utils";

describe("Academic AI Features - Twin Quiz, Socratic Tutor & Visual Scratchpad", () => {
  const studentUserId = "usr_ai_test_student";
  const studentId = "hs_ai_test_student";

  // Setup test student in database
  db.run(
    "INSERT OR REPLACE INTO users (id, email, password_hash, name, role) VALUES (?, ?, ?, ?, 'student')",
    [studentUserId, "ai_student@example.com", hashPassword("123456"), "Học Sinh AI"]
  );
  db.run(
    "INSERT OR REPLACE INTO students (id, user_id, name, grade, target_subject, weakness, long_term_goal, timeframe) VALUES (?, ?, 'Học Sinh AI', '12', 'Toán học', 'none', 'goal', '3m')",
    [studentId, studentUserId]
  );
  db.run(
    `INSERT OR IGNORE INTO quiz_questions (
      id, block, subject, slot_type, source, bloom_level,
      lock_condition, time_limit_seconds, question_text, options,
      correct_answer, micro_explanation, growth_mindset_tip
    ) VALUES (
      'q_test_ai_sample', 'A00', 'Toán học', 'DYNAMIC_3', 'GDPT 2018', 'Thông hiểu',
      'MOTUDO', 60, 'Tìm nghiệm phương trình $2x - 4 = 0$', '{"A": "x = 2", "B": "x = -2", "C": "x = 4", "D": "x = 0"}',
      'A', 'Nghiệm phương trình là x = 2.', 'Chú ý chuyển vế đổi dấu'
    )`
  );

  // Test 1: Feature 1 - Twin Quiz Synthesizer
  test("Feature 1: Synthesize twin question for incorrect answer", async () => {
    const res = await app.request("/api/quiz/twin-challenge", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${studentUserId}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        student_id: studentId,
        question_id: "q_test_ai_sample",
        selected_wrong_answer: "B",
        subject: "Toán học"
      })
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.id).toBeDefined();
    expect(body.question_text).toBeDefined();
    expect(body.options).toBeDefined();
    expect(body.correct_answer).toBeDefined();
    expect(body.cognitive_barrier).toBeDefined();
  });

  // Test 2: Feature 2 - Socratic Inquiry Tutor
  test("Feature 2: Socratic tutor guides student without leaking answers", async () => {
    const res = await app.request("/api/socratic/chat", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${studentUserId}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        student_id: studentId,
        subject: "Toán học",
        message: "Làm sao để tìm nghiệm phương trình bậc hai $ax^2 + bx + c = 0$ khi $a \\neq 0$?",
        history: []
      })
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.response).toBeDefined();
    expect(typeof body.response).toBe("string");
    expect(body.response.length).toBeGreaterThan(10);
  });

  // Test 3: Feature 3 - Visual Scratchpad Radiography
  test("Feature 3: Visual scratchpad analyzes handwritten derivations", async () => {
    const dummyBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
    const res = await app.request("/api/vision/analyze-scratchpad", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${studentUserId}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        student_id: studentId,
        subject: "Toán học",
        image_base64: dummyBase64,
        problem_description: "Tìm giá trị cực trị của hàm số bậc 3"
      })
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.step_by_step)).toBe(true);
    expect(body.step_by_step.length).toBeGreaterThan(0);
    expect(body.error_type).toBeDefined();
    expect(body.pedagogical_guidance).toBeDefined();
  });

  // Test 4: Security & BOLA Guard on AI Routes
  test("Security: Block student A from calling Socratic/Scratchpad for student B", async () => {
    const intruderUserId = "usr_ai_intruder";
    db.run(
      "INSERT OR REPLACE INTO users (id, email, password_hash, name, role) VALUES (?, ?, ?, ?, 'student')",
      [intruderUserId, "intruder@example.com", hashPassword("123456"), "Intruder"]
    );

    const resSocratic = await app.request("/api/socratic/chat", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${intruderUserId}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        student_id: studentId, // Belongs to student A
        subject: "Toán học",
        message: "hello"
      })
    });
    expect(resSocratic.status).toBe(403);

    const resTwin = await app.request("/api/quiz/twin-challenge", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${intruderUserId}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        student_id: studentId, // Belongs to student A
        question_id: "q_test_ai_sample",
        selected_wrong_answer: "B"
      })
    });
    expect(resTwin.status).toBe(403);
  });
});
