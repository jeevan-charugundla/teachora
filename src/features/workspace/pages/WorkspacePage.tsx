import { useState, useEffect, useMemo } from 'react';
import {
  FolderOpen,
  Search,
  Star,
  Clock,
  FileCheck,
  FilePlus,
  Loader2,
  X,
  AlertCircle,
  Plus,
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';
import type { Project } from '@/types/database';
import {
  getProjects,
  renameProject,
  toggleFavorite,
  deleteProject,
  subscribeToProjects,
} from '@/services/supabase/projects';
import { ProjectCard } from '../components/ProjectCard';

const tabs = [
  { id: 'all', label: 'All', icon: FolderOpen },
  { id: 'recent', label: 'Recent', icon: Clock },
  { id: 'drafts', label: 'Drafts', icon: FilePlus },
  { id: 'completed', label: 'Completed', icon: FileCheck },
  { id: 'favorites', label: 'Favorites', icon: Star },
];

export function WorkspacePage() {
  const { user } = useAuthStore();

  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [renameTarget, setRenameTarget] = useState<Project | null>(null);
  const [renameTitle, setRenameTitle] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load initial projects & subscribe to realtime changes
  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    async function loadInitialProjects() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getProjects(user!.id);
        if (isMounted) {
          setProjects(data);
        }
      } catch (err) {
        console.error('Error loading workspace projects:', err);
        if (isMounted) {
          setError('Couldn\'t load your workspace. Please try again.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadInitialProjects();

    // Subscribe to realtime database changes
    const unsubscribe = subscribeToProjects(user.id, (payload) => {
      if (!isMounted) return;

      if (payload.eventType === 'INSERT' && payload.new) {
        const newProj = payload.new;
        setProjects((prev) => {
          if (prev.some((p) => p.id === newProj.id)) return prev;
          return [newProj, ...prev];
        });
      } else if (payload.eventType === 'UPDATE' && payload.new) {
        const updated = payload.new;
        setProjects((prev) =>
          prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p))
        );
      } else if (payload.eventType === 'DELETE' && payload.old) {
        const deletedId = payload.old.id;
        setProjects((prev) => prev.filter((p) => p.id !== deletedId));
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [user]);

  // Favorite toggle with optimistic UI
  const handleToggleFavorite = async (projectId: string, current: boolean) => {
    const nextState = !current;
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, is_favorite: nextState } : p))
    );

    try {
      await toggleFavorite(projectId, nextState);
    } catch (err) {
      console.error('Failed to update favorite status:', err);
      // Rollback on error
      setProjects((prev) =>
        prev.map((p) => (p.id === projectId ? { ...p, is_favorite: current } : p))
      );
    }
  };

  // Rename handle
  const handleRenameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renameTarget || !renameTitle.trim() || isRenaming) return;

    const oldTitle = renameTarget.title;
    const newTitle = renameTitle.trim();

    // Optimistic UI
    setProjects((prev) =>
      prev.map((p) => (p.id === renameTarget.id ? { ...p, title: newTitle } : p))
    );
    setIsRenaming(true);

    try {
      await renameProject(renameTarget.id, newTitle);
      setRenameTarget(null);
    } catch (err) {
      console.error('Failed to rename project:', err);
      // Rollback
      setProjects((prev) =>
        prev.map((p) => (p.id === renameTarget.id ? { ...p, title: oldTitle } : p))
      );
    } finally {
      setIsRenaming(false);
    }
  };

  // Delete handle
  const handleDeleteSubmit = async () => {
    if (!deleteTarget || isDeleting) return;

    const targetId = deleteTarget.id;
    // Optimistic UI
    setProjects((prev) => prev.filter((p) => p.id !== targetId));
    setIsDeleting(true);

    try {
      await deleteProject(targetId);
      setDeleteTarget(null);
    } catch (err) {
      console.error('Failed to delete project:', err);
      // Rollback
      const data = await getProjects(user!.id);
      setProjects(data);
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter & Search Logic
  const filteredProjects = useMemo(() => {
    let list = [...projects];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.subject?.toLowerCase().includes(q) ||
          p.grade_level?.toLowerCase().includes(q) ||
          p.project_type?.toLowerCase().includes(q)
      );
    }

    // Tab filter
    if (activeTab === 'recent') {
      list.sort((a, b) => {
        const timeA = new Date(a.last_opened_at || a.updated_at).getTime();
        const timeB = new Date(b.last_opened_at || b.updated_at).getTime();
        return timeB - timeA;
      });
    } else if (activeTab === 'drafts') {
      list = list.filter((p) => p.status === 'draft');
    } else if (activeTab === 'completed') {
      list = list.filter((p) => p.status === 'completed');
    } else if (activeTab === 'favorites') {
      list = list.filter((p) => p.is_favorite);
    }

    return list;
  }, [projects, searchQuery, activeTab]);

  return (
    <div className="page-container max-w-5xl">
      <PageHeader
        title="Workspace"
        description="Your teaching materials library"
        icon={FolderOpen}
        action={
          <Link
            to="/app/create"
            className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--color-primary-600)] px-3.5 py-2 text-sm font-semibold text-white hover:bg-[var(--color-primary-700)] transition-colors shadow-xs"
          >
            <Plus className="h-4 w-4" /> New Creation
          </Link>
        }
      />

      {/* Search Bar */}
      <div className="relative mb-5">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-tertiary)]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search projects by title, subject, grade, or type…"
          className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] pl-10 pr-4 py-2.5 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-primary-500)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20 transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]"
          >
            Clear
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-1 border-b border-[var(--color-border)]">
        {tabs.map(({ id, label, icon: Icon }) => {
          const count =
            id === 'all'
              ? projects.length
              : id === 'drafts'
              ? projects.filter((p) => p.status === 'draft').length
              : id === 'completed'
              ? projects.filter((p) => p.status === 'completed').length
              : id === 'favorites'
              ? projects.filter((p) => p.is_favorite).length
              : projects.length;

          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                'flex items-center gap-1.5 rounded-t-lg px-3.5 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-all',
                activeTab === id
                  ? 'border-[var(--color-primary-600)] text-[var(--color-primary-700)] bg-[var(--color-primary-50)]/50 font-semibold'
                  : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated)]'
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
              <span
                className={cn(
                  'ml-1 rounded-full px-2 py-0.5 text-[11px] font-semibold',
                  activeTab === id
                    ? 'bg-[var(--color-primary-100)] text-[var(--color-primary-800)]'
                    : 'bg-[var(--color-surface-elevated)] text-[var(--color-text-tertiary)]'
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="text-xs font-semibold underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Content State */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 py-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="card h-40 rounded-xl animate-pulse bg-[var(--color-surface-elevated)] border border-[var(--color-border)]"
            />
          ))}
        </div>
      ) : filteredProjects.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {filteredProjects.map((proj) => (
            <ProjectCard
              key={proj.id}
              project={proj}
              onToggleFavorite={handleToggleFavorite}
              onRename={(p) => {
                setRenameTarget(p);
                setRenameTitle(p.title);
              }}
              onDelete={(p) => setDeleteTarget(p)}
            />
          ))}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {searchQuery ? (
            <EmptyState
              icon={Search}
              title="No matching projects"
              description={`No projects found matching "${searchQuery}". Try a different keyword.`}
              action={
                <button
                  onClick={() => setSearchQuery('')}
                  className="rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm font-medium hover:bg-[var(--color-surface-elevated)]"
                >
                  Clear search
                </button>
              }
            />
          ) : activeTab === 'favorites' ? (
            <EmptyState
              icon={Star}
              title="No favorite projects yet"
              description="Star projects you want quick access to and they will appear here."
              action={
                <button
                  onClick={() => setActiveTab('all')}
                  className="rounded-lg bg-[var(--color-primary-600)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--color-primary-700)]"
                >
                  View all projects
                </button>
              }
            />
          ) : activeTab === 'drafts' ? (
            <EmptyState
              icon={FilePlus}
              title="No drafts"
              description="Your unfinished creations will appear here automatically."
            />
          ) : activeTab === 'completed' ? (
            <EmptyState
              icon={FileCheck}
              title="No completed projects yet"
              description="Finish a creation and it will appear in your completed library."
            />
          ) : (
            <EmptyState
              icon={FolderOpen}
              title="No projects yet"
              description="Start creating to see your projects here. All your lessons, quizzes, worksheets, diagrams, and more will appear in your workspace."
              action={
                <Link
                  to="/app/create"
                  className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary-600)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--color-primary-700)] transition-colors"
                >
                  Start creating
                </Link>
              }
            />
          )}
        </motion.div>
      )}

      {/* Rename Modal */}
      <AnimatePresence>
        {renameTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="card w-full max-w-md rounded-2xl p-6 shadow-2xl border border-[var(--color-border)]"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
                <h3 className="font-bold text-base text-[var(--color-text-primary)]">
                  Rename Project
                </h3>
                <button
                  onClick={() => setRenameTarget(null)}
                  className="p-1 rounded-lg text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleRenameSubmit} className="mt-4">
                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                  Project Title
                </label>
                <input
                  type="text"
                  value={renameTitle}
                  onChange={(e) => setRenameTitle(e.target.value)}
                  className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm text-[var(--color-text-primary)] focus:border-[var(--color-primary-500)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20"
                  placeholder="Enter project title…"
                  autoFocus
                />

                <div className="flex items-center justify-end gap-2 mt-6">
                  <button
                    type="button"
                    onClick={() => setRenameTarget(null)}
                    className="rounded-lg px-4 py-2 text-xs font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-elevated)]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!renameTitle.trim() || isRenaming}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--color-primary-600)] px-4 py-2 text-xs font-semibold text-white hover:bg-[var(--color-primary-700)] disabled:opacity-50"
                  >
                    {isRenaming && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    Save Title
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="card w-full max-w-md rounded-2xl p-6 shadow-2xl border border-[var(--color-border)]"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[var(--color-text-primary)]">
                    Delete Project?
                  </h3>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                    Are you sure you want to delete <strong className="text-[var(--color-text-primary)]">"{deleteTarget.title}"</strong>? This action cannot be undone.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  className="rounded-lg px-4 py-2 text-xs font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-elevated)]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteSubmit}
                  disabled={isDeleting}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
                >
                  {isDeleting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Delete Project
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
