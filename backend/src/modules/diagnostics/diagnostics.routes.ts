import { Hono } from "hono";
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

export function createDiagnosticsRouter(): Hono {
  const router = new Hono();

  router.get("/:subject", (c) => {
    const subject = c.req.param("subject");
    const jsonPath = join(process.cwd(), "..", "hoc_lieu", "bo_cau_hoi", "mau_cau_hoi_chan_doan.json");
    if (existsSync(jsonPath)) {
      try {
        const content = readFileSync(jsonPath, "utf-8");
        const list = JSON.parse(content);
        if (Array.isArray(list)) {
          const match = list.filter((item: { subject?: string }) => item.subject === subject);
          if (match.length > 0) {
            return c.json(match, 200);
          }
        }
      } catch {}
    }

    // Default fallback diagnostic questions
    return c.json([
      {
        id: "diag_1",
        subject,
        question: `Khi học môn ${subject}, trở ngại lớn nhất của bạn thường là gì?`,
        category: "cognitive_barrier",
        options: [
          { id: "A", label: "Khó nhớ công thức và định lý cơ bản", subtext: "Hay bị lẫn lộn giữa các dạng bài" },
          { id: "B", label: "Lúng túng khi gặp bài tập vận dụng mới lạ", subtext: "Chưa biết liên kết kiến thức" },
          { id: "C", label: "Tính toán hay bị sai sót số liệu", subtext: "Áp lực thời gian làm bài thi" },
          { id: "D", label: "Thiếu động lực và cảm thấy áp lực", subtext: "Cần phương pháp học nhẹ nhàng hơn" }
        ]
      }
    ], 200);
  });

  return router;
}
