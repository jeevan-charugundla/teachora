import { useState } from 'react';
import { Compass, Search, BookOpen, HelpCircle, FileSpreadsheet, Presentation, ClipboardList, Sparkles } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const categories = [
  { id: 'all', label: 'All' },
  { id: 'lessons', label: 'Lessons' },
  { id: 'quizzes', label: 'Quizzes' },
  { id: 'worksheets', label: 'Worksheets' },
  { id: 'assignments', label: 'Assignments' },
  { id: 'presentations', label: 'Presentations' },
  { id: 'activities', label: 'Activities' },
];

const featuredTemplates = [
  {
    title: 'Interactive Science Lesson',
    description: 'Engage students with hands-on experiments and guided discussion',
    subject: 'Science',
    grade: 'Grade 6-8',
    type: 'Lesson',
    icon: BookOpen,
    color: 'bg-blue-50 text-blue-600',
  },
  {
    title: '10-Question Quick Quiz',
    description: 'Rapid assessment template with multiple choice and short answer',
    subject: 'Any Subject',
    grade: 'Any Grade',
    type: 'Quiz',
    icon: HelpCircle,
    color: 'bg-amber-50 text-amber-600',
  },
  {
    title: 'Math Practice Worksheet',
    description: 'Progressive difficulty problems with worked examples',
    subject: 'Mathematics',
    grade: 'Grade 5-7',
    type: 'Worksheet',
    icon: FileSpreadsheet,
    color: 'bg-emerald-50 text-emerald-600',
  },
  {
    title: 'Topic Presentation',
    description: '10-slide presentation template with intro, body, and summary',
    subject: 'Any Subject',
    grade: 'Any Grade',
    type: 'Presentation',
    icon: Presentation,
    color: 'bg-orange-50 text-orange-600',
  },
  {
    title: 'Research Assignment',
    description: 'Structured research project with rubric and guidelines',
    subject: 'Any Subject',
    grade: 'Grade 8-12',
    type: 'Assignment',
    icon: ClipboardList,
    color: 'bg-violet-50 text-violet-600',
  },
  {
    title: 'Vocabulary Builder',
    description: 'Word lists, definitions, and usage exercises',
    subject: 'English',
    grade: 'Grade 4-8',
    type: 'Worksheet',
    icon: FileSpreadsheet,
    color: 'bg-teal-50 text-teal-600',
  },
];

export function DiscoverPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="page-container max-w-5xl">
      <PageHeader
        title="Discover"
        description="Browse templates and get inspired"
        icon={Compass}
      />

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-tertiary)]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search templates…"
          className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] pl-10 pr-4 py-2.5 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-primary-500)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20 transition-colors"
        />
      </div>

      {/* Categories */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
        {categories.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setActiveCategory(id)}
            className={cn(
              'rounded-full px-4 py-1.5 text-sm font-medium whitespace-nowrap transition-colors',
              activeCategory === id
                ? 'bg-[var(--color-primary-600)] text-white'
                : 'bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-text-primary)]'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Featured */}
      <div className="mb-6">
        <h3 className="text-label mb-3 flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-[var(--color-accent-500)]" />
          Featured Templates
        </h3>
      </div>

      {/* Template Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {featuredTemplates.map((template, i) => (
          <motion.button
            key={template.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: i * 0.04 }}
            className="card card-interactive p-4 text-left group"
            onClick={() => {/* Will navigate to create with template pre-filled */}}
          >
            <div className="flex items-start gap-3">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${template.color} transition-transform group-hover:scale-110`}>
                <template.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-semibold text-sm text-[var(--color-text-primary)] mb-0.5">{template.title}</h4>
                <p className="text-xs text-[var(--color-text-secondary)] line-clamp-2 mb-2">{template.description}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center rounded-md bg-[var(--color-surface-elevated)] px-2 py-0.5 text-[10px] font-medium text-[var(--color-text-tertiary)]">
                    {template.type}
                  </span>
                  <span className="inline-flex items-center rounded-md bg-[var(--color-surface-elevated)] px-2 py-0.5 text-[10px] font-medium text-[var(--color-text-tertiary)]">
                    {template.subject}
                  </span>
                  <span className="inline-flex items-center rounded-md bg-[var(--color-surface-elevated)] px-2 py-0.5 text-[10px] font-medium text-[var(--color-text-tertiary)]">
                    {template.grade}
                  </span>
                </div>
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
