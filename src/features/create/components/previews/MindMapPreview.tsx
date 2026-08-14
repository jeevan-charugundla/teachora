import { ChevronRight } from 'lucide-react';

interface MindMapPreviewProps {
  data: any;
}

export function MindMapPreview({ data }: MindMapPreviewProps) {
  if (!data || !data.rootNode) return null;

  const root = data.rootNode;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-[var(--color-border)] pb-4">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="bg-green-50 text-green-700 border border-green-200 text-xs px-2.5 py-0.5 rounded-full font-semibold">
            {data.subject} • {data.grade}
          </span>
          <span className="text-xs text-[var(--color-text-tertiary)]">• {data.layout} Layout • {data.depth} Depth</span>
        </div>
        <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">{data.title}</h2>
      </div>

      {/* Visual Concept Tree */}
      <div className="space-y-6">
        {/* Central Core Concept Node */}
        <div className="p-4 rounded-2xl border-2 border-green-500 bg-green-50/70 text-center max-w-md mx-auto shadow-sm">
          <span className="text-[10px] font-black uppercase tracking-widest text-green-700 block mb-1">
            Central Core Concept
          </span>
          <h3 className="text-lg font-black text-green-950">{root.label}</h3>
        </div>

        {/* Branching Category Nodes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {root.children?.map((branch: any) => (
            <div
              key={branch.id}
              className="card p-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xs space-y-3"
            >
              <div className="flex items-center gap-2 pb-2 border-b border-[var(--color-border)]">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: branch.color || '#059669' }}
                />
                <h4 className="text-xs font-bold text-[var(--color-text-primary)]">{branch.label}</h4>
              </div>

              {/* Subtopic Leaf Nodes */}
              <div className="space-y-1.5 pl-2">
                {branch.children?.map((child: any) => (
                  <div
                    key={child.id}
                    className="flex items-center gap-2 p-2 rounded-lg bg-[var(--color-surface-elevated)] text-xs text-[var(--color-text-primary)] font-medium"
                  >
                    <ChevronRight className="h-3 w-3 text-[var(--color-text-tertiary)]" />
                    <span>{child.label}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
