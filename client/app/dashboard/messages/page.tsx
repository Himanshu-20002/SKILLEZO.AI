'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  MessageSquare,
  Search,
  Building2,
  Briefcase,
  Calendar,
  Clock,
  Video,
  ExternalLink,
  Send,
  RefreshCw,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/dashboard/common/PageHeader';
import {
  messageService,
  ConversationSummary,
  ChatMessage,
} from '@/services/message.service';
import { toast } from 'sonner';

function MessagesContent() {
  const searchParams = useSearchParams();
  const preselectedAppId = searchParams.get('appId');

  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<ConversationSummary | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileShowChat, setMobileShowChat] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load candidate conversations
  const loadConversations = async () => {
    try {
      setLoadingList(true);
      const data = await messageService.getConversations({ limit: 50 });
      const items = data.items || [];
      setConversations(items);

      if (items.length > 0) {
        if (preselectedAppId) {
          const match = items.find((c) => c.applicationId === preselectedAppId);
          setSelectedConversation(match || items[0]);
        } else if (!selectedConversation) {
          setSelectedConversation(items[0]);
        }
      }
    } catch (err: any) {
      console.error('[MessagesPage] Failed to load conversations:', err);
      toast.error('Failed to load company messages');
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, [preselectedAppId]);

  // Load message thread when selectedConversation changes
  useEffect(() => {
    if (!selectedConversation) return;

    let isMounted = true;
    async function loadThread() {
      try {
        setLoadingMessages(true);
        const res = await messageService.getConversationMessages(selectedConversation!.id);
        if (isMounted) {
          setMessages(res.messages || []);
          // Clear local unread count
          setConversations((prev) =>
            prev.map((c) =>
              c.id === selectedConversation!.id ? { ...c, unreadCount: 0 } : c
            )
          );
        }
      } catch (err: any) {
        toast.error('Failed to load message history');
      } finally {
        if (isMounted) setLoadingMessages(false);
      }
    }

    loadThread();

    return () => {
      isMounted = false;
    };
  }, [selectedConversation?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedConversation || sending) return;

    const content = replyText.trim();
    setReplyText('');

    try {
      setSending(true);
      const newMsg = await messageService.sendMessage(selectedConversation.id, content);
      setMessages((prev) => [...prev, newMsg]);

      // Update local last message in list
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedConversation.id
            ? {
                ...c,
                lastMessage: {
                  content,
                  senderId: 'me',
                  senderRole: 'candidate',
                  sentAt: new Date().toISOString(),
                },
              }
            : c
        )
      );
    } catch (err: any) {
      toast.error(err?.message || 'Failed to send message');
      setReplyText(content);
    } finally {
      setSending(false);
    }
  };

  const filteredConversations = conversations.filter(
    (c) =>
      c.company?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.job?.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Company Messages"
        description="Communicate directly with hiring teams that have shortlisted your profile or scheduled interviews."
      />

      {/* Main Split-Pane Card */}
      <div className="bg-white dark:bg-[#0E1535] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col md:flex-row h-[720px]">
        {/* Left Sidebar: Conversation List */}
        <div
          className={`w-full md:w-80 lg:w-96 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-slate-50/50 dark:bg-[#0B112B] shrink-0 ${
            mobileShowChat ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Search Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-3 bg-white dark:bg-[#0E1535]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-[#3D5AFE]" />
                Conversations ({conversations.length})
              </span>
              <button
                onClick={loadConversations}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white transition"
                title="Refresh messages"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by company or role..."
                className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl bg-slate-100 dark:bg-[#151D42] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3D5AFE]/30"
              />
            </div>
          </div>

          {/* List of Channels */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
            {loadingList ? (
              <div className="h-48 flex items-center justify-center text-slate-400 text-xs gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-[#3D5AFE]" />
                <span>Loading company channels...</span>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-slate-400 space-y-2">
                <Building2 className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700" />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  No active company chats
                </p>
                <p className="text-[11px] text-slate-400">
                  When a recruiter shortlists your application for an open role, your message channel will appear here automatically.
                </p>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = selectedConversation?.id === conv.id;
                const hasInterview = !!conv.interviewSchedule;

                return (
                  <button
                    key={conv.id}
                    onClick={() => {
                      setSelectedConversation(conv);
                      setMobileShowChat(true);
                    }}
                    className={`w-full text-left p-4 transition flex items-start gap-3 cursor-pointer ${
                      isSelected
                        ? 'bg-white dark:bg-[#151D42] border-l-4 border-l-[#3D5AFE] shadow-xs'
                        : 'hover:bg-slate-100/70 dark:hover:bg-[#111736]'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 text-[#3D5AFE] dark:text-[#8098FF] flex items-center justify-center font-bold text-sm shrink-0">
                      {conv.company?.name ? conv.company.name.charAt(0).toUpperCase() : 'C'}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <h4 className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                          {conv.company?.name || 'Hiring Employer'}
                        </h4>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {conv.lastMessage?.sentAt
                            ? new Date(conv.lastMessage.sentAt).toLocaleDateString([], {
                                month: 'short',
                                day: 'numeric',
                              })
                            : ''}
                        </span>
                      </div>

                      <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate flex items-center gap-1">
                        <Briefcase className="w-3 h-3 text-[#3D5AFE]" />
                        <span>{conv.job?.title || 'Open Position'}</span>
                      </p>

                      <div className="flex items-center justify-between gap-2 mt-1.5">
                        <p className="text-[11px] text-slate-400 truncate max-w-[180px]">
                          {conv.lastMessage?.content || 'Application shortlisted'}
                        </p>

                        {conv.unreadCount > 0 && (
                          <span className="w-4 h-4 rounded-full bg-[#3D5AFE] text-white text-[9px] font-bold flex items-center justify-center shrink-0">
                            {conv.unreadCount}
                          </span>
                        )}

                        {hasInterview && (
                          <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 flex items-center gap-0.5 shrink-0">
                            <Calendar className="w-2.5 h-2.5" />
                            Interview
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Main Panel: Active Conversation View */}
        <div
          className={`flex-1 flex flex-col bg-white dark:bg-[#0E1535] overflow-hidden ${
            !mobileShowChat ? 'hidden md:flex' : 'flex'
          }`}
        >
          {selectedConversation ? (
            <>
              {/* Chat Top Header */}
              <div className="p-4 px-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/40 dark:bg-[#111736] shrink-0">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setMobileShowChat(false)}
                    className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>

                  <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-[#3D5AFE] dark:text-[#8098FF] flex items-center justify-center font-black text-sm">
                    {selectedConversation.company?.name?.charAt(0).toUpperCase() || 'E'}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                        {selectedConversation.company?.name || 'Employer'}
                      </h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Shortlisted
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <span>Role: {selectedConversation.job?.title}</span>
                      <span>•</span>
                      <a
                        href="/dashboard/job-center"
                        className="text-[#3D5AFE] dark:text-[#00D9C0] hover:underline font-semibold flex items-center gap-0.5"
                      >
                        View in Job Center <ChevronRight className="w-3 h-3" />
                      </a>
                    </p>
                  </div>
                </div>
              </div>

              {/* Chat Message Stream */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/30 dark:bg-[#0A0F26]/40">
                {loadingMessages ? (
                  <div className="h-full flex items-center justify-center text-slate-400 text-xs gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-[#3D5AFE]" />
                    <span>Loading conversation...</span>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
                    <MessageSquare className="w-10 h-10 mb-2 text-slate-300 dark:text-slate-700" />
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Conversation started
                    </p>
                    <p className="text-[11px] text-slate-400 max-w-sm mt-1">
                      You are connected with the hiring team at {selectedConversation.company?.name}. Reply below to confirm your availability or ask questions about the role.
                    </p>
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const isCandidate = msg.senderRole === 'candidate';
                    const isInterviewCard = msg.type === 'interview_invite';

                    return (
                      <div
                        key={idx}
                        className={`flex flex-col ${isCandidate ? 'items-end' : 'items-start'}`}
                      >
                        {/* Interview Invitation Card */}
                        {isInterviewCard && msg.interviewDetails ? (
                          <div className="max-w-lg w-full p-5 rounded-3xl bg-gradient-to-br from-indigo-900/90 via-slate-900 to-slate-950 border border-indigo-500/40 text-white shadow-2xl space-y-3.5 my-2">
                            <div className="flex items-center justify-between">
                              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-[#00D9C0]" /> Official Interview Invitation
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {new Date(msg.createdAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>

                            <div>
                              <h4 className="text-base font-extrabold text-white">
                                {msg.interviewDetails.roundTitle}
                              </h4>
                              <p className="text-xs text-indigo-200/90 mt-1 leading-relaxed">
                                {msg.content}
                              </p>
                            </div>

                            {/* Meeting Metadata Pill Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-black/40 p-3 rounded-2xl border border-indigo-500/20">
                              <div className="flex items-center gap-2 text-slate-200">
                                <Calendar className="w-4 h-4 text-[#00D9C0] shrink-0" />
                                <div>
                                  <span className="block text-[10px] text-slate-400 font-semibold">Date</span>
                                  <span className="font-bold">
                                    {new Date(msg.interviewDetails.scheduledAt).toLocaleDateString([], {
                                      weekday: 'short',
                                      month: 'short',
                                      day: 'numeric',
                                    })}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 text-slate-200">
                                <Clock className="w-4 h-4 text-[#00D9C0] shrink-0" />
                                <div>
                                  <span className="block text-[10px] text-slate-400 font-semibold">Time & Duration</span>
                                  <span className="font-bold">
                                    {new Date(msg.interviewDetails.scheduledAt).toLocaleTimeString([], {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}{' '}
                                    ({msg.interviewDetails.durationMinutes} mins)
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Primary Action: Join Google Meet */}
                            <a
                              href={msg.interviewDetails.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-500/20 cursor-pointer"
                            >
                              <Video className="w-4 h-4" />
                              <span>Join Google Meet Interview</span>
                              <ExternalLink className="w-3.5 h-3.5 ml-1 opacity-75" />
                            </a>
                          </div>
                        ) : (
                          /* Standard Message Bubble */
                          <div
                            className={`max-w-[75%] rounded-2xl px-4 py-3 text-xs shadow-sm ${
                              isCandidate
                                ? 'bg-[#3D5AFE] text-white rounded-br-xs'
                                : 'bg-white dark:bg-[#151D42] text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-bl-xs'
                            }`}
                          >
                            <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                            <span
                              className={`block text-[9px] mt-1.5 text-right ${
                                isCandidate ? 'text-indigo-200' : 'text-slate-400'
                              }`}
                            >
                              {new Date(msg.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Bar */}
              <form
                onSubmit={handleSendMessage}
                className="p-4 bg-white dark:bg-[#111736] border-t border-slate-200 dark:border-slate-800 flex items-center gap-3 shrink-0"
              >
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={`Reply to ${selectedConversation.company?.name || 'Employer'}...`}
                  className="flex-1 text-xs px-4 py-3 rounded-2xl bg-slate-100 dark:bg-[#0E1535] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3D5AFE]/30"
                  disabled={sending}
                />
                <button
                  type="submit"
                  disabled={!replyText.trim() || sending}
                  className="px-5 py-3 rounded-2xl bg-[#3D5AFE] hover:bg-[#3048d1] text-white font-bold text-xs flex items-center gap-2 disabled:opacity-40 transition shadow cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">Send</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-400">
              <MessageSquare className="w-12 h-12 mb-3 text-slate-300 dark:text-slate-700" />
              <h3 className="text-sm font-extrabold text-slate-700 dark:text-slate-300">
                No conversation selected
              </h3>
              <p className="text-xs text-slate-400 max-w-xs mt-1">
                Select a company thread from the left sidebar to view messages and interview invitations.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CandidateMessagesPage() {
  return (
    <DashboardLayout>
      <Suspense
        fallback={
          <div className="h-64 flex items-center justify-center text-slate-400 text-xs gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-[#3D5AFE]" />
            <span>Loading messages...</span>
          </div>
        }
      >
        <MessagesContent />
      </Suspense>
    </DashboardLayout>
  );
}
