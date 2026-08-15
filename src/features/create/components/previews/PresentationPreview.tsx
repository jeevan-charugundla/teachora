import { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Image as ImageIcon,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { CreationService } from '../../services/creationService';

interface MediaItem {
  url: string;
  thumbnailUrl?: string;
  alt?: string;
  photographer?: string;
  attribution?: string;
}

interface SlideItem {
  slideNumber: number;
  type?: string;
  title: string;
  subtitle?: string;
  content: string[];
  speakerNotes?: string;
  visualSuggestion?: string;
  visualQuery?: string;
  mediaSuggestions?: MediaItem[];
  needsAiVisual?: boolean;
}

interface PresentationData {
  title: string;
  subtitle?: string;
  subject?: string;
  grade?: string;
  topic?: string;
  visualStyle?: 'Clean' | 'Academic' | 'Modern' | 'Playful' | 'Minimal' | string;
  slides: SlideItem[];
}

interface PresentationPreviewProps {
  data: PresentationData;
}

export function PresentationPreview({ data }: PresentationPreviewProps) {
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [showSpeakerNotes, setShowSpeakerNotes] = useState(true);
  const [isGeneratingAiVisual, setIsGeneratingAiVisual] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  if (!data || !Array.isArray(data.slides) || data.slides.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-[var(--color-text-tertiary)]">
        No slide data available for preview.
      </div>
    );
  }

  const slides = data.slides;
  const currentSlide = slides[activeSlideIndex] || slides[0];
  const visualStyle = data.visualStyle || 'Clean';

  // Theme configuration for visual styles
  const getThemeStyles = () => {
    switch (visualStyle) {
      case 'Academic':
        return {
          cardBg: 'bg-[#fdfbf7] border-blue-900/20 text-slate-900',
          titleColor: 'text-blue-950 font-serif',
          subtitleColor: 'text-blue-700 italic font-serif',
          bulletDot: 'bg-blue-600',
          accentBorder: 'border-blue-900/10',
          badgeBg: 'bg-blue-50 text-blue-800 border-blue-200',
        };
      case 'Modern':
        return {
          cardBg: 'bg-slate-900 border-indigo-500/30 text-slate-100 shadow-2xl',
          titleColor: 'text-white font-extrabold tracking-tight',
          subtitleColor: 'text-indigo-300 font-medium',
          bulletDot: 'bg-indigo-400',
          accentBorder: 'border-indigo-500/20',
          badgeBg: 'bg-indigo-950/80 text-indigo-300 border-indigo-700/50',
        };
      case 'Playful':
        return {
          cardBg: 'bg-amber-50/80 border-amber-200 text-amber-950',
          titleColor: 'text-orange-950 font-black tracking-tight',
          subtitleColor: 'text-orange-700 font-semibold',
          bulletDot: 'bg-orange-500',
          accentBorder: 'border-orange-200',
          badgeBg: 'bg-orange-100 text-orange-800 border-orange-200',
        };
      case 'Minimal':
        return {
          cardBg: 'bg-white border-zinc-200 text-zinc-900',
          titleColor: 'text-zinc-950 font-bold tracking-tight',
          subtitleColor: 'text-zinc-600 font-medium',
          bulletDot: 'bg-zinc-800',
          accentBorder: 'border-zinc-200',
          badgeBg: 'bg-zinc-100 text-zinc-800 border-zinc-200',
        };
      case 'Clean':
      default:
        return {
          cardBg: 'bg-gradient-to-br from-slate-50 to-slate-100/90 border-slate-200 text-slate-900',
          titleColor: 'text-slate-900 font-bold tracking-tight',
          subtitleColor: 'text-orange-600 font-semibold',
          bulletDot: 'bg-orange-500',
          accentBorder: 'border-slate-200',
          badgeBg: 'bg-orange-50 text-orange-700 border-orange-200',
        };
    }
  };

  const theme = getThemeStyles();
  const currentImage = currentSlide.mediaSuggestions?.[0];

  const handleGenerateAiVisual = async () => {
    if (isGeneratingAiVisual) return;
    setIsGeneratingAiVisual(true);
    setGenerationError(null);

    try {
      const res = await CreationService.generateVisual({
        topic: currentSlide.visualQuery || currentSlide.title || data.topic || data.title,
        subject: data.subject,
        grade: data.grade,
        visualSource: 'ai',
        aspectRatio: 'landscape',
        style: visualStyle,
      });

      if (res.success && res.image) {
        const newMedia: MediaItem = {
          url: res.image.url,
          thumbnailUrl: res.image.url,
          alt: res.image.prompt || currentSlide.title,
          photographer: 'Teachora Visual AI',
          attribution: 'AI Generated',
        };

        // Update current slide media array
        currentSlide.mediaSuggestions = [newMedia, ...(currentSlide.mediaSuggestions || [])];
        currentSlide.needsAiVisual = false;
        // Trigger re-render
        setActiveSlideIndex((prev) => prev);
      } else {
        setGenerationError(res.error || 'Unable to generate AI visual. Please try again.');
      }
    } catch (err: any) {
      setGenerationError(err.message || 'Error generating AI visual.');
    } finally {
      setIsGeneratingAiVisual(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-border)] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${theme.badgeBg}`}>
              {data.subject || 'Subject'} • {data.grade || 'Grade'} • {slides.length} Slides
            </span>
            <span className="text-[10px] font-semibold text-[var(--color-text-tertiary)] bg-[var(--color-surface-elevated)] px-2 py-0.5 rounded-full border border-[var(--color-border)]">
              {visualStyle} Theme
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[var(--color-text-primary)] tracking-tight">
            {data.title}
          </h2>
        </div>

        <button
          type="button"
          onClick={() => setShowSpeakerNotes(!showSpeakerNotes)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
            showSpeakerNotes
              ? 'bg-amber-50 text-amber-900 border-amber-300 shadow-2xs'
              : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-elevated)]'
          }`}
        >
          <MessageSquare className="h-3.5 w-3.5" />
          <span>Speaker Notes ({showSpeakerNotes ? 'On' : 'Off'})</span>
        </button>
      </div>

      {/* Main Grid: Thumbnails & Active Slide Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Thumbnails Sidebar */}
        <div className="order-2 lg:order-1 lg:col-span-1 space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-tertiary)] px-1">
            <span>Slide Overview</span>
            <span>{slides.length} Deck</span>
          </div>

          {slides.map((s, idx) => {
            const isActive = activeSlideIndex === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveSlideIndex(idx)}
                className={`w-full text-left p-3 rounded-2xl border text-xs transition-all ${
                  isActive
                    ? 'border-[var(--color-primary-500)] bg-[var(--color-primary-50)]/70 ring-2 ring-[var(--color-primary-200)] shadow-xs'
                    : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-elevated)] text-[var(--color-text-secondary)]'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-bold text-[var(--color-text-tertiary)] mb-1">
                  <span>Slide {s.slideNumber}</span>
                  <span className="uppercase text-[9px] px-1.5 py-0.2 rounded bg-black/5">{s.type || 'concept'}</span>
                </div>
                <p className="font-bold text-[var(--color-text-primary)] truncate">{s.title}</p>
                {s.subtitle && <p className="text-[10px] text-[var(--color-text-tertiary)] truncate mt-0.5">{s.subtitle}</p>}
              </button>
            );
          })}
        </div>

        {/* Active 16:9 Presentation Canvas */}
        <div className="order-1 lg:order-2 lg:col-span-3 space-y-4">
          <div className={`aspect-video w-full rounded-3xl border ${theme.cardBg} p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden shadow-lg transition-all`}>
            {/* Top Slide Header */}
            <div>
              <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest opacity-60 mb-2">
                <span>Teachora Classroom Deck</span>
                <span>Slide {currentSlide.slideNumber} of {slides.length}</span>
              </div>
              <h3 className={`text-xl sm:text-2xl lg:text-3xl ${theme.titleColor}`}>
                {currentSlide.title}
              </h3>
              {currentSlide.subtitle && (
                <p className={`text-xs sm:text-sm mt-1 ${theme.subtitleColor}`}>
                  {currentSlide.subtitle}
                </p>
              )}
            </div>

            {/* Middle Slide Body Content & Visual Box */}
            <div className="my-auto py-3 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              {/* Bullet Content Column */}
              <div className={currentImage ? 'md:col-span-7 space-y-2.5' : 'md:col-span-12 space-y-3'}>
                {Array.isArray(currentSlide.content) && currentSlide.content.length > 0 ? (
                  <ul className="space-y-2.5 text-xs sm:text-sm font-medium">
                    {currentSlide.content.map((pt, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <span className={`h-2 w-2 rounded-full mt-1.5 shrink-0 ${theme.bulletDot}`} />
                        <span className="leading-snug">{pt}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs italic opacity-70">Key instructional content points.</p>
                )}
              </div>

              {/* Slide Image Box */}
              {currentImage && (
                <div className="md:col-span-5 relative rounded-2xl overflow-hidden border border-black/10 aspect-video shadow-md bg-black/5 group">
                  <img
                    src={currentImage.url || currentImage.thumbnailUrl}
                    alt={currentImage.alt || currentSlide.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute bottom-0 inset-x-0 bg-black/70 backdrop-blur-xs text-white text-[9px] p-1.5 flex items-center justify-between">
                    <span className="truncate max-w-[120px]">{currentImage.photographer || 'Teachora Media'}</span>
                    <span className="text-[8px] bg-white/20 px-1.5 py-0.5 rounded font-bold">{currentImage.attribution || 'Stock'}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Slide Canvas Footer */}
            <div className={`pt-3 border-t ${theme.accentBorder} flex items-center justify-between text-[10px] font-bold opacity-65`}>
              <span>{data.subject} • {data.grade}</span>
              <span>{data.title}</span>
            </div>
          </div>

          {/* Visual Media Bar & AI Generator Trigger */}
          <div className="p-3.5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-[var(--color-text-primary)]">
              <span className="flex items-center gap-1.5">
                <ImageIcon className="h-4 w-4 text-orange-600" />
                Visual Media for Slide {currentSlide.slideNumber}
              </span>

              <button
                type="button"
                onClick={handleGenerateAiVisual}
                disabled={isGeneratingAiVisual}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200 transition-colors disabled:opacity-50"
              >
                {isGeneratingAiVisual ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-orange-600" />
                    <span>Generating AI Visual…</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5 text-orange-600" />
                    <span>+ Generate AI Visual</span>
                  </>
                )}
              </button>
            </div>

            {generationError && (
              <p className="text-[11px] text-red-600 font-semibold">{generationError}</p>
            )}

            {currentSlide.mediaSuggestions && currentSlide.mediaSuggestions.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                {currentSlide.mediaSuggestions.map((photo, pIdx) => (
                  <div key={pIdx} className="relative rounded-xl overflow-hidden border border-[var(--color-border)] aspect-video group bg-black/5 shadow-2xs">
                    <img
                      src={photo.url || photo.thumbnailUrl}
                      alt={photo.alt || 'Slide image'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      loading="lazy"
                    />
                    <div className="absolute bottom-0 inset-x-0 bg-black/75 text-white text-[9px] p-1 truncate flex items-center justify-between">
                      <span className="truncate">{photo.photographer || 'Media'}</span>
                      <span className="text-[8px] font-bold text-orange-300">{photo.attribution || 'Stock'}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[var(--color-text-tertiary)] italic pt-1">
                No visual attached yet. Click "+ Generate AI Visual" to create an educational illustration for this slide.
              </p>
            )}
          </div>

          {/* Slide Navigation Controls */}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => setActiveSlideIndex((prev) => Math.max(0, prev - 1))}
              disabled={activeSlideIndex === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text-secondary)] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--color-surface-elevated)] transition-colors"
            >
              <ChevronLeft className="h-4 w-4" /> Previous Slide
            </button>

            <span className="text-xs font-bold text-[var(--color-text-tertiary)]">
              Slide {activeSlideIndex + 1} of {slides.length}
            </span>

            <button
              type="button"
              onClick={() => setActiveSlideIndex((prev) => Math.min(slides.length - 1, prev + 1))}
              disabled={activeSlideIndex === slides.length - 1}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text-secondary)] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--color-surface-elevated)] transition-colors"
            >
              Next Slide <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Collapsible Speaker Notes Drawer */}
          {showSpeakerNotes && currentSlide.speakerNotes && currentSlide.speakerNotes.trim() !== '' && (
            <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50/80 text-amber-950 space-y-1 shadow-xs animate-in fade-in duration-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                <MessageSquare className="h-3.5 w-3.5 text-amber-700" /> Instructor Speaking Script & Cues
              </h4>
              <p className="text-xs text-amber-900 leading-relaxed italic">
                "{currentSlide.speakerNotes}"
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
