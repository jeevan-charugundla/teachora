import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, description, icon: Icon, action, className }: PageHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between gap-4 mb-6', className)}>
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary-50)]">
            <Icon className="h-5 w-5 text-[var(--color-primary-600)]" />
          </div>
        )}
        <div>
          <h1 className="heading-2">{title}</h1>
          {description && (
            <p className="mt-1 text-body">{description}</p>
          )}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
