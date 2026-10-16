import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Search, RefreshCw, CheckCircle2 } from "lucide-react";
import { API_BASE } from "@/shared/api/auth-client";
import { Button } from "@/shared/components/ui/button";
import StudentTableRow, { StudentRow } from "./StudentTableRow";

export default function TeacherStudentManagementView() {
  const navigate = useNavigate();
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("ALL");
  const [boostMsg, setBoostMsg] = useState<string | null>(null);

  const fetchList = () => {
    setLoading(true);
    const token = localStorage.getItem("sunflower_token");
    fetch(`${API_BASE}/api/teacher/students`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then((res) => res.json())
      .then((data) => {
        setStudents(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchList();
  }, []);

  const handleBoost = async (id: string, name: string) => {
    const token = localStorage.getItem("sunflower_token");
    try {
      const res = await fetch(`${API_BASE}/api/teacher/students/${id}/care-boost`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.ok) {
        setBoostMsg(`Đã tiếp nước và động viên học sinh ${name}!`);
        setTimeout(() => setBoostMsg(null), 3000);
        fetchList();
      }
    } catch {}
  };
  const handleViewAccount = (st: StudentRow) => {
    localStorage.setItem("sunflower_student_id", st.id);
    navigate("/garden");
  };

  const classrooms = Array.from(new Set(students.map((s) => s.classroom || "12A1"))).filter(Boolean);
  const filtered = students.filter((s) => {
    const matchesClass = classFilter === "ALL" || (s.classroom || "12A1") === classFilter;
    const q = search.toLowerCase();
    const matchesQuery = !search.trim() || s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q) || (s.email && s.email.toLowerCase().includes(q));
    return matchesClass && matchesQuery;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-500" />
            <h2 className="text-sm font-bold text-stone-900">
              Quản Lý Danh Sách & Tiến Trình Học Sinh ({students.length} em)
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Theo dõi chuyên cần, chuỗi ngày nở rộ và can thiệp sư phạm kịp thời
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-56">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Tìm tên, mã, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
          <Button variant="outline" size="sm" onClick={fetchList} className="h-8 gap-1 text-xs">
            <RefreshCw className="w-3 h-3" />
            <span>Làm mới</span>
          </Button>
        </div>
      </div>

      {boostMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{boostMsg}</span>
        </div>
      )}

      <div className="flex flex-wrap gap-1.5 p-2 bg-stone-50 rounded-2xl border border-stone-200/70">
        <button
          type="button"
          onClick={() => setClassFilter("ALL")}
          className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors ${
            classFilter === "ALL" ? "bg-stone-900 text-white shadow-xs font-semibold" : "bg-white text-stone-600 border border-stone-200"
          }`}
        >
          Tất cả lớp ({students.length})
        </button>
        {classrooms.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setClassFilter(c)}
            className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors ${
              classFilter === c ? "bg-stone-900 text-white shadow-xs font-semibold" : "bg-white text-stone-600 border border-stone-200"
            }`}
          >
            Lớp {c}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50/80 border-b border-stone-200 text-stone-500 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3">Học Sinh</th>
                <th className="p-3">Lớp / Khối</th>
                <th className="p-3">Môn Mục Tiêu</th>
                <th className="p-3">Chuỗi / Nước</th>
                <th className="p-3">Tranh Luận</th>
                <th className="p-3">Trạng Thái Cây</th>
                <th className="p-3 text-right">Tác Vụ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-stone-400 italic">
                    Không tìm thấy học sinh nào phù hợp.
                  </td>
                </tr>
              ) : (
                filtered.map((st) => (
                  <StudentTableRow
                    key={st.id}
                    student={st}
                    onBoost={handleBoost}
                    onViewAccount={handleViewAccount}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
