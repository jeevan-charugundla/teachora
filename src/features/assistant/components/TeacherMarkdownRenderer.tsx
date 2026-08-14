import React from 'react';
import { cn } from '../../../lib/utils';

interface TeacherMarkdownRendererProps {
  content: string;
  className?: string;
}

export function TeacherMarkdownRenderer({ content, className }: TeacherMarkdownRendererProps) {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // 1. Markdown Tables (| Header 1 | Header 2 |)
    if (trimmed.startsWith('|') && trimmed.endsWith('|') && i + 1 < lines.length && lines[i + 1].includes('---')) {
      const tableRows: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        tableRows.push(lines[i].trim());
        i++;
      }

      if (tableRows.length >= 2) {
        const headerCols = tableRows[0]
          .split('|')
          .slice(1, -1)
          .map((c) => c.trim());

        const bodyRows = tableRows.slice(2).map((r) =>
          r
            .split('|')
            .slice(1, -1)
            .map((c) => c.trim())
        );

        elements.push(
          <div key={`table-${i}`} className="my-4 overflow-x-auto rounded-xl border border-[var(--color-border)] shadow-xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-elevated)]">
                  {headerCols.map((h, hIdx) => (
                    <th key={hIdx} className="px-3.5 py-2.5 font-bold text-[var(--color-text-primary)]">
                      {renderInlineFormatting(h)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)] bg-[var(--color-surface)]">
                {bodyRows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-[var(--color-surface-elevated)]/50 transition-colors">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="px-3.5 py-2 text-[var(--color-text-secondary)]">
                        {renderInlineFormatting(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      continue;
    }

    // 2. Headings (H1 - H5)
    if (trimmed.startsWith('#')) {
      const level = trimmed.match(/^#+/)?.[0].length || 1;
      const text = trimmed.replace(/^#+\s*/, '').trim();

      if (level === 1) {
        elements.push(
          <h1 key={`h1-${i}`} className="font-bold text-xl text-[var(--color-text-primary)] mt-5 mb-2.5 tracking-tight border-b border-[var(--color-border)] pb-1.5">
            {renderInlineFormatting(text)}
          </h1>
        );
      } else if (level === 2) {
        elements.push(
          <h2 key={`h2-${i}`} className="font-bold text-lg text-[var(--color-text-primary)] mt-4 mb-2 tracking-tight">
            {renderInlineFormatting(text)}
          </h2>
        );
      } else if (level === 3) {
        elements.push(
          <h3 key={`h3-${i}`} className="font-semibold text-base text-[var(--color-text-primary)] mt-3.5 mb-1.5">
            {renderInlineFormatting(text)}
          </h3>
        );
      } else {
        elements.push(
          <h4 key={`h4-${i}`} className="font-semibold text-sm text-[var(--color-text-primary)] mt-3 mb-1">
            {renderInlineFormatting(text)}
          </h4>
        );
      }
      i++;
      continue;
    }

    // 3. Blockquotes (> quote)
    if (trimmed.startsWith('>')) {
      const quoteText = trimmed.replace(/^>\s*/, '');
      elements.push(
        <blockquote
          key={`quote-${i}`}
          className="my-3 border-l-3 border-[var(--color-primary-500)] bg-[var(--color-primary-50)]/50 pl-3.5 py-1.5 rounded-r-lg text-xs italic text-[var(--color-text-secondary)]"
        >
          {renderInlineFormatting(quoteText)}
        </blockquote>
      );
      i++;
      continue;
    }

    // 4. Unordered Lists (- or *)
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const itemText = trimmed.slice(2);
      elements.push(
        <div key={`ul-${i}`} className="flex items-start gap-2.5 my-1 ml-1 text-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-primary-600)] mt-2 shrink-0" />
          <div className="flex-1 text-[var(--color-text-primary)] leading-relaxed">
            {renderInlineFormatting(itemText)}
          </div>
        </div>
      );
      i++;
      continue;
    }

    // 5. Numbered Lists (1. 2. 3.)
    if (/^\d+\.\s/.test(trimmed)) {
      const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
      const num = numMatch ? numMatch[1] : '•';
      const itemText = numMatch ? numMatch[2] : trimmed;

      elements.push(
        <div key={`ol-${i}`} className="flex items-start gap-2.5 my-1.5 ml-0.5 text-sm">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-100)] text-[11px] font-bold text-[var(--color-primary-700)]">
            {num}
          </span>
          <div className="flex-1 text-[var(--color-text-primary)] leading-relaxed pt-0.5">
            {renderInlineFormatting(itemText)}
          </div>
        </div>
      );
      i++;
      continue;
    }

    // 6. Blank lines
    if (!trimmed) {
      elements.push(<div key={`blank-${i}`} className="h-2" />);
      i++;
      continue;
    }

    // 7. Regular paragraphs
    elements.push(
      <p key={`p-${i}`} className="my-1.5 text-sm text-[var(--color-text-primary)] leading-relaxed">
        {renderInlineFormatting(line)}
      </p>
    );
    i++;
  }

  return <div className={cn('teacher-document-content space-y-0.5', className)}>{elements}</div>;
}

/**
 * Helper that formats inline bold (**text**), italic (*text*), and code (`code`).
 */
function renderInlineFormatting(text: string): React.ReactNode {
  if (!text) return null;

  const tokenRegex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|__[^_]+__|_[^_]+_)/g;
  const parts = text.split(tokenRegex);

  return parts.map((part, index) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={index}
          className="rounded bg-[var(--color-surface-elevated)] border border-[var(--color-border)] px-1.5 py-0.5 text-[12px] font-mono text-[var(--color-primary-700)]"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="font-bold text-[var(--color-text-primary)]">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('__') && part.endsWith('__')) {
      return (
        <strong key={index} className="font-bold text-[var(--color-text-primary)]">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if ((part.startsWith('*') && part.endsWith('*')) || (part.startsWith('_') && part.endsWith('_'))) {
      return (
        <em key={index} className="italic text-[var(--color-text-secondary)]">
          {part.slice(1, -1)}
        </em>
      );
    }
    return part;
  });
}
