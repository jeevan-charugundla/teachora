import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Sparkles } from 'lucide-react';
import type { CreationMeta, WizardStep } from '../types/creationTypes';

interface CreationWizardLayoutProps {
  meta: CreationMeta;
  step: WizardStep;
  onStepChange: (step: WizardStep) => void;
  onGenerate: () => void;
  isValid: boolean;
  children: React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
}

export function CreationWizardLayout({
  meta,
  step,
  onStepChange,
  onGenerate,
  isValid,
  children,
  icon: Icon,
}: CreationWizardLayoutProps) {
  const steps = [
    { key: 'details', label: '1 Details' },
    { key: 'customize', label: '2 Customize' },
    { key: 'review', label: '3 Review' },
  ];

  const currentStepIndex = step === 'details' ? 0 : step === 'customize' ? 1 : 2;

  const handleNext = () => {
    if (step === 'details') onStepChange('customize');
    else if (step === 'customize') onStepChange('review');
    else if (step === 'review') onGenerate();
  };

  const handleBack = () => {
    if (step === 'review') onStepChange('customize');
    else if (step === 'customize') onStepChange('details');
  };

  return (
    <div className="min-h-full flex flex-col justify-between max-w-4xl mx-auto py-4 px-4 sm:px-6">
      {/* Top Header & Navigation */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <Link
            to="/app/create"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Create</span>
          </Link>
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-tertiary)] bg-[var(--color-surface-elevated)] px-2.5 py-1 rounded-md">
            {meta.category}
          </span>
        </div>

        {/* Title Card */}
        <div className="flex items-start gap-3.5 mb-6">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${meta.color} shadow-xs`}>
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[var(--color-text-primary)]">Create {meta.title}</h1>
            <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">{meta.subtitle}</p>
          </div>
        </div>

        {/* Step Indicator Wizard Bar */}
        <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4 mb-6">
          {steps.map((st, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;

            return (
              <div key={st.key} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (isCompleted) onStepChange(st.key as WizardStep);
                  }}
                  disabled={!isCompleted}
                  className={`flex items-center gap-2 text-xs font-bold transition-colors ${
                    isCurrent
                      ? 'text-[var(--color-primary-700)]'
                      : isCompleted
                      ? 'text-[var(--color-success-700)] cursor-pointer hover:underline'
                      : 'text-[var(--color-text-tertiary)] cursor-not-allowed'
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${
                      isCurrent
                        ? 'bg-[var(--color-primary-600)] text-white'
                        : isCompleted
                        ? 'bg-[var(--color-success-600)] text-white'
                        : 'bg-[var(--color-border)] text-[var(--color-text-tertiary)]'
                    }`}
                  >
                    {isCompleted ? <Check className="h-3 w-3" /> : idx + 1}
                  </span>
                  <span>{st.label}</span>
                </button>
                {idx < steps.length - 1 && (
                  <div className="hidden sm:block w-12 h-[1px] bg-[var(--color-border)] mx-2" />
                )}
              </div>
            );
          })}
        </div>

        {/* Wizard Form Area */}
        <div className="card p-6 border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xs rounded-2xl mb-8">
          {children}
        </div>
      </div>

      {/* Wizard Footer Controls */}
      <div className="sticky bottom-0 bg-[var(--color-surface)]/95 backdrop-blur-md border-t border-[var(--color-border)] py-3 px-2 flex items-center justify-between z-20">
        <div>
          {currentStepIndex > 0 ? (
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </button>
          ) : (
            <Link
              to="/app/create"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[var(--color-text-tertiary)] hover:text-[var(--color-danger-600)] transition-colors"
            >
              Cancel
            </Link>
          )}
        </div>

        <div>
          {step === 'review' ? (
            <button
              type="button"
              onClick={onGenerate}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[var(--color-primary-600)] hover:bg-[var(--color-primary-700)] text-white text-xs font-bold shadow-sm transition-all"
            >
              <Sparkles className="h-4 w-4" />
              <span>Generate {meta.title}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              disabled={!isValid}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[var(--color-primary-600)] hover:bg-[var(--color-primary-700)] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold shadow-sm transition-all"
            >
              <span>Continue</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
