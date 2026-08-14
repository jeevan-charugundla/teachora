import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { getGreeting } from '@/lib/utils';
import {
  BookOpen,
  FileText,
  ClipboardList,
  FileSpreadsheet,
  HelpCircle,
  Timer,
  FileQuestion,
  Presentation,
  Image,
  Video,
  Layers,
  Package,
  ArrowRight,
  Sparkles,
  FolderOpen,
} from 'lucide-react';
import { motion } from 'framer-motion';
import type { Project } from '@/types/database';
import {
  getRecentProjects,
  toggleFavorite,
  renameProject,
  deleteProject,
  subscribeToProjects,
} from '@/services/supabase/projects';
import { ProjectCard } from '@/features/workspace/components/ProjectCard';

const quickCreateItems = [
  { to: '/app/create/lesson', icon: BookOpen, label: 'Lesson', color: 'bg-blue-50 text-blue-600' },
  { to: '/app/create/assignment', icon: ClipboardList, label: 'Assignment', color: 'bg-violet-50 text-violet-600' },
  { to: '/app/create/worksheet', icon: FileSpreadsheet, label: 'Worksheet', color: 'bg-emerald-50 text-emerald-600' },
  { to: '/app/create/quiz', icon: HelpCircle, label: 'Quiz', color: 'bg-amber-50 text-amber-600' },
  { to: '/app/create/mock-test', icon: Timer, label: 'Mock Test', color: 'bg-rose-50 text-rose-600' },
  { to: '/app/create/question-paper', icon: FileQuestion, label: 'Question Paper', color: 'bg-cyan-50 text-cyan-600' },
  { to: '/app/create/presentation', icon: Presentation, label: 'Presentation', color: 'bg-orange-50 text-orange-600' },
  { to: '/app/create/notes', icon: FileText, label: 'Notes', color: 'bg-teal-50 text-teal-600' },
  { to: '/app/create/visual', icon: Image, label: 'Visual', color: 'bg-pink-50 text-pink-600' },
  { to: '/app/create/video', icon: Video, label: 'Video', color: 'bg-indigo-50 text-indigo-600' },
  { to: '/app/create/flashcards', icon: Layers, label: 'Flashcards', color: 'bg-lime-50 text-lime-600' },
  { to: '/app/create/pack', icon: Package, label: 'Create Pack', color: 'bg-purple-50 text-purple-600' },
];

export function HomePage() {
  const { user, profile } = useAuthStore();
  const greeting = getGreeting();
  const firstName = profile?.full_name?.split(' ')[0] || 'Teacher';

  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoadingProjects(false);
      return;
    }

    let isMounted = true;

    async function loadRecent() {
      try {
        setLoadingProjects(true);
        const data = await getRecentProjects(user!.id, 6);
        if (isMounted) {
          setRecentProjects(data);
        }
      } catch (err) {
        console.error('Error fetching recent projects:', err);
      } finally {
        if (isMounted) {
          setLoadingProjects(false);
        }
      }
    }

    loadRecent();

    // Realtime subscription for Home page Recent Projects
    const unsubscribe = subscribeToProjects(user.id, () => {
      if (isMounted) {
        // Refetch latest recent 6 projects
        getRecentProjects(user.id, 6).then((latest) => {
          if (isMounted) setRecentProjects(latest);
        });
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [user]);

  const handleToggleFavorite = async (projectId: string, current: boolean) => {
    const nextState = !current;
    setRecentProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, is_favorite: nextState } : p))
    );
    try {
      await toggleFavorite(projectId, nextState);
    } catch {
      setRecentProjects((prev) =>
        prev.map((p) => (p.id === projectId ? { ...p, is_favorite: current } : p))
      );
    }
  };

  const handleRename = async (project: Project) => {
    const newTitle = window.prompt('Enter new project title:', project.title);
    if (newTitle && newTitle.trim() && newTitle.trim() !== project.title) {
      try {
        const updated = await renameProject(project.id, newTitle.trim());
        setRecentProjects((prev) =>
          prev.map((p) => (p.id === project.id ? updated : p))
        );
      } catch (err) {
        console.error('Failed to rename project:', err);
      }
    }
  };

  const handleDelete = async (project: Project) => {
    if (window.confirm(`Are you sure you want to delete "${project.title}"?`)) {
      setRecentProjects((prev) => prev.filter((p) => p.id !== project.id));
      try {
        await deleteProject(project.id);
      } catch {
        const latest = await getRecentProjects(user!.id, 6);
        setRecentProjects(latest);
      }
    }
  };

  return (
    <div className="page-container max-w-5xl">
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-8"
      >
        <h1 className="heading-1 text-3xl mb-1">
          {greeting}, {firstName}
        </h1>
        <p className="text-body text-base">
          What would you like to create today?
        </p>
      </motion.div>

      {/* Quick Create Grid */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="mb-10"
      >
        <h2 className="heading-3 mb-4">Quick Create</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {quickCreateItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="card group flex flex-col items-center justify-center p-4 text-center hover:border-[var(--color-primary-300)] transition-all hover:shadow-md"
            >
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${item.color} mb-2 group-hover:scale-105 transition-transform`}>
                <item.icon className="h-5 w-5" />
              </div>
              <span className="text-xs font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-primary-600)] transition-colors">
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* AI Teaching Assistant Banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="mb-10"
      >
        <Link
          to="/app/assistant"
          className="card group relative flex items-center justify-between p-6 bg-gradient-to-r from-[var(--color-primary-700)] to-[var(--color-primary-900)] text-white overflow-hidden hover:shadow-lg transition-all"
        >
          <div className="relative z-10 max-w-lg">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-5 w-5 text-emerald-300" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                Teachora AI Assistant
              </span>
            </div>
            <h2 className="heading-2 text-xl font-bold text-white mb-1">
              Ask anything, generate any material
            </h2>
            <p className="text-sm text-emerald-100/90">
              Co-create lesson plans, adapt for student needs, or ask pedagogical questions in real time.
            </p>
          </div>
          <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-white group-hover:bg-white group-hover:text-[var(--color-primary-800)] transition-all">
            <ArrowRight className="h-5 w-5" />
          </div>
        </Link>
      </motion.div>

      {/* Recent Projects Section */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
        className="mb-10"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="heading-3">Recent Projects</h2>
          <Link
            to="/app/workspace"
            className="text-sm font-medium text-[var(--color-primary-600)] hover:text-[var(--color-primary-700)] flex items-center gap-1"
          >
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {loadingProjects ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="card h-40 rounded-xl animate-pulse bg-[var(--color-surface-elevated)] border border-[var(--color-border)]"
              />
            ))}
          </div>
        ) : recentProjects.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentProjects.map((proj) => (
              <ProjectCard
                key={proj.id}
                project={proj}
                onToggleFavorite={handleToggleFavorite}
                onRename={handleRename}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          /* Empty state for new users */
          <div className="card flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-surface-elevated)] mb-4">
              <FolderOpen className="h-7 w-7 text-[var(--color-text-tertiary)]" />
            </div>
            <h3 className="font-semibold text-[var(--color-text-primary)] mb-1">No projects yet</h3>
            <p className="text-sm text-[var(--color-text-secondary)] max-w-xs mb-5">
              Create your first lesson, quiz, or worksheet to get started
            </p>
            <Link
              to="/app/create"
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary-600)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--color-primary-700)] transition-colors"
            >
              <Sparkles className="h-4 w-4" />
              Start creating
            </Link>
          </div>
        )}
      </motion.div>

      {/* Suggested Templates */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="heading-3">Suggested Templates</h2>
          <Link
            to="/app/discover"
            className="text-sm font-medium text-[var(--color-primary-600)] hover:text-[var(--color-primary-700)] flex items-center gap-1"
          >
            Browse all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link to="/app/create/lesson" className="card group p-5 hover:border-[var(--color-primary-300)] transition-all">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 mb-3 group-hover:scale-105 transition-transform">
              <BookOpen className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-sm text-[var(--color-text-primary)] group-hover:text-[var(--color-primary-600)] transition-colors mb-1">
              5E Inquiry Lesson Plan
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)]">
              Structured inquiry model for science & math topics
            </p>
          </Link>
          <Link to="/app/create/quiz" className="card group p-5 hover:border-[var(--color-primary-300)] transition-all">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600 mb-3 group-hover:scale-105 transition-transform">
              <HelpCircle className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-sm text-[var(--color-text-primary)] group-hover:text-[var(--color-primary-600)] transition-colors mb-1">
              10-Question Mastery Quiz
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)]">
              Conceptual questions with detailed explanations
            </p>
          </Link>
          <Link to="/app/create/worksheet" className="card group p-5 hover:border-[var(--color-primary-300)] transition-all">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 mb-3 group-hover:scale-105 transition-transform">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-sm text-[var(--color-text-primary)] group-hover:text-[var(--color-primary-600)] transition-colors mb-1">
              Tiered Practice Worksheet
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)]">
              Foundation, intermediate, and challenge tiers
            </p>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
