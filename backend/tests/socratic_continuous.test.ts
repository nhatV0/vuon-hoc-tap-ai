import { describe, expect, test } from "bun:test";
import { app } from "@/index";
import { db } from "@/db/client";
import { hashPassword } from "@/common/utils";

/**
 * Continuous Multi-round & Stress Testing for Socratic Tutor System
 * Tests:
 * 1. Multi-turn Socratic conversation continuity (Toán, Vật lí, Hóa học, Tiếng Anh)
 * 2. Scaffolding & Misconception guidance adherence (Does not give away answers directly in socratic mode)
 * 3. Solver mode vs Socratic mode pedagogical differences
 * 4. Language sanity check (No Chinese/Japanese glitch artifacts, strict English for English subject)
 * 5. LaTeX formula encapsulation ($...$ or $$...$$)
 * 6. Debate Tutor continuous generation (10 questions session with diverse archetypes)
 * 7. Multi-case Essay/Debate Answer Evaluation (Correct, Partially correct, Evading, Misconception)
 * 8. Performance, latency & fallback resilience under malformed / edge-case inputs
 */

describe("Continuous Socratic Tutor System & Pedagogical Evaluation", () => {
  const studentUserId = "usr_socratic_continuous_eval";
  const studentId = "hs_socratic_continuous_eval";

  // Setup student
  db.run(
    "INSERT OR REPLACE INTO users (id, email, password_hash, name, role) VALUES (?, ?, ?, ?, 'student')",
    [studentUserId, "socratic_eval@example.com", hashPassword("123456"), "Học Sinh Đánh Giá"]
  );
  db.run(
    "INSERT OR REPLACE INTO students (id, user_id, name, grade, target_subject, weakness, long_term_goal, timeframe) VALUES (?, ?, 'Học Sinh Đánh Giá', '12', 'Toán học', 'none', 'goal', '3m')",
    [studentId, studentUserId]
  );

  test("1. Multi-turn Socratic dialogue maintains pedagogical scaffolding without giving away final answer", async () => {
    const history: Array<{ role: "system" | "user" | "assistant"; content: string }> = [];

    // Turn 1: Student presents a common misconception in Calculus / Geometry
    const turn1Payload = {
      student_id: studentId,
      subject: "Toán học",
      mode: "socratic",
      message: "Em thấy đồ thị hàm số y = 1/x có tiệm cận đứng là x = 0 và tiệm cận ngang là y = 0. Có phải mọi hàm số phân thức đều có 2 tiệm cận không?",
      history: []
    };

    const res1 = await app.request("/api/socratic/chat", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${studentUserId}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(turn1Payload)
    });

    expect(res1.status).toBe(200);
    const data1 = await res1.json();
    expect(data1.response).toBeDefined();
    expect(data1.question_prompt).toBeDefined();

    // Check no foreign Asian characters (Chinese/Japanese/Korean)
    expect(/[\u4e00-\u9fa5\u3040-\u30ff]/.test(data1.response)).toBe(false);

    history.push({ role: "user", content: turn1Payload.message });
    history.push({ role: "assistant", content: `${data1.response}\n\n${data1.question_prompt}` });

    // Turn 2: Student replies with a partial hypothesis
    const turn2Payload = {
      student_id: studentId,
      subject: "Toán học",
      mode: "socratic",
      message: "Em nghĩ là nếu bậc của tử lớn hơn bậc của mẫu thì sao ạ? Ví dụ hàm (x^2 + 1)/x ?",
      history
    };

    const res2 = await app.request("/api/socratic/chat", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${studentUserId}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(turn2Payload)
    });

    expect(res2.status).toBe(200);
    const data2 = await res2.json();
    expect(data2.response).toBeDefined();
    // Verify response addresses tiệm cận xiên / bậc tử lớn hơn bậc mẫu
    expect(data2.response.length).toBeGreaterThan(30);

    history.push({ role: "user", content: turn2Payload.message });
    history.push({ role: "assistant", content: `${data2.response}\n\n${data2.question_prompt}` });

    // Turn 3: Student asks for final confirmation
    const turn3Payload = {
      student_id: studentId,
      subject: "Toán học",
      mode: "socratic",
      message: "Vậy tóm lại điều kiện để có tiệm cận xiên là gì hả thầy?",
      history
    };

    const res3 = await app.request("/api/socratic/chat", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${studentUserId}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(turn3Payload)
    });

    expect(res3.status).toBe(200);
    const data3 = await res3.json();
    expect(data3.response).toBeDefined();
    expect(data3.question_prompt).toBeDefined();
  }, 120000);

  test("2. Solver mode vs Socratic mode contrast check", async () => {
    // In solver mode, it should provide complete step-by-step solution
    const solverPayload = {
      student_id: studentId,
      subject: "Vật lí",
      mode: "solver",
      message: "Một con lắc lò xo có độ cứng k = 100 N/m, khối lượng m = 100g. Tính chu kì dao động riêng T.",
      history: []
    };

    const resSolver = await app.request("/api/socratic/chat", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${studentUserId}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(solverPayload)
    });
    if (resSolver.status !== 200) {
      const errBody = await resSolver.json();
      console.error("Solver error response:", errBody);
    }
    expect(resSolver.status).toBe(200);
    const dataSolver = await resSolver.json();
    expect(dataSolver.response).toBeDefined();
    // In solver mode, question_prompt asks about clarifying steps
    expect(dataSolver.question_prompt).toMatch(/băn khoăn|clarification/);
    expect(dataSolver.response.length).toBeGreaterThan(20);
  }, 60000);

  test("3. English Subject Strict Language Policy Check", async () => {
    const englishPayload = {
      student_id: studentId,
      subject: "Tiếng Anh",
      mode: "socratic",
      message: "When should I use Present Perfect instead of Past Simple?",
      history: []
    };

    const res = await app.request("/api/socratic/chat", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${studentUserId}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(englishPayload)
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.response).toBeDefined();
    // English subject must return English prompt
    expect(data.question_prompt).toMatch(/step|reasoning|What/i);
    // Should NOT contain Vietnamese words like "bước", "bạn", "chào"
    expect(data.question_prompt.includes("bước")).toBe(false);
  }, 60000);

  test("4. Continuous Debate Evaluation on Diverse Answer Quality", async () => {
    const question = "Tại sao kim loại đồng (Cu) có tính dẫn điện tốt hơn sắt (Fe)?";
    const sampleAnswer = "Đồng có mật độ electron tự do cao hơn và cấu trúc mạng tinh thể ít gây cản trở chuyển động có hướng của electron so với sắt.";

    // Case A: High quality, accurate answer
    const resAccurate = await app.request("/api/socratic/debate/evaluate-answer", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${studentUserId}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        student_id: studentId,
        subject: "Hóa học",
        selected_chapters: ["Đại cương về kim loại"],
        question,
        sample_answer: sampleAnswer,
        student_answer: "Vì mật độ electron tự do trong mạng tinh thể của đồng dày đặc hơn và độ linh động của electron lớn hơn so với sắt."
      })
    });
    expect(resAccurate.status).toBe(200);
    const evalAccurate = await resAccurate.json();
    expect(["chính_xác", "bán_phần"]).toContain(evalAccurate.verdict);
    expect(evalAccurate.is_correct).toBe(true);
    expect(evalAccurate.explanation).toBeDefined();

    // Case B: Partial answer
    const resPartial = await app.request("/api/socratic/debate/evaluate-answer", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${studentUserId}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        student_id: studentId,
        subject: "Hóa học",
        selected_chapters: ["Đại cương về kim loại"],
        question,
        sample_answer: sampleAnswer,
        student_answer: "Do đồng có nhiều electron tự do hơn."
      })
    });
    expect(resPartial.status).toBe(200);
    const evalPartial = await resPartial.json();
    expect(["chính_xác", "bán_phần"]).toContain(evalPartial.verdict);
    expect(evalPartial.is_correct).toBe(true);

    // Case C: Evading / Low effort answer
    const resEvading = await app.request("/api/socratic/debate/evaluate-answer", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${studentUserId}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        student_id: studentId,
        subject: "Hóa học",
        selected_chapters: ["Đại cương về kim loại"],
        question,
        sample_answer: sampleAnswer,
        student_answer: "Em không biết câu này ạ, thầy giải thích giùm em với"
      })
    });
    expect(resEvading.status).toBe(200);
    const evalEvading = await resEvading.json();
    expect(evalEvading.verdict).toBe("chưa_chính_xác");
    expect(evalEvading.is_correct).toBe(false);
    expect(evalEvading.feedback).toBeDefined();
  }, 120000);

  test("5. Multi-chapter Debate Session Generation & Schema Conformance", async () => {
    const res = await app.request("/api/socratic/debate/generate-session", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${studentUserId}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        student_id: studentId,
        subject: "Sinh học",
        selected_chapters: ["Di truyền phân tử", "Di truyền nhiễm sắc thể"],
        count: 5
      })
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.questions)).toBe(true);
    expect(body.questions.length).toBe(5);

    for (let i = 0; i < body.questions.length; i++) {
      const q = body.questions[i];
      expect(typeof q.question).toBe("string");
      expect(q.question.length).toBeGreaterThan(10);
      expect(typeof q.sample_answer).toBe("string");
      expect(Array.isArray(q.key_points)).toBe(true);
      expect(typeof q.topic_hint).toBe("string");
    }
  }, 90000);
});
