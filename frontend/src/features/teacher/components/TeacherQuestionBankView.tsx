import React, { useState, useEffect } from "react";
import { BookOpen, Search, Loader2, Sparkles, Filter } from "lucide-react";
import { API_BASE } from "@/shared/api/auth-client";
import { Badge } from "@/shared/components/ui/badge";
import TeacherQuestionCard, { QuestionItem } from "./TeacherQuestionCard";

interface SubjectGroup {
  subject: string;
  total_questions: number;
  questions: QuestionItem[];
}

export default function TeacherQuestionBankView() {
  const [groups, setGroups] = useState<SubjectGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    const token = localStorage.getItem("sunflower_token");
    fetch(`${API_BASE}/api/quiz/questions/grouped`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then((res) => res.json())
      .then((data) => {
        setGroups(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const totalAllQuestions = groups.reduce((acc, g) => acc + g.total_questions, 0);

  const filteredQuestions = groups
    .filter((g) => selectedSubject === "ALL" || g.subject === selectedSubject)
    .flatMap((g) => g.questions)
    .filter((q) => {
      if (!searchQuery.trim()) return true;
      const lower = searchQuery.toLowerCase();
      return (
        q.question_text.toLowerCase().includes(lower) ||
        q.subject.toLowerCase().includes(lower) ||
        q.bloom_level.toLowerCase().includes(lower) ||
        q.id.toLowerCase().includes(lower)
      );
    });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-500" />
            <h2 className="text-sm font-bold text-stone-900">
              Ngân Hàng 11 Môn Học GDPT 2018 ({totalAllQuestions} câu)
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Ngân hàng phản xạ vi mô, câu bẫy nhận thức & câu hỏi sinh đôi hỗ trợ mọi tổ hợp môn
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Tìm theo nội dung, mã câu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 p-2 bg-stone-50 rounded-2xl border border-stone-200/70">
        <button
          type="button"
          onClick={() => setSelectedSubject("ALL")}
          className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors ${
            selectedSubject === "ALL"
              ? "bg-stone-900 text-white shadow-xs font-semibold"
              : "bg-white text-stone-600 border border-stone-200 hover:bg-stone-100"
          }`}
        >
          Tất cả môn ({totalAllQuestions})
        </button>
        {groups.map((g) => (
          <button
            key={g.subject}
            type="button"
            onClick={() => setSelectedSubject(g.subject)}
            className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
              selectedSubject === g.subject
                ? "bg-amber-500 text-white shadow-xs font-semibold"
                : "bg-white text-stone-600 border border-stone-200 hover:bg-amber-50"
            }`}
          >
            {g.subject} ({g.total_questions})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-12 flex justify-center text-primary">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : filteredQuestions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredQuestions.map((q, idx) => (
            <TeacherQuestionCard key={q.id} question={q} index={idx} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-2xl border border-stone-200 p-6">
          <p className="text-xs text-muted-foreground">Không tìm thấy câu hỏi phù hợp.</p>
        </div>
      )}
    </div>
  );
}
