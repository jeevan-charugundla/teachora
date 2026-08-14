import { Plus, Trash2 } from 'lucide-react';
import type { CreationFormState, QuestionPaperSection } from '../../types/creationTypes';

interface TypeSpecificCustomFormProps {
  form: CreationFormState;
  onChange: <K extends keyof CreationFormState>(key: K, value: CreationFormState[K]) => void;
  errors?: Record<string, string>;
}

// Reusable chip-toggle helper
function ChipGroup({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string;
  options: string[];
  selected: string | string[];
  onToggle: (item: string) => void;
  multi?: boolean;
}) {
  const isSelected = (item: string) =>
    Array.isArray(selected) ? selected.includes(item) : selected === item;

  return (
    <div>
      <label className="block text-xs font-bold text-[var(--color-text-primary)] mb-2 uppercase tracking-wider">
        {label}
      </label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            type="button"
            key={opt}
            onClick={() => onToggle(opt)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              isSelected(opt)
                ? 'bg-[var(--color-primary-600)] text-white border-[var(--color-primary-600)] shadow-xs'
                : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary-300)]'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function ToggleButton({
  label,
  checked,
  onToggle,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
        checked
          ? 'bg-[var(--color-primary-600)] text-white border-[var(--color-primary-600)]'
          : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-secondary)]'
      }`}
    >
      <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${checked ? 'bg-white/30 border-white/50' : 'border-[var(--color-border)]'}`}>
        {checked && <span className="text-white text-[10px]">✓</span>}
      </span>
      {label}
    </button>
  );
}

export function TypeSpecificCustomForm({ form, onChange, errors }: TypeSpecificCustomFormProps) {
  // Helpers
  const toggleMulti = (list: string[], item: string, key: keyof CreationFormState) => {
    const updated = list.includes(item) ? list.filter((i) => i !== item) : [...list, item];
    onChange(key, updated as unknown as CreationFormState[keyof CreationFormState]);
  };

  switch (form.type) {
    // ═══════════════════════════════════════════════════════════════════════════
    // 1. LESSON
    // ═══════════════════════════════════════════════════════════════════════════
    case 'lesson': {
      const lessonTypes = ['Introduction', 'Concept', 'Skill-building', 'Review', 'Application'];
      const durations = ['15 min', '30 min', '45 min', '60 min', '90 min'];
      const styles = ['Interactive', 'Discussion-based', 'Activity-based', 'Lecture + Practice', 'Project-based'];
      const inclusions = ['Learning objectives', 'Key concepts', 'Teaching steps', 'Classroom activity', 'Assessment', 'Homework'];

      return (
        <div className="space-y-6">
          <ChipGroup
            label="Lesson Type"
            options={lessonTypes}
            selected={form.lessonType}
            onToggle={(v) => onChange('lessonType', v as CreationFormState['lessonType'])}
            multi={false}
          />
          <ChipGroup
            label="Lesson Duration"
            options={durations}
            selected={form.duration}
            onToggle={(v) => onChange('duration', v)}
            multi={false}
          />
          <ChipGroup
            label="Teaching Approach"
            options={styles}
            selected={form.teachingStyle}
            onToggle={(v) => onChange('teachingStyle', v)}
            multi={false}
          />
          <div>
            <label className="block text-xs font-bold text-[var(--color-text-primary)] mb-1.5 uppercase tracking-wider">
              Learning Objectives <span className="text-[10px] font-normal text-[var(--color-text-tertiary)]">(Optional)</span>
            </label>
            <textarea
              rows={2}
              value={form.learningObjectives}
              onChange={(e) => onChange('learningObjectives', e.target.value)}
              placeholder="e.g. Students will be able to explain the equation of photosynthesis and label a chloroplast diagram."
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-primary-500)] resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[var(--color-text-primary)] mb-2 uppercase tracking-wider">
              Include in Lesson
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {inclusions.map((item) => (
                <label
                  key={item}
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-xs text-[var(--color-text-primary)] cursor-pointer hover:bg-[var(--color-surface-elevated)] transition-colors"
                >
                  <input type="checkbox" defaultChecked={true} className="rounded text-[var(--color-primary-600)]" />
                  <span>{item}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 2. NOTES
    // ═══════════════════════════════════════════════════════════════════════════
    case 'notes': {
      const purposes = ['Teacher Notes', 'Student Notes', 'Revision Notes', 'Exam Preparation'];
      const depths = ['Quick', 'Standard', 'Detailed'];
      const inclusions = ['Definitions', 'Key concepts', 'Examples', 'Important points', 'Common mistakes', 'Summary', 'Misconceptions'];

      return (
        <div className="space-y-6">
          <ChipGroup
            label="Notes Purpose"
            options={purposes}
            selected={form.notesPurpose}
            onToggle={(v) => onChange('notesPurpose', v as CreationFormState['notesPurpose'])}
            multi={false}
          />
          <ChipGroup
            label="Depth"
            options={depths}
            selected={form.notesDepth}
            onToggle={(v) => onChange('notesDepth', v as CreationFormState['notesDepth'])}
            multi={false}
          />
          <div>
            <label className="block text-xs font-bold text-[var(--color-text-primary)] mb-2 uppercase tracking-wider">Include in Notes</label>
            <div className="flex flex-wrap gap-2">
              {inclusions.map((item) => (
                <button
                  type="button"
                  key={item}
                  onClick={() => toggleMulti(form.notesIncludes, item, 'notesIncludes')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    form.notesIncludes.includes(item)
                      ? 'bg-[var(--color-primary-600)] text-white border-[var(--color-primary-600)]'
                      : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-secondary)]'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 3. PRESENTATION
    // ═══════════════════════════════════════════════════════════════════════════
    case 'presentation': {
      const counts = ['5', '8', '10', '12', '15', '20'];
      const purposes = ['Teach a concept', 'Introduce a topic', 'Review & revision', 'Project presentation', 'Parent meeting'];
      const styles = ['Clean', 'Academic', 'Modern', 'Playful', 'Minimal'];
      const inclusions = ['Title slide', 'Learning objectives', 'Concept slides', 'Examples', 'Discussion questions', 'Summary', 'Quiz slide', 'References'];
      const visualSources = ['Auto', 'Stock', 'AI', 'None'];

      return (
        <div className="space-y-6">
          <ChipGroup
            label="Number of Slides"
            options={counts}
            selected={form.slideCount}
            onToggle={(v) => onChange('slideCount', v)}
            multi={false}
          />
          <ChipGroup
            label="Presentation Purpose"
            options={purposes}
            selected={form.presentationPurpose}
            onToggle={(v) => onChange('presentationPurpose', v as CreationFormState['presentationPurpose'])}
            multi={false}
          />
          <ChipGroup
            label="Visual Style"
            options={styles}
            selected={form.visualStyle}
            onToggle={(v) => onChange('visualStyle', v as CreationFormState['visualStyle'])}
            multi={false}
          />
          <div>
            <label className="block text-xs font-bold text-[var(--color-text-primary)] mb-2 uppercase tracking-wider">Include in Slides</label>
            <div className="flex flex-wrap gap-2">
              {inclusions.map((item) => (
                <button
                  type="button"
                  key={item}
                  onClick={() => toggleMulti(form.presentationIncludes, item, 'presentationIncludes')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    form.presentationIncludes.includes(item)
                      ? 'bg-[var(--color-primary-600)] text-white border-[var(--color-primary-600)]'
                      : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-secondary)]'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ToggleButton
              label="Speaker Notes"
              checked={form.presentationSpeakerNotes}
              onToggle={() => onChange('presentationSpeakerNotes', !form.presentationSpeakerNotes)}
            />
          </div>
          <ChipGroup
            label="Visual Source"
            options={visualSources}
            selected={form.presentationVisualSource}
            onToggle={(v) => onChange('presentationVisualSource', v as CreationFormState['presentationVisualSource'])}
            multi={false}
          />
        </div>
      );
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 4. VIDEO
    // ═══════════════════════════════════════════════════════════════════════════
    case 'video': {
      const durations = ['1 min', '2 min', '3 min', '5 min', '8 min', '10 min'];
      const styles = ['Explainer', 'Story-based', 'Whiteboard', 'Presentation', 'Animated concept'];
      const narrationStyles = ['Formal', 'Conversational', 'Step-by-step', 'Question-led'];
      const visualStyles = ['Animated', 'Live footage', 'Diagrams', 'Mixed'];
      const visualSources = ['Stock Library', 'Teachora Visual AI', 'Auto'];
      const inclusions = ['Narration script', 'Scene breakdown', 'On-screen text', 'Visual suggestions', 'Teacher notes', 'Timestamps'];

      return (
        <div className="space-y-6">
          <ChipGroup
            label="Video Duration"
            options={durations}
            selected={form.videoDuration}
            onToggle={(v) => onChange('videoDuration', v)}
            multi={false}
          />
          <ChipGroup
            label="Video Style"
            options={styles}
            selected={form.videoStyle}
            onToggle={(v) => onChange('videoStyle', v as CreationFormState['videoStyle'])}
            multi={false}
          />
          <ChipGroup
            label="Narration Style"
            options={narrationStyles}
            selected={form.videoNarrationStyle}
            onToggle={(v) => onChange('videoNarrationStyle', v as CreationFormState['videoNarrationStyle'])}
            multi={false}
          />
          <ChipGroup
            label="Visual Style"
            options={visualStyles}
            selected={form.videoVisualStyle}
            onToggle={(v) => onChange('videoVisualStyle', v as CreationFormState['videoVisualStyle'])}
            multi={false}
          />
          <ChipGroup
            label="Visual Source"
            options={visualSources}
            selected={form.videoVisualSource}
            onToggle={(v) => onChange('videoVisualSource', v as CreationFormState['videoVisualSource'])}
            multi={false}
          />
          <div>
            <label className="block text-xs font-bold text-[var(--color-text-primary)] mb-2 uppercase tracking-wider">Include in Storyboard</label>
            <div className="flex flex-wrap gap-2">
              {inclusions.map((item) => (
                <button
                  type="button"
                  key={item}
                  onClick={() => toggleMulti(form.videoIncludes, item, 'videoIncludes')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    form.videoIncludes.includes(item)
                      ? 'bg-[var(--color-primary-600)] text-white border-[var(--color-primary-600)]'
                      : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-secondary)]'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 5. ASSIGNMENT
    // ═══════════════════════════════════════════════════════════════════════════
    case 'assignment': {
      const assignTypes = ['Homework', 'Classwork', 'Practice', 'Research', 'Project'];
      const qCounts = ['5', '8', '10', '12', '15', '20'];
      const qTypes = ['MCQ', 'True/False', 'Fill in blanks', 'Short answer', 'Long answer', 'Match the following', 'Diagram-based'];
      const markOptions = ['10', '20', '25', '30', '40', '50', '100'];

      return (
        <div className="space-y-6">
          <ChipGroup
            label="Assignment Type"
            options={assignTypes}
            selected={form.assignmentType}
            onToggle={(v) => onChange('assignmentType', v as CreationFormState['assignmentType'])}
            multi={false}
          />
          <ChipGroup
            label="Number of Questions"
            options={qCounts}
            selected={form.questionCount}
            onToggle={(v) => onChange('questionCount', v)}
            multi={false}
          />
          <div>
            <label className="block text-xs font-bold text-[var(--color-text-primary)] mb-2 uppercase tracking-wider">Question Types</label>
            <div className="flex flex-wrap gap-2">
              {qTypes.map((item) => (
                <button
                  type="button"
                  key={item}
                  onClick={() => toggleMulti(form.questionTypes, item, 'questionTypes')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    form.questionTypes.includes(item)
                      ? 'bg-[var(--color-primary-600)] text-white border-[var(--color-primary-600)]'
                      : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-secondary)]'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
          <ChipGroup
            label="Total Marks"
            options={markOptions}
            selected={form.totalMarks}
            onToggle={(v) => onChange('totalMarks', v)}
            multi={false}
          />
          <div className="flex items-center gap-3">
            <ToggleButton
              label="Include Rubric"
              checked={form.assignmentIncludeRubric}
              onToggle={() => onChange('assignmentIncludeRubric', !form.assignmentIncludeRubric)}
            />
            <ToggleButton
              label="Include Answer Key"
              checked={form.assignmentIncludeAnswerKey}
              onToggle={() => onChange('assignmentIncludeAnswerKey', !form.assignmentIncludeAnswerKey)}
            />
          </div>
        </div>
      );
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 6. WORKSHEET
    // ═══════════════════════════════════════════════════════════════════════════
    case 'worksheet': {
      const purposes = ['Practice', 'Revision', 'Assessment', 'Homework'];
      const qCounts = ['5', '8', '10', '12', '15'];
      const qTypes = ['Fill in blanks', 'MCQ', 'True/False', 'Short answer', 'Match the following', 'Label the diagram'];
      const layoutStyles = ['Minimal', 'Classroom', 'Exam-style', 'Practice-focused'];

      return (
        <div className="space-y-6">
          <ChipGroup
            label="Worksheet Purpose"
            options={purposes}
            selected={form.worksheetPurpose}
            onToggle={(v) => onChange('worksheetPurpose', v as CreationFormState['worksheetPurpose'])}
            multi={false}
          />
          <ChipGroup
            label="Number of Questions"
            options={qCounts}
            selected={form.worksheetQuestionCount}
            onToggle={(v) => onChange('worksheetQuestionCount', v)}
            multi={false}
          />
          <div>
            <label className="block text-xs font-bold text-[var(--color-text-primary)] mb-2 uppercase tracking-wider">Question Types</label>
            <div className="flex flex-wrap gap-2">
              {qTypes.map((item) => (
                <button
                  type="button"
                  key={item}
                  onClick={() => toggleMulti(form.worksheetQuestionTypes, item, 'worksheetQuestionTypes')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    form.worksheetQuestionTypes.includes(item)
                      ? 'bg-[var(--color-primary-600)] text-white border-[var(--color-primary-600)]'
                      : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-secondary)]'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
          <ChipGroup
            label="Layout Style"
            options={layoutStyles}
            selected={form.worksheetStyle}
            onToggle={(v) => onChange('worksheetStyle', v as CreationFormState['worksheetStyle'])}
            multi={false}
          />
          <ToggleButton
            label="Include Answer Key"
            checked={form.worksheetIncludeAnswerKey}
            onToggle={() => onChange('worksheetIncludeAnswerKey', !form.worksheetIncludeAnswerKey)}
          />
        </div>
      );
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 7. ACTIVITY
    // ═══════════════════════════════════════════════════════════════════════════
    case 'activity': {
      const groupTypes = ['Individual', 'Pair', 'Group', 'Whole class'];
      const actKinds = ['Hands-on', 'Discussion', 'Game', 'Experiment', 'Creative', 'Research'];
      const durations = ['10 min', '15 min', '20 min', '30 min', '45 min'];
      const inclusions = ['Materials required', 'Instructions', 'Teacher steps', 'Student steps', 'Expected outcome', 'Reflection questions'];

      return (
        <div className="space-y-6">
          <ChipGroup
            label="Activity Format"
            options={groupTypes}
            selected={form.activityType}
            onToggle={(v) => onChange('activityType', v as CreationFormState['activityType'])}
            multi={false}
          />
          <ChipGroup
            label="Activity Kind"
            options={actKinds}
            selected={form.activityKind}
            onToggle={(v) => onChange('activityKind', v as CreationFormState['activityKind'])}
            multi={false}
          />
          <ChipGroup
            label="Duration"
            options={durations}
            selected={form.activityDuration}
            onToggle={(v) => onChange('activityDuration', v)}
            multi={false}
          />
          <div>
            <label className="block text-xs font-bold text-[var(--color-text-primary)] mb-1.5 uppercase tracking-wider">
              Teaching Objective <span className="text-[10px] font-normal text-[var(--color-text-tertiary)]">(Optional)</span>
            </label>
            <input
              type="text"
              value={form.activityObjective}
              onChange={(e) => onChange('activityObjective', e.target.value)}
              placeholder="e.g. Help students understand osmosis through a potato experiment"
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm outline-none focus:border-[var(--color-primary-500)]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[var(--color-text-primary)] mb-2 uppercase tracking-wider">Include</label>
            <div className="flex flex-wrap gap-2">
              {inclusions.map((item) => (
                <button
                  type="button"
                  key={item}
                  onClick={() => toggleMulti(form.activityIncludes, item, 'activityIncludes')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    form.activityIncludes.includes(item)
                      ? 'bg-[var(--color-primary-600)] text-white border-[var(--color-primary-600)]'
                      : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-secondary)]'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 8. FLASHCARDS
    // ═══════════════════════════════════════════════════════════════════════════
    case 'flashcards': {
      const counts = ['10', '15', '20', '25', '30', '40'];
      const cardTypes = ['Term → Definition', 'Question → Answer', 'Concept → Example', 'Mixed'];
      const diffs = ['Easy', 'Mixed', 'Challenging'];
      const inclusions = ['Examples', 'Important note', 'Mnemonic', 'Hint', 'Context sentence'];

      return (
        <div className="space-y-6">
          <ChipGroup
            label="Number of Cards"
            options={counts}
            selected={form.flashcardCount}
            onToggle={(v) => onChange('flashcardCount', v)}
            multi={false}
          />
          <ChipGroup
            label="Card Format"
            options={cardTypes}
            selected={form.flashcardType}
            onToggle={(v) => onChange('flashcardType', v as CreationFormState['flashcardType'])}
            multi={false}
          />
          <ChipGroup
            label="Difficulty"
            options={diffs}
            selected={form.flashcardDifficulty}
            onToggle={(v) => onChange('flashcardDifficulty', v as CreationFormState['flashcardDifficulty'])}
            multi={false}
          />
          <div>
            <label className="block text-xs font-bold text-[var(--color-text-primary)] mb-2 uppercase tracking-wider">Add to Each Card</label>
            <div className="flex flex-wrap gap-2">
              {inclusions.map((item) => (
                <button
                  type="button"
                  key={item}
                  onClick={() => toggleMulti(form.flashcardIncludes, item, 'flashcardIncludes')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    form.flashcardIncludes.includes(item)
                      ? 'bg-[var(--color-primary-600)] text-white border-[var(--color-primary-600)]'
                      : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-secondary)]'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 9. QUIZ
    // ═══════════════════════════════════════════════════════════════════════════
    case 'quiz': {
      const qCounts = ['5', '8', '10', '12', '15', '20'];
      const qTypes = ['MCQ', 'True/False', 'Fill in blanks', 'Short answer', 'Match the following'];
      const timeLimits = ['No limit', '5 min', '10 min', '15 min', '20 min', '30 min'];

      return (
        <div className="space-y-6">
          <ChipGroup
            label="Number of Questions"
            options={qCounts}
            selected={form.quizQuestionCount}
            onToggle={(v) => onChange('quizQuestionCount', v)}
            multi={false}
          />
          <div>
            <label className="block text-xs font-bold text-[var(--color-text-primary)] mb-2 uppercase tracking-wider">Question Types</label>
            <div className="flex flex-wrap gap-2">
              {qTypes.map((item) => (
                <button
                  type="button"
                  key={item}
                  onClick={() => toggleMulti(form.quizQuestionTypes, item, 'quizQuestionTypes')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    form.quizQuestionTypes.includes(item)
                      ? 'bg-[var(--color-primary-600)] text-white border-[var(--color-primary-600)]'
                      : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-secondary)]'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
          <ChipGroup
            label="Time Limit"
            options={timeLimits}
            selected={form.quizTimeLimit}
            onToggle={(v) => onChange('quizTimeLimit', v)}
            multi={false}
          />
          <div className="flex items-center gap-3 flex-wrap">
            <ToggleButton
              label="Include Explanations"
              checked={form.quizIncludeExplanations}
              onToggle={() => onChange('quizIncludeExplanations', !form.quizIncludeExplanations)}
            />
            <ToggleButton
              label="Randomize Questions"
              checked={form.quizRandomize}
              onToggle={() => onChange('quizRandomize', !form.quizRandomize)}
            />
          </div>
        </div>
      );
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 10. MOCK TEST
    // ═══════════════════════════════════════════════════════════════════════════
    case 'mock-test': {
      const durations = ['30 min', '45 min', '60 min', '90 min', '120 min', '180 min'];
      const markOptions = ['25', '30', '40', '50', '75', '100'];
      const qTypes = ['MCQ', 'True/False', 'Short answer', 'Long answer', 'Fill in blanks', 'Match the following'];
      const inclusions = ['Answer key', 'Solutions', 'Marking scheme', 'Instructions page'];

      return (
        <div className="space-y-6">
          <ChipGroup
            label="Test Duration"
            options={durations}
            selected={form.mockDuration}
            onToggle={(v) => onChange('mockDuration', v)}
            multi={false}
          />
          <ChipGroup
            label="Total Marks"
            options={markOptions}
            selected={form.mockTotalMarks}
            onToggle={(v) => onChange('mockTotalMarks', v)}
            multi={false}
          />
          <div>
            <label className="block text-xs font-bold text-[var(--color-text-primary)] mb-2 uppercase tracking-wider">Question Types</label>
            <div className="flex flex-wrap gap-2">
              {qTypes.map((item) => (
                <button
                  type="button"
                  key={item}
                  onClick={() => toggleMulti(form.mockQuestionTypes, item, 'mockQuestionTypes')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    form.mockQuestionTypes.includes(item)
                      ? 'bg-[var(--color-primary-600)] text-white border-[var(--color-primary-600)]'
                      : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-secondary)]'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-[var(--color-text-primary)] mb-2 uppercase tracking-wider">
              Difficulty Distribution
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Easy', key: 'easyPercentage' as const },
                { label: 'Medium', key: 'mediumPercentage' as const },
                { label: 'Hard', key: 'hardPercentage' as const },
              ].map(({ label, key }) => (
                <div key={key}>
                  <p className="text-[10px] font-semibold text-[var(--color-text-secondary)] mb-1">{label}</p>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={form[key]}
                    onChange={(e) => onChange(key, Number(e.target.value))}
                    className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-xs font-semibold outline-none"
                  />
                  <p className="text-[10px] text-[var(--color-text-tertiary)] mt-0.5">%</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-[var(--color-text-primary)] mb-2 uppercase tracking-wider">Include</label>
            <div className="flex flex-wrap gap-2">
              {inclusions.map((item) => (
                <button
                  type="button"
                  key={item}
                  onClick={() => toggleMulti(form.mockIncludes, item, 'mockIncludes')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    form.mockIncludes.includes(item)
                      ? 'bg-[var(--color-primary-600)] text-white border-[var(--color-primary-600)]'
                      : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-secondary)]'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 11. QUESTION PAPER & EXAM
    // ═══════════════════════════════════════════════════════════════════════════
    case 'question-paper':
    case 'exam': {
      const durations = ['60 min', '90 min', '120 min', '150 min', '180 min'];
      const markOptions = ['30', '40', '50', '60', '80', '100'];

      const addSection = () => {
        const newId = String(Date.now());
        onChange('sections', [
          ...form.sections,
          { id: newId, name: `Section ${String.fromCharCode(64 + form.sections.length + 1)}`, questionType: 'Short answer', questionCount: 5, marksPerQuestion: 2, instructions: '' },
        ]);
      };

      const removeSection = (id: string) => {
        if (form.sections.length <= 1) return;
        onChange('sections', form.sections.filter((s) => s.id !== id));
      };

      const updateSection = (id: string, key: keyof QuestionPaperSection, val: string | number) => {
        onChange('sections', form.sections.map((s) => (s.id === id ? { ...s, [key]: val } : s)));
      };

      return (
        <div className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-[var(--color-text-primary)] mb-1.5 uppercase tracking-wider">Exam / Paper Name</label>
            <input
              type="text"
              value={form.examName}
              onChange={(e) => onChange('examName', e.target.value)}
              placeholder="e.g. Grade 8 Mid-Term Science Examination"
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm outline-none focus:border-[var(--color-primary-500)]"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <ChipGroup
              label="Duration"
              options={durations}
              selected={form.examDuration}
              onToggle={(v) => onChange('examDuration', v)}
              multi={false}
            />
            <ChipGroup
              label="Total Marks"
              options={markOptions}
              selected={form.examTotalMarks}
              onToggle={(v) => onChange('examTotalMarks', v)}
              multi={false}
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-[var(--color-text-primary)] uppercase tracking-wider">
                Sections ({form.sections.length})
              </label>
              <button
                type="button"
                onClick={addSection}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-primary-600)] hover:underline"
              >
                <Plus className="h-3.5 w-3.5" /> Add Section
              </button>
            </div>
            <div className="space-y-3">
              {form.sections.map((sec) => (
                <div key={sec.id} className="p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] space-y-2">
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      value={sec.name}
                      onChange={(e) => updateSection(sec.id, 'name', e.target.value)}
                      className="flex-1 bg-transparent text-xs font-bold outline-none text-[var(--color-text-primary)]"
                    />
                    {form.sections.length > 1 && (
                      <button type="button" onClick={() => removeSection(sec.id)} className="text-[var(--color-text-tertiary)] hover:text-red-600 p-1">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <p className="text-[10px] text-[var(--color-text-tertiary)] mb-0.5">Questions</p>
                      <input
                        type="number"
                        value={sec.questionCount}
                        onChange={(e) => updateSection(sec.id, 'questionCount', Number(e.target.value))}
                        className="w-full rounded-lg border border-[var(--color-border)] px-2 py-1 text-xs outline-none"
                      />
                    </div>
                    <div>
                      <p className="text-[10px] text-[var(--color-text-tertiary)] mb-0.5">Marks each</p>
                      <input
                        type="number"
                        value={sec.marksPerQuestion}
                        onChange={(e) => updateSection(sec.id, 'marksPerQuestion', Number(e.target.value))}
                        className="w-full rounded-lg border border-[var(--color-border)] px-2 py-1 text-xs outline-none"
                      />
                    </div>
                    <div>
                      <p className="text-[10px] text-[var(--color-text-tertiary)] mb-0.5">Total</p>
                      <p className="py-1 text-xs font-bold text-[var(--color-primary-700)]">
                        {sec.questionCount * sec.marksPerQuestion} marks
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 12. DIAGRAM
    // ═══════════════════════════════════════════════════════════════════════════
    case 'diagram': {
      const diagramTypes = [
        'Process Diagram', 'Flowchart', 'Labeled Diagram', 'Cycle Diagram',
        'Comparison Diagram', 'Hierarchy', 'Timeline', 'Scientific Diagram', 'System Diagram',
      ];
      const styles = ['Simple', 'Classroom', 'Scientific', 'Detailed', 'Colorful'];
      const orientations = ['Portrait', 'Landscape', 'Square'];
      const visualMethods = ['Structured Diagram', 'AI Illustration', 'Auto'];

      return (
        <div className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-[var(--color-text-primary)] mb-2 uppercase tracking-wider">
              Diagram Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {diagramTypes.map((dt) => (
                <button
                  type="button"
                  key={dt}
                  onClick={() => onChange('diagramType', dt as CreationFormState['diagramType'])}
                  className={`p-2.5 rounded-xl text-xs border text-left font-medium transition-all ${
                    form.diagramType === dt
                      ? 'bg-[var(--color-primary-50)] text-[var(--color-primary-800)] border-[var(--color-primary-400)] font-semibold'
                      : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-elevated)]'
                  }`}
                >
                  {dt}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--color-text-primary)] mb-1.5 uppercase tracking-wider">
              What Should the Diagram Explain?
            </label>
            <textarea
              rows={3}
              value={form.diagramGoal}
              onChange={(e) => onChange('diagramGoal', e.target.value)}
              placeholder="e.g. Show how sunlight energy is converted to chemical energy during photosynthesis, with chloroplast, stomata, and glucose output labelled."
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-primary-500)] resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--color-text-primary)] mb-1.5 uppercase tracking-wider">
              Elements to Include <span className="text-[10px] font-normal text-[var(--color-text-tertiary)]">(Optional — comma-separated)</span>
            </label>
            <input
              type="text"
              value={form.diagramSpecificElements}
              onChange={(e) => onChange('diagramSpecificElements', e.target.value)}
              placeholder="e.g. Chloroplast, Thylakoid, Stroma, ATP, NADPH"
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm outline-none focus:border-[var(--color-primary-500)]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ChipGroup
              label="Visual Style"
              options={styles}
              selected={form.diagramStyle}
              onToggle={(v) => onChange('diagramStyle', v as CreationFormState['diagramStyle'])}
              multi={false}
            />
            <ChipGroup
              label="Orientation"
              options={orientations}
              selected={form.diagramOrientation}
              onToggle={(v) => onChange('diagramOrientation', v as CreationFormState['diagramOrientation'])}
              multi={false}
            />
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <ToggleButton
              label="Include Labels"
              checked={form.diagramIncludeLabels}
              onToggle={() => onChange('diagramIncludeLabels', !form.diagramIncludeLabels)}
            />
            <ToggleButton
              label="Include Explanations"
              checked={form.diagramIncludeExplanations}
              onToggle={() => onChange('diagramIncludeExplanations', !form.diagramIncludeExplanations)}
            />
          </div>

          <ChipGroup
            label="Visual Method"
            options={visualMethods}
            selected={form.diagramVisualMethod}
            onToggle={(v) => onChange('diagramVisualMethod', v as CreationFormState['diagramVisualMethod'])}
            multi={false}
          />
        </div>
      );
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 13. MIND MAP
    // ═══════════════════════════════════════════════════════════════════════════
    case 'mind-map': {
      const branchCounts = ['3', '4', '5', '6', '7', '8'];
      const depths = ['Basic', 'Standard', 'Detailed'];
      const layouts = ['Radial', 'Tree', 'Horizontal'];
      const styles = ['Minimal', 'Academic', 'Colorful'];
      const inclusions = ['Definitions', 'Examples', 'Key facts', 'Related concepts', 'Applications'];

      return (
        <div className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-[var(--color-text-primary)] mb-1.5 uppercase tracking-wider">
              Central Topic <span className="text-[10px] font-normal text-[var(--color-text-tertiary)]">(leave blank to use the topic above)</span>
            </label>
            <input
              type="text"
              value={form.mindMapCentralTopic}
              onChange={(e) => onChange('mindMapCentralTopic', e.target.value)}
              placeholder="e.g. Photosynthesis (or leave blank)"
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm outline-none focus:border-[var(--color-primary-500)]"
            />
          </div>

          <ChipGroup
            label="Number of Main Branches"
            options={branchCounts}
            selected={form.mindMapBranchCount}
            onToggle={(v) => onChange('mindMapBranchCount', v)}
            multi={false}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ChipGroup
              label="Depth"
              options={depths}
              selected={form.mindMapDepth}
              onToggle={(v) => onChange('mindMapDepth', v as CreationFormState['mindMapDepth'])}
              multi={false}
            />
            <ChipGroup
              label="Layout"
              options={layouts}
              selected={form.mindMapLayout}
              onToggle={(v) => onChange('mindMapLayout', v as CreationFormState['mindMapLayout'])}
              multi={false}
            />
          </div>

          <ChipGroup
            label="Visual Style"
            options={styles}
            selected={form.mindMapStyle}
            onToggle={(v) => onChange('mindMapStyle', v as CreationFormState['mindMapStyle'])}
            multi={false}
          />

          <div>
            <label className="block text-xs font-bold text-[var(--color-text-primary)] mb-2 uppercase tracking-wider">Include in Nodes</label>
            <div className="flex flex-wrap gap-2">
              {inclusions.map((item) => (
                <button
                  type="button"
                  key={item}
                  onClick={() => toggleMulti(form.mindMapIncludes, item, 'mindMapIncludes')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    form.mindMapIncludes.includes(item)
                      ? 'bg-[var(--color-primary-600)] text-white border-[var(--color-primary-600)]'
                      : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-secondary)]'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 14. CHART
    // ═══════════════════════════════════════════════════════════════════════════
    case 'chart': {
      const chartTypes = ['Bar', 'Line', 'Pie', 'Area', 'Comparison'];

      const addRow = () => {
        const newRow = { id: String(Date.now()), label: `Category ${form.chartData.length + 1}`, value: 50 };
        onChange('chartData', [...form.chartData, newRow]);
      };

      const removeRow = (id: string) => {
        if (form.chartData.length <= 1) return;
        onChange('chartData', form.chartData.filter((r) => r.id !== id));
      };

      const updateRow = (id: string, key: 'label' | 'value', val: string | number) => {
        onChange('chartData', form.chartData.map((r) => (r.id === id ? { ...r, [key]: val } : r)));
      };

      return (
        <div className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-[var(--color-text-primary)] mb-1.5 uppercase tracking-wider">
              What Do You Want to Visualize?
            </label>
            <textarea
              rows={2}
              value={form.chartPurpose}
              onChange={(e) => onChange('chartPurpose', e.target.value)}
              placeholder="e.g. Compare monthly rainfall across seasons, show population growth over 10 years"
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm outline-none focus:border-[var(--color-primary-500)] resize-none"
            />
          </div>

          <ChipGroup
            label="Chart Type"
            options={chartTypes}
            selected={form.chartType}
            onToggle={(v) => onChange('chartType', v as CreationFormState['chartType'])}
            multi={false}
          />

          <div>
            <label className="block text-xs font-bold text-[var(--color-text-primary)] mb-2 uppercase tracking-wider">
              Do You Have Your Own Data?
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onChange('chartHasData', true)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  form.chartHasData
                    ? 'bg-[var(--color-primary-600)] text-white border-[var(--color-primary-600)]'
                    : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-secondary)]'
                }`}
              >
                Yes — I'll enter my data
              </button>
              <button
                type="button"
                onClick={() => onChange('chartHasData', false)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  !form.chartHasData
                    ? 'bg-[var(--color-primary-600)] text-white border-[var(--color-primary-600)]'
                    : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-secondary)]'
                }`}
              >
                No — Teachora generates data
              </button>
            </div>
          </div>

          {form.chartHasData && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-[var(--color-text-primary)] uppercase tracking-wider">
                  Your Data ({form.chartData.length} rows)
                </label>
                <button type="button" onClick={addRow} className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-primary-600)] hover:underline">
                  <Plus className="h-3.5 w-3.5" /> Add Row
                </button>
              </div>
              {errors?.chartData && (
                <p className="mb-2 text-xs text-red-600 font-medium">{errors.chartData}</p>
              )}
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[var(--color-surface-elevated)] border-b border-[var(--color-border)] text-[var(--color-text-tertiary)]">
                    <tr>
                      <th className="py-2 px-3">Label / Category</th>
                      <th className="py-2 px-3 w-32">Value</th>
                      <th className="py-2 px-3 w-10" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-border)]">
                    {form.chartData.map((row) => (
                      <tr key={row.id}>
                        <td className="p-2">
                          <input
                            type="text"
                            value={row.label}
                            onChange={(e) => updateRow(row.id, 'label', e.target.value)}
                            className="w-full rounded-lg border border-[var(--color-border)] px-2.5 py-1.5 text-xs outline-none"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            value={row.value}
                            onChange={(e) => updateRow(row.id, 'value', Number(e.target.value))}
                            className="w-full rounded-lg border border-[var(--color-border)] px-2.5 py-1.5 text-xs outline-none font-semibold"
                          />
                        </td>
                        <td className="p-2 text-center">
                          <button type="button" onClick={() => removeRow(row.id)} className="text-[var(--color-text-tertiary)] hover:text-red-600">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[var(--color-text-primary)] mb-1.5 uppercase tracking-wider">Chart Title</label>
              <input
                type="text"
                value={form.chartTitle}
                onChange={(e) => onChange('chartTitle', e.target.value)}
                placeholder="e.g. Monthly Rainfall 2024"
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm outline-none focus:border-[var(--color-primary-500)]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--color-text-primary)] mb-1.5 uppercase tracking-wider">X-Axis Label</label>
              <input
                type="text"
                value={form.chartXAxisLabel}
                onChange={(e) => onChange('chartXAxisLabel', e.target.value)}
                placeholder="e.g. Month"
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm outline-none focus:border-[var(--color-primary-500)]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--color-text-primary)] mb-1.5 uppercase tracking-wider">Y-Axis Label</label>
              <input
                type="text"
                value={form.chartYAxisLabel}
                onChange={(e) => onChange('chartYAxisLabel', e.target.value)}
                placeholder="e.g. Rainfall (mm)"
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm outline-none focus:border-[var(--color-primary-500)]"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ToggleButton
              label="Show Values"
              checked={form.chartShowValues}
              onToggle={() => onChange('chartShowValues', !form.chartShowValues)}
            />
            <ToggleButton
              label="Show Legend"
              checked={form.chartShowLegend}
              onToggle={() => onChange('chartShowLegend', !form.chartShowLegend)}
            />
          </div>
        </div>
      );
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 15. INFOGRAPHIC
    // ═══════════════════════════════════════════════════════════════════════════
    case 'infographic': {
      const purposes = ['Teach', 'Summarize', 'Compare', 'Explain a process', 'Revision', 'Fact sheet'];
      const orientations = ['Portrait', 'Landscape', 'Square'];
      const styles = ['Educational', 'Modern', 'Minimal', 'Colorful', 'Editorial'];
      const sectionCounts = ['3', '4', '5', '6'];
      const inclusions = ['Key facts', 'Definitions', 'Examples', 'Statistics', 'Steps', 'Takeaways', 'Comparisons'];
      const visualSources = ['Auto', 'Stock', 'AI', 'No visuals'];

      return (
        <div className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-[var(--color-text-primary)] mb-1.5 uppercase tracking-wider">
              What Should the Infographic Explain?
            </label>
            <textarea
              rows={2}
              value={form.infographicGoal}
              onChange={(e) => onChange('infographicGoal', e.target.value)}
              placeholder="e.g. Explain the stages of the water cycle for Grade 7 students using simple language and visual icons"
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm outline-none focus:border-[var(--color-primary-500)] resize-none"
            />
          </div>

          <ChipGroup
            label="Purpose"
            options={purposes}
            selected={form.infographicPurpose}
            onToggle={(v) => onChange('infographicPurpose', v as CreationFormState['infographicPurpose'])}
            multi={false}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ChipGroup
              label="Orientation"
              options={orientations}
              selected={form.infographicOrientation}
              onToggle={(v) => onChange('infographicOrientation', v as CreationFormState['infographicOrientation'])}
              multi={false}
            />
            <ChipGroup
              label="Visual Style"
              options={styles}
              selected={form.infographicStyle}
              onToggle={(v) => onChange('infographicStyle', v as CreationFormState['infographicStyle'])}
              multi={false}
            />
          </div>

          <ChipGroup
            label="Number of Sections"
            options={sectionCounts}
            selected={form.infographicSectionCount}
            onToggle={(v) => onChange('infographicSectionCount', v)}
            multi={false}
          />

          <div>
            <label className="block text-xs font-bold text-[var(--color-text-primary)] mb-2 uppercase tracking-wider">Include</label>
            <div className="flex flex-wrap gap-2">
              {inclusions.map((item) => (
                <button
                  type="button"
                  key={item}
                  onClick={() => toggleMulti(form.infographicIncludes, item, 'infographicIncludes')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    form.infographicIncludes.includes(item)
                      ? 'bg-[var(--color-primary-600)] text-white border-[var(--color-primary-600)]'
                      : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-secondary)]'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <ChipGroup
            label="Visual Source"
            options={visualSources}
            selected={form.infographicVisualSource}
            onToggle={(v) => onChange('infographicVisualSource', v as CreationFormState['infographicVisualSource'])}
            multi={false}
          />
        </div>
      );
    }

    default:
      return null;
  }
}
