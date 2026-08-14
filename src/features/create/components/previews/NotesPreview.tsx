import { AlertTriangle, Lightbulb, CheckCircle2, Bookmark } from 'lucide-react';

interface NotesPreviewProps {
  data: any;
}

export function NotesPreview({ data }: NotesPreviewProps) {
  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-[var(--color-border)] pb-4">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="bg-teal-50 text-teal-700 border border-teal-200 text-xs px-2.5 py-0.5 rounded-full font-semibold">
            {data.subject} • {data.grade}
          </span>
          <span className="bg-[var(--color-surface-elevated)] text-[var(--color-text-secondary)] text-xs px-2 py-0.5 rounded-full font-medium">
            {data.purpose}
          </span>
          <span className="text-xs text-[var(--color-text-tertiary)]">• {data.depth} Depth</span>
        </div>
        <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">{data.title}</h2>
      </div>

      {/* Definitions */}
      {data.definitions && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-primary)] flex items-center gap-1.5">
            <Bookmark className="h-4 w-4 text-teal-600" /> Core Definitions & Terminology
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {data.definitions.map((def: any, i: number) => (
              <div key={i} className="p-3.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
                <h4 className="text-xs font-bold text-[var(--color-primary-800)] mb-1">{def.term}</h4>
                <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">{def.definition}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Concepts */}
      {data.keyConcepts && (
        <div className="p-4 rounded-xl border border-teal-200 bg-teal-50/40">
          <h3 className="text-xs font-bold uppercase tracking-wider text-teal-900 mb-2 flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-teal-600" /> Key Concepts & Principles
          </h3>
          <ul className="space-y-2 text-xs text-teal-950">
            {data.keyConcepts.map((c: string, i: number) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-teal-600 font-bold">✓</span>
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Real-world Examples & Common Mistakes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.examples && (
          <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-primary)] mb-2 flex items-center gap-1.5">
              <Lightbulb className="h-4 w-4 text-amber-500" /> Classroom Examples
            </h3>
            <ul className="space-y-2 text-xs text-[var(--color-text-secondary)]">
              {data.examples.map((ex: string, i: number) => (
                <li key={i}>• {ex}</li>
              ))}
            </ul>
          </div>
        )}

        {data.commonMistakes && (
          <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/40 text-rose-950">
            <h3 className="text-xs font-bold uppercase tracking-wider text-rose-900 mb-2 flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4 text-rose-600" /> Common Student Pitfalls
            </h3>
            <ul className="space-y-2 text-xs text-rose-900">
              {data.commonMistakes.map((mis: string, i: number) => (
                <li key={i}>⚠️ {mis}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Summary */}
      {data.summary && (
        <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)]">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-primary)] mb-1">
            Topic Summary
          </h3>
          <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">{data.summary}</p>
        </div>
      )}
    </div>
  );
}
