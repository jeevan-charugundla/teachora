import { useState } from 'react';
import { Tag, Eye, Info, Sparkles, RotateCw, Download, Loader2, ArrowRight, Camera, Image } from 'lucide-react';
import { CreationService } from '../../services/creationService';

interface DiagramPreviewProps {
  data: any;
}

// Flow-type diagram types that get the node-connection canvas
const FLOW_TYPES = ['process diagram', 'flowchart', 'cycle diagram', 'hierarchy', 'timeline', 'system diagram'];

function isFlowType(diagramType: string = ''): boolean {
  return FLOW_TYPES.includes((diagramType || '').toLowerCase());
}

// ─── SVG Node-Flow Canvas ────────────────────────────────────────────────────
interface SvgNode {
  id: string;
  label: string;
  description?: string;
  x?: number;
  y?: number;
}

interface SvgConnection {
  from: string;
  to: string;
  label?: string;
}

function autoLayout(nodes: SvgNode[], diagramType: string): SvgNode[] {
  const type = (diagramType || '').toLowerCase();
  const count = nodes.length;
  const W = 700;
  const H = 360;

  if (type === 'cycle diagram') {
    const cx = W / 2;
    const cy = H / 2;
    const r = Math.min(cx, cy) - 70;
    return nodes.map((n, i) => ({
      ...n,
      x: Math.round(cx + r * Math.cos((2 * Math.PI * i) / count - Math.PI / 2)),
      y: Math.round(cy + r * Math.sin((2 * Math.PI * i) / count - Math.PI / 2)),
    }));
  }

  if (type === 'hierarchy') {
    const root = nodes[0];
    const children = nodes.slice(1);
    const spacing = W / Math.max(children.length, 1);
    return [
      { ...root, x: W / 2, y: 60 },
      ...children.map((n, i) => ({ ...n, x: Math.round(spacing * i + spacing / 2), y: H - 60 })),
    ];
  }

  if (type === 'timeline') {
    const spacing = W / Math.max(count, 1);
    return nodes.map((n, i) => ({
      ...n,
      x: Math.round(spacing * i + spacing / 2),
      y: H / 2,
    }));
  }

  // Default: vertical process/flowchart
  const spacing = H / Math.max(count, 1);
  return nodes.map((n, i) => ({
    ...n,
    x: W / 2,
    y: Math.round(spacing * i + spacing / 2),
  }));
}

function NodeFlowCanvas({ data }: { data: any }) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const rawNodes: SvgNode[] = Array.isArray(data.nodes) && data.nodes.length > 0
    ? data.nodes
    : (Array.isArray(data.elements) && data.elements.length > 0
        ? data.elements.map((el: any) => ({ id: el.id, label: el.label, description: el.description }))
        : []);

  const connections: SvgConnection[] = Array.isArray(data.connections) && data.connections.length > 0
    ? data.connections
    : (Array.isArray(data.relationships) && data.relationships.length > 0
        ? data.relationships.map((r: any) => ({ from: r.from, to: r.to, label: r.label }))
        : []);

  if (rawNodes.length === 0) {
    return (
      <div className="p-6 text-center text-sm text-[var(--color-text-tertiary)]">
        No diagram nodes to render.
      </div>
    );
  }

  const nodes = autoLayout(rawNodes, data.diagramType || '');
  const W = 700;
  const H = 360;
  const NODE_W = 130;
  const NODE_H = 44;

  const nodeById: Record<string, SvgNode> = {};
  const nodeByLabel: Record<string, SvgNode> = {};
  nodes.forEach((n) => {
    nodeById[n.id] = n;
    nodeByLabel[n.label] = n;
  });

  const resolveNode = (ref: string) =>
    nodeById[ref] || nodeByLabel[ref] || Object.values(nodeById).find((n) => n.id === ref || n.label === ref);

  const diagramColors = [
    '#0d9488', '#0284c7', '#7c3aed', '#d97706', '#059669',
    '#e11d48', '#0891b2', '#9333ea', '#65a30d', '#f97316',
  ];

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full max-w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)]"
        style={{ minHeight: '240px', maxHeight: '420px' }}
      >
        <defs>
          <marker id="arrow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#6b7280" />
          </marker>
        </defs>

        {connections.map((conn, idx) => {
          const fromNode = resolveNode(conn.from);
          const toNode = resolveNode(conn.to);
          if (!fromNode || !toNode) return null;

          const fx = fromNode.x!;
          const fy = fromNode.y!;
          const tx = toNode.x!;
          const ty = toNode.y!;
          const mx = (fx + tx) / 2;
          const my = (fy + ty) / 2;

          return (
            <g key={idx}>
              <line
                x1={fx}
                y1={fy + NODE_H / 2}
                x2={tx}
                y2={ty - NODE_H / 2}
                stroke="#d1d5db"
                strokeWidth={2}
                markerEnd="url(#arrow)"
              />
              {conn.label && (
                <text x={mx} y={my} textAnchor="middle" fontSize={9} fill="#9ca3af" fontWeight="600">
                  {conn.label}
                </text>
              )}
            </g>
          );
        })}

        {nodes.map((node, idx) => {
          const color = diagramColors[idx % diagramColors.length];
          const isHovered = hoveredId === node.id;
          const x = node.x! - NODE_W / 2;
          const y = node.y! - NODE_H / 2;

          return (
            <g
              key={node.id}
              onMouseEnter={() => setHoveredId(node.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{ cursor: 'pointer' }}
            >
              <rect
                x={x} y={y} width={NODE_W} height={NODE_H} rx={10}
                fill={isHovered ? color : `${color}20`}
                stroke={color} strokeWidth={2}
                style={{ transition: 'fill 0.15s' }}
              />
              <text
                x={node.x} y={node.y! - 4}
                textAnchor="middle" fontSize={10} fontWeight="700"
                fill={isHovered ? '#fff' : color}
              >
                {node.label.length > 18 ? node.label.slice(0, 17) + '…' : node.label}
              </text>
              {node.description && (
                <text
                  x={node.x} y={node.y! + 10}
                  textAnchor="middle" fontSize={8}
                  fill={isHovered ? 'rgba(255,255,255,0.85)' : '#6b7280'}
                >
                  {node.description.slice(0, 30)}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ─── Labeled Diagram Canvas ───────────────────────────────────────────────────
// Accepts generatedImageUrl — when set, replaces the placeholder grid with the real AI image
function LabeledDiagramCanvas({
  data,
  generatedImageUrl,
}: {
  data: any;
  generatedImageUrl?: string;
}) {
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);

  const labels: any[] = Array.isArray(data.labels) && data.labels.length > 0
    ? data.labels
    : (Array.isArray(data.elements)
        ? data.elements.map((el: any) => ({ id: el.id, name: el.label, x: el.position?.x || 50, y: el.position?.y || 50, desc: el.description || '' }))
        : []);

  const colors = ['#0d9488', '#0284c7', '#7c3aed', '#e11d48', '#d97706', '#16a34a', '#0891b2', '#9333ea'];

  return (
    <div className="space-y-4">
      {/* Visual Canvas */}
      <div
        className="relative w-full rounded-2xl border-2 border-[var(--color-border)] overflow-hidden"
        style={{
          minHeight: '320px',
          aspectRatio: data.orientation === 'Landscape' ? '16/7' : '4/3',
          background: generatedImageUrl ? '#000' : 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
        }}
      >
        {/* Background: AI image or placeholder grid */}
        {generatedImageUrl ? (
          <img
            src={generatedImageUrl}
            alt={data.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <>
            <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#64748b" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="px-6 py-3 rounded-2xl bg-white/80 border-2 border-[var(--color-primary-300)] shadow-md text-center max-w-[60%]">
                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-primary-500)] block">Diagram Topic</span>
                <span className="font-black text-lg text-[var(--color-text-primary)]">{data.topic || data.title?.replace(/Diagram.*?:/i, '').trim()}</span>
                <span className="text-[10px] text-[var(--color-text-tertiary)] block mt-1">Generate an AI visual below to replace this placeholder</span>
              </div>
            </div>
          </>
        )}

        {/* Positioned label pins — shown over any background */}
        {labels.map((label, idx) => {
          const bgColor = generatedImageUrl ? colors[idx % colors.length] : `${colors[idx % colors.length]}20`;
          const borderColor = colors[idx % colors.length];
          const isSelected = selectedLabel === label.id;
          return (
            <button
              key={label.id}
              type="button"
              onClick={() => setSelectedLabel(isSelected ? null : label.id)}
              className="absolute group flex flex-col items-center gap-1 transition-transform hover:scale-105"
              style={{
                left: `${Math.min(Math.max(label.x ?? 50, 5), 90)}%`,
                top: `${Math.min(Math.max(label.y ?? 50, 5), 90)}%`,
                transform: 'translate(-50%, -50%)',
                zIndex: 2,
              }}
            >
              <div
                className="h-5 w-5 rounded-full border-2 border-white shadow-md flex items-center justify-center text-white text-[9px] font-black"
                style={{ backgroundColor: colors[idx % colors.length] }}
              >
                {idx + 1}
              </div>
              <span
                className="text-[9px] font-bold px-2 py-0.5 rounded-lg shadow-xs border whitespace-nowrap max-w-[100px] truncate"
                style={{
                  backgroundColor: generatedImageUrl ? 'rgba(0,0,0,0.7)' : bgColor,
                  borderColor,
                  color: generatedImageUrl ? '#fff' : borderColor,
                  backdropFilter: generatedImageUrl ? 'blur(4px)' : undefined,
                }}
              >
                {label.name}
              </span>
            </button>
          );
        })}

        {/* AI Generated badge */}
        {generatedImageUrl && (
          <div className="absolute top-2 left-2 z-10">
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1">
              <Sparkles className="h-2.5 w-2.5" /> AI-generated educational visual
            </span>
          </div>
        )}
      </div>

      {/* Selected label detail */}
      {selectedLabel && (() => {
        const lbl = labels.find((l) => l.id === selectedLabel);
        if (!lbl) return null;
        return (
          <div className="p-4 rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border)] text-sm animate-in fade-in">
            <p className="font-bold text-[var(--color-text-primary)] mb-1">{lbl.name}</p>
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">{lbl.desc || lbl.description || 'No description available.'}</p>
          </div>
        );
      })()}

      {/* Labels table */}
      {labels.length > 0 && (
        <div className="rounded-xl border border-[var(--color-border)] overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-[var(--color-surface-elevated)] border-b border-[var(--color-border)] text-[var(--color-text-tertiary)]">
              <tr>
                <th className="py-2 px-3 text-left w-8">#</th>
                <th className="py-2 px-3 text-left">Part / Element</th>
                <th className="py-2 px-3 text-left">Function / Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {labels.map((label, idx) => (
                <tr
                  key={label.id}
                  className={`cursor-pointer transition-colors ${selectedLabel === label.id ? 'bg-[var(--color-primary-50)]' : 'bg-[var(--color-surface)] hover:bg-[var(--color-surface-elevated)]'}`}
                  onClick={() => setSelectedLabel(selectedLabel === label.id ? null : label.id)}
                >
                  <td className="py-2 px-3 font-bold" style={{ color: colors[idx % colors.length] }}>{idx + 1}</td>
                  <td className="py-2 px-3 font-semibold text-[var(--color-text-primary)]">{label.name}</td>
                  <td className="py-2 px-3 text-[var(--color-text-secondary)]">{(label.desc || label.description || '—').slice(0, 80)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── AI Visual Generator Section ─────────────────────────────────────────────
// Provides AI image generation UI with staged loading messages
const AI_LOADING_STAGES = [
  'Creating your AI visual…',
  'Preparing educational illustration…',
  'Rendering image details…',
  'Almost ready…',
];

const VISUAL_STYLES = [
  'Realistic Scientific',
  'Textbook Illustration',
  'Detailed Educational',
  '3D Educational',
  'Clean Vector Illustration',
  'Medical Illustration',
];

interface AiVisualSectionProps {
  data: any;
  visualSource: 'auto' | 'stock' | 'ai';
  setVisualSource: (s: 'auto' | 'stock' | 'ai') => void;
  isGenerating: boolean;
  loadingStage: number;
  visualData: any;
  visualError: string | null;
  onGenerate: (source?: 'auto' | 'stock' | 'ai', instructions?: string) => void;
  onSetError: (e: string | null) => void;
}

function AiVisualSection({
  data, visualSource, setVisualSource,
  isGenerating, loadingStage, visualData, visualError,
  onGenerate, onSetError,
}: AiVisualSectionProps) {
  const [regenerateInstructions, setRegenerateInstructions] = useState('');
  const [showRegenerateInput, setShowRegenerateInput] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState('Realistic Scientific');

  const imageUrl = visualData?.image?.url || null;
  const stockMedia = visualData?.media || [];
  const isAiGenerated = visualData?.source === 'ai' || visualData?.provider === 'pollinations';

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
      {/* Section header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2">
          <Camera className="h-4 w-4 text-[var(--color-primary-600)]" />
          <span className="text-xs font-bold text-[var(--color-text-primary)] uppercase tracking-wider">
            AI Supporting Visual
          </span>
          {imageUrl && isAiGenerated && (
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200">
              AI-generated educational visual
            </span>
          )}
          {imageUrl && !isAiGenerated && (
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
              Stock photo
            </span>
          )}
        </div>
        {/* Source selector */}
        <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[var(--color-surface-elevated)] border border-[var(--color-border)]">
          {(['auto', 'stock', 'ai'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setVisualSource(s)}
              className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${
                visualSource === s
                  ? 'bg-[var(--color-surface)] text-[var(--color-primary-700)] shadow-xs border border-[var(--color-border)]'
                  : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              {s.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-3">
        {/* Style selector — only for AI source */}
        {visualSource === 'ai' && !imageUrl && (
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-tertiary)]">Image Style</label>
            <div className="flex flex-wrap gap-1.5">
              {VISUAL_STYLES.map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => setSelectedStyle(style)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-all ${
                    selectedStyle === style
                      ? 'bg-[var(--color-primary-600)] text-white border-[var(--color-primary-600)]'
                      : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary-300)]'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading state */}
        {isGenerating && (
          <div className="flex flex-col items-center justify-center py-8 gap-3 animate-in fade-in">
            <div className="relative h-14 w-14">
              <Loader2 className="h-14 w-14 animate-spin text-[var(--color-primary-200)]" />
              <Image className="absolute inset-0 m-auto h-6 w-6 text-[var(--color-primary-600)]" />
            </div>
            <p className="text-sm font-bold text-[var(--color-text-primary)]">
              {AI_LOADING_STAGES[loadingStage % AI_LOADING_STAGES.length]}
            </p>
            <p className="text-xs text-[var(--color-text-tertiary)]">
              This may take 10–20 seconds. Please wait.
            </p>
          </div>
        )}

        {/* No image yet — show generate button */}
        {!isGenerating && !imageUrl && stockMedia.length === 0 && (
          <div className="space-y-3">
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
              Generate an AI visual to illustrate this concept. The actual educational image will be created by Pollinations AI and displayed here — not a CSS or HTML placeholder.
            </p>
            <button
              type="button"
              onClick={() => onGenerate(visualSource, visualSource === 'ai' ? selectedStyle : undefined)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-[var(--color-primary-300)] bg-[var(--color-primary-50)] text-[var(--color-primary-700)] text-sm font-bold hover:bg-[var(--color-primary-100)] transition-all"
            >
              <Sparkles className="h-4 w-4" />
              Generate {visualSource === 'ai' ? 'AI' : visualSource === 'stock' ? 'Stock' : 'Best'} Visual
            </button>
          </div>
        )}

        {/* Generated AI image */}
        {!isGenerating && imageUrl && (
          <div className="space-y-3">
            <div className="relative rounded-xl overflow-hidden border border-[var(--color-border)] w-full" style={{ aspectRatio: '16/9', maxHeight: '360px' }}>
              <img src={imageUrl} alt={data.title} className="w-full h-full object-cover" />
              <div className="absolute bottom-2 right-2 flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setShowRegenerateInput((v) => !v)}
                  className="px-2.5 py-1 rounded-md bg-black/70 text-white text-[10px] font-semibold backdrop-blur-xs flex items-center gap-1 hover:bg-black/90 transition"
                >
                  <RotateCw className="h-3 w-3" /> Regenerate
                </button>
                <a
                  href={imageUrl}
                  download={`${data.title || 'diagram'}.jpg`}
                  target="_blank" rel="noreferrer"
                  className="px-2.5 py-1 rounded-md bg-black/70 text-white text-[10px] font-semibold backdrop-blur-xs flex items-center gap-1 hover:bg-black/90 transition"
                >
                  <Download className="h-3 w-3" /> Download
                </a>
              </div>
            </div>

            {/* Regenerate with optional instruction */}
            {showRegenerateInput && (
              <div className="flex gap-2 animate-in fade-in">
                <input
                  type="text"
                  value={regenerateInstructions}
                  onChange={(e) => setRegenerateInstructions(e.target.value)}
                  placeholder='e.g. "More realistic", "Textbook style", "Show internal cross section"'
                  className="flex-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-xs text-[var(--color-text-primary)] outline-none focus:border-[var(--color-primary-500)] focus:ring-2 focus:ring-[var(--color-primary-100)]"
                />
                <button
                  type="button"
                  onClick={() => {
                    setShowRegenerateInput(false);
                    onGenerate(visualSource, regenerateInstructions || undefined);
                  }}
                  className="px-3 py-2 rounded-xl bg-[var(--color-primary-600)] text-white text-xs font-bold hover:bg-[var(--color-primary-700)] transition whitespace-nowrap"
                >
                  <RotateCw className="h-3 w-3 inline mr-1" /> Generate New
                </button>
              </div>
            )}
          </div>
        )}

        {/* Stock photos grid */}
        {!isGenerating && stockMedia.length > 0 && !imageUrl && (
          <div className="grid grid-cols-2 gap-2">
            {stockMedia.slice(0, 4).map((item: any, idx: number) => (
              <div key={idx} className="relative rounded-lg overflow-hidden border border-[var(--color-border)] aspect-video">
                <img src={item.url || item.thumbnailUrl} alt={item.alt} className="w-full h-full object-cover" />
                <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[9px] px-1 py-0.5 truncate">
                  Photo by {item.photographer}
                </div>
              </div>
            ))}
            <div className="col-span-2 flex justify-end">
              <button
                type="button"
                onClick={() => onGenerate('ai', selectedStyle)}
                className="text-[10px] font-bold text-[var(--color-primary-600)] hover:underline flex items-center gap-1"
              >
                <Sparkles className="h-3 w-3" /> Switch to AI Generation instead
              </button>
            </div>
          </div>
        )}

        {/* Error state */}
        {visualError && !isGenerating && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between animate-in fade-in">
            <span>{visualError}</span>
            <div className="flex gap-2 ml-2 shrink-0">
              <button
                type="button"
                onClick={() => { onSetError(null); onGenerate('ai'); }}
                className="font-bold underline hover:text-red-900"
              >
                Try AI
              </button>
              <button
                type="button"
                onClick={() => onSetError(null)}
                className="font-bold text-red-400 hover:text-red-700"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main DiagramPreview Component ───────────────────────────────────────────
export function DiagramPreview({ data }: DiagramPreviewProps) {
  const [visualSource, setVisualSource] = useState<'auto' | 'stock' | 'ai'>('ai');
  const [isGeneratingVisual, setIsGeneratingVisual] = useState(false);
  const [loadingStage, setLoadingStage] = useState(0);
  const [visualData, setVisualData] = useState<any>(null);
  const [visualError, setVisualError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'diagram' | 'details'>('diagram');

  if (!data) return null;

  const flowType = isFlowType(data.diagramType);
  const generatedImageUrl = visualData?.image?.url || null;

  const handleGenerateArtwork = async (sourceOverride?: 'auto' | 'stock' | 'ai', instructionsOverride?: string) => {
    setIsGeneratingVisual(true);
    setVisualError(null);
    setLoadingStage(0);

    const source = sourceOverride || visualSource;

    // Advance the loading stage every 4 seconds to show progress
    const stageInterval = setInterval(() => {
      setLoadingStage((prev) => Math.min(prev + 1, AI_LOADING_STAGES.length - 1));
    }, 4000);

    // Extract component names to pass as requiredElements
    const rawElements = Array.isArray(data.labels) && data.labels.length > 0
      ? data.labels.map((l: any) => l.name)
      : (Array.isArray(data.nodes) && data.nodes.length > 0
          ? data.nodes.map((n: any) => n.label)
          : []);

    try {
      const result = await CreationService.generateVisual({
        topic: data.topic || data.title,
        subject: data.subject,
        grade: data.grade,
        style: instructionsOverride || `educational ${data.diagramType || 'scientific diagram'} illustration`,
        aspectRatio: 'landscape',
        creationType: 'diagram',
        visualSource: source,
        additionalInstructions: data.goal || '',
        // Extended diagram-specific parameters for rich Pollinations prompt
        diagramType: data.diagramType || 'Labeled Diagram',
        visualStyle: instructionsOverride || data.style || 'Realistic Scientific',
        requiredElements: rawElements,
        orientation: data.orientation || 'landscape',
      });

      clearInterval(stageInterval);
      setIsGeneratingVisual(false);

      if (result.success && (result.image || (result.media && result.media.length > 0))) {
        setVisualData({ image: result.image, media: result.media, provider: result.provider, source: result.source });
      } else {
        const errMsg = result.error || result.message;
        if (errMsg?.includes('busy') || errMsg?.includes('429')) {
          setVisualError('AI image generation is temporarily busy. Please try again shortly.');
        } else if (errMsg?.includes('unavailable') || errMsg?.includes('503')) {
          setVisualError('AI visual generation is temporarily unavailable. Try again in a moment.');
        } else if (errMsg?.includes('timeout')) {
          setVisualError('The image is taking longer than expected. Please try again.');
        } else {
          setVisualError(errMsg || 'No visual found. Please try again.');
        }
      }
    } catch (e: any) {
      clearInterval(stageInterval);
      setIsGeneratingVisual(false);
      setVisualError(e.message || 'Network error during visual generation.');
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="border-b border-[var(--color-border)] pb-4 space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="text-xs font-semibold text-pink-800 bg-pink-100/70 border border-pink-200 px-3 py-0.5 rounded-full inline-block">
            {data.subject} • {data.grade} • {data.diagramType || 'Diagram'}
          </span>
          <span className="text-[10px] text-[var(--color-text-tertiary)] font-medium">{data.orientation || 'Landscape'} • {data.style || 'Classroom'} style</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-[var(--color-text-primary)] tracking-tight">{data.title}</h2>
        {data.goal && <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">{data.goal}</p>}
      </div>

      {/* ─── SECTION 1: STRUCTURED DIAGRAM ─── */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-[var(--color-text-tertiary)]" />
          <span className="text-xs font-bold text-[var(--color-text-tertiary)] uppercase tracking-wider">Diagram Structure</span>
        </div>

        {/* Tab bar for flow diagrams */}
        {flowType && (
          <div className="flex gap-1 p-1 rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border)]">
            {[
              { key: 'diagram', label: 'Diagram', icon: <ArrowRight className="h-3 w-3" /> },
              { key: 'details', label: 'Node Details', icon: <Info className="h-3 w-3" /> },
            ].map(({ key, label, icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTab(key as any)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === key
                    ? 'bg-[var(--color-surface)] text-[var(--color-primary-700)] shadow-xs border border-[var(--color-border)]'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                }`}
              >
                {icon} {label}
              </button>
            ))}
          </div>
        )}

        {/* Canvas */}
        {(!flowType || activeTab === 'diagram') && (
          <div className="card p-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xs">
            {flowType ? (
              <NodeFlowCanvas data={data} />
            ) : (
              <LabeledDiagramCanvas data={data} generatedImageUrl={generatedImageUrl || undefined} />
            )}
          </div>
        )}

        {/* Node detail cards for flow type */}
        {flowType && activeTab === 'details' && (() => {
          const nodes: any[] = Array.isArray(data.nodes) && data.nodes.length > 0
            ? data.nodes
            : (Array.isArray(data.elements) ? data.elements : []);

          if (nodes.length === 0) return null;

          return (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {nodes.map((node: any, idx: number) => (
                <div key={node.id || idx} className="p-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xs space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="h-5 w-5 rounded-full bg-[var(--color-primary-600)] text-white text-[10px] font-black flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <h4 className="text-xs font-bold text-[var(--color-text-primary)]">{node.label}</h4>
                  </div>
                  {(node.description || node.desc) && (
                    <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed pl-7">
                      {node.description || node.desc}
                    </p>
                  )}
                </div>
              ))}
            </div>
          );
        })()}
      </div>

      {/* ─── SECTION 2: AI SUPPORTING VISUAL ─── */}
      <AiVisualSection
        data={data}
        visualSource={visualSource}
        setVisualSource={setVisualSource}
        isGenerating={isGeneratingVisual}
        loadingStage={loadingStage}
        visualData={visualData}
        visualError={visualError}
        onGenerate={handleGenerateArtwork}
        onSetError={setVisualError}
      />

      {/* ─── SECTION 3: RELATIONSHIPS ─── (labeled type only) */}
      {!flowType && Array.isArray(data.relationships) && data.relationships.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-primary)] flex items-center gap-1.5">
            <ArrowRight className="h-3.5 w-3.5 text-[var(--color-primary-600)]" /> Relationships
          </h3>
          <div className="space-y-1.5">
            {data.relationships.map((rel: any, idx: number) => (
              <div key={idx} className="flex items-center gap-2 p-2.5 rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border)] text-xs">
                <span className="font-bold text-[var(--color-text-primary)]">{rel.from}</span>
                <ArrowRight className="h-3 w-3 text-[var(--color-text-tertiary)] shrink-0" />
                <span className="font-bold text-[var(--color-text-primary)]">{rel.to}</span>
                {rel.label && <span className="text-[var(--color-text-tertiary)] italic ml-1">— {rel.label}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Legend */}
      {Array.isArray(data.legend) && data.legend.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-primary)] flex items-center gap-1.5">
            <Tag className="h-3.5 w-3.5" /> Legend
          </h3>
          <div className="flex flex-wrap gap-2">
            {data.legend.map((item: any, idx: number) => (
              <div key={idx} className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-xs font-semibold">
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color || '#6b7280' }} />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Description */}
      {data.description && (
        <div className="p-4 rounded-2xl bg-[var(--color-surface-elevated)] border border-[var(--color-border)]">
          <div className="flex items-center gap-2 mb-2">
            <Info className="h-3.5 w-3.5 text-[var(--color-primary-600)]" />
            <span className="text-xs font-bold text-[var(--color-text-primary)]">Diagram Description</span>
          </div>
          <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">{data.description}</p>
        </div>
      )}
    </div>
  );
}
