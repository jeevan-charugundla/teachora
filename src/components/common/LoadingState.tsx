import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingStateProps {
  message?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingState({ message, className, size = 'md' }: LoadingStateProps) {
  const sizes = {
    sm: 'h-5 w-5',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className={cn('flex flex-col items-center justify-center py-16 gap-4', className)}>
      <Loader2 className={cn('animate-spin text-[var(--color-primary-500)]', sizes[size])} />
      {message && (
        <p className="text-body animate-pulse-subtle">{message}</p>
      )}
    </div>
  );
}
