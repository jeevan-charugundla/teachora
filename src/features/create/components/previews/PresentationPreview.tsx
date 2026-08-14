import { useState } from 'react';
import { ChevronLeft, ChevronRight, MessageSquare, Image as ImageIcon, Sparkles } from 'lucide-react';
import { CreationService } from '../../services/creationService';

interface PresentationPreviewProps {
  data: any;
}

export function PresentationPreview({ data }: PresentationPreviewProps) {
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [showSpeakerNotes, setShowSpeakerNotes] = useState(true);

  if (!data || !data.slides || data.slides.length === 0) return null;

  const slides = data.slides;
  const currentSlide = slides[activeSlideIndex];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
        <div>
          <span className="text-xs font-semibold text-orange-700 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
            {data.subject} • {data.grade} • {slides.length} Slides
          </span>
          <h2 className="text-xl font-bold text-[var(--color-text-primary)] mt-1">{data.title}</h2>
        </div>

        <button
          type="button"
          onClick={() => setShowSpeakerNotes(!showSpeakerNotes)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
            showSpeakerNotes
              ? 'bg-[var(--color-primary-50)] text-[var(--color-primary-700)] border-[var(--color-primary-300)]'
              : 'border-[var(--color-border)] text-[var(--color-text-secondary)]'
          }`}
        >
          <MessageSquare className="h-3.5 w-3.5" />
          <span>Speaker Notes</span>
        </button>
      </div>

      {/* Main Slide Canvas & Thumbnails Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Slide Thumbnails Sidebar */}
        <div className="order-2 lg:order-1 lg:col-span-1 space-y-2 max-h-[440px] overflow-y-auto pr-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-tertiary)] block mb-1">
            Slide Overview
          </span>
          {slides.map((s: any, idx: number) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveSlideIndex(idx)}
              className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${
                activeSlideIndex === idx
                  ? 'border-[var(--color-primary-500)] bg-[var(--color-primary-50)]/50 ring-2 ring-[var(--color-primary-200)]'
                  : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-elevated)]'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-bold text-[var(--color-text-tertiary)] mb-1">
                <span>Slide {s.slideNumber}</span>
                <span className="uppercase text-[9px]">{s.type}</span>
              </div>
              <p className="font-semibold text-[var(--color-text-primary)] truncate">{s.title}</p>
            </button>
          ))}
        </div>

        {/* Active Slide Canvas */}
        <div className="order-1 lg:order-2 lg:col-span-3 space-y-4">
          <div className="aspect-video w-full rounded-2xl border border-[var(--color-border)] bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-surface-elevated)] p-6 sm:p-8 flex flex-col justify-between shadow-md relative overflow-hidden">
            {/* Slide Header */}
            <div>
              <div className="flex items-center justify-between text-xs text-[var(--color-text-tertiary)] font-bold uppercase tracking-widest mb-3">
                <span>Teachora Presentation Series</span>
                <span>Slide {currentSlide.slideNumber} / {slides.length}</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-[var(--color-text-primary)] tracking-tight">
                {currentSlide.title}
              </h3>
              {currentSlide.subtitle && (
                <p className="text-sm font-semibold text-[var(--color-primary-700)] mt-1">
                  {currentSlide.subtitle}
                </p>
              )}
            </div>

            {/* Slide Content Points */}
            <div className="my-auto py-4">
              <ul className="space-y-3 text-sm text-[var(--color-text-primary)] font-medium">
                {currentSlide.content?.map((pt: string, i: number) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="text-[var(--color-primary-600)] font-bold text-base">•</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Slide Footer */}
            <div className="pt-4 border-t border-[var(--color-border)] flex items-center justify-between text-[11px] text-[var(--color-text-tertiary)] font-semibold">
              <span>{data.subject} • {data.grade}</span>
              <span>{data.visualStyle || 'Clean'} Theme</span>
            </div>
          </div>

          {/* Media Suggestions Bar (Photos by Pexels or Pollinations AI) */}
          <div className="p-3.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-[var(--color-text-primary)]">
              <span className="flex items-center gap-1.5">
                <ImageIcon className="h-3.5 w-3.5 text-orange-600" />
                Visuals for this Slide
              </span>
              <div className="flex items-center gap-2">
                {currentSlide.mediaSuggestions && currentSlide.mediaSuggestions.length > 0 && (
                  <span className="text-[10px] text-[var(--color-text-tertiary)] font-medium">
                    {currentSlide.mediaSuggestions[0]?.attribution || 'Photos by Pexels'}
                  </span>
                )}
                <button
                  type="button"
                  onClick={async () => {
                    const res = await CreationService.generateVisual({
                      topic: currentSlide.visualSuggestion || currentSlide.title || data.title,
                      subject: data.subject,
                      grade: data.grade,
                      visualSource: 'ai',
                    });
                    if (res.success && res.image) {
                      currentSlide.mediaSuggestions = [
                        ...(currentSlide.mediaSuggestions || []),
                        {
                          url: res.image.url,
                          thumbnailUrl: res.image.url,
                          alt: res.image.prompt,
                          photographer: 'Pollinations AI',
                          attribution: 'AI Generated',
                        },
                      ];
                      setActiveSlideIndex((idx) => idx);
                    }
                  }}
                  className="text-[10px] font-bold text-[var(--color-primary-600)] hover:underline flex items-center gap-1"
                >
                  <Sparkles className="h-3 w-3" /> + Generate AI Visual
                </button>
              </div>
            </div>
            {currentSlide.mediaSuggestions && currentSlide.mediaSuggestions.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {currentSlide.mediaSuggestions.map((photo: any, pIdx: number) => (
                  <div key={pIdx} className="relative rounded-lg overflow-hidden border border-[var(--color-border)] aspect-video group bg-black/5">
                    <img
                      src={photo.url || photo.thumbnailUrl}
                      alt={photo.alt || 'Visual suggestion'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      loading="lazy"
                    />
                    <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[9px] p-1 truncate flex items-center justify-between">
                      <span>{photo.photographer || 'Pexels'}</span>
                      <span className="text-[8px] opacity-80">{photo.attribution || 'Stock'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Slide Navigation Controls */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setActiveSlideIndex((prev) => Math.max(0, prev - 1))}
              disabled={activeSlideIndex === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text-secondary)] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--color-surface-elevated)]"
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
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text-secondary)] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--color-surface-elevated)]"
            >
              Next Slide <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Speaker Notes Drawer */}
          {showSpeakerNotes && currentSlide.speakerNotes && (
            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 text-amber-950">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 mb-1 flex items-center gap-1.5">
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
