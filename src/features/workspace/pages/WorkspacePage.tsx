import { useState } from 'react';
import { FolderOpen, Search, Star, Clock, FileCheck, FilePlus } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const tabs = [
  { id: 'all', label: 'All', icon: FolderOpen },
  { id: 'recent', label: 'Recent', icon: Clock },
  { id: 'drafts', label: 'Drafts', icon: FilePlus },
  { id: 'completed', label: 'Completed', icon: FileCheck },
  { id: 'favorites', label: 'Favorites', icon: Star },
];

export function WorkspacePage() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="page-container max-w-5xl">
      <PageHeader
        title="Workspace"
        description="Your teaching materials library"
        icon={FolderOpen}
      />

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-tertiary)]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search projects…"
          className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] pl-10 pr-4 py-2.5 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-primary-500)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20 transition-colors"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={cn(
              'flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors',
              activeTab === id
                ? 'bg-[var(--color-primary-50)] text-[var(--color-primary-700)]'
                : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-text-primary)]'
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <EmptyState
          icon={FolderOpen}
          title="No projects yet"
          description="Start creating to see your projects here. All your lessons, quizzes, worksheets, and more will appear in your workspace."
          action={
            <Link
              to="/app/create"
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary-600)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--color-primary-700)] transition-colors"
            >
              Start creating
            </Link>
          }
        />
      </motion.div>
    </div>
  );
}
