import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { getGreeting, formatRelativeTime } from '@/lib/utils';
import {
  BookOpen,
  FileText,
  ClipboardList,
  FileSpreadsheet,
  HelpCircle,
  Presentation,
  ArrowRight,
  Sparkles,
  FolderOpen,
  Clock,
  MoreVertical,
  Edit2,
  Trash2,
  Star,
  ExternalLink,
  Bell,
  Menu,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { motion } from 'framer-motion';
import type { Project } from '@/types/database';
import {
  getRecentProjects,
  toggleFavorite,
  renameProject,
  deleteProject,
  subscribeToProjects,
  touchProjectLastOpened,
} from '@/services/supabase/projects';

// Exactly 6 Quick Create items as required
const quickCreateItems = [
  {
    to: '/app/create/lesson',
    icon: BookOpen,
    label: 'Lesson',
    sublabel: 'Create lesson plans',
    color: 'bg-blue-50 text-blue-600 border-blue-100',
  },
  {
    to: '/app/create/assignment',
    icon: ClipboardList,
    label: 'Assignment',
    sublabel: 'Design assignments',
    color: 'bg-violet-50 text-violet-600 border-violet-100',
  },
  {
    to: '/app/create/worksheet',
    icon: FileSpreadsheet,
    label: 'Worksheet',
    sublabel: 'Practice worksheets',
    color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  },
  {
    to: '/app/create/quiz',
    icon: HelpCircle,
    label: 'Quiz',
    sublabel: 'Create quizzes',
    color: 'bg-amber-50 text-amber-600 border-amber-100',
  },
  {
    to: '/app/create/presentation',
    icon: Presentation,
    label: 'Presentation',
    sublabel: 'Slide presentations',
    color: 'bg-rose-50 text-rose-600 border-rose-100',
  },
  {
    to: '/app/create/notes',
    icon: FileText,
    label: 'Notes',
    sublabel: 'Study notes',
    color: 'bg-teal-50 text-teal-600 border-teal-100',
  },
];

// Suggested Templates matching real creation workflows
const suggestedTemplates = [
  {
    to: '/app/create/lesson',
    title: '5E Inquiry Lesson Plan',
    description: 'Structured inquiry model for science & math topics',
    icon: BookOpen,
    color: 'bg-blue-50 text-blue-600 border-blue-100',
  },
  {
    to: '/app/create/worksheet',
    title: 'Science Worksheet',
    description: 'Engaging worksheets for concept reinforcement',
    icon: FileSpreadsheet,
    color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  },
  {
    to: '/app/create/assignment',
    title: 'Rubric Template',
    description: 'Editable rubric for different activities and projects',
    icon: ClipboardList,
    color: 'bg-amber-50 text-amber-600 border-amber-100',
  },
  {
    to: '/app/create/notes',
    title: 'Reading Comprehension',
    description: 'Passages with questions for understanding',
    icon: FileText,
    color: 'bg-violet-50 text-violet-600 border-violet-100',
  },
];

// Helper to resolve project pastel icon & color style by type
function getProjectBadgeStyle(type?: string) {
  const t = (type || '').toLowerCase();
  if (t.includes('lesson')) return { icon: BookOpen, color: 'bg-blue-50 text-blue-600 border-blue-100' };
  if (t.includes('assignment')) return { icon: ClipboardList, color: 'bg-violet-50 text-violet-600 border-violet-100' };
  if (t.includes('worksheet')) return { icon: FileSpreadsheet, color: 'bg-emerald-50 text-emerald-600 border-emerald-100' };
  if (t.includes('quiz') || t.includes('test') || t.includes('exam')) return { icon: HelpCircle, color: 'bg-amber-50 text-amber-600 border-amber-100' };
  if (t.includes('presentation')) return { icon: Presentation, color: 'bg-rose-50 text-rose-600 border-rose-100' };
  if (t.includes('note')) return { icon: FileText, color: 'bg-teal-50 text-teal-600 border-teal-100' };
  return { icon: BookOpen, color: 'bg-slate-50 text-slate-600 border-slate-100' };
}

export function HomePage() {
  const navigate = useNavigate();
  const { user, profile } = useAuthStore();
  const { toggleSidebar } = useUIStore();
  const greeting = getGreeting();

  const firstName =
    profile?.full_name?.split(' ')[0] ||
    user?.user_metadata?.full_name?.split(' ')[0] ||
    user?.email?.split('@')[0] ||
    'Teacher';

  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const loadRecent = useCallback(async () => {
    if (!user) {
      setLoadingProjects(false);
      return;
    }

    try {
      setLoadingProjects(true);
      setHasError(false);
      const data = await getRecentProjects(user.id, 4);
      setRecentProjects(data);
    } catch (err) {
      console.error('Error fetching recent projects:', err);
      setHasError(true);
    } finally {
      setLoadingProjects(false);
    }
  }, [user]);

  useEffect(() => {
    loadRecent();

    if (!user) return;

    // Realtime subscription for Home page Recent Projects
    const unsubscribe = subscribeToProjects(user.id, () => {
      getRecentProjects(user.id, 4)
        .then((latest) => {
          setRecentProjects(latest);
          setHasError(false);
        })
        .catch((err) => {
          console.error('Realtime update fetch error:', err);
        });
    });

    return () => {
      unsubscribe();
    };
  }, [user, loadRecent]);

  const handleOpenProject = (projectId: string) => {
    touchProjectLastOpened(projectId);
    navigate(`/app/lessons/${projectId}`);
  };

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
        if (user) {
          const latest = await getRecentProjects(user.id, 4);
          setRecentProjects(latest);
        }
      }
    }
  };

  return (
    <div className="page-container max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-6 pb-28 lg:pb-8">
      {/* SECTION 1: Personalized Greeting */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between gap-3 mb-6"
      >
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={toggleSidebar}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200/80 bg-white text-teal-600 hover:bg-slate-50 transition-colors lg:hidden shadow-2xs"
            title="Menu"
            aria-label="Menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 truncate tracking-tight">
              {greeting}, {firstName} 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium truncate">
              What would you like to create today?
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200/80 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-2xs"
            title="Notifications"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-teal-500 ring-2 ring-white" />
          </button>

          <Link
            to="/app/profile"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 border border-teal-200 text-teal-800 font-semibold text-sm overflow-hidden shadow-2xs hover:opacity-90 transition-opacity"
            title="Profile"
          >
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt={firstName} className="h-full w-full object-cover" />
            ) : (
              firstName.charAt(0).toUpperCase()
            )}
          </Link>
        </div>
      </motion.div>

      {/* SECTION 2: Teachora AI Assistant Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="mb-8"
      >
        <div
          onClick={() => navigate('/app/assistant')}
          className="group relative rounded-2xl border border-teal-100 bg-gradient-to-br from-teal-50/70 via-white to-cyan-50/50 p-5 shadow-2xs hover:shadow-xs hover:border-teal-200 transition-all cursor-pointer overflow-hidden"
        >
          <div className="flex items-start gap-3.5 mb-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-100/80 text-teal-700 border border-teal-200/50">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold tracking-wider uppercase text-teal-600 block mb-0.5">
                TEACHORA AI ASSISTANT
              </span>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                Ask anything, generate any material
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed mt-1">
                Co-create lessons, adapt for student needs, or get help with any concept.
              </p>
            </div>
          </div>

          {/* Input-style CTA */}
          <div className="flex items-center justify-between rounded-xl border border-teal-200/60 bg-white px-3.5 py-2.5 shadow-2xs group-hover:border-teal-400 transition-colors">
            <div className="flex items-center gap-2.5 min-w-0">
              <Sparkles className="h-4 w-4 text-teal-500 shrink-0" />
              <span className="text-xs sm:text-sm text-slate-400 font-normal truncate">
                Ask Teachora anything...
              </span>
            </div>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-600 text-white group-hover:bg-teal-700 transition-colors shadow-2xs">
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* SECTION 3: Quick Create (6 Items) */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-3.5">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">Quick Create</h2>
          <Link
            to="/app/create"
            className="text-xs sm:text-sm font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1 transition-colors"
          >
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickCreateItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="group relative flex flex-col items-center justify-center p-4 text-center rounded-2xl border border-slate-200/80 bg-white hover:border-teal-300 hover:shadow-xs transition-all active:scale-[0.98]"
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${item.color} mb-2.5 group-hover:scale-105 transition-transform`}>
                <item.icon className="h-6 w-6" />
              </div>
              <span className="text-sm font-semibold text-slate-900 group-hover:text-teal-600 transition-colors mb-0.5">
                {item.label}
              </span>
              <span className="text-xs text-slate-500 font-normal line-clamp-1">
                {item.sublabel}
              </span>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* SECTION 4: Recent Projects */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-3.5">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">Recent Projects</h2>
          <Link
            to="/app/workspace"
            className="text-xs sm:text-sm font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1 transition-colors"
          >
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {loadingProjects ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-20 rounded-2xl border border-slate-200/60 bg-slate-100/70 animate-pulse"
              />
            ))}
          </div>
        ) : hasError ? (
          <div className="rounded-2xl border border-red-200/80 bg-red-50/50 p-6 text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-rose-500 mb-2" />
            <p className="font-semibold text-sm text-slate-900 mb-1">Unable to load recent projects</p>
            <p className="text-xs text-slate-500 mb-4">Please check your connection and try again</p>
            <button
              type="button"
              onClick={loadRecent}
              className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Retry
            </button>
          </div>
        ) : recentProjects.length > 0 ? (
          <div className="space-y-3 sm:grid sm:grid-cols-2 sm:space-y-0 sm:gap-3 lg:grid-cols-3">
            {recentProjects.map((proj) => {
              const badge = getProjectBadgeStyle(proj.project_type || proj.type);
              const Icon = badge.icon;
              const metadataText = [proj.subject, proj.grade_level].filter(Boolean).join(' • ');

              return (
                <div
                  key={proj.id}
                  onClick={() => handleOpenProject(proj.id)}
                  className="group relative flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-2xs hover:border-teal-300 hover:shadow-xs transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${badge.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1 pr-2">
                      <h3 className="font-semibold text-sm text-slate-900 truncate group-hover:text-teal-600 transition-colors">
                        {proj.title}
                      </h3>
                      {metadataText && (
                        <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                          {metadataText}
                        </p>
                      )}
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 font-normal mt-1">
                        <Clock className="h-3 w-3 shrink-0 text-slate-400" />
                        <span>Updated {formatRelativeTime(proj.last_opened_at || proj.updated_at)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Menu Trigger */}
                  <div className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => setOpenMenuId(openMenuId === proj.id ? null : proj.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                      aria-label="Project options"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>

                    {openMenuId === proj.id && (
                      <div
                        className="absolute right-0 top-8 z-30 w-44 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl animate-in fade-in zoom-in-95 duration-100"
                        onMouseLeave={() => setOpenMenuId(null)}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setOpenMenuId(null);
                            handleOpenProject(proj.id);
                          }}
                          className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                        >
                          <ExternalLink className="h-3.5 w-3.5" /> Open Project
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setOpenMenuId(null);
                            handleRename(proj);
                          }}
                          className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                        >
                          <Edit2 className="h-3.5 w-3.5" /> Rename
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setOpenMenuId(null);
                            handleToggleFavorite(proj.id, Boolean(proj.is_favorite));
                          }}
                          className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                        >
                          <Star className="h-3.5 w-3.5" /> {proj.is_favorite ? 'Unfavorite' : 'Favorite'}
                        </button>
                        <div className="my-1 border-t border-slate-100" />
                        <button
                          type="button"
                          onClick={() => {
                            setOpenMenuId(null);
                            handleDelete(proj);
                          }}
                          className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty state */
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 text-center shadow-2xs">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 mx-auto mb-3">
              <FolderOpen className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-sm text-slate-900 mb-1">No projects yet</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto mb-4">
              Create your first lesson, quiz, or worksheet to get started
            </p>
            <Link
              to="/app/create"
              className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-700 transition-colors shadow-2xs"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Start creating
            </Link>
          </div>
        )}
      </motion.div>

      {/* SECTION 5: Suggested Templates */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-3.5">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">Suggested Templates</h2>
          <Link
            to="/app/discover"
            className="text-xs sm:text-sm font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1 transition-colors"
          >
            Browse all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="flex gap-3 overflow-x-auto snap-x pb-2 scrollbar-none sm:grid sm:grid-cols-2 md:grid-cols-4">
          {suggestedTemplates.map((tmpl) => (
            <Link
              key={tmpl.title}
              to={tmpl.to}
              className="min-w-[210px] max-w-[240px] sm:min-w-0 sm:max-w-none snap-start flex-1 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs hover:border-teal-300 transition-all group flex flex-col justify-between cursor-pointer"
            >
              <div>
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl border ${tmpl.color} mb-3 group-hover:scale-105 transition-transform`}>
                  <tmpl.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-sm text-slate-900 group-hover:text-teal-600 transition-colors mb-1">
                  {tmpl.title}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {tmpl.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

