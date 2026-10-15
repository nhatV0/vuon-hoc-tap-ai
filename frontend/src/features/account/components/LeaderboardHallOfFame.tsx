import React from "react";
import { Trophy, Medal, MessageSquareText, CheckCircle2, CheckCircle, User } from "lucide-react";
import { Card } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";

export interface LeaderboardStudent {
  student_id: string;
  name: string;
  grade: string;
  classroom: string;
  target_subject: string;
  selected_flower: string;
  streak: number;
  water_drops: number;
  holy_water: number;
  total_checkins: number;
  quiz_wins: number;
  total_debates?: number;
  exact_correct?: number;
  partial_correct?: number;
}

interface Props {
  students: LeaderboardStudent[];
  currentStudentId?: string;
}

export default function LeaderboardHallOfFame({ students, currentStudentId }: Props) {
  const getRankBadge = (index: number) => {
    if (index === 0) return <Medal className="w-5 h-5 text-yellow-500 shrink-0" />;
    if (index === 1) return <Medal className="w-5 h-5 text-stone-400 shrink-0" />;
    if (index === 2) return <Medal className="w-5 h-5 text-amber-700 shrink-0" />;
    return <span className="font-bold text-xs text-stone-500 w-5 text-center">{index + 1}</span>;
  };

  return (
    <Card className="p-5 border-border bg-white shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          <h3 className="font-bold text-sm text-stone-900">Bảng Phong Thần Tranh Luận & Phản Biện</h3>
        </div>
        <span className="text-xs text-stone-500">Kết quả rèn luyện cùng Trợ lý AI</span>
      </div>

      <div className="divide-y divide-border/60">
        {students.length === 0 ? (
          <p className="text-xs text-stone-500 py-6 text-center italic">Đang cập nhật bảng xếp hạng...</p>
        ) : (
          students.map((st, idx) => {
            const isMe = st.student_id === currentStudentId;
            return (
              <div
                key={st.student_id || idx}
                className={`flex items-center justify-between py-2.5 px-3 rounded-lg transition-colors ${
                  isMe ? "bg-amber-100/60 font-semibold border border-amber-300/60" : "hover:bg-stone-50"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex items-center justify-center w-6">
                    {getRankBadge(idx)}
                  </div>
                  <div className="w-8 h-8 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-stone-600" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-stone-900 truncate">{st.name}</span>
                      {isMe && <Badge variant="default" className="text-[10px] h-4 px-1 bg-amber-600">Bạn</Badge>}
                    </div>
                    <span className="text-[10px] text-stone-500">Lớp {st.classroom || "12A1"} • {st.target_subject}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 text-right">
                  <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900">
                      <MessageSquareText className="w-3.5 h-3.5 text-amber-500" />
                      <span>{st.total_debates || 0} câu</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px]">
                      <span className="flex items-center gap-0.5 text-emerald-600 font-medium" title="Chính xác">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{st.exact_correct || 0} đúng</span>
                      </span>
                      <span className="flex items-center gap-0.5 text-amber-600 font-medium" title="Đúng một phần">
                        <CheckCircle className="w-3 h-3" />
                        <span>{st.partial_correct || 0} bán phần</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}
