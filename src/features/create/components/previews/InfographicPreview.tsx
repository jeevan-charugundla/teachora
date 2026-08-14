import { useState } from 'react';
import { Sparkles, Image as ImageIcon, RotateCw, Download, Loader2 } from 'lucide-react';
import { CreationService } from '../../services/creationService';

interface InfographicPreviewProps {
  data: any;
}

export function InfographicPreview({ data }: InfographicPreviewProps) {
  const [visualSource, setVisualSource] = useState<'auto' | 'stock' | 'ai'>('ai');
  const [isGeneratingVisual, setIsGeneratingVisual] = useState(false);
  const [visualData, setVisualData] = useState<any>(data.visual || null);
  const [visualError, setVisualError] = useState<string | null>(null);

  if (!data || !data.sections) return null;

  const handleGenerateArtwork = async (sourceOverride?: 'auto' | 'stock' | 'ai') => {
    setIsGeneratingVisual(true);
    setVisualError(null);

    const source = sourceOverride || visualSource;
    try {
      const res = await CreationService.generateVisual({
        topic: data.title || 'Educational Infographic',
        subject: data.subject || 'Science',
        grade: data.grade || 'Grade 8',
        style: 'modern educational infographic visual',
        aspectRatio: 'landscape',
        visualSource: source,
        creationType: 'infographic',
        additionalInstructions: `Visual overview for ${data.title}. ${data.purpose || ''}`,
      });

      setIsGeneratingVisual(false);
      if (res.success && (res.image || (res.media && res.media.length > 0))) {
        setVisualData({
          image: res.image,
          media: res.media,
          provider: res.provider,
          source: res.source,
        });
      } else {
        setVisualError(res.error || res.message || 'No visual found.');
      }
    } catch (err: any) {
      setIsGeneratingVisual(false);
      setVisualError(err.message || 'Visual generation failed.');
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center border-b border-[var(--color-border)] pb-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-yellow-800 bg-yellow-100/70 border border-yellow-200 px-3 py-0.5 rounded-full inline-block">
            {data.subject} • {data.grade} • Visual Overview
          </span>

          {/* Visual Source Mode Selector */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border)] text-xs">
            <span className="text-[10px] uppercase font-bold text-[var(--color-text-tertiary)] px-1">Visual:</span>
            {(['auto', 'stock', 'ai'] as const).map((src) => (
              <button
                key={src}
                type="button"
                onClick={() => setVisualSource(src)}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition-all ${
                  visualSource === src
                    ? 'bg-[var(--color-surface)] text-[var(--color-primary-700)] shadow-2xs border border-[var(--color-border)]'
                    : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]'
                }`}
              >
                {src.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-[var(--color-text-primary)] tracking-tight">
          {data.title}
        </h2>
        <div className="flex items-center justify-center gap-3 text-xs text-[var(--color-text-tertiary)]">
          <span>{data.purpose}</span>
          <span>•</span>
          <button
            type="button"
            onClick={() => handleGenerateArtwork()}
            disabled={isGeneratingVisual}
            className="inline-flex items-center gap-1 font-bold text-[var(--color-primary-600)] hover:underline disabled:opacity-50"
          >
            {isGeneratingVisual ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" /> Generating {visualSource.toUpperCase()} Visual…
              </>
            ) : (
              <>
                <Sparkles className="h-3 w-3" /> + Add {visualSource.toUpperCase()} Banner Visual
              </>
            )}
          </button>
        </div>
      </div>

      {/* Generated Banner Visual View */}
      {visualData && (
        <div className="card p-4 border border-[var(--color-border)] rounded-2xl bg-[var(--color-surface)] space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-3.5 w-3.5 text-[var(--color-primary-600)]" />
              <span className="font-bold text-[var(--color-text-primary)]">Infographic Visual Header</span>
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                visualData.source === 'ai' || visualData.provider === 'pollinations'
                  ? 'bg-purple-100 text-purple-800'
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {visualData.source === 'ai' || visualData.provider === 'pollinations' ? 'AI Generated' : 'Photos by Pexels'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleGenerateArtwork()}
              disabled={isGeneratingVisual}
              className="inline-flex items-center gap-1 text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            >
              <RotateCw className={`h-3 w-3 ${isGeneratingVisual ? 'animate-spin' : ''}`} /> Regenerate
            </button>
          </div>

          {visualData.image?.url && (
            <div className="relative rounded-xl overflow-hidden border border-[var(--color-border)] aspect-video max-h-72">
              <img
                src={visualData.image.url}
                alt={visualData.image.prompt || data.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 right-2">
                <a
                  href={visualData.image.url}
                  download={`${data.title}.jpg`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1 rounded-md bg-black/70 text-white text-[10px] font-semibold backdrop-blur-xs flex items-center gap-1"
                >
                  <Download className="h-3 w-3" /> Download
                </a>
              </div>
            </div>
          )}

          {visualData.media && visualData.media.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {visualData.media.slice(0, 2).map((photo: any, pIdx: number) => (
                <div key={pIdx} className="relative rounded-lg overflow-hidden border aspect-video">
                  <img src={photo.url || photo.thumbnailUrl} alt={photo.alt} className="w-full h-full object-cover" />
                  <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[9px] px-1 py-0.5 truncate">
                    Photo by {photo.photographer}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {visualError && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between">
          <span>{visualError}</span>
          <button
            type="button"
            onClick={() => handleGenerateArtwork('ai')}
            className="font-bold underline hover:text-amber-950 ml-2"
          >
            Generate with AI
          </button>
        </div>
      )}

      {/* Visual Section Cards Stack */}
      <div className="space-y-4">
        {data.sections.map((sec: any, idx: number) => (
          <div
            key={idx}
            className={`p-6 rounded-2xl border ${sec.color || 'bg-[var(--color-surface)] border-[var(--color-border)]'} shadow-xs space-y-3 transition-transform hover:scale-[1.01]`}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-[var(--color-text-primary)]">
                {sec.title}
              </h3>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white/80 shadow-2xs">
                Step 0{idx + 1}
              </span>
            </div>

            <p className="text-xs sm:text-sm font-medium leading-relaxed opacity-95">
              {sec.content}
            </p>

            {sec.stat && (
              <div className="pt-2 border-t border-black/10 flex items-center gap-2 text-xs font-bold">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Key Fact: {sec.stat}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
