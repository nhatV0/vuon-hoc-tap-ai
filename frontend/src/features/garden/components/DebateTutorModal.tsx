import React, { useState, useEffect } from "react";
import { MessageSquareText } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import DebateTopicSelector from "./DebateTopicSelector";
import DebateQuestionCard from "./DebateQuestionCard";
import DebateAnswerFeedback from "./DebateAnswerFeedback";
import DebateSessionSummary from "./DebateSessionSummary";
import { useDebateSession } from "./useDebateSession";

const SUBJECTS = [
  "Toán học", "Vật lí", "Hóa học", "Sinh học", "Tin học",
  "Ngữ văn", "Tiếng Anh", "Lịch sử", "Địa lí", "GDKT & PL"
];

interface Props {
  studentId: string;
  subject?: string;
  onClose: () => void;
}

export default function DebateTutorModal({ studentId, subject = "Toán học", onClose }: Props) {
  const [currentSubject, setCurrentSubject] = useState(subject);
  const [inputAnswer, setInputAnswer] = useState("");

  const {
    chapters,
    selectedIds,
    setSelectedIds,
    stage,
    setStage,
    questionIndex,
    currentQuestion,
    topicHint,
    lastStudentAnswer,
    currentEvaluation,
    history,
    loading,
    fetchSyllabus,
    startSession,
    submitAnswer,
    nextQuestion
  } = useDebateSession(studentId, currentSubject);

  useEffect(() => {
    fetchSyllabus(currentSubject);
  }, [currentSubject, fetchSyllabus]);

  const selectedTitlesText = chapters
    .filter((c) => selectedIds.includes(c.id))
    .map((c) => c.title)
    .join(", ");

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl flex flex-col h-[700px] p-6">
        <DialogHeader className="pb-3 border-b border-border">
          <DialogTitle className="flex items-center gap-2 text-sm font-semibold">
            <MessageSquareText className="w-5 h-5 text-amber-500" />
            <span>Gia Sư Tranh Luận Phản Biện ({currentSubject})</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden pt-2">
          {stage === "topics" && (
            <DebateTopicSelector
              subjects={SUBJECTS}
              currentSubject={currentSubject}
              onSelectSubject={setCurrentSubject}
              chapters={chapters}
              selectedChapterIds={selectedIds}
              onToggleChapter={(id) =>
                setSelectedIds((prev) =>
                  prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
                )
              }
              onSelectAll={() => setSelectedIds(chapters.map((c) => c.id))}
              onClearAll={() => setSelectedIds([])}
              onStartDebate={startSession}
              loading={loading}
            />
          )}

          {stage === "question" && (
            <DebateQuestionCard
              questionIndex={questionIndex}
              totalQuestions={10}
              question={currentQuestion}
              input={inputAnswer}
              setInput={setInputAnswer}
              onSubmitAnswer={() => {
                submitAnswer(inputAnswer);
                setInputAnswer("");
              }}
              loading={loading}
              topicHint={topicHint}
            />
          )}

          {stage === "feedback" && currentEvaluation && (
            <DebateAnswerFeedback
              questionText={currentQuestion}
              studentAnswer={lastStudentAnswer}
              evaluation={currentEvaluation}
              questionIndex={questionIndex}
              totalQuestions={10}
              onNextQuestion={nextQuestion}
              loading={loading}
            />
          )}

          {stage === "summary" && (
            <DebateSessionSummary
              subject={currentSubject}
              selectedTopicsText={selectedTitlesText || currentSubject}
              history={history}
              onRestart={startSession}
              onSelectNewTopics={() => setStage("topics")}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
