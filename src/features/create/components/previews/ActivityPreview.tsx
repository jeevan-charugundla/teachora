import { Clock, Users, CheckCircle2, ListOrdered, HelpCircle } from 'lucide-react';

interface ActivityPreviewProps {
  data: any;
}

export function ActivityPreview({ data }: ActivityPreviewProps) {
  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-[var(--color-border)] pb-4">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="bg-sky-50 text-sky-700 border border-sky-200 text-xs px-2.5 py-0.5 rounded-full font-semibold">
            {data.subject} • {data.grade}
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-[var(--color-text-secondary)]">
            <Users className="h-3.5 w-3.5" /> {data.activityType}
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-[var(--color-text-secondary)]">
            <Clock className="h-3.5 w-3.5" /> {data.duration}
          </span>
          <span className="text-xs text-[var(--color-text-tertiary)]">• {data.difficulty}</span>
        </div>
        <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">{data.title}</h2>
        <p className="text-xs text-[var(--color-text-tertiary)] mt-1">{data.objective}</p>
      </div>

      {/* Materials Checklist */}
      {data.materials && (
        <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-primary)] mb-2 flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-sky-600" /> Required Lab / Activity Materials
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[var(--color-text-secondary)]">
            {data.materials.map((m: string, i: number) => (
              <div key={i} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
                <span>{m}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Teacher and Student Step Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Teacher Instructions */}
        {data.teacherSteps && (
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-primary)] flex items-center gap-1.5">
              <ListOrdered className="h-4 w-4 text-[var(--color-primary-600)]" /> Teacher Facilitation Steps
            </h3>
            <div className="space-y-2">
              {data.teacherSteps.map((st: string, i: number) => (
                <div key={i} className="p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-xs text-[var(--color-text-secondary)] leading-relaxed">
                  <span className="font-bold text-[var(--color-primary-700)] mr-1.5">{i + 1}.</span> {st}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Student Steps */}
        {data.studentSteps && (
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-primary)] flex items-center gap-1.5">
              <Users className="h-4 w-4 text-purple-600" /> Student Procedure Steps
            </h3>
            <div className="space-y-2">
              {data.studentSteps.map((st: string, i: number) => (
                <div key={i} className="p-3 rounded-xl border border-purple-100 bg-purple-50/40 text-xs text-purple-950 leading-relaxed">
                  {st}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Reflection Questions */}
      {data.reflectionQuestions && (
        <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 text-amber-950">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900 mb-2 flex items-center gap-1.5">
            <HelpCircle className="h-4 w-4 text-amber-600" /> Post-Activity Reflection & Debrief Questions
          </h3>
          <ul className="space-y-1.5 text-xs text-amber-900">
            {data.reflectionQuestions.map((q: string, i: number) => (
              <li key={i}>• {q}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
