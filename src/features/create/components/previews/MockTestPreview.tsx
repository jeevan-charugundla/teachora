import { Clock } from 'lucide-react';

interface MockTestPreviewProps {
  data: any;
}

export function MockTestPreview({ data }: MockTestPreviewProps) {
  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-[var(--color-border)] pb-4">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="bg-rose-50 text-rose-700 border border-rose-200 text-xs px-2.5 py-0.5 rounded-full font-semibold">
            {data.subject} • {data.grade}
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-[var(--color-text-secondary)] font-medium">
            <Clock className="h-3.5 w-3.5" /> {data.duration}
          </span>
          <span className="text-xs font-bold text-rose-800 bg-rose-100/70 px-2.5 py-0.5 rounded-full">
            Total: {data.totalMarks} Marks
          </span>
        </div>
        <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">{data.title}</h2>
      </div>

      {/* Difficulty Distribution Bar */}
      {data.distribution && (
        <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-[var(--color-text-primary)]">
            <span>Cognitive Difficulty Distribution</span>
            <span>Easy: {data.distribution.easy}% • Med: {data.distribution.medium}% • Hard: {data.distribution.hard}%</span>
          </div>
          <div className="h-3 w-full rounded-full overflow-hidden flex">
            <div style={{ width: `${data.distribution.easy}%` }} className="bg-emerald-500" title="Easy" />
            <div style={{ width: `${data.distribution.medium}%` }} className="bg-amber-500" title="Medium" />
            <div style={{ width: `${data.distribution.hard}%` }} className="bg-rose-500" title="Hard" />
          </div>
        </div>
      )}

      {/* Sections */}
      <div className="space-y-4">
        {data.sections?.map((sec: any, idx: number) => (
          <div key={idx} className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] space-y-3">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-2">
              <h3 className="text-xs font-bold text-[var(--color-text-primary)] uppercase tracking-wider">{sec.name}</h3>
              <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md">[{sec.marks} Marks]</span>
            </div>
            <div className="space-y-2">
              {sec.questions?.map((q: any, i: number) => (
                <div key={i} className="flex items-start justify-between p-2.5 rounded-lg bg-[var(--color-surface-elevated)] text-xs text-[var(--color-text-primary)]">
                  <span>{q.q}</span>
                  <span className="font-semibold text-[var(--color-text-tertiary)] shrink-0 ml-2">[{q.marks}M]</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
