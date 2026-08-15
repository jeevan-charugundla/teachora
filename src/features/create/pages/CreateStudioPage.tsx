import { useState, useMemo, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import {
  BookOpen,
  FileText,
  Presentation,
  Video,
  ClipboardList,
  FileSpreadsheet,
  Puzzle,
  Layers,
  HelpCircle,
  Timer,
  FileQuestion,
  GraduationCap,
  Image,
  GitBranch,
  BarChart3,
  Network,
} from 'lucide-react';
import type { CreationType, WizardStep, CreationFormState } from '../types/creationTypes';
import { CREATION_ITEMS_CATALOG, getInitialFormState } from '../data/creationCatalog';
import { CreationWizardLayout } from '../components/CreationWizardLayout';
import { CommonDetailsForm } from '../components/forms/CommonDetailsForm';
import { TypeSpecificCustomForm } from '../components/forms/TypeSpecificCustomForm';
import { CreationReviewCard } from '../components/CreationReviewCard';
import { CreationGenerationOverlay } from '../components/CreationGenerationOverlay';
import { CreationResultEditor } from '../components/CreationResultEditor';
import { CreationService } from '../services/creationService';
import { createProject } from '@/services/supabase/projects';
import { sendGenerationCompletionNotification } from '@/services/notifications/pushService';
import { useAuthStore } from '@/stores/authStore';

const ICONS_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  BookOpen,
  FileText,
  Presentation,
  Video,
  ClipboardList,
  FileSpreadsheet,
  Puzzle,
  Layers,
  HelpCircle,
  Timer,
  FileQuestion,
  GraduationCap,
  Image,
  GitBranch,
  BarChart3,
  Network,
};

// Type-specific loading messages
const GENERATION_LABELS: Record<CreationType, string> = {
  lesson: 'Building your lesson plan…',
  notes: 'Writing your notes…',
  presentation: 'Building your slides…',
  video: 'Creating your storyboard…',
  assignment: 'Preparing your assignment…',
  worksheet: 'Creating your worksheet…',
  activity: 'Designing your activity…',
  flashcards: 'Creating your flashcards…',
  quiz: 'Writing your questions…',
  'mock-test': 'Building your mock test…',
  'question-paper': 'Creating your question paper…',
  exam: 'Building your exam…',
  diagram: 'Building your diagram…',
  'mind-map': 'Organizing your mind map…',
  chart: 'Preparing your chart…',
  infographic: 'Designing your infographic…',
};

const GENERATION_STEPS: Record<CreationType, string[]> = {
  diagram: ['Analysing topic & diagram type…', 'Structuring nodes & connections…', 'Generating labels & explanations…', 'Finalizing diagram data…'],
  'mind-map': ['Mapping central concept…', 'Building branches & subtopics…', 'Adding details & examples…', 'Finalizing mind map…'],
  chart: ['Analysing data & chart type…', 'Generating chart data & insights…', 'Calculating axes & labels…', 'Finalizing chart…'],
  infographic: ['Planning infographic sections…', 'Writing section content…', 'Adding facts & takeaways…', 'Finalizing infographic…'],
  presentation: ['Planning slide structure…', 'Writing slide content…', 'Adding examples & visuals…', 'Finalizing presentation…'],
  lesson: ['Analysing learning objectives…', 'Writing lesson steps…', 'Adding activities & assessment…', 'Finalizing lesson plan…'],
  notes: ['Analysing topic structure…', 'Writing key concepts…', 'Adding definitions & examples…', 'Finalizing notes…'],
  video: ['Planning scenes & script…', 'Writing narration…', 'Adding visual cues…', 'Finalizing storyboard…'],
  assignment: ['Planning question set…', 'Writing questions…', 'Adding marks & rubric…', 'Finalizing assignment…'],
  worksheet: ['Planning worksheet layout…', 'Writing questions…', 'Adding answer key…', 'Finalizing worksheet…'],
  activity: ['Planning activity structure…', 'Writing instructions…', 'Adding teacher notes…', 'Finalizing activity…'],
  flashcards: ['Identifying key terms…', 'Writing card fronts & backs…', 'Adding examples & mnemonics…', 'Finalizing flashcards…'],
  quiz: ['Planning question set…', 'Writing questions & options…', 'Adding explanations & answer key…', 'Finalizing quiz…'],
  'mock-test': ['Planning test sections…', 'Writing questions…', 'Adding marking scheme…', 'Finalizing mock test…'],
  'question-paper': ['Planning paper sections…', 'Writing questions…', 'Adding marks & instructions…', 'Finalizing question paper…'],
  exam: ['Planning exam structure…', 'Writing questions…', 'Adding marking scheme…', 'Finalizing exam…'],
};

export function CreateStudioPage() {
  const { type: rawType } = useParams<{ type?: string }>();
  const location = useLocation();
  const { user, profile } = useAuthStore();
  const notifiedJobsRef = useRef<Set<string>>(new Set());

  // Extract creation type from params or pathname
  const creationType: CreationType = useMemo(() => {
    if (rawType && rawType in CREATION_ITEMS_CATALOG) {
      return rawType as CreationType;
    }
    const pathParts = location.pathname.split('/');
    const lastPart = pathParts[pathParts.length - 1];
    if (lastPart in CREATION_ITEMS_CATALOG) {
      return lastPart as CreationType;
    }
    return 'lesson';
  }, [rawType, location.pathname]);

  const meta = CREATION_ITEMS_CATALOG[creationType] || CREATION_ITEMS_CATALOG.lesson;
  const IconComponent = ICONS_MAP[meta.iconName] || BookOpen;

  // Form state initialized with teacher profile defaults
  const [form, setForm] = useState<CreationFormState>(() =>
    getInitialFormState(
      creationType,
      profile?.subjects?.[0] || 'Science',
      profile?.grade_levels?.[0] || 'Grade 8'
    )
  );

  // Wizard state
  const [step, setStep] = useState<WizardStep>('details');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [genStepNum, setGenStepNum] = useState(1);
  const [genLabel, setGenLabel] = useState(GENERATION_LABELS[creationType] || 'Generating content…');
  const [previewData, setPreviewData] = useState<any>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const handleFormChange = <K extends keyof CreationFormState>(key: K, value: CreationFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key as string]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key as string];
        return next;
      });
    }
  };

  const validateStep = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.topic.trim()) {
      errs.topic = 'Please enter a topic or concept title before continuing.';
    }
    // Chart: only require data if teacher said they have data
    if (form.type === 'chart' && form.chartHasData && form.chartData.length === 0) {
      errs.chartData = 'Please add at least one data row.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleStepChange = (newStep: WizardStep) => {
    if (newStep === 'customize' || newStep === 'review') {
      if (!validateStep()) {
        setStep('details');
        return;
      }
    }
    setStep(newStep);
  };

  const handleGenerate = async () => {
    if (isGenerating) return;

    if (!validateStep()) {
      setStep('details');
      return;
    }

    setGenerationError(null);
    setIsGenerating(true);
    setGenStepNum(1);
    setGenLabel(GENERATION_LABELS[form.type] || 'Generating content…');

    const steps = GENERATION_STEPS[form.type] || [
      'Preparing requirements…',
      'Generating content with AI…',
      'Validating structure…',
      'Finalizing your material…',
    ];

    try {
      const res = await CreationService.generate(form, (num, _defaultLabel) => {
        setGenStepNum(num);
        setGenLabel(steps[num - 1] || steps[steps.length - 1]);
      });

      setIsGenerating(false);

      if (res.success && res.data) {
        setPreviewData(res.data);
        setStep('preview');

        // Auto-persist generated material and dispatch Web Push completion notification
        if (user) {
          try {
            const created = await createProject({
              user_id: user.id,
              title: res.data?.title || `${meta.title}: ${form.topic}`,
              type: meta.type as any,
              project_type: meta.type,
              subject: form.subject,
              grade: form.grade,
              status: 'completed',
              content: res.data,
              metadata: {
                difficulty: form.difficulty,
                generated_in: 'create_studio',
              },
              is_favorite: false,
            });

            // Idempotency guard against duplicate notifications
            if (created?.id && !notifiedJobsRef.current.has(created.id)) {
              notifiedJobsRef.current.add(created.id);
              sendGenerationCompletionNotification({
                creationType: form.type,
                topic: form.topic,
                grade: form.grade,
                projectId: created.id,
                jobId: created.id,
              });
            }
          } catch (saveErr) {
            console.warn('Auto-save project notice:', saveErr);
          }
        }
      } else {
        setGenerationError(res.error || 'Unable to generate material. Please try again.');
      }
    } catch (err: any) {
      setIsGenerating(false);
      setGenerationError(err.message || 'An unexpected error occurred during generation.');
    }
  };

  // If in Preview / Result Mode, render the full interactive editor
  if (step === 'preview' && previewData) {
    return (
      <CreationResultEditor
        meta={meta}
        form={form}
        previewData={previewData}
        onBackToEdit={() => setStep('details')}
        onNewCreation={() => {
          setForm(getInitialFormState(creationType));
          setStep('details');
        }}
      />
    );
  }

  return (
    <>
      {isGenerating && (
        <CreationGenerationOverlay
          title={meta.title}
          stepNumber={genStepNum}
          totalSteps={4}
          currentLabel={genLabel}
        />
      )}

      <CreationWizardLayout
        meta={meta}
        step={step}
        onStepChange={handleStepChange}
        onGenerate={handleGenerate}
        isValid={Boolean(form.topic.trim())}
        icon={IconComponent}
      >
        {generationError && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center justify-between animate-in fade-in">
            <span>{generationError}</span>
            <button
              type="button"
              onClick={() => setGenerationError(null)}
              className="text-red-500 hover:text-red-700 font-bold ml-2"
            >
              ✕
            </button>
          </div>
        )}

        {step === 'details' && (
          <CommonDetailsForm
            form={form}
            onChange={handleFormChange}
            errors={errors}
          />
        )}

        {step === 'customize' && (
          <TypeSpecificCustomForm
            form={form}
            onChange={handleFormChange}
            errors={errors}
          />
        )}

        {step === 'review' && (
          <CreationReviewCard
            form={form}
            meta={meta}
            onEdit={() => setStep('details')}
            onGenerate={handleGenerate}
          />
        )}
      </CreationWizardLayout>
    </>
  );
}
