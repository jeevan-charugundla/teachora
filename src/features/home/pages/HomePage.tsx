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
  MessageSquare,
  ArrowRight,
  Sparkles,
  FolderOpen,
} from 'lucide-react';
import { motion } from 'framer-motion';

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
  const { profile } = useAuthStore();
  const greeting = getGreeting();
  const firstName = profile?.full_name?.split(' ')[0] || 'Teacher';

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

      {/* AI Assistant CTA */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
      >
        <Link
          to="/app/assistant"
          className="flex items-center gap-4 p-5 rounded-xl bg-gradient-to-r from-[var(--color-primary-600)] to-[var(--color-primary-700)] text-white mb-8 hover:from-[var(--color-primary-700)] hover:to-[var(--color-primary-800)] transition-all group"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 shrink-0">
            <MessageSquare className="h-6 w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base mb-0.5">AI Teaching Assistant</h3>
            <p className="text-sm text-white/80">
              Ask questions, get explanations, generate quizzes and more
            </p>
          </div>
          <ArrowRight className="h-5 w-5 shrink-0 group-hover:translate-x-1 transition-transform" />
        </Link>
      </motion.div>

      {/* Quick Create */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="mb-10"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="heading-3 flex items-center gap-2">
            <Sparkles className="h-4.5 w-4.5 text-[var(--color-accent-500)]" />
            Quick Create
          </h2>
          <Link
            to="/app/create"
            className="text-sm font-medium text-[var(--color-primary-600)] hover:text-[var(--color-primary-700)] flex items-center gap-1"
          >
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {quickCreateItems.map(({ to, icon: Icon, label, color }) => (
            <Link
              key={to}
              to={to}
              className="card card-interactive flex flex-col items-center gap-2.5 p-4 text-center group"
            >
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${color} transition-transform group-hover:scale-110`}>
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-xs font-medium text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)]">
                {label}
              </span>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Recent Projects */}
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

        {/* Empty state for new users */}
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
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            {
              title: 'Science Lesson Plan',
              desc: 'Complete lesson structure with activities and assessment',
              type: 'Lesson',
              icon: BookOpen,
              subject: 'Science',
            },
            {
              title: 'Math Quiz Generator',
              desc: 'Multiple choice and problem-solving questions',
              type: 'Quiz',
              icon: HelpCircle,
              subject: 'Mathematics',
            },
            {
              title: 'Reading Comprehension',
              desc: 'Passage-based worksheet with graded questions',
              type: 'Worksheet',
              icon: FileSpreadsheet,
              subject: 'English',
            },
          ].map((template) => (
            <Link
              key={template.title}
              to="/app/create"
              className="card card-interactive p-4"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary-50)]">
                  <template.icon className="h-5 w-5 text-[var(--color-primary-600)]" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-sm text-[var(--color-text-primary)] mb-0.5">{template.title}</h3>
                  <p className="text-xs text-[var(--color-text-secondary)] line-clamp-2">{template.desc}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="inline-flex items-center rounded-md bg-[var(--color-surface-elevated)] px-2 py-0.5 text-[10px] font-medium text-[var(--color-text-tertiary)]">
                      {template.type}
                    </span>
                    <span className="inline-flex items-center rounded-md bg-[var(--color-surface-elevated)] px-2 py-0.5 text-[10px] font-medium text-[var(--color-text-tertiary)]">
                      {template.subject}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
