import { useState } from 'react';
import { ClipboardList, CheckCircle2, ChevronDown, ChevronUp, Award } from 'lucide-react';

interface AssignmentPreviewProps {
  data: any;
}

export function AssignmentPreview({ data }: AssignmentPreviewProps) {
  const [showAnswerKey, setShowAnswerKey] = useState(false);

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-[var(--color-border)] pb-4">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="bg-violet-50 text-violet-700 border border-violet-200 text-xs px-2.5 py-0.5 rounded-full font-semibold">
            {data.subject} • {data.grade}
          </span>
          <span className="bg-[var(--color-surface-elevated)] text-xs px-2 py-0.5 rounded-full font-medium text-[var(--color-text-secondary)]">
            {data.assignmentType}
          </span>
          <span className="text-xs font-bold text-violet-800 bg-violet-100/70 px-2.5 py-0.5 rounded-full">
            Total: {data.totalMarks} Marks
          </span>
        </div>
        <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">{data.title}</h2>
      </div>

      {/* Instructions */}
      {data.instructions && (
        <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)]/50">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-primary)] mb-1.5">
            Student Instructions
          </h3>
          <ul className="space-y-1 text-xs text-[var(--color-text-secondary)]">
            {data.instructions.map((ins: string, i: number) => (
              <li key={i}>• {ins}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Questions List */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-primary)] flex items-center gap-1.5">
          <ClipboardList className="h-4 w-4 text-violet-600" /> Assignment Questions ({data.questions?.length || 0})
        </h3>

        <div className="space-y-3">
          {data.questions?.map((q: any) => (
            <div key={q.id || q.number} className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] space-y-2">
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-bold text-[var(--color-text-primary)]">
                  Question {q.number} ({q.type})
                </span>
                <span className="text-[11px] font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-md">
                  [{q.marks} Marks]
                </span>
              </div>
              <p className="text-xs text-[var(--color-text-secondary)] font-medium leading-relaxed">
                {q.text}
              </p>

              {q.options && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                  {q.options.map((opt: string, i: number) => (
                    <div key={i} className="p-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] text-xs text-[var(--color-text-secondary)]">
                      {opt}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Grading Rubric Table */}
      {data.rubric && (
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-primary)] flex items-center gap-1.5">
            <Award className="h-4 w-4 text-amber-500" /> Evaluation Criteria & Rubric
          </h3>
          <div className="rounded-xl border border-[var(--color-border)] overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-[var(--color-surface-elevated)] border-b border-[var(--color-border)] text-[var(--color-text-tertiary)]">
                <tr>
                  <th className="py-2.5 px-3">Criteria</th>
                  <th className="py-2.5 px-3">Exceeds Expectations</th>
                  <th className="py-2.5 px-3">Satisfactory</th>
                  <th className="py-2.5 px-3">Needs Improvement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {data.rubric.map((r: any, idx: number) => (
                  <tr key={idx} className="bg-[var(--color-surface)]">
                    <td className="py-2.5 px-3 font-bold text-[var(--color-text-primary)]">{r.criteria}</td>
                    <td className="py-2.5 px-3 text-emerald-800">{r.excellent}</td>
                    <td className="py-2.5 px-3 text-blue-800">{r.satisfactory}</td>
                    <td className="py-2.5 px-3 text-rose-800">{r.needsImprovement}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Answer Key Expandable Drawer */}
      {data.answerKey && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4">
          <button
            type="button"
            onClick={() => setShowAnswerKey(!showAnswerKey)}
            className="w-full flex items-center justify-between text-xs font-bold text-emerald-900"
          >
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Instructor Answer Key ({data.answerKey.length} Solutions)
            </span>
            {showAnswerKey ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {showAnswerKey && (
            <div className="mt-3 pt-3 border-t border-emerald-200 space-y-2 text-xs text-emerald-950">
              {data.answerKey.map((ans: any, idx: number) => (
                <div key={idx} className="p-2.5 rounded-lg bg-emerald-100/60">
                  <span className="font-bold">Q{ans.q}:</span> {ans.answer}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
