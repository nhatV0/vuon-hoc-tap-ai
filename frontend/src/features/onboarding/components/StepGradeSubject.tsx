import React from "react";
import { ArrowRight, BookOpen } from "lucide-react";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";

const SUBJECTS = ["Toán học", "Ngữ văn", "Tiếng Anh", "Vật lí", "Hóa học", "Sinh học", "Lịch sử", "Địa lí", "Tin học", "GDKT & PL"];

interface Props {
  name: string;
  setName: (v: string) => void;
  grade: string;
  setGrade: (v: string) => void;
  targetSubject: string;
  setTargetSubject: (v: string) => void;
  onNext: () => void;
}

export default function StepGradeSubject({
  name,
  setName,
  grade,
  setGrade,
  targetSubject,
  setTargetSubject,
  onNext
}: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-stone-900 mb-1">Khối lớp & Môn học mục tiêu</h2>
        <p className="text-xs text-stone-500">Trợ lý sẽ thiết kế bài học vi mô chuẩn cấu trúc GDPT 2018 cho bạn.</p>
      </div>
      <div>
        <label className="block text-xs font-semibold text-stone-700 mb-1.5">Tên của bạn</label>
        <Input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nhập tên thân mật..."
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-stone-700 mb-1.5">Khối lớp</label>
        <div className="grid grid-cols-3 gap-2">
          {["10", "11", "12"].map((g) => (
            <Button
              key={g}
              variant={grade === g ? "default" : "outline"}
              onClick={() => setGrade(g)}
            >
              Lớp {g}
            </Button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold text-stone-700 mb-1.5">Môn học trọng tâm</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1">
          {SUBJECTS.map((s) => (
            <button
              key={s}
              onClick={() => setTargetSubject(s)}
              className={`p-2.5 text-left text-xs font-medium rounded-xl border transition-colors flex items-center gap-2 ${
                targetSubject === s ? "bg-amber-50 border-amber-500 text-amber-800" : "bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-600" />
              <span>{s}</span>
            </button>
          ))}
        </div>
      </div>
      <Button onClick={onNext} className="w-full">
        <span>Tiếp tục</span>
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );
}
