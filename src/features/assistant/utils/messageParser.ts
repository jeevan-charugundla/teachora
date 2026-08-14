export interface ParsedAssistantMessage {
  mainContent: string;
  followUpPrompt: string | null;
  followUpItems: string[];
}

/**
 * Splits an assistant message into the primary educational content and
 * any trailing follow-up suggestion prompts (e.g. "Would you like me to: ...").
 */
export function parseAssistantMessage(rawContent: string): ParsedAssistantMessage {
  if (!rawContent) {
    return { mainContent: '', followUpPrompt: null, followUpItems: [] };
  }

  // Regex to detect the start of the follow-up section
  const followUpPattern = /\n+(?:###*\s*)?(?:Would you like(?: me to| us to| to)?:?|Next steps:?|Suggested follow-ups:?|Here are a few things we can do next:?)([\s\S]*)$/i;
  const match = rawContent.match(followUpPattern);

  if (!match || match.index === undefined) {
    return {
      mainContent: rawContent.trim(),
      followUpPrompt: null,
      followUpItems: [],
    };
  }

  const mainContent = rawContent.slice(0, match.index).trim();
  const followUpSection = match[0].trim();

  // Extract the individual suggestion bullets
  const lines = followUpSection.split('\n');
  const promptLine = lines[0].replace(/^#+\s*/, '').replace(/:\s*$/, ':');
  const items: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('- ') || line.startsWith('* ') || /^\d+\.\s/.test(line)) {
      const cleanItem = line
        .replace(/^[-*]\s+|\d+\.\s+/, '')
        .replace(/\*\*/g, '')
        .replace(/\?$/, '')
        .trim();
      if (cleanItem) items.push(cleanItem);
    }
  }

  return {
    mainContent: mainContent || rawContent.trim(),
    followUpPrompt: items.length > 0 ? promptLine : null,
    followUpItems: items,
  };
}

/**
 * Converts Markdown text into clean, readable plain text for clipboard copying or workspace saving.
 * Strips all raw symbols (#, **, *, `, etc.) while preserving natural layout.
 */
export function cleanMarkdownToPlainText(markdown: string): string {
  if (!markdown) return '';
  return markdown
    .replace(/^#+\s+/gm, '') // Remove heading markers
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markers
    .replace(/\*(.*?)\*/g, '$1') // Remove italic markers
    .replace(/__(.*?)__/g, '$1')
    .replace(/_(.*?)_/g, '$1')
    .replace(/`([^`]+)`/g, '$1') // Remove inline code
    .replace(/^>\s+/gm, '') // Remove blockquote markers
    .replace(/\|/g, '  ') // Clean tables
    .replace(/^[-*]\s+/gm, '• ') // Normalize bullets
    .trim();
}
