import React from "react";
import { Droplets, Sparkles, Eye } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";

export interface StudentRow {
  id: string;
  name: string;
  grade: string;
  classroom: string;
  target_subject: string;
  weakness: string;
  long_term_goal: string;
  selected_flower: string;
  email?: string;
  flower_state: string;
  streak: number;
  water_drops: number;
  total_checkins: number;
  total_debates: number;
}

interface Props {
  student: StudentRow;
  onBoost: (id: string, name: string) => void;
  onViewAccount: (student: StudentRow) => void;
}

export default function StudentTableRow({ student: st, onBoost, onViewAccount }: Props) {
  return (
    <tr className="hover:bg-stone-50/60 transition-colors">
      <td className="p-3">
        <div className="font-bold text-stone-900">{st.name}</div>
        <div className="text-[10px] text-stone-400 font-mono">{st.id}</div>
        {st.email && <div className="text-[10px] text-stone-500">{st.email}</div>}
      </td>
      <td className="p-3">
        <span className="font-semibold text-stone-800">Lớp {st.classroom || "12A1"}</span>
        <span className="text-stone-400 text-[10px] block">Khối {st.grade || "12"}</span>
      </td>
      <td className="p-3">
        <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-800 border-amber-200">
          {st.target_subject}
        </Badge>
      </td>
      <td className="p-3">
        <div className="font-semibold text-stone-800">{st.streak} ngày</div>
        <div className="text-[10px] text-stone-400 flex items-center gap-0.5">
          <Droplets className="w-2.5 h-2.5 text-blue-500" />
          <span>{st.water_drops} giọt</span>
        </div>
      </td>
      <td className="p-3">
        <span className="font-semibold text-stone-700">{st.total_debates || 0} câu</span>
      </td>
      <td className="p-3">
        <Badge
          variant="default"
          className={`text-[10px] h-5 ${
            st.flower_state === "thieu_nuoc"
              ? "bg-rose-500"
              : st.flower_state === "no_ro"
              ? "bg-amber-600"
              : "bg-emerald-600"
          }`}
        >
          {st.flower_state === "thieu_nuoc" ? "Cần cứu cây" : st.flower_state === "no_ro" ? "Nở rộ" : "Phát triển"}
        </Badge>
      </td>
      <td className="p-3 text-right">
        <div className="flex items-center justify-end gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewAccount(st)}
            className="h-7 text-[11px] gap-1 text-indigo-700 border-indigo-200 hover:bg-indigo-50"
            title="Xem không gian và tài khoản học sinh"
          >
            <Eye className="w-3 h-3 text-indigo-600" />
            <span>Xem vườn</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onBoost(st.id, st.name)}
            className="h-7 text-[11px] gap-1 text-emerald-700 border-emerald-200 hover:bg-emerald-50"
            title="Tiếp nước hỗ trợ"
          >
            <Sparkles className="w-3 h-3 text-emerald-600" />
            <span>Tiếp Nước</span>
          </Button>
        </div>
      </td>
    </tr>
  );
}
