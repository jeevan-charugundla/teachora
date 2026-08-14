import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Loader2, Sparkles } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { useAuthStore } from '@/stores/authStore';
import { generateContent } from '@/services/ai/client';
import { createProject } from '@/services/supabase/projects';
import { SUBJECTS, GRADE_LEVELS, DIFFICULTY_LEVELS } from '@/lib/constants';
import { GeneratingOverlay } from '@/components/feedback/GeneratingOverlay';
import type { LessonContent } from '@/types/content';
import { motion } from 'framer-motion';

export function LessonCreatePage() {
  const navigate = useNavigate();
  const { user, profile } = useAuthStore();

  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState(profile?.subjects?.[0] || '');
  const [grade, setGrade] = useState(profile?.grade_levels?.[0] || '');
  const [duration, setDuration] = useState('45');
  const [difficulty, setDifficulty] = useState('Medium');
  const [objectives, setObjectives] = useState('');
  const [additionalInstructions, setAdditionalInstructions] = useState('');

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [error, setError] = useState('');

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !topic.trim()) return;
    setError('');
    setIsGenerating(true);
    setGenerationStep(0);

    // Simulate progress steps
    const stepInterval = setInterval(() => {
      setGenerationStep((prev) => Math.min(prev + 1, 5));
    }, 2000);

    try {
      const response = await generateContent<LessonContent>({
        type: 'lesson',
        topic: topic.trim(),
        subject,
        grade,
        difficulty,
        duration: `${duration} minutes`,
        language: profile?.preferred_language || 'English',
        teaching_style: profile?.teaching_style || 'balanced',
        additional_instructions: [
          objectives && `Learning objectives: ${objectives}`,
          additionalInstructions,
        ]
          .filter(Boolean)
          .join('. '),
      });

      clearInterval(stepInterval);

      if (response.success && response.data) {
        // Save project
        const project = await createProject({
          user_id: user.id,
          title: response.data.title || topic,
          type: 'lesson',
          subject,
          grade,
          status: 'draft',
          content: response.data as unknown as Record<string, unknown>,
          metadata: { duration, difficulty },
          is_favorite: false,
        });

        navigate(`/app/lesson/${project.id}`, { replace: true });
      } else {
        setError(response.error || 'Generation failed. Please try again.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      clearInterval(stepInterval);
      setIsGenerating(false);
    }
  };

  return (
    <div className="page-container max-w-2xl">
      <PageHeader
        title="Create Lesson"
        description="Generate a complete lesson plan with AI"
        icon={BookOpen}
      />

      <GeneratingOverlay isVisible={isGenerating} step={generationStep} />

      <motion.form
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        onSubmit={handleGenerate}
        className="space-y-5"
      >
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Topic */}
        <div className="card p-5">
          <label htmlFor="lesson-topic" className="block text-sm font-semibold text-[var(--color-text-primary)] mb-1">
            Topic *
          </label>
          <p className="text-xs text-[var(--color-text-tertiary)] mb-2">What should the lesson be about?</p>
          <input
            id="lesson-topic"
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            required
            placeholder="e.g., Photosynthesis, Fractions, World War II"
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-primary-500)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20 transition-colors"
          />
        </div>

        {/* Subject & Grade */}
        <div className="grid grid-cols-2 gap-4">
          <div className="card p-5">
            <label htmlFor="lesson-subject" className="block text-sm font-semibold text-[var(--color-text-primary)] mb-1.5">
              Subject
            </label>
            <select
              id="lesson-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm text-[var(--color-text-primary)] focus:border-[var(--color-primary-500)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20 transition-colors"
            >
              <option value="">Select subject</option>
              {SUBJECTS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="card p-5">
            <label htmlFor="lesson-grade" className="block text-sm font-semibold text-[var(--color-text-primary)] mb-1.5">
              Grade Level
            </label>
            <select
              id="lesson-grade"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm text-[var(--color-text-primary)] focus:border-[var(--color-primary-500)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20 transition-colors"
            >
              <option value="">Select grade</option>
              {GRADE_LEVELS.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Duration & Difficulty */}
        <div className="grid grid-cols-2 gap-4">
          <div className="card p-5">
            <label htmlFor="lesson-duration" className="block text-sm font-semibold text-[var(--color-text-primary)] mb-1.5">
              Duration (minutes)
            </label>
            <input
              id="lesson-duration"
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              min={10}
              max={180}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm text-[var(--color-text-primary)] focus:border-[var(--color-primary-500)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20 transition-colors"
            />
          </div>

          <div className="card p-5">
            <label htmlFor="lesson-difficulty" className="block text-sm font-semibold text-[var(--color-text-primary)] mb-1.5">
              Difficulty
            </label>
            <select
              id="lesson-difficulty"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm text-[var(--color-text-primary)] focus:border-[var(--color-primary-500)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20 transition-colors"
            >
              {DIFFICULTY_LEVELS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Objectives */}
        <div className="card p-5">
          <label htmlFor="lesson-objectives" className="block text-sm font-semibold text-[var(--color-text-primary)] mb-1">
            Learning Objectives
          </label>
          <p className="text-xs text-[var(--color-text-tertiary)] mb-2">Optional — what should students learn?</p>
          <textarea
            id="lesson-objectives"
            value={objectives}
            onChange={(e) => setObjectives(e.target.value)}
            rows={3}
            placeholder="e.g., Students will understand the process of photosynthesis and identify its key stages"
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-primary-500)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20 transition-colors resize-none"
          />
        </div>

        {/* Additional Instructions */}
        <div className="card p-5">
          <label htmlFor="lesson-instructions" className="block text-sm font-semibold text-[var(--color-text-primary)] mb-1">
            Additional Instructions
          </label>
          <p className="text-xs text-[var(--color-text-tertiary)] mb-2">Optional — any specific requirements</p>
          <textarea
            id="lesson-instructions"
            value={additionalInstructions}
            onChange={(e) => setAdditionalInstructions(e.target.value)}
            rows={2}
            placeholder="e.g., Include a hands-on experiment, focus on visual learners"
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-primary-500)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20 transition-colors resize-none"
          />
        </div>

        {/* Generate Button */}
        <button
          type="submit"
          disabled={isGenerating || !topic.trim()}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-[var(--color-primary-600)] px-6 py-3 text-sm font-semibold text-white hover:bg-[var(--color-primary-700)] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Generating lesson…
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5" />
              Generate Lesson
            </>
          )}
        </button>
      </motion.form>
    </div>
  );
}
