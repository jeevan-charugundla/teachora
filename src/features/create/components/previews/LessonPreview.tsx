import { Clock, Target, CheckCircle2, ListOrdered, Sparkles, Home } from 'lucide-react';

interface LessonPreviewProps {
  data: any;
}

export function LessonPreview({ data }: LessonPreviewProps) {
  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Title & Metadata Banner */}
      <div className="border-b border-[var(--color-border)] pb-4">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs px-2.5 py-0.5 rounded-full font-semibold">
            {data.subject} • {data.grade}
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-[var(--color-text-secondary)]">
            <Clock className="h-3.5 w-3.5" /> {data.duration}
          </span>
          <span className="text-xs text-[var(--color-text-tertiary)]">• {data.difficulty}</span>
        </div>
        <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">{data.title}</h2>
      </div>

      {/* Objectives */}
      {data.objectives && (
        <div className="card p-4 rounded-xl border border-blue-100 bg-blue-50/40">
          <h3 className="text-xs font-bold uppercase tracking-wider text-blue-800 mb-2 flex items-center gap-1.5">
            <Target className="h-4 w-4 text-blue-600" /> Learning Objectives
          </h3>
          <ul className="space-y-1.5 text-xs text-blue-950">
            {data.objectives.map((obj: string, i: number) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-blue-500 font-bold">•</span>
                <span>{obj}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Materials & Warm-up */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.materials && (
          <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-primary)] mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Materials Needed
            </h3>
            <ul className="space-y-1 text-xs text-[var(--color-text-secondary)]">
              {data.materials.map((m: string, i: number) => (
                <li key={i}>✓ {m}</li>
              ))}
            </ul>
          </div>
        )}

        {data.warmup && (
          <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-primary)] flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-amber-500" /> Warm-up Hook
              </h3>
              <span className="text-[11px] text-[var(--color-text-tertiary)] font-semibold">{data.warmup.duration}</span>
            </div>
            <p className="text-xs text-[var(--color-text-secondary)] italic">
              "{data.warmup.prompt}"
            </p>
          </div>
        )}
      </div>

      {/* Teaching Steps */}
      {data.teachingSteps && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-primary)] flex items-center gap-1.5">
            <ListOrdered className="h-4 w-4 text-[var(--color-primary-600)]" /> Teaching Procedure & Instructional Steps
          </h3>
          <div className="space-y-2.5">
            {data.teachingSteps.map((step: any, i: number) => (
              <div key={i} className="p-3.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
                <div className="flex items-center justify-between mb-1.5">
                  <h4 className="text-xs font-bold text-[var(--color-text-primary)]">
                    Step {step.step}: {step.heading}
                  </h4>
                  <span className="text-[11px] font-semibold text-[var(--color-primary-700)] bg-[var(--color-primary-50)] px-2 py-0.5 rounded-md">
                    {step.time}
                  </span>
                </div>
                <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">{step.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Activity & Homework */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.activity && (
          <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/40 text-purple-950">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-purple-800">
                Classroom Activity: {data.activity.name}
              </h3>
              <span className="text-[11px] font-semibold text-purple-700">{data.activity.duration}</span>
            </div>
            <p className="text-xs text-purple-900 leading-relaxed">{data.activity.description}</p>
          </div>
        )}

        {data.homework && (
          <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-primary)] mb-2 flex items-center gap-1.5">
              <Home className="h-4 w-4 text-[var(--color-primary-600)]" /> Homework Assignment
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">{data.homework}</p>
          </div>
        )}
      </div>
    </div>
  );
}
