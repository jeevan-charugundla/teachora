import { Edit2, CheckCircle2 } from 'lucide-react';
import type { CreationFormState, CreationMeta } from '../types/creationTypes';

interface CreationReviewCardProps {
  form: CreationFormState;
  meta: CreationMeta;
  onEdit: () => void;
  onGenerate?: () => void;
}

export function CreationReviewCard({ form, meta, onEdit }: CreationReviewCardProps) {
  const getSummaryItems = () => {
    const items: Array<{ label: string; value: string | number }> = [
      { label: 'Subject', value: form.subject },
      { label: 'Grade Level', value: form.grade },
      { label: 'Topic', value: form.topic },
      { label: 'Difficulty', value: form.difficulty },
      { label: 'Language', value: form.language },
    ];

    if (form.type === 'lesson') {
      items.push({ label: 'Duration', value: form.duration });
      items.push({ label: 'Teaching Style', value: form.teachingStyle });
    } else if (form.type === 'notes') {
      items.push({ label: 'Purpose', value: form.notesPurpose });
      items.push({ label: 'Depth', value: form.notesDepth });
    } else if (form.type === 'presentation') {
      items.push({ label: 'Number of Slides', value: `${form.slideCount} Slides` });
      items.push({ label: 'Visual Style', value: form.visualStyle });
    } else if (form.type === 'video') {
      items.push({ label: 'Target Duration', value: form.videoDuration });
      items.push({ label: 'Video Style', value: form.videoStyle });
    } else if (form.type === 'assignment' || form.type === 'worksheet') {
      items.push({ label: 'Questions', value: form.questionCount });
      items.push({ label: 'Total Marks', value: `${form.totalMarks} pts` });
      items.push({ label: 'Question Types', value: form.questionTypes.join(', ') });
    } else if (form.type === 'activity') {
      items.push({ label: 'Activity Type', value: form.activityType });
      items.push({ label: 'Duration', value: form.duration });
    } else if (form.type === 'flashcards') {
      items.push({ label: 'Card Count', value: `${form.flashcardCount} Cards` });
      items.push({ label: 'Format', value: form.flashcardType });
    } else if (form.type === 'quiz') {
      items.push({ label: 'Time Limit', value: form.quizTimeLimit });
    } else if (form.type === 'mock-test') {
      items.push({ label: 'Duration', value: form.mockDuration });
      items.push({ label: 'Marks', value: `${form.mockTotalMarks} pts` });
      items.push({ label: 'Distribution', value: `Easy: ${form.easyPercentage}%, Med: ${form.mediumPercentage}%, Hard: ${form.hardPercentage}%` });
    } else if (form.type === 'question-paper' || form.type === 'exam') {
      items.push({ label: 'Exam Title', value: form.examName });
      items.push({ label: 'Duration', value: form.examDuration });
      items.push({ label: 'Sections', value: `${form.sections.length} Sections` });
    } else if (form.type === 'chart') {
      items.push({ label: 'Chart Type', value: `${form.chartType} Chart` });
      items.push({ label: 'Data Points', value: `${form.chartData.length} entries` });
    } else if (form.type === 'diagram') {
      items.push({ label: 'Diagram Type', value: form.diagramType });
      items.push({ label: 'Visual Style', value: form.diagramStyle });
    } else if (form.type === 'mind-map') {
      items.push({ label: 'Layout', value: form.mindMapLayout });
      items.push({ label: 'Depth', value: form.mindMapDepth });
    } else if (form.type === 'infographic') {
      items.push({ label: 'Visual Style', value: form.infographicStyle });
      items.push({ label: 'Sections', value: `${form.infographicSections.length} Sections` });
    }

    if (form.additionalInstructions) {
      items.push({ label: 'Additional Focus', value: form.additionalInstructions });
    }

    return items;
  };

  const summaryItems = getSummaryItems();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
        <div>
          <h2 className="text-base font-bold text-[var(--color-text-primary)]">Review your creation</h2>
          <p className="text-xs text-[var(--color-text-tertiary)]">Double check your requirements before generating the preview.</p>
        </div>
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-elevated)] transition-colors"
        >
          <Edit2 className="h-3.5 w-3.5" /> Edit
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {summaryItems.map((item, idx) => (
          <div key={idx} className="p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)]/50">
            <span className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)] mb-1">
              {item.label}
            </span>
            <span className="block text-xs font-bold text-[var(--color-text-primary)] break-words">
              {item.value}
            </span>
          </div>
        ))}
      </div>

      <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-900 text-xs flex items-start gap-2.5">
        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold">Ready for Studio Preview</p>
          <p className="text-emerald-700 text-[11px] mt-0.5">
            Clicking generate will open the interactive {meta.title.toLowerCase()} workspace editor with your configured parameters.
          </p>
        </div>
      </div>
    </div>
  );
}
