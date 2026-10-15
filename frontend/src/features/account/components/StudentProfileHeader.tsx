import React from "react";
import { User, Mail, GraduationCap, Target, Calendar } from "lucide-react";
import { Card } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Student } from "@/shared/types";

interface Props {
  student: Student | null;
  email?: string;
  userName?: string;
}

export default function StudentProfileHeader({ student, email, userName }: Props) {
  return (
    <Card className="p-6 border-border bg-gradient-to-r from-amber-50/70 via-white to-stone-50/70 shadow-xs">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold text-2xl shadow-md shrink-0">
            {student?.name ? student.name.charAt(0).toUpperCase() : <User className="w-8 h-8" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-stone-900">{student?.name || userName || "Học Sinh"}</h1>
              <Badge variant="outline" className="text-xs bg-white">Học sinh</Badge>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-500 mt-1">
              {email && (
                <div className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-stone-400" />
                  <span>{email}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5 text-stone-400" />
                <span>Khối {student?.grade || "12"} • Lớp {student?.classroom || "12A1"}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap sm:flex-col items-start sm:items-end gap-1.5 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-border">
          <div className="flex items-center gap-1 text-xs font-semibold text-stone-800">
            <Target className="w-3.5 h-3.5 text-amber-500" />
            <span>Môn trọng tâm: {student?.target_subject || "Toán học"}</span>
          </div>
          <span className="text-[11px] text-stone-500">
            Mục tiêu: {student?.long_term_goal || "Chinh phục kỳ thi THPT"}
          </span>
        </div>
      </div>
    </Card>
  );
}
