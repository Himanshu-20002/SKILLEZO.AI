'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  CreditCard,
  DollarSign,
  Sparkles,
  Lock,
  Unlock,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Save,
  CheckCircle2,
  Mic,
  Video,
  FileText,
  Sliders,
  Megaphone,
  Loader2,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import { adminService, AdminMonetizationConfig } from '@/services/admin.service';

export const AdminMonetizationPanel: React.FC = () => {
  const [config, setConfig] = useState<AdminMonetizationConfig | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isResetting, setIsResetting] = useState<boolean>(false);

  const fetchConfig = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await adminService.getMonetizationConfig();
      setConfig(data);
    } catch (err: any) {
      toast.error('Failed to load monetization config: ' + (err.message || 'Network error'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const handleSave = async () => {
    if (!config) return;
    try {
      setIsSaving(true);
      const updated = await adminService.updateMonetizationConfig(config);
      setConfig(updated);
      toast.success('Monetization & quota settings updated successfully! Live across all candidates.');
    } catch (err: any) {
      toast.error('Failed to save settings: ' + (err.message || 'Unknown error'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Are you sure you want to reset all pricing and quotas back to default strategic values?')) {
      return;
    }
    try {
      setIsResetting(true);
      const reset = await adminService.resetMonetizationConfig();
      setConfig(reset);
      toast.success('Monetization settings restored to strategic defaults (₹199 sprint, ₹499 pro, 1 free interview).');
    } catch (err: any) {
      toast.error('Failed to reset config: ' + (err.message || 'Unknown error'));
    } finally {
      setIsResetting(false);
    }
  };

  if (isLoading || !config) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <p className="text-sm font-medium text-slate-500">Loading dynamic monetization engine...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Top Banner Header */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl border border-indigo-900/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-2">
              <Zap className="w-3.5 h-3.5" />
              Dynamic Revenue Engine
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Monetization & Quota Control</h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl leading-relaxed">
              Tweak candidate pricing, free tier practice quotas, and paywall switches live. Changes apply immediately across the entire platform without requiring code redeployment.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleReset}
              disabled={isResetting || isSaving}
              data-testid="btn-reset-monetization"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
              <span>Defaults</span>
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || isResetting}
              data-testid="btn-save-monetization"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>Save Configuration</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: Pricing Tiers & Promo Banner (7 cols) */}
        <div className="lg:col-span-7 space-y-8">
          {/* 1. Pricing & Plans Configuration Card */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Candidate Pricing Tiers</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Live prices in INR (₹) charged during Razorpay checkout</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Sprint Pass (7 Days) */}
              <div className="rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-4 transition-all">
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Placement Sprint</span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">7-Day Sprint Pass</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">High-converting micro-transaction for active interview weeks</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">₹</span>
                      <input
                        type="number"
                        min="0"
                        value={config.pricing.sprintPass7Day.amountInRupees}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            pricing: {
                              ...config.pricing,
                              sprintPass7Day: {
                                ...config.pricing.sprintPass7Day,
                                amountInRupees: Number(e.target.value),
                                amountInPaise: Number(e.target.value) * 100,
                              },
                            },
                          })
                        }
                        data-testid="input-sprint-pass-price"
                        className="w-24 pl-7 pr-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-bold text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.pricing.sprintPass7Day.isActive}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            pricing: {
                              ...config.pricing,
                              sprintPass7Day: {
                                ...config.pricing.sprintPass7Day,
                                isActive: e.target.checked,
                              },
                            },
                          })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-500 relative"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* SKILLEZO Pro Monthly */}
              <div className="rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-4 transition-all">
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Recurring Monthly</span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">SKILLEZO Pro (Monthly)</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Continuous unlimited practice with priority AI latency</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">₹</span>
                      <input
                        type="number"
                        min="0"
                        value={config.pricing.proMonthly.amountInRupees}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            pricing: {
                              ...config.pricing,
                              proMonthly: {
                                ...config.pricing.proMonthly,
                                amountInRupees: Number(e.target.value),
                                amountInPaise: Number(e.target.value) * 100,
                              },
                            },
                          })
                        }
                        data-testid="input-pro-monthly-price"
                        className="w-24 pl-7 pr-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-bold text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.pricing.proMonthly.isActive}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            pricing: {
                              ...config.pricing,
                              proMonthly: {
                                ...config.pricing.proMonthly,
                                isActive: e.target.checked,
                              },
                            },
                          })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-500 relative"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* SKILLEZO Pro Annual */}
              <div className="rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-4 transition-all">
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Annual Commitment (33% Savings)</span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">SKILLEZO Pro (Annual)</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">12 months commitment for career switchers & graduates</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">₹</span>
                      <input
                        type="number"
                        min="0"
                        value={config.pricing.proYearly.amountInRupees}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            pricing: {
                              ...config.pricing,
                              proYearly: {
                                ...config.pricing.proYearly,
                                amountInRupees: Number(e.target.value),
                                amountInPaise: Number(e.target.value) * 100,
                              },
                            },
                          })
                        }
                        data-testid="input-pro-yearly-price"
                        className="w-24 pl-7 pr-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-bold text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.pricing.proYearly.isActive}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            pricing: {
                              ...config.pricing,
                              proYearly: {
                                ...config.pricing.proYearly,
                                isActive: e.target.checked,
                              },
                            },
                          })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-500 relative"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Global Promo Banner Card */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
                <Megaphone className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Broadcast Promotional Banner</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Top notification ribbon shown across the student & candidate dashboard</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Display Promo Banner</span>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.globalSettings.promoBannerActive}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        globalSettings: {
                          ...config.globalSettings,
                          promoBannerActive: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600 relative"></div>
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Banner Announcement Text</label>
                <input
                  type="text"
                  maxLength={200}
                  value={config.globalSettings.promoBannerText}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      globalSettings: {
                        ...config.globalSettings,
                        promoBannerText: e.target.value,
                      },
                    })
                  }
                  data-testid="input-promo-banner-text"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. 🎉 Placement Season Sprint: Get 7 Days Pro for ₹199!"
                />
              </div>

              {config.globalSettings.updatedByAdminEmail && (
                <p className="text-[11px] text-slate-400 dark:text-slate-500 italic">
                  Last updated by: {config.globalSettings.updatedByAdminEmail}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: AI Interview Coach & Resume Quotas (5 cols) */}
        <div className="lg:col-span-5 space-y-8">
          {/* 3. AI Mock Interview Quotas Card */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Interview Coach Free Quotas</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Limits enforced on non-paying candidate accounts</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Free Monthly Sessions */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Free Sessions / Month</h4>
                  <p className="text-[11px] text-slate-500">Number of full interviews before paywall</p>
                </div>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={config.interviewQuotas.freeMonthlySessions}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      interviewQuotas: {
                        ...config.interviewQuotas,
                        freeMonthlySessions: Number(e.target.value),
                      },
                    })
                  }
                  data-testid="input-free-monthly-sessions"
                  className="w-20 px-3 py-1.5 text-center rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Free Max Questions Per Session */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Max Questions / Session</h4>
                  <p className="text-[11px] text-slate-500">Cap question count for free practice</p>
                </div>
                <input
                  type="number"
                  min="1"
                  max="15"
                  value={config.interviewQuotas.freeMaxQuestionsPerSession}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      interviewQuotas: {
                        ...config.interviewQuotas,
                        freeMaxQuestionsPerSession: Number(e.target.value),
                      },
                    })
                  }
                  data-testid="input-free-max-questions"
                  className="w-20 px-3 py-1.5 text-center rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="h-px bg-slate-100 dark:bg-slate-800 my-2" />

              {/* Lock Senior Model Answers */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Lock Senior Model Answers</h4>
                  </div>
                  <p className="text-[11px] text-slate-500">Blur gold-standard answers in report</p>
                </div>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.interviewQuotas.lockModelAnswersForFree}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        interviewQuotas: {
                          ...config.interviewQuotas,
                          lockModelAnswersForFree: e.target.checked,
                        },
                      })
                    }
                    data-testid="toggle-lock-model-answers"
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600 relative"></div>
                </label>
              </div>

              {/* Allow Voice for Free */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <Mic className="w-3.5 h-3.5 text-slate-500" />
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Voice Speech (TTS/STT)</h4>
                  </div>
                  <p className="text-[11px] text-slate-500">Allow microphone input in free arena</p>
                </div>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.interviewQuotas.enableVoiceForFree}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        interviewQuotas: {
                          ...config.interviewQuotas,
                          enableVoiceForFree: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-500 relative"></div>
                </label>
              </div>

              {/* Allow Video for Free */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5 text-slate-500" />
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Webcam Video Feed</h4>
                  </div>
                  <p className="text-[11px] text-slate-500">Allow candidate camera mirror in arena</p>
                </div>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.interviewQuotas.enableVideoForFree}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        interviewQuotas: {
                          ...config.interviewQuotas,
                          enableVideoForFree: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-500 relative"></div>
                </label>
              </div>
            </div>
          </div>

          {/* 4. Resume Studio & ATS Quotas Card */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Resume & ATS Gates</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Free allowances for resume tailoring</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Free Max Resumes</h4>
                  <p className="text-[11px] text-slate-500">Resumes created before upgrade</p>
                </div>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={config.resumeQuotas.freeMaxResumes}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      resumeQuotas: {
                        ...config.resumeQuotas,
                        freeMaxResumes: Number(e.target.value),
                      },
                    })
                  }
                  className="w-20 px-3 py-1.5 text-center rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Free Monthly ATS Scans</h4>
                  <p className="text-[11px] text-slate-500">Job description match scans</p>
                </div>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={config.resumeQuotas.freeMonthlyAtsScans}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      resumeQuotas: {
                        ...config.resumeQuotas,
                        freeMonthlyAtsScans: Number(e.target.value),
                      },
                    })
                  }
                  className="w-20 px-3 py-1.5 text-center rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="h-px bg-slate-100 dark:bg-slate-800 my-2" />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Lock Word (DOCX) Export</h4>
                  <p className="text-[11px] text-slate-500">Editable Word exports require Pro</p>
                </div>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.resumeQuotas.lockDocxExportForFree}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        resumeQuotas: {
                          ...config.resumeQuotas,
                          lockDocxExportForFree: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600 relative"></div>
                </label>
              </div>

              {/* Lock Multi-Job Resume Tailoring */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Lock Multi-Job Tailoring</h4>
                  </div>
                  <p className="text-[11px] text-slate-500">AI resume tailoring requires Pro or Sprint Pass</p>
                </div>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.resumeQuotas.lockMultiJobTailoringForFree}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        resumeQuotas: {
                          ...config.resumeQuotas,
                          lockMultiJobTailoringForFree: e.target.checked,
                        },
                      })
                    }
                    data-testid="toggle-lock-multi-job-tailoring"
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600 relative"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
