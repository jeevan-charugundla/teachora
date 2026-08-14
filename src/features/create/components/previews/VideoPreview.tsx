import { Film, Eye, Mic, Music, Clock, PlayCircle } from 'lucide-react';

interface VideoPreviewProps {
  data: any;
}

export function VideoPreview({ data }: VideoPreviewProps) {
  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-[var(--color-border)] pb-4">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs px-2.5 py-0.5 rounded-full font-semibold">
            {data.subject} • {data.grade}
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-[var(--color-text-secondary)]">
            <Clock className="h-3.5 w-3.5" /> {data.duration}
          </span>
          <span className="text-xs text-[var(--color-text-tertiary)]">• {data.style} Style</span>
        </div>
        <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">{data.title}</h2>
        <p className="text-xs text-[var(--color-text-tertiary)] mt-1">Target Audience: {data.audience}</p>
      </div>

      {/* Storyboard Scenes Grid */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-primary)] flex items-center gap-1.5">
          <Film className="h-4 w-4 text-indigo-600" /> Storyboard & Production Scenes ({data.scenes?.length || 0})
        </h3>

        <div className="space-y-4">
          {data.scenes?.map((scene: any, idx: number) => (
            <div
              key={idx}
              className="card p-5 border border-[var(--color-border)] rounded-2xl bg-[var(--color-surface)] shadow-xs space-y-3"
            >
              {/* Scene Header */}
              <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border)]">
                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-200">
                  Scene {scene.sceneNumber}
                </span>
                <span className="text-xs font-semibold text-[var(--color-text-tertiary)] flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {scene.time}
                </span>
              </div>

              {/* Visual Description */}
              <div className="p-3 rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border)]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-tertiary)] flex items-center gap-1 mb-1">
                  <Eye className="h-3 w-3 text-indigo-500" /> Visual & Camera Direction
                </span>
                <p className="text-xs text-[var(--color-text-primary)] font-medium leading-relaxed">
                  {scene.visual}
                </p>
                {scene.onScreenText && (
                  <div className="mt-2 text-[11px] font-semibold text-indigo-800 bg-indigo-50/80 px-2.5 py-1 rounded-md inline-block">
                    On-Screen Text: "{scene.onScreenText}"
                  </div>
                )}
              </div>

              {/* Pexels Video Footage Suggestions */}
              {scene.videoSuggestions && scene.videoSuggestions.length > 0 && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-800">
                    <span className="flex items-center gap-1">
                      <PlayCircle className="h-3.5 w-3.5 text-indigo-600" /> Suggested B-Roll Footage Clips
                    </span>
                    <span className="text-[10px] text-slate-500 font-normal">Videos by Pexels</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {scene.videoSuggestions.map((clip: any, cIdx: number) => (
                      <a
                        key={cIdx}
                        href={clip.url}
                        target="_blank"
                        rel="noreferrer"
                        className="relative rounded-lg overflow-hidden border border-slate-300 aspect-video group bg-black/10 block"
                      >
                        <img
                          src={clip.thumbnailUrl}
                          alt="Video clip thumbnail"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <PlayCircle className="h-8 w-8 text-white drop-shadow-md" />
                        </div>
                        <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[9px] px-1 py-0.5 truncate">
                          {clip.duration}s • {clip.photographer}
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Narration Script */}
              <div className="p-3 rounded-xl bg-purple-50/40 border border-purple-100 text-purple-950">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-800 flex items-center gap-1 mb-1">
                  <Mic className="h-3 w-3 text-purple-600" /> Voiceover / Narration Script
                </span>
                <p className="text-xs text-purple-900 leading-relaxed italic">
                  "{scene.narration}"
                </p>
              </div>

              {/* Audio Sound Effect */}
              {scene.sound && (
                <div className="text-[11px] text-[var(--color-text-tertiary)] flex items-center gap-1.5 pl-1">
                  <Music className="h-3 w-3 text-[var(--color-text-tertiary)]" />
                  <span>Audio Cue: {scene.sound}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
