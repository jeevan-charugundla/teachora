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
  ChevronLeft,
  ChevronRight,
  Paperclip,
  WifiOff,
  Maximize2,
  ArrowRight,
  Download,
  FileText,
  FileSearch,
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
  { label: 'Give me 5 classroom activity ideas', prompt: 'Give me 5 interactive classroom activity ideas for teaching ' },
  { label: 'Create questions about fractions', prompt: 'Create 5 conceptual questions about fractions with answer explanations.' },
  { label: 'Make this explanation simpler', prompt: 'Make this explanation simpler and more relatable for middle school students: ' },
  { label: 'Help me plan a 45-minute lesson', prompt: 'Help me plan a structured 45-minute lesson on ' },
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

  // Sidebar & context state
  const [showHistorySidebar, setShowHistorySidebar] = useState(true);
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
            timestamp: new Date().toISOString(),
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

  // Copy ONLY clean educational content (without follow-up actions)
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
    <div className="flex h-[calc(100dvh-64px)] lg:h-screen bg-[var(--color-surface-elevated)] overflow-hidden">
      {/* 1. Conversations History Sidebar */}
      <aside
        className={cn(
          'flex flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)] transition-all duration-200 z-10',
          showHistorySidebar ? 'w-80' : 'w-0 hidden md:flex md:w-0 overflow-hidden'
        )}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-2">
            <MessageSquareText className="h-5 w-5 text-[var(--color-primary-600)]" />
            <h2 className="font-semibold text-sm text-[var(--color-text-primary)]">Chat History</h2>
          </div>
          <button
            onClick={handleNewChat}
            className="inline-flex items-center gap-1 rounded-lg bg-[var(--color-primary-50)] text-[var(--color-primary-700)] hover:bg-[var(--color-primary-100)] px-2.5 py-1 text-xs font-semibold transition-colors"
            title="Start new conversation"
          >
            <Plus className="h-3.5 w-3.5" />
            New
          </button>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {isLoadingConversations ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2 text-[var(--color-text-tertiary)]">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-xs">Loading history…</span>
            </div>
          ) : conversations.length === 0 ? (
            <div className="py-8 px-4 text-center">
              <p className="text-xs text-[var(--color-text-tertiary)]">No conversations yet.</p>
              <button
                onClick={handleNewChat}
                className="mt-3 text-xs font-medium text-[var(--color-primary-600)] hover:underline"
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
                    if (!isEditing) setActiveConversationId(conv.id);
                  }}
                  className={cn(
                    'group relative flex items-center justify-between rounded-lg px-3 py-2.5 text-xs font-medium cursor-pointer transition-colors',
                    isActive
                      ? 'bg-[var(--color-primary-50)] text-[var(--color-primary-800)]'
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
                        className="flex-1 rounded border border-[var(--color-primary-300)] bg-[var(--color-surface)] px-1.5 py-0.5 text-xs outline-none"
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
              className="text-xs text-[var(--color-primary-600)] hover:underline flex items-center gap-1"
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

        {/* Top Header */}
        <header className="shrink-0 flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3 bg-[var(--color-surface)]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowHistorySidebar(!showHistorySidebar)}
              className="p-1.5 rounded-lg border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-elevated)] transition-colors"
              title={showHistorySidebar ? 'Hide history' : 'Show history'}
            >
              {showHistorySidebar ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-base text-[var(--color-text-primary)]">Teachora AI</h1>
                {activeDocument ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                    <FileSearch className="h-2.5 w-2.5 text-emerald-600" />
                    Document Mode
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-primary-50)] px-2 py-0.5 text-[10px] font-semibold text-[var(--color-primary-700)]">
                    <Sparkles className="h-2.5 w-2.5 text-[var(--color-accent-500)]" />
                    Groq Llama 3.3
                  </span>
                )}
              </div>
              <p className="text-xs text-[var(--color-text-tertiary)]">
                {activeDocument ? `Asking questions about ${activeDocument.fileName}` : 'Your personal teaching assistant'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowContextModal(true)}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-text-primary)] transition-colors"
            >
              <SlidersHorizontal className="h-3.5 w-3.5 text-[var(--color-primary-600)]" />
              <span>{activeSubject} • {activeGrade}</span>
            </button>
            <button
              onClick={handleNewChat}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--color-primary-600)] text-white px-3 py-1.5 text-xs font-semibold hover:bg-[var(--color-primary-700)] transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">New Chat</span>
            </button>
          </div>
        </header>

        {/* Messages Scroll Area */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-4 lg:px-8 py-6"
        >
          <div className="mx-auto max-w-3xl">
            {isLoadingMessages ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-[var(--color-text-tertiary)]">
                <Loader2 className="h-7 w-7 animate-spin text-[var(--color-primary-500)]" />
                <p className="text-sm font-medium">Loading conversation…</p>
              </div>
            ) : messages.length === 0 ? (
              /* Empty Conversation Welcome State */
              <div className="flex flex-col items-center justify-center py-8">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-primary-50)] text-[var(--color-primary-600)] mb-4 shadow-sm">
                  {activeDocument ? <FileSearch className="h-8 w-8 text-emerald-600" /> : <Sparkles className="h-8 w-8" />}
                </div>
                <h2 className="heading-2 text-center text-2xl mb-2">
                  {activeDocument ? `Ask anything about ${activeDocument.fileName}` : 'How can I help you teach today?'}
                </h2>
                <p className="text-body text-center max-w-md text-sm mb-8">
                  {activeDocument
                    ? 'Questions will be answered directly from the uploaded document text with page citations.'
                    : 'Ask questions, explain difficult concepts, attach PDFs, create activities, or turn ideas into teaching material.'}
                </p>

                {/* Suggested Prompts List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-xl">
                  {suggestedPrompts.map(({ label, prompt }) => (
                    <button
                      key={label}
                      onClick={() => setInput(prompt)}
                      className="card card-interactive flex items-start gap-3 p-3.5 text-left group"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary-50)] text-[var(--color-primary-600)] transition-transform group-hover:scale-105">
                        <Lightbulb className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="block text-xs font-semibold text-[var(--color-text-primary)] mb-0.5">{label}</span>
                        <span className="block text-[11px] text-[var(--color-text-tertiary)] line-clamp-1">{prompt}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Conversation Messages List */
              <div className="space-y-6">
                <AnimatePresence>
                  {messages.map((msg) => {
                    const isAssistant = msg.role === 'assistant';
                    const parsed = isAssistant ? parseAssistantMessage(msg.content) : null;
                    const mainContent = parsed?.mainContent || msg.content;
                    const docName = (msg.metadata as Record<string, unknown>)?.document_name as string | undefined;
                    const sourcePages = (msg.metadata as Record<string, unknown>)?.source_pages as number[] | undefined;

                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className={cn(
                          'flex flex-col',
                          msg.role === 'user' ? 'items-end' : 'items-start w-full'
                        )}
                      >
                        {/* 1. Main Document Card / User Bubble */}
                        <div
                          className={cn(
                            'rounded-2xl text-sm leading-relaxed max-w-[90%] sm:max-w-[85%]',
                            msg.role === 'user'
                              ? 'bg-[var(--color-primary-600)] text-white px-4 py-3 rounded-br-sm shadow-xs'
                              : 'card p-6 border border-[var(--color-border)] rounded-bl-sm shadow-xs w-full max-w-full'
                          )}
                        >
                          {isAssistant && (
                            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3 mb-4">
                              <div className="flex items-center gap-2">
                                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[var(--color-primary-50)] text-[var(--color-primary-600)]">
                                  {docName ? <FileText className="h-3.5 w-3.5 text-emerald-600" /> : <Sparkles className="h-3.5 w-3.5" />}
                                </div>
                                <span className="text-xs font-bold text-[var(--color-text-primary)]">
                                  Teachora AI {docName && <span className="text-emerald-700 font-normal">• Document Q&A</span>}
                                </span>
                              </div>

                              {/* Document Actions (Copy clean text, Save / Export modal) */}
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => handleCopyCleanContent(mainContent, msg.id)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated)] border border-transparent hover:border-[var(--color-border)] transition-colors"
                                  title="Copy clean educational text"
                                >
                                  {copiedMsgId === msg.id ? (
                                    <>
                                      <CheckCheck className="h-3.5 w-3.5 text-[var(--color-success-600)]" />
                                      <span className="text-[var(--color-success-600)] font-semibold">Copied</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="h-3.5 w-3.5" />
                                      <span>Copy</span>
                                    </>
                                  )}
                                </button>

                                <button
                                  onClick={() => handleOpenExportModal(mainContent)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[var(--color-primary-700)] bg-[var(--color-primary-50)] hover:bg-[var(--color-primary-100)] border border-[var(--color-primary-200)] transition-colors shadow-2xs"
                                  title="Save / Export document as PDF, DOCX, TXT"
                                >
                                  <Download className="h-3.5 w-3.5" />
                                  <span>Save</span>
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Content Rendering */}
                          {msg.role === 'user' ? (
                            <div className="text-white whitespace-pre-wrap">{msg.content}</div>
                          ) : (
                            <>
                              <TeacherMarkdownRenderer content={mainContent} />

                              {/* Page Source Citation Badge */}
                              {docName && sourcePages && sourcePages.length > 0 && (
                                <div className="mt-4 pt-3 border-t border-[var(--color-border)] flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50/70 p-2.5 rounded-lg font-medium">
                                  <FileSearch className="h-4 w-4 text-emerald-600 shrink-0" />
                                  <span>
                                    <strong>Source:</strong> {docName} · Page {sourcePages.join(', ')}
                                  </span>
                                </div>
                              )}
                            </>
                          )}
                        </div>

                        {/* 2. Distinct Follow-Up Actions & Suggestions Area (OUTSIDE Main Card) */}
                        {isAssistant && (
                          <div className="mt-3 ml-1 max-w-full space-y-2.5">
                            {/* Follow-up suggestions from model */}
                            {parsed && parsed.followUpItems.length > 0 && (
                              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)]/60 p-3 text-xs">
                                <p className="font-semibold text-[var(--color-text-secondary)] mb-2 flex items-center gap-1.5">
                                  <Sparkles className="h-3.5 w-3.5 text-[var(--color-accent-500)]" />
                                  <span>{parsed.followUpPrompt || 'Would you like to:'}</span>
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {parsed.followUpItems.map((item, idx) => (
                                    <button
                                      key={idx}
                                      onClick={() => handleSend(`${item} based on the previous explanation:`)}
                                      className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-primary)] hover:border-[var(--color-primary-400)] hover:text-[var(--color-primary-700)] hover:shadow-xs transition-all"
                                    >
                                      <span>{item}</span>
                                      <ArrowRight className="h-3 w-3 text-[var(--color-text-tertiary)]" />
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Standard Core Teacher Actions */}
                            <div className="flex flex-wrap items-center gap-1.5">
                              <button
                                onClick={() => handleSaveToWorkspace(mainContent, msg.id)}
                                className="inline-flex items-center gap-1 rounded-full bg-[var(--color-surface-elevated)] border border-[var(--color-border)] px-2.5 py-1 text-[11px] font-medium text-[var(--color-text-secondary)] hover:border-[var(--color-primary-300)] hover:text-[var(--color-primary-700)] transition-colors"
                              >
                                {savedWorkspaceMsgId === msg.id ? (
                                  <>
                                    <Check className="h-3 w-3 text-[var(--color-success-600)]" />
                                    <span className="text-[var(--color-success-600)] font-semibold">Saved in Workspace</span>
                                  </>
                                ) : (
                                  <>
                                    <FolderPlus className="h-3 w-3 text-[var(--color-primary-600)]" />
                                    Save to Workspace
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => handleSend(`Can you make this explanation simpler and more concise for ${activeGrade}?`)}
                                className="inline-flex items-center gap-1 rounded-full bg-[var(--color-surface-elevated)] border border-[var(--color-border)] px-2.5 py-1 text-[11px] font-medium text-[var(--color-text-secondary)] hover:border-[var(--color-primary-300)] hover:text-[var(--color-primary-700)] transition-colors"
                              >
                                <Sparkles className="h-3 w-3 text-[var(--color-accent-500)]" />
                                Make Simpler
                              </button>
                              <button
                                onClick={() => handleSend(`Can you expand on this topic with more in-depth examples, subtopics and teaching notes?`)}
                                className="inline-flex items-center gap-1 rounded-full bg-[var(--color-surface-elevated)] border border-[var(--color-border)] px-2.5 py-1 text-[11px] font-medium text-[var(--color-text-secondary)] hover:border-[var(--color-primary-300)] hover:text-[var(--color-primary-700)] transition-colors"
                              >
                                <Maximize2 className="h-3 w-3 text-indigo-500" />
                                Expand
                              </button>
                              <button
                                onClick={() => handleSend(`Create a 10-question multiple-choice quiz with answers based on this:`)}
                                className="inline-flex items-center gap-1 rounded-full bg-[var(--color-surface-elevated)] border border-[var(--color-border)] px-2.5 py-1 text-[11px] font-medium text-[var(--color-text-secondary)] hover:border-[var(--color-primary-300)] hover:text-[var(--color-primary-700)] transition-colors"
                              >
                                <HelpCircle className="h-3 w-3 text-amber-500" />
                                Create Quiz
                              </button>
                              <button
                                onClick={() => handleSend(`Create an assignment with questions and a grading rubric based on this topic:`)}
                                className="inline-flex items-center gap-1 rounded-full bg-[var(--color-surface-elevated)] border border-[var(--color-border)] px-2.5 py-1 text-[11px] font-medium text-[var(--color-text-secondary)] hover:border-[var(--color-primary-300)] hover:text-[var(--color-primary-700)] transition-colors"
                              >
                                <ClipboardList className="h-3 w-3 text-emerald-500" />
                                Create Assignment
                              </button>
                              <button
                                onClick={() => {
                                  navigate('/app/create/lesson', {
                                    state: { topic: activeSubject, instructions: mainContent.slice(0, 300) },
                                  });
                                }}
                                className="inline-flex items-center gap-1 rounded-full bg-[var(--color-surface-elevated)] border border-[var(--color-border)] px-2.5 py-1 text-[11px] font-medium text-[var(--color-text-secondary)] hover:border-[var(--color-primary-300)] hover:text-[var(--color-primary-700)] transition-colors"
                              >
                                <BookOpen className="h-3 w-3 text-blue-500" />
                                Create Lesson
                              </button>
                              <button
                                onClick={() => handleSend(`Create a homework practice worksheet based on this with an answer key:`)}
                                className="inline-flex items-center gap-1 rounded-full bg-[var(--color-surface-elevated)] border border-[var(--color-border)] px-2.5 py-1 text-[11px] font-medium text-[var(--color-text-secondary)] hover:border-[var(--color-primary-300)] hover:text-[var(--color-primary-700)] transition-colors"
                              >
                                <FileSpreadsheet className="h-3 w-3 text-violet-500" />
                                Create Worksheet
                              </button>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {/* Loading indicator */}
                {isSending && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3 items-start"
                  >
                    <div className="card p-4 border border-[var(--color-border)] rounded-2xl rounded-bl-sm flex items-center gap-3">
                      <Loader2 className="h-4 w-4 animate-spin text-[var(--color-primary-600)]" />
                      <span className="text-xs font-medium text-[var(--color-text-secondary)]">
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
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] text-[var(--color-text-primary)] px-4 py-2 rounded-xl shadow-lg text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
            <Check className="h-4 w-4 text-[var(--color-success-600)]" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Floating Scroll Down button */}
        {showScrollDown && (
          <button
            onClick={scrollToBottom}
            className="absolute bottom-28 right-8 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] p-2.5 shadow-md hover:bg-[var(--color-surface-elevated)] transition-colors z-20"
            title="Scroll to bottom"
          >
            <ArrowDown className="h-4 w-4 text-[var(--color-text-secondary)]" />
          </button>
        )}

        {/* Error Toast */}
        {error && (
          <div className="mx-4 lg:mx-8 mb-2">
            <div className="mx-auto max-w-3xl rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700 flex items-center justify-between">
              <span>{error}</span>
              <button
                onClick={() => handleSend()}
                className="inline-flex items-center gap-1 font-semibold text-red-800 hover:underline ml-3"
              >
                <RefreshCw className="h-3 w-3" /> Retry
              </button>
            </div>
          </div>
        )}

        {/* 3. Input Toolbar & Attached Document Banner */}
        <div className="shrink-0 border-t border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 lg:px-8">
          <div className="mx-auto max-w-3xl space-y-2">
            {/* Active Document Attachment Card */}
            {activeDocument && (
              <div className="flex items-center justify-between p-2.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-900 text-xs shadow-2xs">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{activeDocument.fileName}</p>
                    <p className="text-[10px] text-emerald-700">
                      ✓ Document ready ({activeDocument.pageCount} pages) • Answers will cite page sources
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveDocument}
                  className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-emerald-800 hover:text-red-700 hover:bg-emerald-100/80 rounded-md transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                  <span>Remove</span>
                </button>
              </div>
            )}

            {/* Document Processing Progress Banner */}
            {isProcessingDoc && (
              <div className="flex items-center gap-2.5 p-2.5 rounded-xl border border-[var(--color-primary-200)] bg-[var(--color-primary-50)] text-[var(--color-primary-800)] text-xs">
                <Loader2 className="h-4 w-4 animate-spin text-[var(--color-primary-600)]" />
                <span className="font-medium">{docProgressStatus || 'Analyzing PDF document…'}</span>
              </div>
            )}

            {/* Main Message Composer */}
            <div className="relative flex items-end gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-2 focus-within:border-[var(--color-primary-500)] focus-within:ring-2 focus-within:ring-[var(--color-primary-500)]/20 transition-all">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessingDoc || isSending}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[var(--color-text-tertiary)] hover:text-[var(--color-primary-600)] hover:bg-[var(--color-surface)] disabled:opacity-40 transition-colors"
                title="Attach PDF teaching material to ask questions"
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
                    ? `Ask a question about ${activeDocument.fileName}...`
                    : 'Ask Teachora anything...'
                }
                rows={1}
                disabled={isSending || isProcessingDoc}
                className="flex-1 resize-none bg-transparent px-2 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] outline-none max-h-36 disabled:opacity-50"
                style={{ minHeight: '44px' }}
              />

              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isSending || isProcessingDoc}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary-600)] text-white hover:bg-[var(--color-primary-700)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Send message"
              >
                {isSending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </div>
            <p className="mt-1 text-center text-[10px] text-[var(--color-text-tertiary)]">
              {activeDocument
                ? `Grounded Q&A enabled for ${activeDocument.fileName}. Answers are strictly derived from document text.`
                : `Teachora AI powered by Groq. Tailored for ${activeSubject} • ${activeGrade}.`}
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
          <div className="card max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="heading-3 text-base">Active Teaching Context</h3>
              <button
                onClick={() => setShowContextModal(false)}
                className="p-1 rounded text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1">Subject</label>
                <input
                  type="text"
                  value={activeSubject}
                  onChange={(e) => setActiveSubject(e.target.value)}
                  placeholder="e.g. Science, Mathematics"
                  className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary-500)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1">Grade Level</label>
                <input
                  type="text"
                  value={activeGrade}
                  onChange={(e) => setActiveGrade(e.target.value)}
                  placeholder="e.g. Grade 8, High School"
                  className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary-500)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1">Teaching Style</label>
                <input
                  type="text"
                  value={activeStyle}
                  onChange={(e) => setActiveStyle(e.target.value)}
                  placeholder="e.g. Interactive and engaging"
                  className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary-500)]"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowContextModal(false)}
                className="rounded-lg bg-[var(--color-primary-600)] px-4 py-2 text-xs font-semibold text-white hover:bg-[var(--color-primary-700)] transition-colors"
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
