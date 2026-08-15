import { useState, useEffect } from 'react';
import {
  FileText,
  FileCode,
  FileType,
  Printer,
  CheckCircle2,
  Loader2,
  X,
  Download,
  AlertCircle,
  Image as ImageIcon,
  Code as VectorIcon,
  Presentation as PresentationIcon,
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import {
  parseMarkdownToDocument,
  exportToPDF,
  exportToDOCX,
  exportToTXT,
  printDocument,
} from '../../../services/export/documentExporter';
import {
  exportDiagramToPDF,
  exportDiagramToPNG,
  exportDiagramToSVG,
} from '../../../services/export/diagramExporter';
import {
  exportPresentationToPDF,
  exportPresentationToPPTX,
} from '../../../services/export/presentationExporter';

export type ExportFormat = 'pdf' | 'docx' | 'pptx' | 'png' | 'svg' | 'txt' | 'print';

interface SaveExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  rawMarkdownContent: string;
  defaultTitle?: string;
  onSuccess?: (format: ExportFormat) => void;
  diagramData?: any;
  presentationData?: any;
  svgRef?: React.RefObject<SVGSVGElement | null>;
  subject?: string;
  grade?: string;
}

interface FormatOption {
  id: ExportFormat;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  buttonLabel: string;
  loadingLabel: string;
}

const defaultFormatOptions: FormatOption[] = [
  {
    id: 'pptx',
    title: 'PowerPoint Presentation',
    description: 'Editable 16:9 widescreen slide deck',
    icon: PresentationIcon,
    iconBg: 'bg-orange-500/10',
    iconColor: 'text-orange-600',
    buttonLabel: 'Download PowerPoint (.pptx)',
    loadingLabel: 'Generating PowerPoint deck…',
  },
  {
    id: 'pdf',
    title: 'PDF Document / Slide Deck',
    description: 'Best for printing, viewing and sharing',
    icon: FileText,
    iconBg: 'bg-rose-500/10',
    iconColor: 'text-rose-600',
    buttonLabel: 'Download PDF',
    loadingLabel: 'Generating PDF…',
  },
  {
    id: 'png',
    title: 'PNG Image',
    description: 'High-resolution diagram image',
    icon: ImageIcon,
    iconBg: 'bg-purple-500/10',
    iconColor: 'text-purple-600',
    buttonLabel: 'Download PNG Image',
    loadingLabel: 'Generating image…',
  },
  {
    id: 'svg',
    title: 'SVG Vector Graphic',
    description: 'Scalable vector file for editing',
    icon: VectorIcon,
    iconBg: 'bg-teal-500/10',
    iconColor: 'text-teal-600',
    buttonLabel: 'Download SVG Vector',
    loadingLabel: 'Preparing SVG…',
  },
  {
    id: 'docx',
    title: 'Word Document',
    description: 'Editable in Microsoft Word',
    icon: FileCode,
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-600',
    buttonLabel: 'Download Word Document',
    loadingLabel: 'Preparing Word document…',
  },
  {
    id: 'txt',
    title: 'Plain Text',
    description: 'Simple text format',
    icon: FileType,
    iconBg: 'bg-slate-500/10',
    iconColor: 'text-slate-600',
    buttonLabel: 'Download Plain Text',
    loadingLabel: 'Preparing text file…',
  },
  {
    id: 'print',
    title: 'Print Document',
    description: "Open your browser's print dialog",
    icon: Printer,
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-600',
    buttonLabel: 'Print Document',
    loadingLabel: 'Opening print dialog…',
  },
];

export function SaveExportModal({
  isOpen,
  onClose,
  rawMarkdownContent,
  defaultTitle,
  onSuccess,
  diagramData,
  presentationData,
  svgRef,
  subject,
  grade,
}: SaveExportModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('pdf');
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Set default selection based on content type
  useEffect(() => {
    if (presentationData) {
      setSelectedFormat('pptx');
    } else {
      setSelectedFormat('pdf');
    }
  }, [presentationData, isOpen]);

  // Filter options based on content type
  const availableOptions = defaultFormatOptions.filter((opt) => {
    if (diagramData) {
      return opt.id !== 'pptx';
    }
    if (presentationData) {
      return opt.id !== 'png' && opt.id !== 'svg';
    }
    return opt.id !== 'png' && opt.id !== 'svg' && opt.id !== 'pptx';
  });

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isExporting) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isExporting, onClose]);

  if (!isOpen) return null;

  const currentOption = availableOptions.find((f) => f.id === selectedFormat) || availableOptions[0];

  const handleExport = async () => {
    if (isExporting) return;
    setError(null);
    setIsExporting(true);

    try {
      const doc = parseMarkdownToDocument(rawMarkdownContent);
      const filename = defaultTitle || doc.title;

      if (presentationData && selectedFormat === 'pptx') {
        await exportPresentationToPPTX(presentationData, filename);
      } else if (presentationData && selectedFormat === 'pdf') {
        await exportPresentationToPDF(presentationData, filename);
      } else if (diagramData && selectedFormat === 'pdf') {
        await exportDiagramToPDF({
          data: diagramData,
          title: filename,
          subject,
          grade,
          svgElement: svgRef?.current,
        });
      } else if (diagramData && selectedFormat === 'png') {
        await exportDiagramToPNG({
          data: diagramData,
          title: filename,
          svgElement: svgRef?.current,
        });
      } else if (diagramData && selectedFormat === 'svg') {
        exportDiagramToSVG({
          data: diagramData,
          title: filename,
          svgElement: svgRef?.current,
        });
      } else if (selectedFormat === 'pdf') {
        await exportToPDF(doc, filename);
      } else if (selectedFormat === 'docx') {
        await exportToDOCX(doc, filename);
      } else if (selectedFormat === 'txt') {
        exportToTXT(doc, filename);
      } else if (selectedFormat === 'print') {
        printDocument(doc);
      }

      onSuccess?.(selectedFormat);
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (err: any) {
      console.error('Export error:', err);
      setError(err?.message || "Couldn't generate the document. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs">
      <div
        className="card w-full max-w-lg overflow-hidden rounded-2xl p-6 shadow-2xl border border-[var(--color-border)] animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="export-modal-title"
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[var(--color-border)]">
          <div>
            <h2 id="export-modal-title" className="heading-3 text-lg font-bold text-[var(--color-text-primary)]">
              Save your teaching material
            </h2>
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
              Choose a format to download this content.
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isExporting}
            className="p-1.5 rounded-lg text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated)] transition-colors disabled:opacity-50"
            aria-label="Close export modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
            <span className="flex-1">{error}</span>
          </div>
        )}

        {/* Format Selection Cards */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {availableOptions.map((opt) => {
            const isSelected = selectedFormat === opt.id;
            const IconComponent = opt.icon;

            return (
              <div
                key={opt.id}
                onClick={() => !isExporting && setSelectedFormat(opt.id)}
                className={cn(
                  'group relative flex flex-col justify-between p-3.5 rounded-xl border cursor-pointer transition-all',
                  isSelected
                    ? 'border-[var(--color-primary-500)] bg-[var(--color-primary-50)]/40 ring-2 ring-[var(--color-primary-500)]/20 shadow-xs'
                    : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-border-hover)] hover:bg-[var(--color-surface-elevated)]'
                )}
              >
                <div className="flex items-start justify-between">
                  <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg', opt.iconBg, opt.iconColor)}>
                    <IconComponent className="h-5 w-5" />
                  </div>
                  {isSelected ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-primary-600)] text-white px-2 py-0.5 text-[10px] font-bold">
                      <CheckCircle2 className="h-3 w-3" />
                      Selected
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium text-[var(--color-text-tertiary)] group-hover:text-[var(--color-text-secondary)]">
                      Select
                    </span>
                  )}
                </div>

                <div className="mt-3">
                  <h3 className="font-semibold text-xs text-[var(--color-text-primary)]">{opt.title}</h3>
                  <p className="text-[11px] text-[var(--color-text-secondary)] mt-0.5 leading-snug">
                    {opt.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions Footer */}
        <div className="mt-6 pt-4 border-t border-[var(--color-border)] flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            disabled={isExporting}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated)] transition-colors disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            onClick={handleExport}
            disabled={isExporting}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-primary-600)] px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[var(--color-primary-700)] focus:ring-2 focus:ring-[var(--color-primary-500)]/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{currentOption.loadingLabel}</span>
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                <span>{currentOption.buttonLabel}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
