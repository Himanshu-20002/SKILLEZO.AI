'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HelpCircle,
  MessageSquare,
  X,
  Send,
  Mail,
  BookOpen,
  Shield,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';

export function DashboardFooter() {
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackType, setFeedbackType] = useState<'improvement' | 'bug' | 'feature'>('improvement');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) {
      toast.error('Please enter your feedback before submitting.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setFeedbackOpen(false);
      setFeedbackText('');
      toast.success('Thank you for your feedback! Our team reviews every suggestion.');
    }, 50);
  };

  return (
    <>
      <footer
        className="mt-10 sm:mt-14 border-t border-slate-200/70 dark:border-white/[0.06] pt-6 pb-6 select-none transition-colors"
        data-testid="dashboard-footer"
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pr-0 lg:pr-24">
          {/* Corporate Attribution & Pedigree */}
          <div className="space-y-1 text-center sm:text-left">
            <p className="text-xs font-medium text-slate-700 dark:text-white/80">
              © {new Date().getFullYear()}{' '}
              <span className="font-semibold text-slate-900 dark:text-white">Skillezo</span>. All rights
              reserved.
            </p>
            <p className="text-[11px] text-slate-500 dark:text-white/40 leading-relaxed">
              A product of{' '}
              <span className="font-medium text-slate-600 dark:text-white/60">SKILLEDHYRE LABS</span>, a unit
              of{' '}
              <span className="font-medium text-slate-600 dark:text-white/60">
                DEVAADYA TECHNOLOGIES PRIVATE LIMITED
              </span>
              .
            </p>
          </div>

          {/* Clean Help & Feedback Action Buttons */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => setHelpOpen(true)}
              data-testid="footer-help-btn"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium text-slate-700 dark:text-white/80 bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.05] dark:hover:bg-white/[0.1] border border-slate-200/80 dark:border-white/10 transition-all cursor-pointer shadow-xs"
            >
              <HelpCircle className="w-3.5 h-3.5 text-[#3D5AFE] dark:text-[#00D9C0]" />
              <span>Help</span>
            </button>

            <button
              onClick={() => setFeedbackOpen(true)}
              data-testid="footer-feedback-btn"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium text-slate-700 dark:text-white/80 bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.05] dark:hover:bg-white/[0.1] border border-slate-200/80 dark:border-white/10 transition-all cursor-pointer shadow-xs"
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#3D5AFE] dark:text-[#00D9C0]" />
              <span>Feedback</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Feedback Dialog Modal */}
      <AnimatePresence>
        {feedbackOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setFeedbackOpen(false)}
              className="fixed inset-0 bg-slate-950/60 dark:bg-[#070b1e]/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative z-10 w-full max-w-md rounded-2xl bg-white dark:bg-[#0D153A] border border-slate-200 dark:border-white/15 p-6 shadow-2xl text-slate-900 dark:text-white"
              data-testid="feedback-modal"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-[#00D9C0]/15 text-[#00D9C0]">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold">Share Your Feedback</h3>
                </div>
                <button
                  onClick={() => setFeedbackOpen(false)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleFeedbackSubmit} className="mt-4 space-y-4">
                {/* Type Selection */}
                <div className="flex items-center gap-2">
                  {[
                    { id: 'improvement', label: 'Idea / Suggestion' },
                    { id: 'bug', label: 'Issue' },
                    { id: 'feature', label: 'Feature Request' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setFeedbackType(t.id as any)}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        feedbackType === t.id
                          ? 'bg-[#3D5AFE]/10 dark:bg-[#3D5AFE]/20 border-[#3D5AFE] text-[#3D5AFE] dark:text-indigo-300'
                          : 'border-slate-200 dark:border-white/10 text-slate-500 dark:text-white/60 hover:bg-slate-50 dark:hover:bg-white/5'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-white/70 mb-1.5">
                    How can we improve your experience?
                  </label>
                  <textarea
                    rows={4}
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Tell us what you liked or what needs improvement..."
                    className="w-full rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 p-3 text-xs sm:text-sm text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/30 focus:outline-none focus:border-[#00D9C0] transition-colors resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setFeedbackOpen(false)}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-white/60 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    data-testid="feedback-submit-btn"
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#3D5AFE] to-[#00D9C0] hover:shadow-[0_0_18px_rgba(0,217,192,0.4)] text-xs font-bold text-white transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmitting ? 'Sending...' : 'Send Feedback'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Help & Support Dialog Modal */}
      <AnimatePresence>
        {helpOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setHelpOpen(false)}
              className="fixed inset-0 bg-slate-950/60 dark:bg-[#070b1e]/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative z-10 w-full max-w-md rounded-2xl bg-white dark:bg-[#0D153A] border border-slate-200 dark:border-white/15 p-6 shadow-2xl text-slate-900 dark:text-white"
              data-testid="help-modal"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-[#3D5AFE]/15 text-[#3D5AFE]">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold">Help & Resources</h3>
                </div>
                <button
                  onClick={() => setHelpOpen(false)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4 space-y-3">
                <a
                  href="mailto:support@skillezo.com"
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] hover:bg-slate-100 dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/5 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-[#00D9C0]" />
                    <div>
                      <h4 className="text-xs font-bold">Email Support Desk</h4>
                      <p className="text-[11px] text-slate-500 dark:text-white/50">
                        support@skillezo.com • Response within 24 hours
                      </p>
                    </div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white" />
                </a>

                <Link
                  href="/faq"
                  onClick={() => setHelpOpen(false)}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] hover:bg-slate-100 dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/5 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-4 h-4 text-[#3D5AFE]" />
                    <div>
                      <h4 className="text-xs font-bold">Frequently Asked Questions</h4>
                      <p className="text-[11px] text-slate-500 dark:text-white/50">
                        Common questions on resumes, tokens & scoring
                      </p>
                    </div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white" />
                </Link>

                <Link
                  href="/security"
                  onClick={() => setHelpOpen(false)}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] hover:bg-slate-100 dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/5 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <Shield className="w-4 h-4 text-emerald-400" />
                    <div>
                      <h4 className="text-xs font-bold">Data Privacy & Security</h4>
                      <p className="text-[11px] text-slate-500 dark:text-white/50">
                        How your resume and assessment data is safeguarded
                      </p>
                    </div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white" />
                </Link>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-200 dark:border-white/10 flex justify-end">
                <button
                  onClick={() => setHelpOpen(false)}
                  className="px-4 py-1.5 rounded-xl bg-slate-100 dark:bg-white/10 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-white/20 transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
