import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import {
  BookOpen,
  FileText,
  ClipboardList,
  FileSpreadsheet,
  HelpCircle,
  Timer,
  FileQuestion,
  GraduationCap,
  Presentation,
  Image,
  Video,
  Layers,
  Puzzle,
  PlusCircle,
  BarChart3,
  Network,
  GitBranch,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface CreateItem {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
  color: string;
}

const categories: Array<{ title: string; items: CreateItem[] }> = [
  {
    title: 'TEACH',
    items: [
      { to: '/app/create/lesson', icon: BookOpen, label: 'Lesson', description: 'Full lesson plan with objectives and activities', color: 'bg-blue-50 text-blue-600 border-blue-200' },
      { to: '/app/create/notes', icon: FileText, label: 'Notes', description: 'Structured teaching notes and key points', color: 'bg-teal-50 text-teal-600 border-teal-200' },
      { to: '/app/create/presentation', icon: Presentation, label: 'Presentation', description: 'Slide deck with visuals and speaker notes', color: 'bg-orange-50 text-orange-600 border-orange-200' },
      { to: '/app/create/video', icon: Video, label: 'Video', description: 'Educational video script and storyboard', color: 'bg-indigo-50 text-indigo-600 border-indigo-200' },
    ],
  },
  {
    title: 'PRACTICE',
    items: [
      { to: '/app/create/assignment', icon: ClipboardList, label: 'Assignment', description: 'Homework or classwork with answer key', color: 'bg-violet-50 text-violet-600 border-violet-200' },
      { to: '/app/create/worksheet', icon: FileSpreadsheet, label: 'Worksheet', description: 'Practice exercises and problem sets', color: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
      { to: '/app/create/activity', icon: Puzzle, label: 'Activity', description: 'Interactive classroom activities and games', color: 'bg-sky-50 text-sky-600 border-sky-200' },
      { to: '/app/create/flashcards', icon: Layers, label: 'Flashcards', description: 'Term and definition cards for revision', color: 'bg-lime-50 text-lime-600 border-lime-200' },
    ],
  },
  {
    title: 'ASSESS',
    items: [
      { to: '/app/create/quiz', icon: HelpCircle, label: 'Quiz', description: 'Quick assessment with auto-marking', color: 'bg-amber-50 text-amber-600 border-amber-200' },
      { to: '/app/create/mock-test', icon: Timer, label: 'Mock Test', description: 'Full-length practice test with time limit', color: 'bg-rose-50 text-rose-600 border-rose-200' },
      { to: '/app/create/question-paper', icon: FileQuestion, label: 'Question Paper', description: 'Formal exam paper with sections and marks', color: 'bg-cyan-50 text-cyan-600 border-cyan-200' },
      { to: '/app/create/exam', icon: GraduationCap, label: 'Exam', description: 'Comprehensive exam with answer key', color: 'bg-fuchsia-50 text-fuchsia-600 border-fuchsia-200' },
    ],
  },
  {
    title: 'VISUALIZE',
    items: [
      { to: '/app/create/diagram', icon: Image, label: 'Diagram', description: 'Educational diagrams and illustrations', color: 'bg-pink-50 text-pink-600 border-pink-200' },
      { to: '/app/create/mind-map', icon: GitBranch, label: 'Mind Map', description: 'Topic exploration and concept mapping', color: 'bg-green-50 text-green-600 border-green-200' },
      { to: '/app/create/chart', icon: BarChart3, label: 'Chart', description: 'Data visualizations and graphs', color: 'bg-red-50 text-red-600 border-red-200' },
      { to: '/app/create/infographic', icon: Network, label: 'Infographic', description: 'Visual summaries and information design', color: 'bg-yellow-50 text-yellow-600 border-yellow-200' },
    ],
  },
];

export function CreatePage() {
  return (
    <div className="page-container max-w-5xl">
      <PageHeader
        title="Create"
        description="Choose what you'd like to create"
        icon={PlusCircle}
      />

      {/* Categories */}
      <div className="space-y-8">
        {categories.map((category, categoryIndex) => (
          <motion.div
            key={category.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: categoryIndex * 0.05 }}
          >
            <h3 className="text-label mb-3">{category.title}</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {category.items.map(({ to, icon: Icon, label, description, color }) => (
                <Link
                  key={label}
                  to={to}
                  className="card card-interactive p-4 group transition-all"
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color} mb-3 transition-transform group-hover:scale-105 shadow-2xs`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h4 className="font-semibold text-sm text-[var(--color-text-primary)] mb-1 group-hover:text-[var(--color-primary-600)] transition-colors">
                    {label}
                  </h4>
                  <p className="text-xs text-[var(--color-text-tertiary)] line-clamp-2 leading-relaxed">
                    {description}
                  </p>
                </Link>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
