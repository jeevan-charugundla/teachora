import type { CreationFormState } from '../../types/creationTypes';
import { SUBJECTS, GRADE_LEVELS, DIFFICULTY_LEVELS } from '@/lib/constants';

interface CommonDetailsFormProps {
  form: CreationFormState;
  onChange: <K extends keyof CreationFormState>(key: K, value: CreationFormState[K]) => void;
  errors?: Record<string, string>;
}

// Visual types don't need difficulty — it's not relevant for a diagram or chart
const VISUAL_TYPES = ['diagram', 'mind-map', 'chart', 'infographic'];

export function CommonDetailsForm({ form, onChange, errors }: CommonDetailsFormProps) {
  const isVisualType = VISUAL_TYPES.includes(form.type);

  return (
    <div className="space-y-6">
      {/* Topic (Required) */}
      <div>
        <label className="block text-xs font-bold text-[var(--color-text-primary)] mb-1.5 uppercase tracking-wider">
          Topic / Concept Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={form.topic}
          onChange={(e) => onChange('topic', e.target.value)}
          placeholder="e.g. Photosynthesis and Cellular Respiration, Newton's Laws, Linear Equations..."
          className={`w-full rounded-xl border ${
            errors?.topic ? 'border-red-500 focus:ring-red-200' : 'border-[var(--color-border)] focus:border-[var(--color-primary-500)] focus:ring-[var(--color-primary-100)]'
          } bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] outline-none focus:ring-2 transition-all`}
        />
        {errors?.topic ? (
          <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.topic}</p>
        ) : (
          <p className="mt-1 text-[11px] text-[var(--color-text-tertiary)]">
            Be as specific as you like. You can include chapters, topics, or key concepts.
          </p>
        )}
      </div>

      {/* 2-Column Grid: Subject & Grade */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-[var(--color-text-primary)] mb-1.5 uppercase tracking-wider">
            Subject <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select
              value={form.subject}
              onChange={(e) => onChange('subject', e.target.value)}
              className="w-full appearance-none rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-primary-500)] focus:ring-2 focus:ring-[var(--color-primary-100)] transition-all cursor-pointer"
            >
              {SUBJECTS.map((subj) => (
                <option key={subj} value={subj}>
                  {subj}
                </option>
              ))}
              <option value="General">General / Other</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[var(--color-text-tertiary)]">
              ▼
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[var(--color-text-primary)] mb-1.5 uppercase tracking-wider">
            Grade / Level <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select
              value={form.grade}
              onChange={(e) => onChange('grade', e.target.value)}
              className="w-full appearance-none rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-primary-500)] focus:ring-2 focus:ring-[var(--color-primary-100)] transition-all cursor-pointer"
            >
              {GRADE_LEVELS.map((grd) => (
                <option key={grd} value={grd}>
                  {grd}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[var(--color-text-tertiary)]">
              ▼
            </div>
          </div>
        </div>
      </div>

      {/* Difficulty & Language — hide Difficulty for visual types */}
      <div className={`grid grid-cols-1 gap-4 ${isVisualType ? '' : 'sm:grid-cols-2'}`}>
        {!isVisualType && (
          <div>
            <label className="block text-xs font-bold text-[var(--color-text-primary)] mb-1.5 uppercase tracking-wider">
              Difficulty Level
            </label>
            <div className="flex rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-1">
              {DIFFICULTY_LEVELS.map((diff) => {
                const isSelected = form.difficulty === diff;
                return (
                  <button
                    type="button"
                    key={diff}
                    onClick={() => onChange('difficulty', diff as CreationFormState['difficulty'])}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      isSelected
                        ? 'bg-[var(--color-surface)] text-[var(--color-primary-700)] shadow-xs border border-[var(--color-border)]'
                        : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                    }`}
                  >
                    {diff}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-[var(--color-text-primary)] mb-1.5 uppercase tracking-wider">
            Language
          </label>
          <input
            type="text"
            value={form.language}
            onChange={(e) => onChange('language', e.target.value)}
            placeholder="e.g. English, Spanish, French..."
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-primary-500)] focus:ring-2 focus:ring-[var(--color-primary-100)] transition-all"
          />
        </div>
      </div>

      {/* Additional Instructions */}
      <div>
        <label className="block text-xs font-bold text-[var(--color-text-primary)] mb-1.5 uppercase tracking-wider">
          Special Focus / Additional Instructions <span className="text-xs font-normal text-[var(--color-text-tertiary)]">(Optional)</span>
        </label>
        <textarea
          rows={2}
          value={form.additionalInstructions}
          onChange={(e) => onChange('additionalInstructions', e.target.value)}
          placeholder="e.g. Emphasize real-world applications, avoid advanced formulas, include relatable analogies..."
          className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] outline-none focus:border-[var(--color-primary-500)] focus:ring-2 focus:ring-[var(--color-primary-100)] transition-all resize-none"
        />
      </div>
    </div>
  );
}
