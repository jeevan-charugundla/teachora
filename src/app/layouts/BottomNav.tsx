import { NavLink } from 'react-router-dom';
import { Home, PlusCircle, FolderOpen, Compass, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/app', icon: Home, label: 'Home', end: true },
  { to: '/app/create', icon: PlusCircle, label: 'Create' },
  { to: '/app/workspace', icon: FolderOpen, label: 'Library' },
  { to: '/app/discover', icon: Compass, label: 'Discover' },
  { to: '/app/profile', icon: User, label: 'Profile' },
];

export function BottomNav() {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-[var(--color-border)] bg-[var(--color-surface)] px-1 pb-[env(safe-area-inset-bottom)]">
      {navItems.map(({ to, icon: Icon, label, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center gap-0.5 py-2 px-3 text-[10px] font-medium transition-colors min-w-[56px]',
              isActive
                ? 'text-[var(--color-primary-600)]'
                : 'text-[var(--color-text-tertiary)]'
            )
          }
        >
          <Icon className="h-5 w-5" />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
