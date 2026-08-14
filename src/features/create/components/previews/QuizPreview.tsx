import { useState } from 'react';
import { Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

interface QuizPreviewProps {
  data: any;
}

export function QuizPreview({ data }: QuizPreviewProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [showFeedback, setShowFeedback] = useState<Record<string, boolean>>({});

  if (!data || !data.questions) return null;

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
    setShowFeedback((prev) => ({ ...prev, [questionId]: true }));
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setShowFeedback({});
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-amber-50 text-amber-700 border border-amber-200 text-xs px-2.5 py-0.5 rounded-full font-semibold">
              {data.subject} • {data.grade}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-[var(--color-text-secondary)] font-medium">
              <Clock className="h-3.5 w-3.5" /> {data.timeLimit}
            </span>
          </div>
          <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">{data.title}</h2>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-elevated)]"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Reset Quiz
        </button>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {data.questions.map((q: any) => {
          const selected = selectedAnswers[q.id];
          const hasAnswered = showFeedback[q.id];
          const isCorrect = selected === q.correctIndex;

          return (
            <div key={q.id} className="card p-5 border border-[var(--color-border)] rounded-2xl bg-[var(--color-surface)] shadow-xs space-y-3">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-sm font-bold text-[var(--color-text-primary)] leading-snug">
                  <span className="text-[var(--color-primary-600)] mr-1.5">Q{q.number}.</span>
                  {q.question}
                </h3>
                <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md shrink-0">
                  {q.marks} pts
                </span>
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {q.options.map((opt: string, optIdx: number) => {
                  const isThisSelected = selected === optIdx;
                  const isThisCorrect = optIdx === q.correctIndex;

                  let btnStyle = 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] hover:border-[var(--color-primary-300)]';
                  if (hasAnswered) {
                    if (isThisCorrect) {
                      btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold';
                    } else if (isThisSelected && !isCorrect) {
                      btnStyle = 'border-rose-500 bg-rose-50 text-rose-950 font-bold';
                    }
                  } else if (isThisSelected) {
                    btnStyle = 'border-[var(--color-primary-600)] bg-[var(--color-primary-50)] text-[var(--color-primary-900)] font-semibold';
                  }

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      onClick={() => handleSelectOption(q.id, optIdx)}
                      className={`p-3 rounded-xl border text-xs text-left transition-all ${btnStyle}`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {/* Instant Explanation Feedback */}
              {hasAnswered && (
                <div className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
                  isCorrect ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950' : 'bg-rose-50/70 border-rose-200 text-rose-950'
                }`}>
                  <div className="flex items-center gap-1.5 font-bold mb-1">
                    {isCorrect ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-emerald-600" />
                        <span className="text-emerald-800">Correct Answer!</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-rose-600" />
                        <span className="text-rose-800">Incorrect. Correct Answer: {q.correctAnswer}</span>
                      </>
                    )}
                  </div>
                  <p className="text-[11px] mt-0.5">{q.explanation}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
