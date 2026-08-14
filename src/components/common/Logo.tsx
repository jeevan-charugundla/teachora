import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export function Logo({ size = 'md', showText = true, className }: LogoProps) {
  const sizes = {
    sm: { icon: 24, text: 'text-base' },
    md: { icon: 32, text: 'text-xl' },
    lg: { icon: 40, text: 'text-2xl' },
  };

  const s = sizes[size];

  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <svg
        width={s.icon}
        height={s.icon}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <rect width="32" height="32" rx="8" fill="#0D9488" />
        <path
          d="M8 10h16v2H8zm0 5h12v2H8zm0 5h14v2H8z"
          fill="#fff"
          opacity="0.9"
        />
        <path
          d="M22 15l4 4-4 4"
          stroke="#FBBF24"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
      {showText && (
        <span className={cn('font-semibold tracking-tight text-[var(--color-text-primary)]', s.text)}>
          Teachora
        </span>
      )}
    </div>
  );
}
