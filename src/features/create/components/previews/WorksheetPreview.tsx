import { HelpCircle } from 'lucide-react';

interface WorksheetPreviewProps {
  data: any;
}

export function WorksheetPreview({ data }: WorksheetPreviewProps) {
  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-[var(--color-border)] pb-4">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs px-2.5 py-0.5 rounded-full font-semibold">
            {data.subject} • {data.grade}
          </span>
          <span className="text-xs text-[var(--color-text-tertiary)]">• {data.style} Style • {data.difficulty}</span>
        </div>
        <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">{data.title}</h2>
      </div>

      {/* Student Name and Date Blank Line */}
      <div className="flex justify-between border-b border-dashed border-[var(--color-border)] pb-3 text-xs text-[var(--color-text-tertiary)]">
        <span>Student Name: __________________________</span>
        <span>Date: ____________</span>
        <span>Score: _____ / 100</span>
      </div>

      {/* Worksheet Sections */}
      <div className="space-y-6">
        {data.sections?.map((sec: any, idx: number) => (
          <div key={idx} className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-primary)] border-b border-[var(--color-border)] pb-2">
              {sec.title}
            </h3>

            <div className="space-y-2.5">
              {sec.items?.map((item: any, i: number) => (
                <div key={i} className="text-xs text-[var(--color-text-primary)] font-medium">
                  {item.sentence && (
                    <div className="p-2 rounded-lg bg-[var(--color-surface-elevated)] leading-relaxed">
                      {item.sentence}
                    </div>
                  )}
                  {item.prompt && (
                    <div className="flex items-center justify-between p-2 rounded-lg bg-[var(--color-surface-elevated)]">
                      <span>{item.prompt}</span>
                      <span className="text-[var(--color-text-secondary)] italic">{item.match}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Hints Box */}
      {data.hints && (
        <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 text-amber-950">
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 mb-1.5 flex items-center gap-1.5">
            <HelpCircle className="h-4 w-4 text-amber-600" /> Helpful Hints for Students
          </h4>
          <ul className="space-y-1 text-xs text-amber-900">
            {data.hints.map((h: string, i: number) => (
              <li key={i}>💡 {h}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
