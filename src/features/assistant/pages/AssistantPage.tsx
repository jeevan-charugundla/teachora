import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Send,
  Loader2,
  Sparkles,
  BookOpen,
  HelpCircle,
  FileSpreadsheet,
  ClipboardList,
  Lightbulb,
  ArrowDown,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Copy,
  CheckCheck,
  FolderPlus,
  SlidersHorizontal,
  RefreshCw,
  MessageSquareText,
  Paperclip,
  WifiOff,
  Maximize2,
  ArrowRight,
  Download,
  FileText,
  FileSearch,
  Menu,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { ChatService } from '@/services/ai/ChatService';
import {
  getConversations,
  getMessages,
  deleteConversation,
  updateConversationTitle,
  createConversation,
} from '@/services/supabase/conversations';
import { createProject } from '@/services/supabase/projects';
import { uploadAndProcessPDF, getDocumentDetails, type ProcessedDocument } from '@/services/documents/documentService';
import type { Conversation, Message } from '@/types/database';
import { cn, formatRelativeTime } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { TeacherMarkdownRenderer } from '../components/TeacherMarkdownRenderer';
import {
  parseAssistantMessage,
  cleanMarkdownToPlainText,
} from '../utils/messageParser';
import { SaveExportModal, type ExportFormat } from '../components/SaveExportModal';

const suggestedPrompts = [
  { label: 'Explain photosynthesis for Grade 8', prompt: 'Explain photosynthesis for Grade 8 with key concepts and real-world examples.' },
  { label: 'Give me 5 classroom activity ideas', prompt: 'Give me 5 interactive classroom activity ideas for teaching science.' },
  { label: 'Create questions about fractions', prompt: 'Create 5 conceptual questions about fractions with answer explanations.' },
  { label: 'Make this explanation simpler', prompt: 'Make this explanation simpler and more relatable for middle school students.' },
  { label: 'Help me plan a 45-minute lesson', prompt: 'Help me plan a structured 45-minute lesson.' },
];

export function AssistantPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuthStore();

  // Online / offline tracking
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Conversations state
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  // Attached PDF Document State
  const [activeDocument, setActiveDocument] = useState<ProcessedDocument | null>(null);
  const [isProcessingDoc, setIsProcessingDoc] = useState(false);
  const [docProgressStatus, setDocProgressStatus] = useState<string>('');

  // Chat input state
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [savedWorkspaceMsgId, setSavedWorkspaceMsgId] = useState<string | null>(null);

  // Export Modal state
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportContent, setExportContent] = useState<string>('');
  const [exportTitle, setExportTitle] = useState<string>('');

  // Sidebar & context state (defaults to hidden on mobile viewports)
  const [showHistorySidebar, setShowHistorySidebar] = useState(false);
  const [showContextModal, setShowContextModal] = useState(false);
  const [editingConvId, setEditingConvId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  // Teacher context overrides
  const [activeSubject, setActiveSubject] = useState(profile?.subjects?.[0] || 'General Science');
  const [activeGrade, setActiveGrade] = useState(profile?.grade_levels?.[0] || 'Grade 8');
  const [activeStyle, setActiveStyle] = useState(profile?.teaching_style || 'Interactive and inquiry-based');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showScrollDown, setShowScrollDown] = useState(false);

  // 1. Load conversations list
  const loadConversations = useCallback(async () => {
    if (!user) return;
    try {
      const data = await getConversations(user.id);
      setConversations(data);
      if (data.length > 0 && !activeConversationId) {
        setActiveConversationId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setIsLoadingConversations(false);
    }
  }, [user, activeConversationId]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // 2. Load messages and active document for conversation
  useEffect(() => {
    if (!activeConversationId) {
      setMessages([]);
      setActiveDocument(null);
      return;
    }

    const fetchMessagesAndDoc = async () => {
      setIsLoadingMessages(true);
      setError('');
      try {
        const msgs = await getMessages(activeConversationId);
        setMessages(msgs);

        // Check if this conversation had an active document
        const currentConv = conversations.find((c) => c.id === activeConversationId);
        const docId = (currentConv?.context as Record<string, unknown>)?.active_document_id as string | undefined;

        if (docId && user) {
          const docData = await getDocumentDetails(docId, user.id);
          if (docData) {
            setActiveDocument({
              fileId: docData.id,
              fileName: docData.file_name,
              fileSize: Number(docData.file_size) || 0,
              pageCount: Number((docData.metadata as Record<string, unknown>)?.page_count) || 1,
              chunkCount: 0,
              storagePath: '',
            });
          }
        } else {
          setActiveDocument(null);
        }
      } catch (err) {
        console.error('Failed to load messages:', err);
        setError('Could not load message history.');
      } finally {
        setIsLoadingMessages(false);
      }
    };

    fetchMessagesAndDoc();
  }, [activeConversationId, conversations, user]);

  // Scroll to bottom when messages update
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    setShowScrollDown(scrollHeight - scrollTop - clientHeight > 120);
  };

  // Handle PDF File Upload & Processing
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setError('Please select a PDF document.');
      return;
    }

    setIsProcessingDoc(true);
    setError('');

    const res = await uploadAndProcessPDF(file, user.id, (status) => {
      setDocProgressStatus(status);
    });

    setIsProcessingDoc(false);
    setDocProgressStatus('');

    if (res.success && res.document) {
      setActiveDocument(res.document);
      setToastMessage(`✓ ${res.document.fileName} analyzed and ready for questions.`);
      setTimeout(() => setToastMessage(null), 3500);
      inputRef.current?.focus();
    } else {
      setError(res.error || 'Failed to process the PDF. Please try another file.');
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Remove attached document
  const handleRemoveDocument = () => {
    setActiveDocument(null);
    setToastMessage('Document removed from active chat context.');
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Start new conversation
  const handleNewChat = async () => {
    if (!user) return;
    try {
      const newConv = await createConversation(user.id, 'New Conversation', {
        subject: activeSubject,
        grade: activeGrade,
        teaching_style: activeStyle,
        active_document_id: null,
      });
      setConversations((prev) => [newConv, ...prev]);
      setActiveConversationId(newConv.id);
      setMessages([]);
      setActiveDocument(null);
      setInput('');
      setShowHistorySidebar(false);
      inputRef.current?.focus();
    } catch {
      setError('Failed to start a new chat.');
    }
  };

  // Delete conversation
  const handleDeleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this conversation?')) return;
    try {
      await deleteConversation(id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeConversationId === id) {
        const remaining = conversations.filter((c) => c.id !== id);
        setActiveConversationId(remaining.length > 0 ? remaining[0].id : null);
      }
    } catch {
      setError('Failed to delete conversation.');
    }
  };

  // Rename conversation
  const handleRename = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!editingTitle.trim()) return;
    try {
      await updateConversationTitle(id, editingTitle.trim());
      setConversations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, title: editingTitle.trim() } : c))
      );
      setEditingConvId(null);
    } catch {
      setError('Failed to update title.');
    }
  };

  // Send message (Document-Aware when activeDocument exists)
  const handleSend = async (customPrompt?: string) => {
    if (!isOnline) {
      setError("You're offline. Reconnect to use Teachora AI.");
      return;
    }

    const textToSend = (customPrompt || input).trim();
    if (!textToSend || isSending || !user) return;

    setInput('');
    setError('');
    setIsSending(true);

    // Optimistic user message
    const tempUserMsg: Message = {
      id: crypto.randomUUID(),
      conversation_id: activeConversationId || 'temp',
      user_id: user.id,
      role: 'user',
      content: textToSend,
      metadata: {
        optimistic: true,
        document_id: activeDocument?.fileId || null,
        document_name: activeDocument?.fileName || null,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const response = await ChatService.sendMessage({
        conversationId: activeConversationId,
        message: textToSend,
        documentId: activeDocument?.fileId || null,
        teacherContext: {
          name: profile?.full_name || 'Teacher',
          subject: activeSubject,
          grade: activeGrade,
          language: profile?.preferred_language || 'English',
          teaching_style: activeStyle,
          difficulty: profile?.default_difficulty || 'Medium',
        },
        history: messages.map((m) => ({ role: m.role, content: m.content })),
      });

      if (response.success && response.message) {
        if (!activeConversationId && response.conversation_id) {
          setActiveConversationId(response.conversation_id);
          await loadConversations();
        }

        const newAssistantMsg: Message = {
          id: response.assistant_message_id || crypto.randomUUID(),
          conversation_id: response.conversation_id || activeConversationId || '',
          user_id: user.id,
          role: 'assistant',
          content: response.message,
          metadata: {
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            document_name: response.document_name || activeDocument?.fileName || null,
            source_pages: response.source_pages || null,
          },
          created_at: new Date().toISOString(),
        };

        setMessages((prev) => [...prev.filter((m) => !m.metadata?.optimistic), tempUserMsg, newAssistantMsg]);
      } else {
        setError(response.error || "Teachora is busy right now. Please try again.");
      }
    } catch {
      setError("Teachora couldn't connect to the AI assistant. Please check your internet connection.");
    } finally {
      setIsSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Copy ONLY clean educational content
  const handleCopyCleanContent = (mainContent: string, msgId: string) => {
    const cleanText = cleanMarkdownToPlainText(mainContent);
    navigator.clipboard.writeText(cleanText);
    setCopiedMsgId(msgId);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  // Open Save / Export Modal
  const handleOpenExportModal = (mainContent: string) => {
    const titleMatch = mainContent.match(/^#+\s*(.+)$/m);
    const title = titleMatch ? titleMatch[1].trim() : `${activeSubject} - Teaching Material`;
    setExportContent(mainContent);
    setExportTitle(title);
    setExportModalOpen(true);
  };

  // Save ONLY clean educational content as project in Supabase Workspace
  const handleSaveToWorkspace = async (mainContent: string, msgId: string) => {
    if (!user) return;
    try {
      const titleMatch = mainContent.match(/^#+\s*(.+)$/m);
      const title = titleMatch ? titleMatch[1].slice(0, 50) : `${activeSubject} - Teaching Material`;

      await createProject({
        user_id: user.id,
        title,
        type: 'notes',
        project_type: 'notes',
        subject: activeSubject,
        grade: activeGrade,
        status: 'completed',
        content: { text: mainContent, generated_at: new Date().toISOString() },
        metadata: {
          source: 'assistant',
          conversation_id: activeConversationId,
          document_id: activeDocument?.fileId || null,
        },
        is_favorite: false,
      });

      setSavedWorkspaceMsgId(msgId);
      setToastMessage('Saved to Workspace successfully.');
      setTimeout(() => {
        setSavedWorkspaceMsgId(null);
        setToastMessage(null);
      }, 3000);
    } catch (err) {
      console.error('Failed to save to workspace:', err);
    }
  };

  const handleExportSuccess = (format: ExportFormat) => {
    const label =
      format === 'pdf'
        ? 'PDF document'
        : format === 'docx'
        ? 'Word document'
        : format === 'txt'
        ? 'Plain text file'
        : 'Print dialog opened';
    setToastMessage(`${label} generated successfully.`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="flex h-[calc(100dvh-64px)] lg:h-screen bg-[var(--color-surface-elevated)] overflow-hidden relative">
      {/* Mobile Drawer Overlay Backdrop */}
      {showHistorySidebar && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs md:hidden"
          onClick={() => setShowHistorySidebar(false)}
          aria-hidden="true"
        />
      )}

      {/* 1. Conversations History Sidebar / Drawer */}
      <aside
        className={cn(
          'flex flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)] transition-all duration-200 z-50',
          // Mobile overlay vs desktop sidebar
          'fixed inset-y-0 left-0 w-80 md:relative md:inset-auto',
          showHistorySidebar
            ? 'translate-x-0 shadow-2xl md:shadow-none'
            : '-translate-x-full md:translate-x-0 md:w-80 md:flex hidden'
        )}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-2">
            <MessageSquareText className="h-5 w-5 text-[#0D9488]" />
            <h2 className="font-semibold text-sm text-[var(--color-text-primary)]">Chat History</h2>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleNewChat}
              className="inline-flex items-center gap-1 rounded-lg bg-teal-50 text-[#0D9488] hover:bg-teal-100 px-2.5 py-1 text-xs font-semibold transition-colors"
              title="Start new conversation"
            >
              <Plus className="h-3.5 w-3.5" />
              New
            </button>
            <button
              onClick={() => setShowHistorySidebar(false)}
              className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 md:hidden"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {isLoadingConversations ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2 text-[var(--color-text-tertiary)]">
              <Loader2 className="h-5 w-5 animate-spin text-[#0D9488]" />
              <span className="text-xs">Loading history…</span>
            </div>
          ) : conversations.length === 0 ? (
            <div className="py-8 px-4 text-center">
              <p className="text-xs text-[var(--color-text-tertiary)]">No conversations yet.</p>
              <button
                onClick={handleNewChat}
                className="mt-3 text-xs font-medium text-[#0D9488] hover:underline"
              >
                Start your first chat
              </button>
            </div>
          ) : (
            conversations.map((conv) => {
              const isActive = conv.id === activeConversationId;
              const isEditing = editingConvId === conv.id;

              return (
                <div
                  key={conv.id}
                  onClick={() => {
                    if (!isEditing) {
                      setActiveConversationId(conv.id);
                      setShowHistorySidebar(false);
                    }
                  }}
                  className={cn(
                    'group relative flex items-center justify-between rounded-lg px-3 py-2.5 text-xs font-medium cursor-pointer transition-colors',
                    isActive
                      ? 'bg-teal-50 text-[#0D9488] font-bold'
                      : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-text-primary)]'
                  )}
                >
                  {isEditing ? (
                    <div className="flex items-center gap-1 w-full" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleRename(conv.id, e as unknown as React.MouseEvent)}
                        autoFocus
                        className="flex-1 rounded border border-teal-300 bg-[var(--color-surface)] px-1.5 py-0.5 text-xs outline-none"
                      />
                      <button
                        onClick={(e) => handleRename(conv.id, e)}
                        className="p-1 hover:text-[var(--color-success-600)]"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setEditingConvId(null)}
                        className="p-1 hover:text-[var(--color-danger-600)]"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="min-w-0 flex-1 pr-2">
                        <p className="truncate font-medium">{conv.title || 'Untitled Chat'}</p>
                        <p className="text-[10px] text-[var(--color-text-tertiary)] mt-0.5">
                          {formatRelativeTime(conv.updated_at)}
                        </p>
                      </div>
                      <div className="hidden group-hover:flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingConvId(conv.id);
                            setEditingTitle(conv.title || '');
                          }}
                          className="p-1 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] rounded"
                          title="Rename"
                        >
                          <Edit2 className="h-3 w-3" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteConversation(conv.id, e)}
                          className="p-1 text-[var(--color-text-tertiary)] hover:text-[var(--color-danger-600)] rounded"
                          title="Delete"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Teacher Context Footer in Sidebar */}
        <div className="border-t border-[var(--color-border)] p-3 bg-[var(--color-surface-elevated)]">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider">
              Context
            </span>
            <button
              onClick={() => setShowContextModal(!showContextModal)}
              className="text-xs text-[#0D9488] hover:underline flex items-center gap-1 font-semibold"
            >
              <SlidersHorizontal className="h-3 w-3" />
              Change
            </button>
          </div>
          <div className="text-xs text-[var(--color-text-secondary)] space-y-0.5">
            <p className="truncate"><strong>Subject:</strong> {activeSubject}</p>
            <p className="truncate"><strong>Grade:</strong> {activeGrade}</p>
          </div>
        </div>
      </aside>

      {/* 2. Main Chat Canvas */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[var(--color-surface)]">
        {/* Offline notification banner */}
        {!isOnline && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-xs text-amber-700 font-medium flex items-center justify-center gap-2">
            <WifiOff className="h-3.5 w-3.5" />
            <span>You're offline. Reconnect to use Teachora AI.</span>
          </div>
        )}

        {/* Compact Mobile Header (Strictly matched to Teachora AI mobile design) */}
        <header className="sticky top-0 z-20 shrink-0 flex items-center justify-between border-b border-slate-200/80 px-3 py-2.5 sm:px-4 sm:py-3 bg-white/95 backdrop-blur-md">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Mobile Menu / History Toggle */}
            <button
              onClick={() => setShowHistorySidebar(!showHistorySidebar)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200/80 bg-slate-50 text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
              aria-label="Toggle chat history"
              title="Chat History"
            >
              <Menu className="h-4 w-4" />
            </button>

            {/* Teachora Teal Robot Avatar Icon */}
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0D9488] text-white shadow-xs">
              <svg className="h-5 w-5" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 10h16v2H8zm0 5h12v2H8zm0 5h14v2H8z" fill="#fff" opacity="0.95" />
                <path d="M22 15l4 4-4 4" stroke="#FBBF24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            {/* Title, Subtitle, & Teachora Intelligence Pill Badge */}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h1 className="font-bold text-sm sm:text-base text-slate-900 leading-tight truncate">
                  Teachora AI
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 text-[10px] font-semibold text-[#0D9488]">
                  <Sparkles className="h-2.5 w-2.5 text-amber-500" />
                  Teachora Intelligence
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium truncate">
                {activeDocument ? `Asking about ${activeDocument.fileName}` : 'Your personal teaching assistant'}
              </p>
            </div>
          </div>

          {/* Right Action: Teal Circular New Chat (+) Button */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowContextModal(true)}
              className="hidden sm:inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              <SlidersHorizontal className="h-3 w-3 text-[#0D9488]" />
              <span>{activeSubject}</span>
            </button>
            <button
              onClick={handleNewChat}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0D9488] text-white shadow-xs hover:bg-[#0B7A70] transition-colors"
              aria-label="Start new chat"
              title="New Chat"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Messages Scroll Area */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6"
        >
          <div className="mx-auto max-w-3xl">
            {isLoadingMessages ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
                <Loader2 className="h-7 w-7 animate-spin text-[#0D9488]" />
                <p className="text-xs font-medium">Loading conversation…</p>
              </div>
            ) : messages.length === 0 ? (
              /* Empty Conversation Welcome State */
              <div className="flex flex-col items-center justify-center py-6 sm:py-10 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-[#0D9488] mb-3 shadow-xs">
                  {activeDocument ? <FileSearch className="h-7 w-7 text-emerald-600" /> : <Sparkles className="h-7 w-7 text-amber-500" />}
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1.5">
                  {activeDocument ? `Ask anything about ${activeDocument.fileName}` : 'How can I help you teach today?'}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md mb-6 leading-relaxed">
                  {activeDocument
                    ? 'Questions will be answered directly from the uploaded document text with page citations.'
                    : 'Ask questions, explain difficult concepts, attach PDFs, create activities, or turn ideas into teaching material.'}
                </p>

                {/* Suggested Prompts Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-xl text-left">
                  {suggestedPrompts.map(({ label, prompt }) => (
                    <button
                      key={label}
                      onClick={() => setInput(prompt)}
                      className="flex items-start gap-3 p-3 rounded-xl border border-slate-200/90 bg-white hover:border-teal-400 hover:shadow-xs transition-all group"
                    >
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-[#0D9488] group-hover:scale-105 transition-transform">
                        <Lightbulb className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0">
                        <span className="block text-xs font-bold text-slate-900 mb-0.5 truncate">{label}</span>
                        <span className="block text-[11px] text-slate-500 line-clamp-1 font-medium">{prompt}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Conversation Messages List */
              <div className="space-y-4 sm:space-y-6">
                <AnimatePresence>
                  {messages.map((msg) => {
                    const isAssistant = msg.role === 'assistant';
                    const parsed = isAssistant ? parseAssistantMessage(msg.content) : null;
                    const mainContent = parsed?.mainContent || msg.content;
                    const docName = (msg.metadata as Record<string, unknown>)?.document_name as string | undefined;
                    const sourcePages = (msg.metadata as Record<string, unknown>)?.source_pages as number[] | undefined;
                    const timeStr = (msg.metadata as Record<string, unknown>)?.timestamp as string ||
                      new Date(msg.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                    // Check if assistant response generates/mentions a document title
                    const hasDocMention = isAssistant && (
                      mainContent.toLowerCase().includes('rubric') ||
                      mainContent.toLowerCase().includes('lesson plan') ||
                      mainContent.toLowerCase().includes('worksheet') ||
                      mainContent.toLowerCase().includes('quiz') ||
                      mainContent.toLowerCase().includes('assignment')
                    );

                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.18 }}
                        className={cn(
                          'flex flex-col',
                          msg.role === 'user' ? 'items-end' : 'items-start w-full'
                        )}
                      >
                        {/* USER MESSAGE BUBBLE */}
                        {msg.role === 'user' ? (
                          <div className="flex flex-col items-end max-w-[88%] sm:max-w-[80%]">
                            <div className="rounded-2xl rounded-tr-xs bg-[#E6F4F1] text-slate-900 px-4 py-3 text-xs sm:text-sm leading-relaxed shadow-2xs font-medium border border-teal-100">
                              {msg.content}
                            </div>
                            <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400 font-medium">
                              <span>{timeStr}</span>
                              <CheckCheck className="h-3 w-3 text-teal-600" />
                            </div>
                          </div>
                        ) : (
                          /* AI MESSAGE CARD */
                          <div className="flex items-start gap-2 sm:gap-3 w-full">
                            {/* Teachora AI Avatar */}
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0D9488] text-white shadow-xs mt-0.5">
                              <svg className="h-4 w-4" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M8 10h16v2H8zm0 5h12v2H8zm0 5h14v2H8z" fill="#fff" opacity="0.95" />
                                <path d="M22 15l4 4-4 4" stroke="#FBBF24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="rounded-2xl bg-white border border-slate-200/90 shadow-xs p-4 sm:p-5 w-full">
                                {/* Top Bar: Teachora AI label + Copy / Save buttons */}
                                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-bold text-slate-900">Teachora AI</span>
                                    {docName && (
                                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                                        Document Q&A
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => handleCopyCleanContent(mainContent, msg.id)}
                                      className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors"
                                      title="Copy clean text"
                                    >
                                      {copiedMsgId === msg.id ? (
                                        <CheckCheck className="h-3.5 w-3.5 text-emerald-600" />
                                      ) : (
                                        <Copy className="h-3.5 w-3.5" />
                                      )}
                                    </button>

                                    <button
                                      onClick={() => handleOpenExportModal(mainContent)}
                                      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold text-[#0D9488] bg-teal-50 hover:bg-teal-100 transition-colors"
                                      title="Save / Export as PDF, DOCX"
                                    >
                                      <Download className="h-3 w-3" />
                                      <span>Save</span>
                                    </button>
                                  </div>
                                </div>

                                {/* Formatted Educational Content */}
                                <TeacherMarkdownRenderer content={mainContent} />

                                {/* Document Attachment Card if document exists or mentioned */}
                                {hasDocMention && (
                                  <div className="my-3 flex items-center justify-between rounded-xl border border-slate-200/90 bg-white p-3 shadow-2xs">
                                    <div className="flex items-center gap-3 min-w-0">
                                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                                        <FileText className="h-5 w-5" />
                                      </div>
                                      <div className="min-w-0">
                                        <h4 className="text-xs font-bold text-slate-900 truncate">
                                          {activeSubject} {activeGrade} Teaching Material
                                        </h4>
                                        <p className="text-[11px] text-slate-500 font-medium">PDF • 1.2 MB</p>
                                      </div>
                                    </div>
                                    <button
                                      onClick={() => handleOpenExportModal(mainContent)}
                                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                                      title="Download Document"
                                    >
                                      <Download className="h-4 w-4" />
                                    </button>
                                  </div>
                                )}

                                {/* Citation Badge */}
                                {docName && sourcePages && sourcePages.length > 0 && (
                                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50/70 p-2 rounded-lg font-medium">
                                    <FileSearch className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                                    <span>
                                      <strong>Source:</strong> {docName} · Page {sourcePages.join(', ')}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Follow-up suggestions */}
                              {parsed && parsed.followUpItems.length > 0 && (
                                <div className="mt-2.5 rounded-xl border border-slate-200/80 bg-slate-50/70 p-2.5 text-xs">
                                  <p className="font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                                    <Sparkles className="h-3 w-3 text-amber-500" />
                                    <span>{parsed.followUpPrompt || 'Suggested follow-ups:'}</span>
                                  </p>
                                  <div className="flex flex-wrap gap-1.5">
                                    {parsed.followUpItems.map((item, idx) => (
                                      <button
                                        key={idx}
                                        onClick={() => handleSend(`${item} based on the previous explanation:`)}
                                        className="inline-flex items-center gap-1 rounded-lg bg-white border border-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-800 hover:border-teal-400 hover:text-[#0D9488] transition-all"
                                      >
                                        <span>{item}</span>
                                        <ArrowRight className="h-3 w-3 text-slate-400" />
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Contextual Quick Actions Chips */}
                              <div className="mt-2.5 flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 max-w-full">
                                <button
                                  onClick={() => handleSend('Create a 10-question multiple choice quiz based on this topic:')}
                                  className="inline-flex items-center gap-1.5 rounded-full bg-white border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:border-teal-500 hover:text-[#0D9488] transition-all shrink-0"
                                >
                                  <HelpCircle className="h-3.5 w-3.5 text-amber-500" />
                                  <span>Create Quiz</span>
                                </button>
                                <button
                                  onClick={() => {
                                    navigate('/app/create/lesson', {
                                      state: { topic: activeSubject, instructions: mainContent.slice(0, 300) },
                                    });
                                  }}
                                  className="inline-flex items-center gap-1.5 rounded-full bg-white border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:border-teal-500 hover:text-[#0D9488] transition-all shrink-0"
                                >
                                  <BookOpen className="h-3.5 w-3.5 text-blue-500" />
                                  <span>Create Lesson</span>
                                </button>
                                <button
                                  onClick={() => handleSend('Create a practice worksheet with an answer key based on this:')}
                                  className="inline-flex items-center gap-1.5 rounded-full bg-white border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:border-teal-500 hover:text-[#0D9488] transition-all shrink-0"
                                >
                                  <FileSpreadsheet className="h-3.5 w-3.5 text-violet-500" />
                                  <span>Create Worksheet</span>
                                </button>
                                <button
                                  onClick={() => handleSend('Create an assignment rubric for Grade 8 students based on this:')}
                                  className="inline-flex items-center gap-1.5 rounded-full bg-white border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:border-teal-500 hover:text-[#0D9488] transition-all shrink-0"
                                >
                                  <ClipboardList className="h-3.5 w-3.5 text-emerald-500" />
                                  <span>Create Assignment</span>
                                </button>
                                <button
                                  onClick={() => handleSend('Make this explanation simpler and more relatable:')}
                                  className="inline-flex items-center gap-1.5 rounded-full bg-white border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:border-teal-500 hover:text-[#0D9488] transition-all shrink-0"
                                >
                                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                                  <span>Make Simpler</span>
                                </button>
                                <button
                                  onClick={() => handleSend('Expand on this with more in-depth examples and subtopics:')}
                                  className="inline-flex items-center gap-1.5 rounded-full bg-white border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:border-teal-500 hover:text-[#0D9488] transition-all shrink-0"
                                >
                                  <Maximize2 className="h-3.5 w-3.5 text-indigo-500" />
                                  <span>Expand</span>
                                </button>
                                <button
                                  onClick={() => handleSaveToWorkspace(mainContent, msg.id)}
                                  className="inline-flex items-center gap-1.5 rounded-full bg-white border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:border-teal-500 hover:text-[#0D9488] transition-all shrink-0"
                                >
                                  {savedWorkspaceMsgId === msg.id ? (
                                    <>
                                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                                      <span className="text-emerald-700 font-bold">Saved</span>
                                    </>
                                  ) : (
                                    <>
                                      <FolderPlus className="h-3.5 w-3.5 text-[#0D9488]" />
                                      <span>Save to Workspace</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {/* Polished Loading state */}
                {isSending && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-2.5 items-start"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0D9488] text-white shadow-xs mt-0.5">
                      <svg className="h-4 w-4" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 10h16v2H8zm0 5h12v2H8zm0 5h14v2H8z" fill="#fff" opacity="0.95" />
                        <path d="M22 15l4 4-4 4" stroke="#FBBF24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>

                    <div className="bg-white border border-slate-200/90 rounded-2xl px-4 py-3 shadow-xs flex items-center gap-3">
                      <Loader2 className="h-4 w-4 animate-spin text-[#0D9488]" />
                      <span className="text-xs font-semibold text-slate-600">
                        {activeDocument ? `Searching ${activeDocument.fileName}…` : 'Teachora is thinking…'}
                      </span>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Floating Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-4 py-2 rounded-xl shadow-lg text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
            <Check className="h-4 w-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Floating Scroll Down button */}
        {showScrollDown && (
          <button
            onClick={scrollToBottom}
            className="absolute bottom-28 right-6 rounded-full bg-white border border-slate-200 p-2.5 shadow-md hover:bg-slate-50 transition-colors z-20"
            title="Scroll to bottom"
          >
            <ArrowDown className="h-4 w-4 text-slate-600" />
          </button>
        )}

        {/* Error Toast & Retry */}
        {error && (
          <div className="mx-3 sm:mx-6 mb-2">
            <div className="mx-auto max-w-3xl rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 flex items-center justify-between">
              <span>{error}</span>
              <button
                onClick={() => handleSend()}
                className="inline-flex items-center gap-1 font-bold text-red-800 hover:underline ml-3 shrink-0"
              >
                <RefreshCw className="h-3 w-3" /> Retry
              </button>
            </div>
          </div>
        )}

        {/* 3. Fixed Bottom Chat Composer */}
        <div className="shrink-0 border-t border-slate-200/80 bg-white px-3 py-2.5 sm:px-6 sm:py-3">
          <div className="mx-auto max-w-3xl space-y-2">
            {/* Active Document Attachment Preview Card */}
            {activeDocument && (
              <div className="flex items-center justify-between p-2 rounded-xl border border-emerald-200 bg-emerald-50/80 text-emerald-900 text-xs shadow-2xs">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold truncate text-slate-900">{activeDocument.fileName}</p>
                    <p className="text-[10px] text-emerald-700 font-medium">
                      PDF • {activeDocument.pageCount} pages · Grounded Q&A
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveDocument}
                  className="p-1 rounded-md text-slate-500 hover:text-red-700 hover:bg-emerald-100 transition-colors"
                  title="Remove document"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Document Processing Progress Banner */}
            {isProcessingDoc && (
              <div className="flex items-center gap-2.5 p-2 rounded-xl border border-teal-200 bg-teal-50 text-[#0D9488] text-xs">
                <Loader2 className="h-4 w-4 animate-spin text-[#0D9488]" />
                <span className="font-semibold">{docProgressStatus || 'Analyzing PDF document…'}</span>
              </div>
            )}

            {/* Main Rounded Input Bar */}
            <div className="relative flex items-center gap-2 rounded-full border border-slate-200/90 bg-slate-50/70 px-3 py-1.5 focus-within:border-[#0D9488] focus-within:bg-white focus-within:ring-2 focus-within:ring-teal-500/20 transition-all shadow-xs">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessingDoc || isSending}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-400 hover:text-[#0D9488] hover:bg-teal-50 disabled:opacity-40 transition-colors"
                title="Attach PDF document"
              >
                <Paperclip className="h-4 w-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={handleFileUpload}
              />

              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  activeDocument
                    ? `Ask about ${activeDocument.fileName}...`
                    : 'Ask Teachora anything...'
                }
                rows={1}
                disabled={isSending || isProcessingDoc}
                className="flex-1 resize-none bg-transparent px-1 py-1.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none max-h-32 disabled:opacity-50"
                style={{ minHeight: '36px' }}
              />

              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isSending || isProcessingDoc}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0D9488] text-white hover:bg-[#0B7A70] disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-xs"
                aria-label="Send message"
              >
                {isSending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 ml-0.5" />
                )}
              </button>
            </div>

            {/* Context Subtitle */}
            <p className="text-center text-[10px] text-slate-400 font-medium tracking-tight">
              {activeDocument
                ? `Grounded Q&A enabled for ${activeDocument.fileName}. Answers are strictly derived from document text.`
                : `Teachora AI Engine. Tailored for ${activeSubject} • ${activeGrade}.`}
            </p>
          </div>
        </div>
      </div>

      {/* 4. Save / Export Document Modal */}
      <SaveExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        rawMarkdownContent={exportContent}
        defaultTitle={exportTitle}
        onSuccess={handleExportSuccess}
      />

      {/* 5. Teacher Context Quick Modal */}
      {showContextModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="card max-w-md w-full p-6 shadow-xl rounded-2xl bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">Active Teaching Context</h3>
              <button
                onClick={() => setShowContextModal(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Subject</label>
                <input
                  type="text"
                  value={activeSubject}
                  onChange={(e) => setActiveSubject(e.target.value)}
                  placeholder="e.g. Science, Mathematics"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs sm:text-sm outline-none focus:border-teal-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Grade Level</label>
                <input
                  type="text"
                  value={activeGrade}
                  onChange={(e) => setActiveGrade(e.target.value)}
                  placeholder="e.g. Grade 8, High School"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs sm:text-sm outline-none focus:border-teal-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Teaching Style</label>
                <input
                  type="text"
                  value={activeStyle}
                  onChange={(e) => setActiveStyle(e.target.value)}
                  placeholder="e.g. Interactive and engaging"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs sm:text-sm outline-none focus:border-teal-500 focus:bg-white"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowContextModal(false)}
                className="rounded-xl bg-[#0D9488] px-4 py-2 text-xs font-bold text-white hover:bg-[#0B7A70] transition-colors"
              >
                Apply Context
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
