import { Loader2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface CreationGenerationOverlayProps {
  title: string;
  stepNumber: number;
  totalSteps: number;
  currentLabel: string;
}

export function CreationGenerationOverlay({
  title,
  stepNumber,
  totalSteps,
  currentLabel,
}: CreationGenerationOverlayProps) {
  const percentage = Math.min(Math.round((stepNumber / totalSteps) * 100), 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card max-w-md w-full p-8 border border-[var(--color-border)] shadow-2xl rounded-3xl text-center bg-[var(--color-surface)]"
      >
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-primary-50)] text-[var(--color-primary-600)] shadow-inner">
          <Sparkles className="h-8 w-8 animate-pulse text-[var(--color-accent-500)]" />
        </div>

        <h3 className="text-lg font-bold text-[var(--color-text-primary)] mb-1">
          Creating your {title}
        </h3>
        <p className="text-xs text-[var(--color-text-tertiary)] mb-6">
          Teachora is preparing your classroom material…
        </p>

        {/* Progress Bar */}
        <div className="space-y-2 mb-6">
          <div className="h-2 w-full rounded-full bg-[var(--color-surface-elevated)] overflow-hidden border border-[var(--color-border)]">
            <motion.div
              className="h-full bg-[var(--color-primary-600)]"
              initial={{ width: '0%' }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-[var(--color-text-tertiary)] font-medium">
            <span>Step {stepNumber} of {totalSteps}</span>
            <span>{percentage}%</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 text-xs font-semibold text-[var(--color-text-secondary)] bg-[var(--color-surface-elevated)] p-3 rounded-xl">
          <Loader2 className="h-4 w-4 animate-spin text-[var(--color-primary-600)]" />
          <span>{currentLabel}</span>
        </div>
      </motion.div>
    </div>
  );
}
