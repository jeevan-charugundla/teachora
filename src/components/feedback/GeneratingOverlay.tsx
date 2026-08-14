import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const GENERATION_STEPS = [
  'Preparing your content…',
  'Understanding your topic…',
  'Creating the structure…',
  'Generating content…',
  'Formatting your material…',
  'Almost ready…',
];

interface GeneratingOverlayProps {
  isVisible: boolean;
  step?: number;
  customMessage?: string;
  className?: string;
}

export function GeneratingOverlay({
  isVisible,
  step = 0,
  customMessage,
  className,
}: GeneratingOverlayProps) {
  if (!isVisible) return null;

  const message = customMessage || GENERATION_STEPS[Math.min(step, GENERATION_STEPS.length - 1)];

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex flex-col items-center justify-center bg-[var(--color-surface)]/80 backdrop-blur-sm',
        className
      )}
    >
      <div className="flex flex-col items-center gap-6 rounded-2xl bg-[var(--color-surface)] p-10 shadow-lg border border-[var(--color-border)]">
        <div className="relative">
          <Loader2 className="h-12 w-12 animate-spin text-[var(--color-primary-500)]" />
          <div className="absolute inset-0 h-12 w-12 animate-ping rounded-full bg-[var(--color-primary-200)] opacity-20" />
        </div>
        <div className="text-center">
          <p className="heading-3 mb-1">{message}</p>
          <p className="text-small">This may take a few moments</p>
        </div>
        <div className="w-48 h-1.5 rounded-full bg-[var(--color-surface-elevated)] overflow-hidden">
          <div
            className="h-full rounded-full bg-[var(--color-primary-500)] transition-all duration-1000 ease-out"
            style={{ width: `${Math.min(((step + 1) / GENERATION_STEPS.length) * 100, 95)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
