import React from "react";
import { Check, BookOpen } from "lucide-react";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";

const SUBJECTS = [
  "Toán học", "Ngữ văn", "Tiếng Anh", "Vật lí",
  "Hóa học", "Sinh học", "Lịch sử", "Địa lí",
  "Tin học", "GDKT & PL"
];

interface Props {
  name: string;
  setName: (v: string) => void;
  grade: string;
  setGrade: (v: string) => void;
  targetSubjects: string[];
  setTargetSubjects: (v: string[]) => void;
}

export default function StepBasicAcademic({
  name,
  setName,
  grade,
  setGrade,
  targetSubjects,
  setTargetSubjects
}: Props) {
  const toggleSubject = (subj: string) => {
    if (targetSubjects.includes(subj)) {
      if (targetSubjects.length > 1) {
        setTargetSubjects(targetSubjects.filter((s) => s !== subj));
      }
    } else {
      setTargetSubjects([...targetSubjects, subj]);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-stone-900 mb-1">Thông tin học tập cá nhân</h2>
        <p className="text-xs text-stone-500">
          Chọn lớp và các môn bạn muốn đồng hành cải thiện cùng Trợ lý ảo.
        </p>
      </div>

      <div>
        <label className="block text-xs font-semibold text-stone-700 mb-1">
          Họ và tên / Biệt danh
        </label>
        <Input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ví dụ: Minh Tuấn, Lan Anh..."
          className="text-xs h-9"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-stone-700 mb-1.5">
          Khối lớp hiện tại
        </label>
        <div className="grid grid-cols-3 gap-2">
          {["10", "11", "12"].map((g) => (
            <Button
              key={g}
              type="button"
              variant={grade === g ? "default" : "outline"}
              className="h-9 text-xs"
              onClick={() => setGrade(g)}
            >
              Lớp {g}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-xs font-semibold text-stone-700">
            Các môn muốn cải thiện
          </label>
          <span className="text-[11px] text-amber-600 font-medium">
            (Đã chọn {targetSubjects.length} môn)
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1">
          {SUBJECTS.map((s) => {
            const isSelected = targetSubjects.includes(s);
            return (
              <button
                key={s}
                type="button"
                onClick={() => toggleSubject(s)}
                className={`p-2.5 text-left text-xs font-medium rounded-xl border transition-all flex items-center justify-between gap-1.5 ${
                  isSelected
                    ? "bg-amber-50 border-amber-500 text-amber-900 shadow-xs"
                    : "bg-stone-50/70 border-stone-200 text-stone-600 hover:bg-stone-100/80"
                }`}
              >
                <div className="flex items-center gap-1.5 truncate">
                  <BookOpen className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span className="truncate">{s}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
