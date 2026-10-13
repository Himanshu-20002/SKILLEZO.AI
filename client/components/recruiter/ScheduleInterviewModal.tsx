'use client';

import React, { useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  Video,
  User,
  Link as LinkIcon,
  MessageSquare,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { messageService, ScheduleInterviewPayload } from '@/services/message.service';
import { toast } from 'sonner';

interface ScheduleInterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: string;
  candidateName: string;
  jobTitle: string;
  onScheduled: (interviewData: any) => void;
}

export const ScheduleInterviewModal: React.FC<ScheduleInterviewModalProps> = ({
  isOpen,
  onClose,
  applicationId,
  candidateName,
  jobTitle,
  onScheduled,
}) => {
  const [roundTitle, setRoundTitle] = useState('Round 1: Technical Screening');
  const [scheduledDate, setScheduledDate] = useState(() => {
    // Tomorrow at 10:00 AM
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(10, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  });
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [meetingPlatform, setMeetingPlatform] = useState<
    'google_meet' | 'zoom' | 'teams' | 'phone' | 'other'
  >('google_meet');
  const [meetingLink, setMeetingLink] = useState('https://meet.google.com/new');
  const [interviewerName, setInterviewerName] = useState('Hiring Team Lead');
  const [instructions, setInstructions] = useState(
    'Please join 5 minutes early. Ensure your camera, microphone, and coding workspace are ready.'
  );
  const [message, setMessage] = useState(
    `Hi ${candidateName}, we were impressed by your profile and would love to speak with you regarding the ${jobTitle} opening!`
  );
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!roundTitle.trim()) {
      toast.error('Please enter an interview round title');
      return;
    }

    if (!meetingLink.trim()) {
      toast.error('Please enter a valid meeting link');
      return;
    }

    try {
      setSubmitting(true);
      const payload: ScheduleInterviewPayload = {
        roundTitle: roundTitle.trim(),
        scheduledAt: new Date(scheduledDate).toISOString(),
        durationMinutes: Number(durationMinutes),
        timezone: 'Asia/Kolkata (IST)',
        meetingPlatform,
        meetingLink: meetingLink.trim(),
        interviewerName: interviewerName.trim() || 'Hiring Manager',
        instructions: instructions.trim(),
        message: message.trim(),
      };

      const result = await messageService.scheduleInterview(applicationId, payload);
      toast.success('Interview scheduled successfully!', {
        description: `Candidate notified with meeting details & calendar invitation.`,
      });

      onScheduled(result);
      onClose();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to schedule interview');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#0E1535] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-200/90 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-[#111736]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Schedule Interview with {candidateName}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Candidate will receive an email, calendar invite, and in-app action card.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Round Title */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Interview Round Title
            </label>
            <input
              type="text"
              value={roundTitle}
              onChange={(e) => setRoundTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#151D42] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3D5AFE]/30"
              placeholder="e.g. Round 1: Technical & System Architecture Screen"
              required
            />
          </div>

          {/* Date & Duration Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#3D5AFE]" /> Date & Time (IST)
              </label>
              <input
                type="datetime-local"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#151D42] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3D5AFE]/30"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#3D5AFE]" /> Duration
              </label>
              <select
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#151D42] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3D5AFE]/30"
              >
                <option value={30}>30 Minutes</option>
                <option value={45}>45 Minutes (Recommended)</option>
                <option value={60}>60 Minutes (1 Hour)</option>
                <option value={90}>90 Minutes</option>
              </select>
            </div>
          </div>

          {/* Platform & Meeting Link */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-[#3D5AFE]" /> Platform
              </label>
              <select
                value={meetingPlatform}
                onChange={(e) => setMeetingPlatform(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#151D42] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3D5AFE]/30"
              >
                <option value="google_meet">Google Meet</option>
                <option value="zoom">Zoom</option>
                <option value="teams">Microsoft Teams</option>
                <option value="phone">Phone Screen</option>
                <option value="other">Other / Onsite</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5 text-[#3D5AFE]" /> Meeting URL / Instructions
              </label>
              <input
                type="text"
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                placeholder="https://meet.google.com/abc-defg-hij"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#151D42] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3D5AFE]/30 font-mono text-[11px]"
                required
              />
            </div>
          </div>

          {/* Interviewer Name */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#3D5AFE]" /> Primary Interviewer Name
            </label>
            <input
              type="text"
              value={interviewerName}
              onChange={(e) => setInterviewerName(e.target.value)}
              placeholder="e.g. Dayjafry (Hiring Manager)"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#151D42] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3D5AFE]/30"
              required
            />
          </div>

          {/* Direct Message to Candidate */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-[#3D5AFE]" /> Message to Candidate
            </label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#151D42] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3D5AFE]/30"
              placeholder="Add personal note to candidate..."
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-white text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#3D5AFE] to-[#6366F1] hover:opacity-90 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <span>Sending Invitation...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm & Send Interview Invite</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
