'use client';

import React, { useState } from 'react';
import {
  X,
  Gift,
  Calendar,
  DollarSign,
  Briefcase,
  MapPin,
  Clock,
  Sparkles,
  CheckCircle2,
  FileCheck,
} from 'lucide-react';
import { messageService, SendOfferPayload } from '@/services/message.service';
import { toast } from 'sonner';

interface SendOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: string;
  candidateName: string;
  jobTitle: string;
  companyName?: string;
  onOfferSent: (offerData: any) => void;
}

export const SendOfferModal: React.FC<SendOfferModalProps> = ({
  isOpen,
  onClose,
  applicationId,
  candidateName,
  jobTitle,
  companyName = 'Our Organization',
  onOfferSent,
}) => {
  const [designation, setDesignation] = useState(jobTitle || 'Full Stack Engineer');
  const [currency, setCurrency] = useState<'INR' | 'USD' | 'EUR'>('INR');
  const [salaryAmount, setSalaryAmount] = useState('18,00,000');
  const [joiningDate, setJoiningDate] = useState(() => {
    // 14 days from today
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().slice(0, 10);
  });
  const [workplaceType, setWorkplaceType] = useState<'remote' | 'hybrid' | 'on-site'>('remote');
  const [location, setLocation] = useState('Remote / India');
  const [decisionDeadline, setDecisionDeadline] = useState(() => {
    // 7 days from today
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 10);
  });
  const [perksText, setPerksText] = useState('Comprehensive Health Insurance, Performance Bonus, Flexible Hours, Annual Learning Stipend');
  const [message, setMessage] = useState(
    `Congratulations ${candidateName}! We were very impressed by your technical interview rounds and problem-solving skills. We are excited to welcome you to ${companyName}!`
  );
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!designation.trim()) {
      toast.error('Please enter a role designation');
      return;
    }

    if (!salaryAmount.trim()) {
      toast.error('Please enter annual compensation');
      return;
    }

    try {
      setSubmitting(true);
      const symbol = currency === 'INR' ? '₹' : currency === 'USD' ? '$' : '€';
      const formattedComp = `${symbol}${salaryAmount.trim()} / year`;

      const benefits = perksText
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean);

      const payload: SendOfferPayload = {
        designation: designation.trim(),
        annualCompensation: formattedComp,
        joiningDate: new Date(joiningDate).toISOString(),
        workplaceType,
        location: location.trim(),
        decisionDeadline: new Date(decisionDeadline).toISOString(),
        benefits,
        message: message.trim(),
      };

      const result = await messageService.sendOffer(applicationId, payload);
      toast.success('Official Job Offer Extended!', {
        description: `Delivered to ${candidateName} with interactive acceptance actions in Chat.`,
      });

      onOfferSent(result);
      onClose();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to extend job offer');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white dark:bg-[#0E1535] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Extend Official Job Offer</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                  Candidate Final Round
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                For <strong className="text-slate-800 dark:text-slate-200">{candidateName}</strong> • {companyName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Role Designation */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
              <span>Role Title / Designation *</span>
            </label>
            <input
              type="text"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              placeholder="e.g. Senior Full Stack Engineer"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#151D42] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
              required
            />
          </div>

          {/* Compensation CTC & Currency */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                <span>Annual Compensation (CTC) *</span>
              </span>
              <div className="flex items-center gap-1">
                {(['INR', 'USD', 'EUR'] as const).map((curr) => (
                  <button
                    key={curr}
                    type="button"
                    onClick={() => setCurrency(curr)}
                    className={`px-2 py-0.5 rounded-md font-bold text-[10px] transition cursor-pointer ${
                      currency === curr
                        ? 'bg-emerald-500 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {curr === 'INR' ? '₹ INR' : curr === 'USD' ? '$ USD' : '€ EUR'}
                  </button>
                ))}
              </div>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                {currency === 'INR' ? '₹' : currency === 'USD' ? '$' : '€'}
              </span>
              <input
                type="text"
                value={salaryAmount}
                onChange={(e) => setSalaryAmount(e.target.value)}
                placeholder="18,00,000"
                className="w-full pl-8 pr-16 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#151D42] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-sm tracking-wide"
                required
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[11px] font-semibold">
                / year
              </span>
            </div>
          </div>

          {/* Joining Date & Decision Deadline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-teal-500" />
                <span>Target Joining Date *</span>
              </label>
              <input
                type="date"
                value={joiningDate}
                onChange={(e) => setJoiningDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#151D42] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>Decision Deadline *</span>
              </label>
              <input
                type="date"
                value={decisionDeadline}
                onChange={(e) => setDecisionDeadline(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#151D42] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                required
              />
            </div>
          </div>

          {/* Workplace Mode & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300">Workplace Mode</label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['remote', 'hybrid', 'on-site'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setWorkplaceType(mode)}
                    className={`py-2 px-1 rounded-xl text-[11px] font-bold capitalize transition border cursor-pointer ${
                      workplaceType === mode
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-300'
                        : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                <span>Office Location</span>
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Bangalore, India (Remote-friendly)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#151D42] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Benefits & Perks */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Key Benefits & Perks (Comma-separated)</span>
            </label>
            <input
              type="text"
              value={perksText}
              onChange={(e) => setPerksText(e.target.value)}
              placeholder="Health Insurance, ESOPs, Annual Bonus, Learning Budget"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#151D42] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Personalized Message / Welcome Note */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 dark:text-slate-300">
              Offer Welcome Note & Candidate Instructions
            </label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#151D42] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black shadow-lg shadow-emerald-500/20 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <FileCheck className="w-4 h-4" />
              <span>{submitting ? 'Extending Offer...' : 'Send Official Job Offer'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
