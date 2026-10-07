"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  Lock,
  Mail,
  Sparkles,
  Clock,
  Calendar,
  CheckCircle2,
  ChevronRight,
  PenLine,
  Archive
} from "lucide-react";
import { API_BASE, TimeCapsuleItem } from "@/lib/types";

interface TimeCapsuleVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  currentStreak?: number;
  initialMode?: "list" | "compose";
  onCapsuleCreated?: () => void;
}

export function formatVietnameseDateTime(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const dayOfWeek = [
      "Chủ Nhật",
      "Thứ Hai",
      "Thứ Ba",
      "Thứ Tư",
      "Thứ Năm",
      "Thứ Sáu",
      "Thứ Bảy"
    ][d.getDay()];
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${hours}:${minutes} - ${dayOfWeek}, Ngày ${day}/${month}/${year}`;
  } catch {
    return dateStr;
  }
}

export default function TimeCapsuleVaultModal({
  isOpen,
  onClose,
  studentId,
  currentStreak = 1,
  initialMode = "list",
  onCapsuleCreated,
}: TimeCapsuleVaultModalProps) {
  const [activeTab, setActiveTab] = useState<"list" | "compose">(initialMode);
  const [capsules, setCapsules] = useState<TimeCapsuleItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCapsule, setSelectedCapsule] = useState<TimeCapsuleItem | null>(null);

  // Form state
  const [title, setTitle] = useState<string>("Tâm thư ngày đầu tiên gửi người vượt trọng lực");
  const [content, setContent] = useState<string>("");
  const [targetDay, setTargetDay] = useState<number>(21);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const fetchCapsules = useCallback(async () => {
    if (!studentId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/capsule/${studentId}`);
      if (res.ok) {
        const data = await res.json();
        setCapsules(data);
      }
    } catch (err) {
      console.error("Failed to load time capsules:", err);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialMode);
      setSelectedCapsule(null);
      fetchCapsules();
    }
  }, [isOpen, initialMode, fetchCapsules]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setErrorMsg("Vui lòng viết đôi dòng gửi đến chính mình trong tương lai!");
      return;
    }
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`${API_BASE}/api/capsule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: studentId,
          title: title.trim() || "Tâm thư gửi tương lai",
          letter_content: content.trim(),
          target_unlock_day: targetDay,
          author_type: "STUDENT",
        }),
      });

      if (res.ok) {
        setSuccessToast("Đã phong ấn tâm thư thành công vào Kho Thời Gian!");
        setContent("");
        setTimeout(() => setSuccessToast(null), 3500);
        await fetchCapsules();
        setActiveTab("list");
        if (onCapsuleCreated) {
          onCapsuleCreated();
        }
      } else {
        const err = await res.json().catch(() => null);
        setErrorMsg(err?.detail || "Không thể lưu tâm thư, vui lòng thử lại!");
      }
    } catch {
      setErrorMsg("Lỗi kết nối máy chủ khi gửi tâm thư.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnlock = async (capsuleId: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/capsule/${capsuleId}/unlock`, {
        method: "POST",
      });
      if (res.ok) {
        const updated = await res.json();
        setSelectedCapsule(updated);
        await fetchCapsules();
      }
    } catch (err) {
      console.error("Failed to unlock capsule:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#FAF8F5] border border-amber-900/10 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden relative">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200/80 bg-white/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100/80 border border-amber-300/50 flex items-center justify-center text-amber-800">
              <Archive className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-stone-900 text-base sm:text-lg">
                  Kho Lưu Trữ Tâm Thư Thời Gian
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200/60">
                  {capsules.length} lá thư
                </span>
              </div>
              <p className="text-xs text-stone-500">
                Ghi nhận thời gian thực &bull; Phong ấn tâm lý mỏ neo cho hành trình 21 ngày
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
            title="Đóng modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 px-6 pt-3 pb-2 border-b border-stone-200/60 bg-white/40">
          <button
            onClick={() => {
              setActiveTab("list");
              setSelectedCapsule(null);
            }}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === "list"
                ? "bg-stone-900 text-white shadow-xs"
                : "text-stone-600 hover:bg-stone-100"
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            Các Bức Thư Của Bạn ({capsules.length})
          </button>
          <button
            onClick={() => {
              setActiveTab("compose");
              setSelectedCapsule(null);
            }}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === "compose"
                ? "bg-amber-600 text-white shadow-xs"
                : "text-stone-600 hover:bg-stone-100"
            }`}
          >
            <PenLine className="w-3.5 h-3.5" />
            Soạn Thư Mới Gửi Tương Lai
          </button>
        </div>

        {/* Body content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {successToast && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successToast}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2 animate-in fade-in">
              <span className="font-bold">Lưu ý:</span> {errorMsg}
            </div>
          )}

          {/* TAB 1: DANH SÁCH BỨC THƯ */}
          {activeTab === "list" && (
            <div className="space-y-4">
              {loading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2 text-stone-400">
                  <Clock className="w-6 h-6 animate-spin text-amber-500" />
                  <p className="text-xs">Đang mở khóa niêm phong kho lưu trữ...</p>
                </div>
              ) : capsules.length === 0 ? (
                <div className="py-12 px-6 rounded-3xl border border-dashed border-stone-300 bg-white/60 text-center flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-700">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-stone-800">Chưa có lá thư nào được phong ấn</h4>
                    <p className="text-xs text-stone-500 max-w-sm mt-1 leading-relaxed">
                      Hãy viết một bức thư ngắn gửi cho chính bạn vào Ngày thứ 21. Đó sẽ là ngọn đèn dẫn lối khi bạn gặp chán nản.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab("compose")}
                    className="mt-2 px-4 py-2 rounded-xl bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 transition-colors shadow-xs flex items-center gap-1.5"
                  >
                    <PenLine className="w-3.5 h-3.5" />
                    Viết lá thư đầu tiên ngay
                  </button>
                </div>
              ) : selectedCapsule ? (
                /* Xem chi tiết bức thư đã chọn */
                <div className="space-y-4 animate-in fade-in">
                  <button
                    onClick={() => setSelectedCapsule(null)}
                    className="text-xs text-stone-500 hover:text-stone-900 font-medium flex items-center gap-1 transition-colors"
                  >
                    &larr; Quay lại danh sách thư
                  </button>

                  <div className="p-6 rounded-3xl bg-[#FFFDF9] border border-amber-200/80 shadow-md relative">
                    <div className="flex items-start justify-between border-b border-amber-100 pb-4 mb-4 gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-200">
                            {selectedCapsule.status === "sealed" ? "Đang Niêm Phong" : "Đã Khơi Mở"}
                          </span>
                          <span className="text-xs text-stone-400">
                            Mốc mở khóa: Ngày {selectedCapsule.target_unlock_day}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-stone-900">{selectedCapsule.title}</h4>
                        <p className="text-xs text-amber-700/80 font-medium mt-0.5">
                          Thời gian phong ấn: {formatVietnameseDateTime(selectedCapsule.created_at)}
                        </p>
                      </div>

                      {selectedCapsule.status === "sealed" && (
                        <div className="p-2.5 rounded-2xl bg-amber-50 border border-amber-200 text-center shrink-0">
                          <Lock className="w-4 h-4 text-amber-700 mx-auto" />
                          <span className="text-[10px] text-amber-800 font-bold block mt-1">
                            Còn {Math.max(0, selectedCapsule.target_unlock_day - currentStreak)} ngày
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Nội dung thư */}
                    {selectedCapsule.status === "sealed" ? (
                      <div className="relative p-6 rounded-2xl bg-stone-100/70 border border-stone-200/80 text-center overflow-hidden">
                        <div className="filter blur-md select-none text-stone-400 text-xs leading-relaxed space-y-2">
                          <p>
                            Gửi tôi của 21 ngày nữa, lúc này bạn đã hoàn thành chặng đường vượt trọng lực.
                            Tôi hy vọng bạn vẫn kiên trì mỗi ngày và giữ vững ngọn lửa kỷ luật...
                          </p>
                          <p>
                            Khi nhìn lại những ngày đầu bỡ ngỡ, bạn sẽ nhận ra mọi nỗ lực đều xứng đáng.
                            Hãy tự hào về hành trình bạn đã đi qua!
                          </p>
                        </div>
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-stone-900/10 backdrop-blur-xs p-4">
                          <div className="w-10 h-10 rounded-2xl bg-white shadow-md flex items-center justify-center text-amber-600 mb-2">
                            <Lock className="w-5 h-5" />
                          </div>
                          <p className="text-xs font-bold text-stone-800">
                            Bức thư đang được phong ấn bảo vệ mỏ neo cảm xúc
                          </p>
                          <p className="text-[11px] text-stone-500 max-w-sm mt-1">
                            Bức thư sẽ tự động mở ra khi bạn đạt chuỗi Streak {selectedCapsule.target_unlock_day} Ngày (Hiện tại: {currentStreak} ngày).
                          </p>
                          {currentStreak >= selectedCapsule.target_unlock_day && (
                            <button
                              onClick={() => handleUnlock(selectedCapsule.id)}
                              className="mt-3 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition-colors"
                            >
                              Khơi mở lá thư ngay 📜
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="p-6 rounded-2xl bg-amber-50/40 border border-amber-200/60 font-serif text-sm leading-relaxed text-stone-800 whitespace-pre-wrap">
                        {selectedCapsule.letter_content}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Danh sách thẻ thư */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {capsules.map((c) => {
                    const isSealed = c.status === "sealed";
                    const daysLeft = Math.max(0, c.target_unlock_day - currentStreak);
                    const canUnlockNow = isSealed && currentStreak >= c.target_unlock_day;

                    return (
                      <div
                        key={c.id}
                        onClick={() => setSelectedCapsule(c)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer relative group text-left ${
                          isSealed
                            ? "bg-white hover:border-amber-400 hover:shadow-md border-stone-200"
                            : "bg-amber-50/60 hover:bg-amber-50 hover:border-amber-300 border-amber-200"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            {isSealed ? (
                              <div className="w-7 h-7 rounded-lg bg-stone-100 flex items-center justify-center text-stone-600">
                                <Lock className="w-3.5 h-3.5" />
                              </div>
                            ) : (
                              <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700">
                                <Mail className="w-3.5 h-3.5" />
                              </div>
                            )}
                            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                              Mục tiêu: Ngày {c.target_unlock_day}
                            </span>
                          </div>

                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isSealed
                                ? "bg-stone-100 text-stone-600"
                                : "bg-emerald-100 text-emerald-800"
                            }`}
                          >
                            {isSealed ? (canUnlockNow ? "Sẵn sàng mở!" : `Còn ${daysLeft} ngày`) : "Đã mở"}
                          </span>
                        </div>

                        <h5 className="font-bold text-stone-900 text-xs sm:text-sm mt-2.5 line-clamp-1 group-hover:text-amber-700 transition-colors">
                          {c.title}
                        </h5>

                        <p className="text-[11px] text-stone-400 mt-1 flex items-center gap-1 font-mono">
                          <Calendar className="w-3 h-3 text-stone-400" />
                          {formatVietnameseDateTime(c.created_at)}
                        </p>

                        <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between text-[11px] font-semibold text-amber-700">
                          <span>{isSealed ? "Xem phong ấn" : "Đọc nội dung thư"}</span>
                          <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SOẠN THƯ MỚI */}
          {activeTab === "compose" && (
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 text-xs text-amber-900 leading-relaxed flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Mỏ neo cảm xúc ngày đầu tiên</p>
                  <p className="text-amber-800/90 mt-0.5">
                    Hãy thành thật ghi lại cảm xúc hiện tại: Bạn đang cảm thấy thế nào? Mục tiêu lớn nhất bạn muốn gửi gắm tới phiên bản tương lai vào Ngày 21 là gì?
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700">
                  Tiêu đề bức thư
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ví dụ: Gửi tôi của Ngày thứ 21..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-xs text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-stone-700">
                    Nội dung tâm thư phong ấn
                  </label>
                  <span className="text-[10px] text-stone-400">
                    Sẽ được niêm phong cho đến khi đạt mục tiêu
                  </span>
                </div>
                <textarea
                  rows={6}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Gửi bản thân thân mến, hôm nay là ngày tôi quyết định thay đổi thói quen học tập của mình..."
                  className="w-full p-3.5 rounded-2xl border border-stone-200 bg-white text-xs leading-relaxed text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-medium text-stone-600">
                    Mốc ngày mở khóa:
                  </label>
                  <select
                    value={targetDay}
                    onChange={(e) => setTargetDay(Number(e.target.value))}
                    className="px-3 py-1.5 rounded-xl border border-stone-200 bg-white text-xs font-bold text-stone-800 focus:outline-none focus:border-amber-500"
                  >
                    <option value={7}>Ngày 7 (Vượt Quán Tính Đầu)</option>
                    <option value={14}>Ngày 14 (Định Hình Quỹ Đạo)</option>
                    <option value={21}>Ngày 21 (Hoàn Toàn Tự Hành)</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setActiveTab("list")}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-stone-600 hover:bg-stone-100 transition-colors"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !content.trim()}
                    className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    {submitting ? "Đang phong ấn..." : "Phong ấn tâm thư 🔒"}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
