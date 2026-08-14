interface QuestionPaperPreviewProps {
  data: any;
}

export function QuestionPaperPreview({ data }: QuestionPaperPreviewProps) {
  if (!data) return null;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Formal Institutional Header */}
      <div className="text-center border-b-2 border-[var(--color-border)] pb-4 space-y-1">
        <span className="text-[11px] uppercase tracking-widest font-black text-[var(--color-text-tertiary)]">
          Institutional Examination Paper
        </span>
        <h2 className="text-xl sm:text-2xl font-black text-[var(--color-text-primary)] uppercase tracking-tight">
          {data.title}
        </h2>
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-[var(--color-text-secondary)] pt-1">
          <span>Subject: {data.subject}</span>
          <span>•</span>
          <span>Grade / Class: {data.grade}</span>
          <span>•</span>
          <span>Time: {data.duration}</span>
          <span>•</span>
          <span className="font-bold text-[var(--color-text-primary)]">Max Marks: {data.totalMarks}</span>
        </div>
      </div>

      {/* General Instructions */}
      {data.generalInstructions && (
        <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)]/60 text-xs">
          <h3 className="font-bold uppercase tracking-wider text-[var(--color-text-primary)] mb-1.5">
            General Instructions:
          </h3>
          <ol className="list-decimal list-inside space-y-1 text-[var(--color-text-secondary)]">
            {data.generalInstructions.map((ins: string, i: number) => (
              <li key={i}>{ins}</li>
            ))}
          </ol>
        </div>
      )}

      {/* Sections & Sample Questions */}
      <div className="space-y-6 pt-2">
        {data.sections?.map((sec: any) => (
          <div key={sec.id} className="space-y-3">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-1.5">
              <h4 className="text-xs font-black uppercase tracking-wider text-[var(--color-primary-800)]">
                {sec.name} ({sec.questionType})
              </h4>
              <span className="text-[11px] font-bold text-[var(--color-text-tertiary)]">
                [{sec.questionCount} Questions × {sec.marksPerQuestion}M = {sec.questionCount * sec.marksPerQuestion} Marks]
              </span>
            </div>

            {sec.instructions && (
              <p className="text-[11px] text-[var(--color-text-secondary)] italic">{sec.instructions}</p>
            )}

            {/* Questions under this section */}
            <div className="space-y-2.5">
              {Array.from({ length: Math.min(sec.questionCount, 4) }).map((_, qIdx) => (
                <div key={qIdx} className="flex items-start justify-between p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-xs">
                  <p className="text-[var(--color-text-primary)] font-medium">
                    <span className="font-bold mr-1.5">{qIdx + 1}.</span>
                    Explain the mechanism of energy transfer and state how temperature affects enzyme activity.
                  </p>
                  <span className="font-bold text-[var(--color-text-tertiary)] shrink-0 ml-3">
                    [{sec.marksPerQuestion}]
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
