'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Calendar,
  Video,
  Clock,
  ExternalLink,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  User,
  Gift,
  DollarSign,
  MapPin,
  FileCheck,
} from 'lucide-react';
import { messageService, ChatMessage } from '@/services/message.service';
import { toast } from 'sonner';

interface CandidateMessagesTabProps {
  applicationId: string;
  initialConversationId?: string | null;
  candidateName: string;
  candidateId: string;
  onScheduleInterviewClick: () => void;
  onOfferStatusDetected?: (status: 'accepted' | 'declined', offerDetails?: any) => void;
  isHired?: boolean;
}

export const CandidateMessagesTab: React.FC<CandidateMessagesTabProps> = ({
  applicationId,
  initialConversationId,
  candidateName,
  candidateId,
  onScheduleInterviewClick,
  onOfferStatusDetected,
  isHired,
}) => {
  const [conversationId, setConversationId] = useState<string | null>(
    initialConversationId || null
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [text, setText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    let isMounted = true;
    let pollInterval: NodeJS.Timeout | null = null;

    async function loadThread(showLoading = true) {
      try {
        if (showLoading) setLoading(true);
        // If we don't have conversationId yet, search user conversations for this application
        let convId = conversationId;
        if (!convId) {
          const list = await messageService.getConversations({ limit: 50 });
          const match = list.items.find((c) => c.applicationId === applicationId);
          if (match) {
            convId = match.id;
            if (isMounted) setConversationId(match.id);
          }
        }

        if (convId) {
          const res = await messageService.getConversationMessages(convId);
          if (isMounted) {
            setMessages(res.messages || []);
            // Check if there is an offer response in the thread
            const offerMsg = res.messages?.find(
              (m) => m.type === 'offer_letter' && m.offerDetails?.status && m.offerDetails.status !== 'pending'
            );
            if (offerMsg?.offerDetails?.status) {
              onOfferStatusDetected?.(offerMsg.offerDetails.status as 'accepted' | 'declined', offerMsg.offerDetails);
            }
          }
        } else {
          if (isMounted) setMessages([]);
        }
      } catch (err: any) {
        console.error('[CandidateMessagesTab] Error loading conversation:', err);
      } finally {
        if (isMounted && showLoading) setLoading(false);
      }
    }

    loadThread(true);

    // Light periodic polling while viewing chat to detect live candidate response
    pollInterval = setInterval(() => {
      loadThread(false);
    }, 6000);

    return () => {
      isMounted = false;
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [applicationId, conversationId, onOfferStatusDetected]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || sending) return;

    const messageText = text.trim();
    setText('');

    try {
      setSending(true);

      // If conversation doesn't exist yet, it will be initialized on first send
      if (!conversationId) {
        toast.error('Please move candidate to Shortlisted or Schedule an Interview to start chatting');
        return;
      }

      const newMsg = await messageService.sendMessage(conversationId, messageText);
      setMessages((prev) => [...prev, newMsg]);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to send message');
      setText(messageText); // Restore input
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col h-full bg-slate-50/60 dark:bg-[#0B112B] overflow-hidden">
      {/* Tab Top Bar */}
      <div className="p-3.5 px-5 bg-white dark:bg-[#111736] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#3D5AFE]/10 text-[#3D5AFE] flex items-center justify-center font-bold text-xs">
            {candidateName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
              {candidateName}
            </h4>
            <span className="text-[10px] text-emerald-500 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Connected Candidate
            </span>
          </div>
        </div>

        {isHired ? (
          <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold flex items-center gap-1.5 shadow-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Offer Accepted</span>
          </span>
        ) : (
          <button
            onClick={onScheduleInterviewClick}
            className="px-3 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Schedule Interview</span>
          </button>
        )}
      </div>

      {/* Message History Feed */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 space-y-3">
        {loading ? (
          <div className="h-full flex items-center justify-center text-slate-400 text-xs gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Loading conversation...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <MessageSquare className="w-10 h-10 mb-2 text-slate-300 dark:text-slate-700" />
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
              No messages yet
            </p>
            <p className="text-[11px] text-slate-400 max-w-xs mt-1">
              Moving this candidate to <strong className="text-purple-500">Shortlisted</strong> or clicking <strong className="text-indigo-500">Schedule Interview</strong> opens this communication channel.
            </p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isRecruiter = msg.senderRole === 'recruiter';
            const isInterviewInvite = msg.type === 'interview_invite';

            return (
              <div
                key={idx}
                className={`flex flex-col ${isRecruiter ? 'items-end' : 'items-start'}`}
              >
                {/* Interview Invite Action Card */}
                {isInterviewInvite && msg.interviewDetails ? (
                  <div className="max-w-md w-full p-4 rounded-2xl bg-gradient-to-br from-indigo-900/40 to-slate-900 border border-indigo-500/30 text-white shadow-xl space-y-3 my-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Interview Invitation
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div>
                      <h5 className="text-sm font-extrabold text-white">
                        {msg.interviewDetails.roundTitle}
                      </h5>
                      <p className="text-xs text-indigo-200/80 mt-0.5">
                        {msg.content}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <Calendar className="w-3.5 h-3.5 text-[#00D9C0]" />
                        <span>
                          {new Date(msg.interviewDetails.scheduledAt).toLocaleDateString([], {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-slate-300">
                        <Clock className="w-3.5 h-3.5 text-[#00D9C0]" />
                        <span>
                          {new Date(msg.interviewDetails.scheduledAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}{' '}
                          ({msg.interviewDetails.durationMinutes}m)
                        </span>
                      </div>
                    </div>

                    <a
                      href={msg.interviewDetails.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-90 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Join Meeting Link</span>
                      <ExternalLink className="w-3 h-3 ml-1 opacity-70" />
                    </a>
                  </div>
                ) : msg.type === 'offer_letter' && msg.offerDetails ? (
                  /* Job Offer Letter Card (Recruiter View) */
                  <div className="max-w-md w-full p-4 rounded-2xl bg-gradient-to-br from-emerald-950/60 via-slate-900 to-slate-950 border border-emerald-500/40 text-white shadow-xl space-y-3 my-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                        <Gift className="w-3 h-3 text-[#00D9C0]" /> Official Job Offer
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div>
                      <h5 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                        <span>{msg.offerDetails.designation}</span>
                      </h5>
                      <p className="text-xs text-emerald-200/90 mt-1 leading-relaxed">
                        {msg.content}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs bg-black/40 p-2.5 rounded-xl border border-emerald-500/20">
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <div>
                          <span className="block text-[9px] text-slate-400 uppercase font-bold">Compensation</span>
                          <span className="font-extrabold text-emerald-300">{msg.offerDetails.annualCompensation}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 text-slate-300">
                        <Calendar className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                        <div>
                          <span className="block text-[9px] text-slate-400 uppercase font-bold">Joining Date</span>
                          <span className="font-bold">
                            {new Date(msg.offerDetails.joiningDate).toLocaleDateString([], {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {msg.offerDetails.benefits && msg.offerDetails.benefits.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-0.5">
                        {msg.offerDetails.benefits.map((benefit, bIdx) => (
                          <span key={bIdx} className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[10px] font-semibold">
                            ✓ {benefit}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="pt-2 border-t border-emerald-500/20 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Status:</span>
                      {msg.offerDetails.status === 'accepted' ? (
                        <span className="px-2.5 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Offer Accepted by Candidate
                        </span>
                      ) : msg.offerDetails.status === 'declined' ? (
                        <span className="px-2.5 py-0.5 rounded-full font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                          Offer Declined
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          Awaiting Candidate Response
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Standard Chat Bubble */
                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs shadow-sm ${
                      isRecruiter
                        ? 'bg-[#3D5AFE] text-white rounded-br-xs'
                        : 'bg-white dark:bg-[#151D42] text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-bl-xs'
                    }`}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    <span
                      className={`block text-[9px] mt-1 text-right ${
                        isRecruiter ? 'text-indigo-200' : 'text-slate-400'
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

      {/* Message Input Box */}
      <form
        onSubmit={handleSendMessage}
        className="p-3 bg-white dark:bg-[#111736] border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
      >
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={`Message ${candidateName}...`}
          className="flex-1 text-xs px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-[#0E1535] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3D5AFE]/30"
          disabled={!conversationId || sending}
        />
        <button
          type="submit"
          disabled={!text.trim() || !conversationId || sending}
          className="p-2 rounded-xl bg-[#3D5AFE] hover:bg-[#324ad9] text-white disabled:opacity-40 transition cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
