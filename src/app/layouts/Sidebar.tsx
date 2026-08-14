import { NavLink } from 'react-router-dom';
import {
  Home,
  PlusCircle,
  FolderOpen,
  Compass,
  User,
  MessageSquare,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react';
import { Logo } from '@/components/common/Logo';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/app', icon: Home, label: 'Home', end: true },
  { to: '/app/create', icon: PlusCircle, label: 'Create' },
  { to: '/app/workspace', icon: FolderOpen, label: 'Workspace' },
  { to: '/app/discover', icon: Compass, label: 'Discover' },
  { to: '/app/assistant', icon: MessageSquare, label: 'Assistant' },
];

export function Sidebar() {
  const { profile } = useAuthStore();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();

  return (
    <aside
      className={cn(
        'hidden lg:flex flex-col h-screen border-r border-[var(--color-border)] bg-[var(--color-surface)] transition-all duration-200',
        sidebarCollapsed ? 'w-[68px]' : 'w-[240px]'
      )}
    >
      {/* Logo */}
      <div className={cn('flex items-center h-16 border-b border-[var(--color-border)]', sidebarCollapsed ? 'justify-center px-2' : 'px-5')}>
        <Logo size="sm" showText={!sidebarCollapsed} />
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                sidebarCollapsed && 'justify-center px-2',
                isActive
                  ? 'bg-[var(--color-primary-50)] text-[var(--color-primary-700)]'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-text-primary)]'
              )
            }
            title={sidebarCollapsed ? label : undefined}
          >
            <Icon className="h-5 w-5 shrink-0" />
            {!sidebarCollapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Collapse toggle */}
      <div className="border-t border-[var(--color-border)] px-2 py-2">
        <button
          onClick={toggleSidebar}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-[var(--color-text-tertiary)] hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-text-primary)] transition-colors"
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? (
            <PanelLeft className="h-5 w-5 mx-auto" />
          ) : (
            <>
              <PanelLeftClose className="h-5 w-5" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>

      {/* Profile */}
      <div className="border-t border-[var(--color-border)]">
        <NavLink
          to="/app/profile"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 px-4 py-3 transition-colors',
              sidebarCollapsed && 'justify-center px-2',
              isActive
                ? 'bg-[var(--color-primary-50)]'
                : 'hover:bg-[var(--color-surface-elevated)]'
            )
          }
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-100)] text-sm font-semibold text-[var(--color-primary-700)]">
            {profile?.full_name?.charAt(0)?.toUpperCase() || <User className="h-4 w-4" />}
          </div>
          {!sidebarCollapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-[var(--color-text-primary)]">
                {profile?.full_name || 'Teacher'}
              </p>
              <p className="truncate text-xs text-[var(--color-text-tertiary)]">
                {profile?.subjects?.[0] || 'Set up profile'}
              </p>
            </div>
          )}
        </NavLink>
      </div>
    </aside>
  );
}
