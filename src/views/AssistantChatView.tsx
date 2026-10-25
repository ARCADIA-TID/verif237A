import React, { useState, useEffect, useRef } from 'react';
import { NavPage, AssistantMessage, AssistantConversation, AssistantSource } from '../types';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';
import { api } from '../services/api';
import { LOGO_URL } from '../data/mockData';

interface AssistantChatViewProps {
  setCurrentPage: (page: NavPage) => void;
  initialQuery?: string;
}

export const AssistantChatView: React.FC<AssistantChatViewProps> = ({
  setCurrentPage,
  initialQuery
}) => {
  const { user, isAuthenticated } = useAuth();
  const { t } = useI18n();

  // Active conversation state
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversationTitle, setConversationTitle] = useState<string>('Nouvelle discussion');
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [inputText, setInputText] = useState<string>(initialQuery || '');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Conversations history state
  const [conversationsList, setConversationsList] = useState<Array<{
    id: string;
    title: string;
    createdAt: string;
    updatedAt: string;
    messageCount: number;
    lastMessage: string;
  }>>([]);
  const [historyLoading, setHistoryLoading] = useState<boolean>(false);
  const [historyOpen, setHistoryOpen] = useState<boolean>(false);
  const [searchHistory, setSearchHistory] = useState<string>('');

  // Editing title state
  const [editingConvId, setEditingConvId] = useState<string | null>(null);
  const [editTitleInput, setEditTitleInput] = useState<string>('');

  // UI feedback states
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [reportedMsgId, setReportedMsgId] = useState<string | null>(null);
  const [reportModalOpen, setReportModalOpen] = useState<boolean>(false);
  const [reportReason, setReportReason] = useState<string>('');

  // DOM refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Anonymous session key for guests to retain their chats locally
  const getSessionKey = () => {
    if (user?.id) return user.id;
    let guestKey = localStorage.getItem('verif237_guest_ai_session');
    if (!guestKey) {
      guestKey = `guest-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      localStorage.setItem('verif237_guest_ai_session', guestKey);
    }
    return guestKey;
  };

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Load conversations list
  const loadConversations = async () => {
    setHistoryLoading(true);
    try {
      const res = await api.getAssistantConversations(getSessionKey());
      setConversationsList(res.conversations || []);
    } catch {
      // Ignorer silencieusement si la liste est vide
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, [user?.id]);

  // Handle initial query if passed via props
  useEffect(() => {
    if (initialQuery && initialQuery.trim().length > 0 && messages.length === 0) {
      handleSendMessage(initialQuery.trim());
    }
  }, [initialQuery]);

  // Auto-resize textarea
  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [inputText]);

  // Start new conversation
  const handleNewChat = () => {
    setConversationId(null);
    setConversationTitle('Nouvelle discussion');
    setMessages([]);
    setInputText('');
    setErrorMessage(null);
    setHistoryOpen(false);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // Open existing conversation
  const handleSelectConversation = async (id: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await api.getAssistantConversation(id);
      if (res.conversation) {
        setConversationId(res.conversation.id);
        setConversationTitle(res.conversation.title || 'Discussion');
        setMessages(res.conversation.messages || []);
        setHistoryOpen(false);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Impossible de charger la conversation.');
    } finally {
      setIsLoading(false);
    }
  };

  // Delete conversation
  const handleDeleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Voulez-vous vraiment supprimer cette conversation ?')) return;

    try {
      await api.deleteAssistantConversation(id, getSessionKey());
      setConversationsList(prev => prev.filter(c => c.id !== id));
      if (conversationId === id) {
        handleNewChat();
      }
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la suppression.');
    }
  };

  // Rename conversation
  const handleStartRename = (id: string, currentTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingConvId(id);
    setEditTitleInput(currentTitle);
  };

  const handleSaveRename = async (id: string, e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!editTitleInput.trim()) return;

    try {
      await api.renameAssistantConversation(id, editTitleInput.trim(), getSessionKey());
      setConversationsList(prev =>
        prev.map(c => (c.id === id ? { ...c, title: editTitleInput.trim() } : c))
      );
      if (conversationId === id) {
        setConversationTitle(editTitleInput.trim());
      }
      setEditingConvId(null);
    } catch (err: any) {
      alert(err.message || 'Erreur lors du renommage.');
    }
  };

  // Send user message
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    setErrorMessage(null);
    setInputText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    const tempUserMsg: AssistantMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, tempUserMsg]);
    setIsLoading(true);

    try {
      const res = await api.sendAssistantMessage({
        conversationId: conversationId || undefined,
        message: text,
        userId: user?.id,
        userSessionId: getSessionKey()
      });

      if (!conversationId) {
        setConversationId(res.conversationId);
      }
      if (res.title) {
        setConversationTitle(res.title);
      }

      setMessages(prev => [...prev, res.message]);
      loadConversations();
    } catch (err: any) {
      setErrorMessage(err.message || 'Impossible d’obtenir une réponse de l’assistant pour le moment.');
      setMessages(prev => [
        ...prev,
        {
          id: `msg-err-${Date.now()}`,
          role: 'assistant',
          content: "Une anomalie de connexion ou de traitement est survenue. Vous pouvez cliquer sur « Réessayer » pour relancer votre demande.",
          timestamp: new Date().toISOString(),
          isError: true
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Key down for textarea
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Copy assistant response
  const handleCopyMessage = (msg: AssistantMessage) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(msg.content);
      setCopiedMsgId(msg.id);
      setTimeout(() => setCopiedMsgId(null), 2500);
    }
  };

  // Submit report on a message
  const handleOpenReport = (msgId: string) => {
    setReportedMsgId(msgId);
    setReportReason('');
    setReportModalOpen(true);
  };

  const handleSubmitReport = () => {
    setReportModalOpen(false);
    alert('Merci pour votre vigilance citoyenne. Votre signalement a été transmis à la cellule déontologique de Vérif237.');
  };

  // Retry last message
  const handleRetryLast = () => {
    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
    if (lastUserMsg) {
      // Remove last error message
      setMessages(prev => prev.filter(m => !m.isError));
      handleSendMessage(lastUserMsg.content);
    }
  };

  // Formatter for markdown-like plain text safe rendering
  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n');
    return (
      <div className="space-y-2 leading-relaxed text-sm">
        {lines.map((line, idx) => {
          const trimmed = line.trim();

          // H3 header
          if (trimmed.startsWith('### ')) {
            return (
              <h3 key={idx} className="text-base font-black text-slate-900 dark:text-white pt-2 pb-0.5 border-b border-slate-200 dark:border-slate-800">
                {trimmed.replace('### ', '')}
              </h3>
            );
          }

          // H4 header
          if (trimmed.startsWith('#### ')) {
            return (
              <h4 key={idx} className="text-sm font-bold text-[#005c55] dark:text-[#2dd4bf] pt-1">
                {trimmed.replace('#### ', '')}
              </h4>
            );
          }

          // Blockquote
          if (trimmed.startsWith('> ')) {
            return (
              <blockquote key={idx} className="border-l-4 border-[#007953] pl-3 py-1 my-1.5 bg-emerald-50/50 dark:bg-emerald-950/20 text-xs text-slate-700 dark:text-slate-300 rounded-r-lg italic">
                {trimmed.replace('> ', '')}
              </blockquote>
            );
          }

          // Bullet point
          if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            const bulletText = trimmed.replace(/^[-*]\s+/, '');
            return (
              <div key={idx} className="flex items-start gap-2 pl-2 text-xs sm:text-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-[#007953] shrink-0 mt-2" />
                <span>{renderInlineStyles(bulletText)}</span>
              </div>
            );
          }

          // Numbered point
          if (/^\d+\.\s+/.test(trimmed)) {
            const num = trimmed.match(/^(\d+)\.\s+/)?.[1];
            const itemText = trimmed.replace(/^\d+\.\s+/, '');
            return (
              <div key={idx} className="flex items-start gap-2 pl-2 text-xs sm:text-sm">
                <span className="font-bold text-xs font-mono text-[#007953] shrink-0 mt-0.5">{num}.</span>
                <span>{renderInlineStyles(itemText)}</span>
              </div>
            );
          }

          // Empty line
          if (!trimmed) {
            return <div key={idx} className="h-1" />;
          }

          return (
            <p key={idx} className="text-xs sm:text-sm text-slate-800 dark:text-slate-200">
              {renderInlineStyles(line)}
            </p>
          );
        })}
      </div>
    );
  };

  // Safe inline bold / italic / code parser
  const renderInlineStyles = (text: string) => {
    // Bold **text**
    const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-bold text-slate-900 dark:text-white">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={i} className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[11px] text-[#007953] dark:text-emerald-400">{part.slice(1, -1)}</code>;
      }
      return part;
    });
  };

  const filteredHistory = conversationsList.filter(c =>
    !searchHistory.trim() || c.title.toLowerCase().includes(searchHistory.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-65px)] min-h-[550px] bg-[#f8fafc] dark:bg-[#0b1220] text-slate-800 dark:text-slate-100 flex overflow-hidden font-body">

      {/* 1. SIDEBAR (CONVERSATION HISTORY) */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-72 sm:w-80 bg-white dark:bg-[#101928] border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-300 ease-in-out ${
          historyOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#007953] text-xl">forum</span>
            <span className="font-bold text-sm text-slate-900 dark:text-white">Vos discussions</span>
          </div>
          <button
            onClick={() => setHistoryOpen(false)}
            className="md:hidden p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            title="Fermer"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          <button
            onClick={handleNewChat}
            className="w-full py-2.5 px-3 rounded-xl bg-[#007953] hover:bg-[#006344] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">add_circle</span>
            <span>Nouvelle discussion</span>
          </button>
        </div>

        {/* Search Conversations */}
        <div className="px-3 pb-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700">
            <span className="material-symbols-outlined text-slate-400 text-sm">search</span>
            <input
              type="text"
              value={searchHistory}
              onChange={(e) => setSearchHistory(e.target.value)}
              placeholder="Rechercher une discussion..."
              className="w-full bg-transparent border-none outline-none text-slate-700 dark:text-slate-200 placeholder:text-slate-400 text-xs"
            />
            {searchHistory && (
              <button onClick={() => setSearchHistory('')} className="text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined text-xs">close</span>
              </button>
            )}
          </div>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto px-2 space-y-1">
          {historyLoading ? (
            <div className="p-4 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-sm animate-spin">sync</span>
              <span>Chargement...</span>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400 space-y-1">
              <span className="material-symbols-outlined text-2xl text-slate-300 dark:text-slate-600">chat_bubble_outline</span>
              <p>Aucune discussion enregistrée.</p>
            </div>
          ) : (
            filteredHistory.map(conv => {
              const isSelected = conversationId === conv.id;
              const isEditing = editingConvId === conv.id;

              return (
                <div
                  key={conv.id}
                  onClick={() => !isEditing && handleSelectConversation(conv.id)}
                  className={`group relative p-2.5 rounded-xl text-xs cursor-pointer transition-all flex items-center justify-between gap-2 ${
                    isSelected
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 font-semibold text-emerald-900 dark:text-emerald-200'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300 border border-transparent'
                  }`}
                >
                  {isEditing ? (
                    <form
                      onSubmit={(e) => handleSaveRename(conv.id, e)}
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1 w-full"
                    >
                      <input
                        type="text"
                        value={editTitleInput}
                        onChange={(e) => setEditTitleInput(e.target.value)}
                        className="w-full px-2 py-1 text-xs bg-white dark:bg-slate-900 border border-[#007953] rounded outline-none"
                        autoFocus
                      />
                      <button
                        type="submit"
                        className="p-1 text-emerald-600 hover:text-emerald-700 cursor-pointer"
                        title="Enregistrer"
                      >
                        <span className="material-symbols-outlined text-sm">check</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingConvId(null)}
                        className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                        title="Annuler"
                      >
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                    </form>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 truncate">
                        <span className="material-symbols-outlined text-sm text-slate-400 shrink-0">
                          {isSelected ? 'chat' : 'chat_bubble_outline'}
                        </span>
                        <span className="truncate">{conv.title}</span>
                      </div>

                      <div className="hidden group-hover:flex items-center gap-0.5 shrink-0 bg-white/80 dark:bg-slate-900/80 px-1 py-0.5 rounded shadow-xs">
                        <button
                          onClick={(e) => handleStartRename(conv.id, conv.title, e)}
                          className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                          title="Renommer"
                        >
                          <span className="material-symbols-outlined text-xs">edit</span>
                        </button>
                        <button
                          onClick={(e) => handleDeleteConversation(conv.id, e)}
                          className="p-1 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                          title="Supprimer"
                        >
                          <span className="material-symbols-outlined text-xs">delete</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Sidebar Footer info */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span>{conversationsList.length} discussion(s)</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">Vérif237 AI</span>
        </div>
      </aside>

      {/* Overlay backdrop for mobile history drawer */}
      {historyOpen && (
        <div
          onClick={() => setHistoryOpen(false)}
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-xs md:hidden"
        />
      )}

      {/* 2. MAIN CHAT AREA */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Chat Top Header */}
        <header className="px-4 py-3 bg-white dark:bg-[#101928] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shadow-xs">
          
          <div className="flex items-center gap-3">
            {/* Mobile History Toggle */}
            <button
              onClick={() => setHistoryOpen(true)}
              className="md:hidden p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              title="Afficher l'historique"
            >
              <span className="material-symbols-outlined text-lg">menu_open</span>
            </button>

            {/* Back Button */}
            <button
              onClick={() => setCurrentPage('accueil')}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Retour à l'accueil"
            >
              <span className="material-symbols-outlined text-lg">arrow_back</span>
            </button>

            {/* Assistant Identity & Description */}
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#005c55] to-[#2dd4bf] flex items-center justify-center text-white shadow-sm shrink-0">
                <span className="material-symbols-outlined text-xl">smart_toy</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white leading-tight">
                    Assistant IA Vérif237
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Disponible</span>
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block truncate max-w-md">
                  Votre assistant intelligent pour comprendre, analyser et vérifier l'information
                </p>
              </div>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleNewChat}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              title="Démarrer une nouvelle discussion"
            >
              <span className="material-symbols-outlined text-sm">edit_note</span>
              <span>Nouveau sujet</span>
            </button>

            <button
              onClick={() => setCurrentPage('verifier')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#007953] hover:bg-[#006344] text-xs font-bold text-white transition-all shadow-xs cursor-pointer"
              title="Ouvrir le formulaire d'investigation formelle"
            >
              <span className="material-symbols-outlined text-sm">fact_check</span>
              <span className="hidden sm:inline">Dossier formel</span>
            </button>
          </div>

        </header>

        {/* Message Zone */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 max-w-4xl w-full mx-auto">
          
          {/* Welcome Screen when no messages */}
          {messages.length === 0 && (
            <div className="pt-4 pb-8 space-y-8 animate-fade-in text-center max-w-2xl mx-auto">
              
              <div className="space-y-3">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#005c55] to-[#2dd4bf] text-white flex items-center justify-center mx-auto shadow-lg">
                  <span className="material-symbols-outlined text-3xl">psychology</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  Bonjour et bienvenue sur l'Assistant IA de Vérif237 !
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Je suis là pour vous aider à comprendre l'actualité, analyser des informations, répondre à vos questions et vous orienter vers des sources fiables.
                </p>
                <p className="text-xs font-semibold text-[#007953] dark:text-emerald-400">
                  Que souhaitez-vous savoir aujourd'hui ?
                </p>
              </div>

              {/* 5 Suggestion Chips as explicitly requested */}
              <div className="space-y-2 text-left">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center mb-3">
                  Questions suggérées :
                </div>
                <div className="grid grid-cols-1 gap-2.5">
                  {[
                    "Comment reconnaître une fausse information ?",
                    "Comment vérifier une information qui circule sur WhatsApp ?",
                    "Quelles sont les dernières informations officielles au Cameroun ?",
                    "Comment fonctionne la vérification des informations sur Vérif237 ?",
                    "Peux-tu m'aider à analyser cette publication ?"
                  ].map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(suggestion)}
                      className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-[#007953] dark:hover:border-emerald-500/50 hover:shadow-sm text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-between gap-3 transition-all text-left group cursor-pointer"
                    >
                      <span className="group-hover:text-[#007953] dark:group-hover:text-emerald-400 transition-colors">
                        « {suggestion} »
                      </span>
                      <span className="material-symbols-outlined text-slate-400 group-hover:text-[#007953] group-hover:translate-x-1 transition-all text-sm shrink-0">
                        arrow_forward
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Ethics reminder banner */}
              <div className="p-3.5 bg-slate-100/80 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 text-[11px] text-slate-500 dark:text-slate-400 text-center leading-relaxed">
                ⚖️ <strong>Engagement Vérif237 :</strong> Réponses générées par intelligence artificielle supervisée, croisées avec les bases documentaires officielles du Cameroun. Les analyses de l'assistant ne constituent pas des démentis judiciaires.
              </div>

            </div>
          )}

          {/* Messages List */}
          {messages.map((msg, index) => {
            const isUser = msg.role === 'user';

            return (
              <div
                key={msg.id || index}
                className={`flex gap-3 animate-fade-in ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {/* Assistant Avatar */}
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-[#005c55] text-white flex items-center justify-center shrink-0 mt-1 shadow-xs">
                    <span className="material-symbols-outlined text-lg">smart_toy</span>
                  </div>
                )}

                {/* Message Bubble Card */}
                <div
                  className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 sm:p-5 space-y-3 shadow-xs ${
                    isUser
                      ? 'bg-[#007953] text-white rounded-tr-none'
                      : msg.isError
                      ? 'bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-900 dark:text-red-200 rounded-tl-none'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-tl-none'
                  }`}
                >
                  {/* Bubble Content */}
                  {isUser ? (
                    <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed font-medium">
                      {msg.content}
                    </p>
                  ) : (
                    <div>{renderFormattedContent(msg.content)}</div>
                  )}

                  {/* Sources Grounding block */}
                  {!isUser && msg.sources && msg.sources.length > 0 && (
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                      <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-xs text-[#007953]">menu_book</span>
                        <span>Sources officielles & références consultées :</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.sources.map((src, sIdx) => (
                          <a
                            key={sIdx}
                            href={src.url || '#'}
                            target={src.url ? '_blank' : '_self'}
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[11px] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
                          >
                            <span className="material-symbols-outlined text-xs text-[#007953]">link</span>
                            <span className="font-semibold truncate max-w-[180px]">{src.title}</span>
                            {src.isOfficial && (
                              <span className="text-[9px] font-extrabold uppercase bg-emerald-600 text-white px-1 rounded">
                                .cm
                              </span>
                            )}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Message Bottom Action Bar */}
                  <div className="flex items-center justify-between gap-2 pt-1 text-[10px] text-slate-400 dark:text-slate-500">
                    <span className="font-mono">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>

                    {!isUser && (
                      <div className="flex items-center gap-2">
                        {/* Copy button */}
                        <button
                          onClick={() => handleCopyMessage(msg)}
                          className="hover:text-slate-700 dark:hover:text-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
                          title="Copier la réponse"
                        >
                          <span className="material-symbols-outlined text-xs">
                            {copiedMsgId === msg.id ? 'check' : 'content_copy'}
                          </span>
                          <span>{copiedMsgId === msg.id ? 'Copié !' : 'Copier'}</span>
                        </button>

                        {/* Report button */}
                        <button
                          onClick={() => handleOpenReport(msg.id)}
                          className="hover:text-amber-600 transition-colors flex items-center gap-1 cursor-pointer"
                          title="Signaler une inexactitude"
                        >
                          <span className="material-symbols-outlined text-xs">flag</span>
                          <span>Signaler</span>
                        </button>

                        {/* Retry if error */}
                        {msg.isError && (
                          <button
                            onClick={handleRetryLast}
                            className="text-red-600 hover:text-red-700 font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-xs">replay</span>
                            <span>Réessayer</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                </div>

                {/* User Avatar */}
                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold text-xs shrink-0 mt-1">
                    {user?.name ? user.name.slice(0, 2).toUpperCase() : 'VOUS'}
                  </div>
                )}
              </div>
            );
          })}

          {/* Loading indicator when assistant is thinking */}
          {isLoading && (
            <div className="flex gap-3 animate-fade-in">
              <div className="w-8 h-8 rounded-xl bg-[#005c55] text-white flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
              </div>
              <div className="p-4 rounded-2xl rounded-tl-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2.5 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-[#007953] animate-ping" />
                <span className="font-semibold">L'assistant analyse votre demande et consulte les sources camerounaises…</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 3. INPUT ZONE */}
        <div className="p-3 sm:p-4 bg-white dark:bg-[#101928] border-t border-slate-200 dark:border-slate-800">
          <div className="max-w-4xl mx-auto space-y-2">
            
            {/* Input field wrapper */}
            <div className="relative flex items-end bg-[#f8fafc] dark:bg-slate-900 rounded-2xl border border-slate-300 dark:border-slate-700 focus-within:border-[#007953] focus-within:ring-2 focus-within:ring-[#007953]/20 shadow-xs transition-all">
              
              <textarea
                ref={textareaRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                placeholder="Posez votre question à l'IA Vérif237 (ex: Comment reconnaître un faux concours ?)..."
                disabled={isLoading}
                className="w-full py-3 px-4 bg-transparent outline-none text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 resize-none max-h-44 disabled:opacity-50"
              />

              <div className="flex items-center gap-1.5 p-2">
                {inputText && (
                  <button
                    onClick={() => setInputText('')}
                    className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    title="Effacer le texte"
                  >
                    <span className="material-symbols-outlined text-base">clear</span>
                  </button>
                )}

                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputText.trim() || isLoading}
                  className={`p-2.5 rounded-xl text-white transition-all flex items-center justify-center cursor-pointer ${
                    inputText.trim() && !isLoading
                      ? 'bg-[#007953] hover:bg-[#006344] shadow-sm'
                      : 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed text-slate-400'
                  }`}
                  title="Envoyer la question (Entrée)"
                >
                  <span className="material-symbols-outlined text-base">
                    {isLoading ? 'hourglass_empty' : 'send'}
                  </span>
                </button>
              </div>

            </div>

            {/* Helper shortcuts & privacy note */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
              <span className="hidden sm:inline">
                Appuyez sur <kbd className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border font-mono text-[10px]">Entrée</kbd> pour envoyer, <kbd className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border font-mono text-[10px]">Maj+Entrée</kbd> pour sauter une ligne.
              </span>
              <span className="ml-auto text-slate-500">
                🔒 Données confidentielles protégées · Vérif237 Cameroun
              </span>
            </div>

          </div>
        </div>

      </div>

      {/* REPORT MODAL */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-600">flag</span>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Signaler une réponse de l'assistant
                </h3>
              </div>
              <button
                onClick={() => setReportModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Indiquez la raison du signalement (inexactitude factuelle, omission d'un arrêté officiel, hallucination ou problème déontologique) :
            </p>

            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Précisez pourquoi cette réponse vous semble inexacte..."
              rows={3}
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none resize-none"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setReportModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={handleSubmitReport}
                className="px-4 py-2 rounded-xl bg-[#007953] hover:bg-[#006344] text-white text-xs font-bold cursor-pointer"
              >
                Transmettre à la cellule
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
