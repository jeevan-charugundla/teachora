import { Edit2, CheckCircle2 } from 'lucide-react';
import type { CreationFormState, CreationMeta } from '../types/creationTypes';

interface CreationReviewCardProps {
  form: CreationFormState;
  meta: CreationMeta;
  onEdit: () => void;
  onGenerate?: () => void;
}

const VISUAL_TYPES = ['diagram', 'mind-map', 'chart', 'infographic'] as const;

export function CreationReviewCard({ form, meta, onEdit }: CreationReviewCardProps) {
  const isVisualType = (VISUAL_TYPES as readonly string[]).includes(form.type);

  const getSummaryItems = () => {
    // ── Common baseline (shared by all types) ──────────────────────────────────
    const items: Array<{ label: string; value: string | number }> = [
      { label: 'Subject', value: form.subject },
      { label: 'Grade Level', value: form.grade },
      { label: 'Topic', value: form.topic },
    ];

    // Difficulty only for non-visual types
    if (!isVisualType) {
      items.push({ label: 'Difficulty', value: form.difficulty });
    }

    items.push({ label: 'Language', value: form.language });

    // ── Type-specific fields ───────────────────────────────────────────────────
    switch (form.type) {
      // ─ TEACH ─────────────────────────────────────────────────────────────────
      case 'lesson':
        items.push(
          { label: 'Lesson Type', value: form.lessonType },
          { label: 'Duration', value: form.duration },
          { label: 'Teaching Approach', value: form.teachingStyle },
        );
        if (form.learningObjectives) {
          items.push({ label: 'Objectives', value: form.learningObjectives });
        }
        if (form.lessonIncludes?.length) {
          items.push({ label: 'Includes', value: form.lessonIncludes.join(', ') });
        }
        break;

      case 'notes':
        items.push(
          { label: 'Purpose', value: form.notesPurpose },
          { label: 'Depth', value: form.notesDepth },
        );
        if (form.notesIncludes?.length) {
          items.push({ label: 'Includes', value: form.notesIncludes.join(', ') });
        }
        break;

      case 'presentation':
        items.push(
          { label: 'Number of Slides', value: `${form.slideCount} Slides` },
          { label: 'Presentation Purpose', value: form.presentationPurpose },
          { label: 'Visual Style', value: form.visualStyle },
          { label: 'Speaker Notes', value: form.presentationSpeakerNotes ? 'On' : 'Off' },
          { label: 'Visual Source', value: form.presentationVisualSource },
        );
        if (form.presentationIncludes?.length) {
          items.push({ label: 'Includes', value: form.presentationIncludes.join(', ') });
        }
        break;

      case 'video':
        items.push(
          { label: 'Duration', value: form.videoDuration },
          { label: 'Video Style', value: form.videoStyle },
          { label: 'Narration Style', value: form.videoNarrationStyle },
          { label: 'Visual Style', value: form.videoVisualStyle },
          { label: 'Visual Source', value: form.videoVisualSource },
        );
        if (form.videoIncludes?.length) {
          items.push({ label: 'Includes', value: form.videoIncludes.join(', ') });
        }
        break;

      // ─ PRACTICE ──────────────────────────────────────────────────────────────
      case 'assignment':
        items.push(
          { label: 'Assignment Type', value: form.assignmentType },
          { label: 'Number of Questions', value: form.questionCount },
          { label: 'Total Marks', value: `${form.totalMarks} pts` },
          { label: 'Question Types', value: form.questionTypes.join(', ') },
          { label: 'Rubric', value: form.assignmentIncludeRubric ? 'Included' : 'Not included' },
          { label: 'Answer Key', value: form.assignmentIncludeAnswerKey ? 'Included' : 'Not included' },
        );
        break;

      case 'worksheet':
        items.push(
          { label: 'Purpose', value: form.worksheetPurpose },
          { label: 'Number of Questions', value: form.worksheetQuestionCount },
          { label: 'Layout Style', value: form.worksheetStyle },
          { label: 'Question Types', value: form.worksheetQuestionTypes.join(', ') },
          { label: 'Answer Key', value: form.worksheetIncludeAnswerKey ? 'Included' : 'Not included' },
        );
        break;

      case 'activity':
        items.push(
          { label: 'Activity Format', value: form.activityType },
          { label: 'Activity Kind', value: form.activityKind },
          { label: 'Duration', value: form.activityDuration },
        );
        if (form.activityObjective) {
          items.push({ label: 'Teaching Objective', value: form.activityObjective });
        }
        if (form.activityIncludes?.length) {
          items.push({ label: 'Includes', value: form.activityIncludes.join(', ') });
        }
        break;

      case 'flashcards':
        items.push(
          { label: 'Number of Cards', value: `${form.flashcardCount} Cards` },
          { label: 'Card Format', value: form.flashcardType },
          { label: 'Difficulty', value: form.flashcardDifficulty },
        );
        if (form.flashcardIncludes?.length) {
          items.push({ label: 'Add to Each Card', value: form.flashcardIncludes.join(', ') });
        }
        break;

      // ─ ASSESS ────────────────────────────────────────────────────────────────
      case 'quiz':
        items.push(
          { label: 'Number of Questions', value: form.quizQuestionCount },
          { label: 'Question Types', value: form.quizQuestionTypes.join(', ') },
          { label: 'Time Limit', value: form.quizTimeLimit },
          { label: 'Include Explanations', value: form.quizIncludeExplanations ? 'Yes' : 'No' },
          { label: 'Randomize Questions', value: form.quizRandomize ? 'Yes' : 'No' },
        );
        break;

      case 'mock-test':
        items.push(
          { label: 'Duration', value: form.mockDuration },
          { label: 'Total Marks', value: `${form.mockTotalMarks} pts` },
          { label: 'Difficulty Distribution', value: `Easy ${form.easyPercentage}% / Med ${form.mediumPercentage}% / Hard ${form.hardPercentage}%` },
          { label: 'Question Types', value: form.mockQuestionTypes.join(', ') },
        );
        if (form.mockIncludes?.length) {
          items.push({ label: 'Includes', value: form.mockIncludes.join(', ') });
        }
        break;

      case 'question-paper':
        items.push(
          { label: 'Paper Name', value: form.examName },
          { label: 'Duration', value: form.examDuration },
          { label: 'Total Marks', value: `${form.examTotalMarks} pts` },
          { label: 'Sections', value: `${form.sections.length} Sections` },
        );
        if (form.sections.length > 0) {
          items.push({ label: 'Section Breakdown', value: form.sections.map((s) => `${s.name} (${s.questionCount}Q × ${s.marksPerQuestion}m)`).join(' | ') });
        }
        break;

      case 'exam':
        items.push(
          { label: 'Exam Name', value: form.examName },
          { label: 'Duration', value: form.examDuration },
          { label: 'Total Marks', value: `${form.examTotalMarks} pts` },
          { label: 'Sections', value: `${form.sections.length} Sections` },
        );
        if (form.examIncludes?.length) {
          items.push({ label: 'Includes', value: form.examIncludes.join(', ') });
        }
        break;

      // ─ VISUALIZE ─────────────────────────────────────────────────────────────
      case 'diagram':
        items.push(
          { label: 'Diagram Type', value: form.diagramType },
          { label: 'Visual Style', value: form.diagramStyle },
          { label: 'Orientation', value: form.diagramOrientation },
          { label: 'Visual Method', value: form.diagramVisualMethod },
          { label: 'Include Labels', value: form.diagramIncludeLabels ? 'Yes' : 'No' },
          { label: 'Include Explanations', value: form.diagramIncludeExplanations ? 'Yes' : 'No' },
        );
        if (form.diagramGoal) {
          items.push({ label: 'Explanation', value: form.diagramGoal });
        }
        if (form.diagramSpecificElements) {
          items.push({ label: 'Elements', value: form.diagramSpecificElements });
        }
        break;

      case 'mind-map':
        items.push(
          { label: 'Main Branches', value: form.mindMapBranchCount },
          { label: 'Depth', value: form.mindMapDepth },
          { label: 'Layout', value: form.mindMapLayout },
          { label: 'Visual Style', value: form.mindMapStyle },
        );
        if (form.mindMapCentralTopic) {
          items.push({ label: 'Central Topic', value: form.mindMapCentralTopic });
        }
        if (form.mindMapIncludes?.length) {
          items.push({ label: 'Include in Nodes', value: form.mindMapIncludes.join(', ') });
        }
        break;

      case 'chart':
        items.push(
          { label: 'Chart Type', value: `${form.chartType} Chart` },
          { label: 'Data Source', value: form.chartHasData ? 'Teacher-provided data' : 'AI-generated data' },
          { label: 'Show Values', value: form.chartShowValues ? 'Yes' : 'No' },
          { label: 'Show Legend', value: form.chartShowLegend ? 'Yes' : 'No' },
        );
        if (form.chartPurpose) {
          items.push({ label: 'Visualization', value: form.chartPurpose });
        }
        if (form.chartTitle) {
          items.push({ label: 'Chart Title', value: form.chartTitle });
        }
        if (form.chartHasData) {
          items.push({ label: 'Data Points', value: `${form.chartData.length} entries` });
        }
        if (form.chartXAxisLabel) {
          items.push({ label: 'X-Axis', value: form.chartXAxisLabel });
        }
        if (form.chartYAxisLabel) {
          items.push({ label: 'Y-Axis', value: form.chartYAxisLabel });
        }
        break;

      case 'infographic':
        items.push(
          { label: 'Purpose', value: form.infographicPurpose },
          { label: 'Orientation', value: form.infographicOrientation },
          { label: 'Visual Style', value: form.infographicStyle },
          { label: 'Number of Sections', value: form.infographicSectionCount },
          { label: 'Visual Source', value: form.infographicVisualSource },
        );
        if (form.infographicGoal) {
          items.push({ label: 'Explanation', value: form.infographicGoal });
        }
        if (form.infographicIncludes?.length) {
          items.push({ label: 'Includes', value: form.infographicIncludes.join(', ') });
        }
        break;
    }

    // Additional instructions (all types)
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
