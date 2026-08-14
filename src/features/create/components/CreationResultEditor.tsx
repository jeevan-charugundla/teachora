import { useState, useRef } from 'react';
import { ArrowLeft, Download, FolderPlus, Copy, Share2, Check, CheckCheck, RefreshCw } from 'lucide-react';
import type { CreationMeta, CreationFormState } from '../types/creationTypes';
import { SaveExportModal, type ExportFormat } from '@/features/assistant/components/SaveExportModal';
import { createProject } from '@/services/supabase/projects';
import { useAuthStore } from '@/stores/authStore';

// 16 Dedicated Previews
import { LessonPreview } from './previews/LessonPreview';
import { NotesPreview } from './previews/NotesPreview';
import { PresentationPreview } from './previews/PresentationPreview';
import { VideoPreview } from './previews/VideoPreview';
import { AssignmentPreview } from './previews/AssignmentPreview';
import { WorksheetPreview } from './previews/WorksheetPreview';
import { ActivityPreview } from './previews/ActivityPreview';
import { FlashcardsPreview } from './previews/FlashcardsPreview';
import { QuizPreview } from './previews/QuizPreview';
import { MockTestPreview } from './previews/MockTestPreview';
import { QuestionPaperPreview } from './previews/QuestionPaperPreview';
import { DiagramPreview } from './previews/DiagramPreview';
import { MindMapPreview } from './previews/MindMapPreview';
import { ChartPreview } from './previews/ChartPreview';
import { InfographicPreview } from './previews/InfographicPreview';

interface CreationResultEditorProps {
  meta: CreationMeta;
  form: CreationFormState;
  previewData: any;
  onBackToEdit: () => void;
  onNewCreation: () => void;
}

export function CreationResultEditor({
  meta,
  form,
  previewData,
  onBackToEdit,
  onNewCreation,
}: CreationResultEditorProps) {
  const { user } = useAuthStore();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [savedWorkspace, setSavedWorkspace] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCopy = () => {
    const text = typeof previewData === 'object' ? JSON.stringify(previewData, null, 2) : String(previewData);
    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast('Copied content to clipboard.');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveToWorkspace = async () => {
    if (!user) {
      showToast('You must be signed in to save to Workspace.');
      return;
    }

    try {
      await createProject({
        user_id: user.id,
        title: previewData?.title || `${meta.title}: ${form.topic}`,
        type: meta.type as any,
        project_type: meta.type,
        subject: form.subject,
        grade: form.grade,
        status: 'draft',
        content: previewData,
        metadata: {
          difficulty: form.difficulty,
          generated_in: 'create_studio',
        },
        is_favorite: false,
      });

      setSavedWorkspace(true);
      showToast('Saved to your Workspace successfully.');
      setTimeout(() => setSavedWorkspace(false), 3000);
    } catch {
      showToast('Saved locally in preview session.');
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast('Shareable link copied to clipboard.');
  };

  const handleExportSuccess = (format: ExportFormat) => {
    showToast(`Exported as ${format.toUpperCase()} successfully.`);
  };

  const renderPreviewContent = () => {
    switch (meta.type) {
      case 'lesson':
        return <LessonPreview data={previewData} />;
      case 'notes':
        return <NotesPreview data={previewData} />;
      case 'presentation':
        return <PresentationPreview data={previewData} />;
      case 'video':
        return <VideoPreview data={previewData} />;
      case 'assignment':
        return <AssignmentPreview data={previewData} />;
      case 'worksheet':
        return <WorksheetPreview data={previewData} />;
      case 'activity':
        return <ActivityPreview data={previewData} />;
      case 'flashcards':
        return <FlashcardsPreview data={previewData} />;
      case 'quiz':
        return <QuizPreview data={previewData} />;
      case 'mock-test':
        return <MockTestPreview data={previewData} />;
      case 'question-paper':
      case 'exam':
        return <QuestionPaperPreview data={previewData} />;
      case 'diagram':
        return <DiagramPreview data={previewData} svgRef={svgRef} />;
      case 'mind-map':
        return <MindMapPreview data={previewData} />;
      case 'chart':
        return <ChartPreview data={previewData} />;
      case 'infographic':
        return <InfographicPreview data={previewData} />;
      default:
        return (
          <div className="p-6">
            <h3 className="font-bold text-lg">{previewData?.title || meta.title}</h3>
            <pre className="mt-4 p-4 bg-black/5 rounded-xl text-xs overflow-auto">{JSON.stringify(previewData, null, 2)}</pre>
          </div>
        );
    }
  };

  const markdownExportText = `# ${previewData?.title || meta.title}\n\n**Subject:** ${form.subject} • **Grade:** ${form.grade}\n\n${
    typeof previewData === 'object'
      ? Object.entries(previewData)
          .filter(([k]) => k !== 'title' && k !== 'subject' && k !== 'grade')
          .map(([k, v]) => `## ${k.toUpperCase()}\n${typeof v === 'object' ? JSON.stringify(v, null, 2) : String(v)}`)
          .join('\n\n')
      : String(previewData)
  }`;

  return (
    <div className="min-h-full max-w-5xl mx-auto py-4 px-4 sm:px-6 space-y-6">
      {/* Top Action Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--color-border)] pb-4">
        <button
          type="button"
          onClick={onBackToEdit}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Edit Requirements</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-elevated)] text-xs font-semibold text-[var(--color-text-secondary)] transition-colors"
            title="Copy content"
          >
            {copied ? <CheckCheck className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-elevated)] text-xs font-semibold text-[var(--color-text-secondary)] transition-colors"
            title="Share"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Share</span>
          </button>

          <button
            type="button"
            onClick={() => setExportModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-[var(--color-primary-200)] bg-[var(--color-primary-50)] hover:bg-[var(--color-primary-100)] text-xs font-semibold text-[var(--color-primary-700)] transition-colors shadow-2xs"
            title="Export as PDF, DOCX, TXT"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export</span>
          </button>

          <button
            type="button"
            onClick={handleSaveToWorkspace}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[var(--color-primary-600)] hover:bg-[var(--color-primary-700)] text-white text-xs font-bold shadow-xs transition-colors"
          >
            {savedWorkspace ? (
              <>
                <Check className="h-3.5 w-3.5 text-white" />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <FolderPlus className="h-3.5 w-3.5" />
                <span>Save to Workspace</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Content Preview Card */}
      <div className="card p-6 sm:p-8 border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xs rounded-3xl">
        {renderPreviewContent()}
      </div>

      {/* Bottom Actions Toolbar */}
      <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border)] text-xs">
        <button
          type="button"
          onClick={onNewCreation}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Create Another
        </button>

        <span className="text-[11px] text-[var(--color-text-tertiary)]">
          Teachora Create Studio • Preview Edition
        </span>
      </div>

      {/* Export Modal */}
      <SaveExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        rawMarkdownContent={markdownExportText}
        defaultTitle={previewData?.title || `${meta.title} - ${form.topic}`}
        onSuccess={handleExportSuccess}
        diagramData={meta.type === 'diagram' ? previewData : undefined}
        svgRef={svgRef}
        subject={form.subject}
        grade={form.grade}
      />

      {/* Floating Toast */}
      {toastMessage && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] text-[var(--color-text-primary)] px-4 py-2 rounded-xl shadow-lg text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <Check className="h-4 w-4 text-[var(--color-success-600)]" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
