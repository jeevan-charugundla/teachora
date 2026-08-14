import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  BookOpen,
  ArrowLeft,
  Download,
  Save,
  Star,
  Clock,
  Target,
  CheckCircle,
  Lightbulb,
  FileText,
  Loader2,
} from 'lucide-react';
import { getProject, updateProject, toggleFavorite } from '@/services/supabase/projects';
import { generateLessonPDF, downloadPDF } from '@/services/export/pdf';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';
import type { LessonContent } from '@/types/content';
import type { Project } from '@/types/database';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export function LessonEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [lesson, setLesson] = useState<LessonContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    const loadProject = async () => {
      if (!id) return;
      try {
        const p = await getProject(id);
        if (p) {
          setProject(p);
          setLesson(p.content as unknown as LessonContent);
        } else {
          setError('Project not found.');
        }
      } catch {
        setError('Failed to load project.');
      } finally {
        setIsLoading(false);
      }
    };
    loadProject();
  }, [id]);

  const handleSave = async () => {
    if (!project || !lesson) return;
    setIsSaving(true);
    try {
      await updateProject(project.id, {
        content: lesson as unknown as Record<string, unknown>,
        status: 'completed',
      });
      setSaveMessage('Saved');
      setTimeout(() => setSaveMessage(''), 2000);
    } catch {
      setSaveMessage('Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportPDF = async () => {
    if (!lesson) return;
    setIsExporting(true);
    try {
      const pdfBytes = await generateLessonPDF(lesson);
      const filename = `${(lesson.title || 'Lesson').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      downloadPDF(pdfBytes, filename);
    } catch (err) {
      console.error('PDF export error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!project) return;
    try {
      await toggleFavorite(project.id, !project.is_favorite);
      setProject({ ...project, is_favorite: !project.is_favorite });
    } catch {
      // Silently handle
    }
  };

  if (isLoading) {
    return <LoadingState message="Loading lesson…" className="min-h-screen" />;
  }

  if (error || !lesson) {
    return (
      <div className="page-container">
        <ErrorState
          message={error || 'Lesson not found'}
          onRetry={() => navigate('/app/workspace')}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Toolbar */}
      <div className="sticky top-0 z-20 border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 lg:px-6">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <Link
              to="/app/workspace"
              className="flex items-center gap-1 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Workspace</span>
            </Link>
            <div className="h-5 w-px bg-[var(--color-border)]" />
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-[var(--color-primary-600)]" />
              <span className="text-sm font-semibold truncate max-w-[200px] sm:max-w-none">
                {lesson.title}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {saveMessage && (
              <span className="text-xs text-[var(--color-success-600)] flex items-center gap-1">
                <CheckCircle className="h-3.5 w-3.5" />
                {saveMessage}
              </span>
            )}
            <button
              onClick={handleToggleFavorite}
              className={cn(
                'p-2 rounded-lg transition-colors',
                project?.is_favorite
                  ? 'text-[var(--color-accent-500)]'
                  : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-accent-500)]'
              )}
              title="Toggle favorite"
            >
              <Star className={cn('h-4 w-4', project?.is_favorite && 'fill-current')} />
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated)] transition-colors disabled:opacity-60"
            >
              {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              Save
            </button>
            <button
              onClick={handleExportPDF}
              disabled={isExporting}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--color-primary-600)] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[var(--color-primary-700)] transition-colors disabled:opacity-60"
            >
              {isExporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
              Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="page-container max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* Title & Meta */}
          <div className="card p-6">
            <h1 className="heading-1 text-2xl mb-3">{lesson.title}</h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--color-text-secondary)]">
              {lesson.subject && (
                <span className="flex items-center gap-1.5">
                  <FileText className="h-4 w-4" />
                  {lesson.subject}
                </span>
              )}
              {lesson.grade && (
                <span className="flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4" />
                  {lesson.grade}
                </span>
              )}
              {lesson.duration && (
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  {lesson.duration}
                </span>
              )}
              {lesson.difficulty && (
                <span className="inline-flex items-center rounded-md bg-[var(--color-surface-elevated)] px-2 py-0.5 text-xs font-medium">
                  {lesson.difficulty}
                </span>
              )}
            </div>
          </div>

          {/* Objectives */}
          {lesson.objectives?.length > 0 && (
            <div className="card p-6">
              <h2 className="heading-3 flex items-center gap-2 mb-4">
                <Target className="h-5 w-5 text-[var(--color-primary-600)]" />
                Learning Objectives
              </h2>
              <ul className="space-y-2">
                {lesson.objectives.map((obj, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-[var(--color-text-primary)]">
                    <CheckCircle className="h-4 w-4 mt-0.5 shrink-0 text-[var(--color-success-500)]" />
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Introduction */}
          {lesson.introduction && (
            <div className="card p-6">
              <h2 className="heading-3 mb-3">Introduction</h2>
              <p className="text-sm text-[var(--color-text-primary)] leading-relaxed">{lesson.introduction}</p>
            </div>
          )}

          {/* Sections */}
          {lesson.sections?.map((section, i) => (
            <div key={i} className="card p-6">
              <h2 className="heading-3 mb-3">{section.heading}</h2>
              <p className="text-sm text-[var(--color-text-primary)] leading-relaxed mb-4">{section.content}</p>

              {section.key_points && section.key_points.length > 0 && (
                <div className="rounded-lg bg-[var(--color-primary-50)] p-4 mb-3">
                  <h4 className="text-xs font-semibold text-[var(--color-primary-700)] mb-2 uppercase tracking-wide">Key Points</h4>
                  <ul className="space-y-1.5">
                    {section.key_points.map((point, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-[var(--color-primary-800)]">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[var(--color-primary-500)] shrink-0" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {section.examples && section.examples.length > 0 && (
                <div className="rounded-lg bg-amber-50 p-4">
                  <h4 className="text-xs font-semibold text-amber-700 mb-2 uppercase tracking-wide">Examples</h4>
                  <ul className="space-y-1.5">
                    {section.examples.map((example, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-amber-800">
                        <Lightbulb className="h-4 w-4 mt-0.5 shrink-0 text-amber-500" />
                        {example}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}

          {/* Activities */}
          {lesson.activities?.length > 0 && (
            <div className="card p-6">
              <h2 className="heading-3 flex items-center gap-2 mb-4">
                <Lightbulb className="h-5 w-5 text-[var(--color-accent-500)]" />
                Activities
              </h2>
              <div className="space-y-5">
                {lesson.activities.map((activity, i) => (
                  <div key={i} className="rounded-lg border border-[var(--color-border)] p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-sm text-[var(--color-text-primary)]">{activity.name}</h3>
                      <span className="text-xs text-[var(--color-text-tertiary)] flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {activity.duration}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--color-text-secondary)] mb-3">{activity.description}</p>
                    {activity.instructions?.length > 0 && (
                      <ol className="space-y-1.5">
                        {activity.instructions.map((step, j) => (
                          <li key={j} className="flex items-start gap-2 text-sm text-[var(--color-text-primary)]">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-surface-elevated)] text-[10px] font-bold text-[var(--color-text-tertiary)]">
                              {j + 1}
                            </span>
                            {step}
                          </li>
                        ))}
                      </ol>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Assessment */}
          {lesson.assessment?.questions?.length > 0 && (
            <div className="card p-6">
              <h2 className="heading-3 flex items-center gap-2 mb-4">
                <Target className="h-5 w-5 text-[var(--color-primary-600)]" />
                Assessment
              </h2>
              <div className="space-y-4">
                {lesson.assessment.questions.map((q, i) => (
                  <div key={i} className="rounded-lg border border-[var(--color-border)] p-4">
                    <p className="font-medium text-sm text-[var(--color-text-primary)] mb-2">
                      {i + 1}. {q.question}
                    </p>
                    {q.options && (
                      <div className="space-y-1.5 ml-4">
                        {q.options.map((opt, j) => (
                          <div
                            key={j}
                            className={cn(
                              'text-sm px-3 py-1.5 rounded-md',
                              opt === q.correct_answer
                                ? 'bg-green-50 text-green-700 font-medium'
                                : 'text-[var(--color-text-secondary)]'
                            )}
                          >
                            {String.fromCharCode(65 + j)}. {opt}
                          </div>
                        ))}
                      </div>
                    )}
                    {q.explanation && (
                      <p className="mt-2 text-xs text-[var(--color-text-tertiary)] italic">
                        💡 {q.explanation}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Summary */}
          {lesson.summary && (
            <div className="card p-6">
              <h2 className="heading-3 mb-3">Summary</h2>
              <p className="text-sm text-[var(--color-text-primary)] leading-relaxed">{lesson.summary}</p>
            </div>
          )}

          {/* Homework */}
          {lesson.homework && (
            <div className="card p-6">
              <h2 className="heading-3 mb-3">Homework</h2>
              <p className="text-sm text-[var(--color-text-primary)] leading-relaxed">{lesson.homework}</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
