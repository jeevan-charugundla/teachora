import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-4 text-center', className)}>
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-surface-elevated)] mb-4">
        <Icon className="h-8 w-8 text-[var(--color-text-tertiary)]" />
      </div>
      <h3 className="heading-3 mb-2">{title}</h3>
      <p className="text-body max-w-sm mb-6">{description}</p>
      {action}
    </div>
  );
}
