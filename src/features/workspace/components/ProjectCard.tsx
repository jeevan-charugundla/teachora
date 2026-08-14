import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Star,
  MoreVertical,
  Edit2,
  Trash2,
  ExternalLink,
  BookOpen,
  Presentation,
  GitFork,
  HelpCircle,
  FileSpreadsheet,
  Video,
  Layers,
  Puzzle,
  FileText,
  Clock,
} from 'lucide-react';
import type { Project } from '@/types/database';
import { cn } from '@/lib/utils';
import { touchProjectLastOpened } from '@/services/supabase/projects';

interface ProjectCardProps {
  project: Project;
  onToggleFavorite: (projectId: string, current: boolean) => void;
  onRename: (project: Project) => void;
  onDelete: (project: Project) => void;
}

// Icon helper by creation type
export function getProjectTypeIcon(type?: string) {
  const t = (type || '').toLowerCase();
  if (t.includes('lesson') || t.includes('note')) return BookOpen;
  if (t.includes('presentation')) return Presentation;
  if (t.includes('diagram') || t.includes('mind') || t.includes('chart') || t.includes('infographic') || t.includes('visual')) return GitFork;
  if (t.includes('quiz') || t.includes('test') || t.includes('exam') || t.includes('question')) return HelpCircle;
  if (t.includes('worksheet') || t.includes('assignment')) return FileSpreadsheet;
  if (t.includes('video')) return Video;
  if (t.includes('flashcard')) return Layers;
  if (t.includes('activity')) return Puzzle;
  return FileText;
}

// Color helper by creation type
export function getProjectTypeColor(type?: string) {
  const t = (type || '').toLowerCase();
  if (t.includes('lesson')) return 'bg-emerald-500/10 text-emerald-600 border-emerald-200';
  if (t.includes('presentation')) return 'bg-blue-500/10 text-blue-600 border-blue-200';
  if (t.includes('diagram') || t.includes('mind') || t.includes('chart')) return 'bg-purple-500/10 text-purple-600 border-purple-200';
  if (t.includes('quiz') || t.includes('test')) return 'bg-amber-500/10 text-amber-600 border-amber-200';
  if (t.includes('worksheet') || t.includes('assignment')) return 'bg-teal-500/10 text-teal-600 border-teal-200';
  if (t.includes('video')) return 'bg-rose-500/10 text-rose-600 border-rose-200';
  return 'bg-slate-500/10 text-slate-600 border-slate-200';
}

export function formatRelativeTime(dateStr?: string | null): string {
  if (!dateStr) return 'Recently';
  const date = new Date(dateStr);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMins = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMins < 1) return 'Just now';
  if (diffInMins < 60) return `${diffInMins}m ago`;
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function ProjectCard({
  project,
  onToggleFavorite,
  onRename,
  onDelete,
}: ProjectCardProps) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const Icon = getProjectTypeIcon(project.project_type || project.type);
  const colorClass = getProjectTypeColor(project.project_type || project.type);

  const isFavorite = Boolean(project.is_favorite);
  const displayType = (project.project_type || project.type || 'Material')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

  const handleCardClick = () => {
    touchProjectLastOpened(project.id);
    navigate(`/app/lessons/${project.id}`);
  };

  return (
    <div
      className="group relative flex flex-col justify-between rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 transition-all hover:border-[var(--color-border-hover)] hover:shadow-md cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Top Header Bar */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg border', colorClass)}>
              <Icon className="h-4.5 w-4.5" />
            </div>
            <div>
              <span className="text-[11px] font-medium tracking-wide uppercase text-[var(--color-text-tertiary)]">
                {displayType}
              </span>
              {(project.subject || project.grade_level) && (
                <p className="text-xs text-[var(--color-text-secondary)] font-medium line-clamp-1">
                  {[project.subject, project.grade_level].filter(Boolean).join(' • ')}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            {/* Star Favorite Button */}
            <button
              type="button"
              onClick={() => onToggleFavorite(project.id, isFavorite)}
              className={cn(
                'p-1.5 rounded-lg transition-colors',
                isFavorite
                  ? 'text-amber-500 hover:text-amber-600'
                  : 'text-[var(--color-text-tertiary)] hover:text-amber-500 hover:bg-[var(--color-surface-elevated)]'
              )}
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Star className={cn('h-4 w-4', isFavorite && 'fill-amber-500')} />
            </button>

            {/* Actions Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-1.5 rounded-lg text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated)] transition-colors"
              >
                <MoreVertical className="h-4 w-4" />
              </button>

              {menuOpen && (
                <div
                  className="absolute right-0 top-8 z-30 w-44 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-1.5 shadow-xl animate-in fade-in zoom-in-95 duration-100"
                  onMouseLeave={() => setMenuOpen(false)}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      handleCardClick();
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated)]"
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> Open Project
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onRename(project);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated)]"
                  >
                    <Edit2 className="h-3.5 w-3.5" /> Rename
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onToggleFavorite(project.id, isFavorite);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated)]"
                  >
                    <Star className="h-3.5 w-3.5" /> {isFavorite ? 'Unfavorite' : 'Favorite'}
                  </button>
                  <div className="my-1 border-t border-[var(--color-border)]" />
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onDelete(project);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Project Title */}
        <h3 className="font-semibold text-sm text-[var(--color-text-primary)] line-clamp-2 mb-1 group-hover:text-[var(--color-primary-600)] transition-colors">
          {project.title}
        </h3>

        {/* Description snippet */}
        {project.description && (
          <p className="text-xs text-[var(--color-text-secondary)] line-clamp-2 mb-3">
            {project.description}
          </p>
        )}
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between pt-3 mt-2 border-t border-[var(--color-border)] text-[11px] text-[var(--color-text-tertiary)]">
        <span
          className={cn(
            'inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-medium text-[10px] capitalize',
            project.status === 'completed'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-amber-50 text-amber-700 border border-amber-200'
          )}
        >
          {project.status === 'completed' ? 'Completed' : 'Draft'}
        </span>

        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {formatRelativeTime(project.last_opened_at || project.updated_at)}
        </span>
      </div>
    </div>
  );
}
