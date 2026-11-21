'use client';

import React, { useEffect, useState, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  InterviewSession,
  InterviewQuestion,
  InterviewAnswer,
  InterviewEvaluation,
  InterviewReport,
  SessionEvaluationSummary,
} from '@/types/interview-coach';
import {
  ReadinessScoreHero,
  CompetencyBreakdownCard,
  ExecutiveFeedbackCard,
  QuestionBreakdownAccordion,
  QuestionEvaluationItem,
} from '@/components/dashboard/interview-coach/report';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { planService } from '@/services/plan.service';
import {
  ArrowLeft,
  Sparkles,
  Loader2,
  AlertCircle,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';

interface ReportPageProps {
  params: Promise<{
    sessionId: string;
  }>;
}

export default function InterviewReportPage({ params }: ReportPageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const sessionId = resolvedParams.sessionId;

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [session, setSession] = useState<InterviewSession | null>(null);
  const [report, setReport] = useState<InterviewReport | null>(null);
  const [evaluations, setEvaluations] = useState<InterviewEvaluation[]>([]);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [answers, setAnswers] = useState<InterviewAnswer[]>([]);
  const [isPro, setIsPro] = useState<boolean>(true);

  // Load report or trigger evaluation if needed
  const loadReportData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 0. Check candidate plan tier
      planService
        .getPlanStatus()
        .then((plan) => {
          setIsPro(plan?.tier === 'PRO' || plan?.tier === 'ENTERPRISE');
        })
        .catch(() => {
          setIsPro(false);
        });

      // 1. Fetch Session details
      const sessionRes = await fetch(`/api/interviews/sessions/${sessionId}`);
      if (!sessionRes.ok) {
        const errData = await sessionRes.json().catch(() => null);
        throw new Error(errData?.error?.message || errData?.message || 'Interview session not found or you do not have permission.');
      }
      const sessionPayload = await sessionRes.json();
      const currentSession: InterviewSession = sessionPayload.data;
      setSession(currentSession);

      // 2. Fetch existing report
      const reportRes = await fetch(`/api/interviews/sessions/${sessionId}/report`);
      let reportData: InterviewReport | null = null;
      if (reportRes.ok) {
        const reportPayload = await reportRes.json();
        reportData = reportPayload.data;
      }

      // If no report exists yet, trigger evaluation generation
      if (!reportData) {
        setIsEvaluating(true);
        const evalRes = await fetch(`/api/interviews/sessions/${sessionId}/evaluate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!evalRes.ok) {
          const errData = await evalRes.json().catch(() => null);
          throw new Error(errData?.error?.message || errData?.message || 'Failed to generate interview evaluation.');
        }

        const evalPayload = await evalRes.json();
        const evalSummary: SessionEvaluationSummary = evalPayload.data;
        reportData = evalSummary.report;
        setReport(reportData);

        if (evalSummary.evaluations && evalSummary.evaluations.length > 0) {
          setEvaluations(evalSummary.evaluations.map((e) => e.evaluation).filter(Boolean));
          setQuestions(evalSummary.evaluations.map((e) => e.question).filter(Boolean));
          setAnswers(evalSummary.evaluations.map((e) => e.answer).filter(Boolean));
        }
      }

      setReport(reportData);

      // 3. Always fetch all session questions, evaluations, and answers in parallel to guarantee complete data
      const [evalsRes, questionsRes, answersRes] = await Promise.all([
        fetch(`/api/interviews/sessions/${sessionId}/evaluations`),
        fetch(`/api/interviews/sessions/${sessionId}/questions`),
        fetch(`/api/interviews/sessions/${sessionId}/answers`),
      ]);

      if (evalsRes.ok) {
        const evalsPayload = await evalsRes.json();
        if (evalsPayload.data && evalsPayload.data.length > 0) {
          setEvaluations(evalsPayload.data);
        }
      }
      if (questionsRes.ok) {
        const qPayload = await questionsRes.json();
        if (qPayload.data && qPayload.data.length > 0) {
          setQuestions(qPayload.data);
        }
      }
      if (answersRes.ok) {
        const ansPayload = await answersRes.json();
        if (ansPayload.data && ansPayload.data.length > 0) {
          setAnswers(ansPayload.data);
        }
      }
    } catch (err: unknown) {
      console.error('[InterviewReportPage] Error loading report:', err);
      const msg = err instanceof Error ? err.message : 'An error occurred while loading this evaluation report.';
      setError(msg);
    } finally {
      setIsLoading(false);
      setIsEvaluating(false);
    }
  }, [sessionId]);

  useEffect(() => {
    loadReportData();
  }, [loadReportData]);

  // Combine questions, answers, and evaluations into unified view models
  const questionItems: QuestionEvaluationItem[] = questions.map((q) => {
    const qIdStr = q._id ? String(q._id) : '';
    const matchedAnswer = answers.find((a) => {
      const aQId = a.questionId ? String((a.questionId as any)._id || a.questionId) : '';
      return aQId === qIdStr;
    });
    const matchedEvaluation = evaluations.find((e) => {
      const eQId = e.questionId ? String((e.questionId as any)._id || e.questionId) : '';
      return eQId === qIdStr;
    });

    return {
      question: q,
      answer: matchedAnswer,
      evaluation: matchedEvaluation,
    };
  });

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
        {/* Navigation Back CTA */}
        <div className="flex items-center justify-between gap-4 print:hidden">
          <Link
            href="/dashboard/interview-coach"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Return to Interview Hub"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Interview Hub</span>
          </Link>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="min-h-[400px] flex flex-col items-center justify-center p-8 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
              <Loader2 className="w-7 h-7 text-indigo-600 dark:text-indigo-400 animate-spin" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                {isEvaluating
                  ? 'Synthesizing AI Evaluation Report...'
                  : 'Loading Your Interview Assessment...'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                {isEvaluating
                  ? 'Analyzing your responses against industry benchmarks, grading 5 core competencies, and compiling gold-standard model answers.'
                  : 'Retrieving your scores, performance metrics, and coaching feedback.'}
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {!isLoading && (error || !session || !report) && (
          <div className="max-w-md mx-auto my-12 rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-lg dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/50 mx-auto flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-rose-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Unable to Display Report
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {error || 'The requested interview report could not be found or evaluation failed.'}
            </p>
            <div className="pt-2 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={loadReportData}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry</span>
              </button>
              <button
                type="button"
                onClick={() => router.push('/dashboard/interview-coach')}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 transition-colors cursor-pointer"
              >
                <span>Back to Hub</span>
              </button>
            </div>
          </div>
        )}

        {/* Main Report Dashboard Content */}
        {!isLoading && session && report && (
          <div className="space-y-8">
            {/* Zero Answers Notice if Session Concluded Without Submissions */}
            {report.overallScore === 0 && (!answers || answers.length === 0) && (
              <div className="rounded-2xl border border-amber-300/80 bg-amber-50/80 p-4 dark:border-amber-800/80 dark:bg-amber-950/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 shrink-0">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                      Incomplete Session — No Answers Submitted
                    </h4>
                    <p className="text-xs text-amber-800/90 dark:text-amber-300/90 mt-0.5">
                      This mock interview session was ended before answers were submitted. Practice again and submit responses to unlock full scoring, 5-dimension analytics, and AI model answers.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => router.push('/dashboard/interview-coach')}
                  className="shrink-0 px-4 py-2 text-xs font-bold rounded-xl bg-amber-600 hover:bg-amber-700 text-white transition-colors cursor-pointer"
                >
                  Start New Session
                </button>
              </div>
            )}

            {/* 1. Readiness Score Hero Card */}
            <ReadinessScoreHero
              session={session}
              report={report}
              totalQuestions={questions.length}
              totalAnswers={answers.length}
              onPracticeAgain={() => router.push('/dashboard/interview-coach')}
            />

            {/* 2. Dual Grid: Competency Breakdown & Executive Coaching Feedback */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* 5-Dimension Competency Scorecard (7 cols) */}
              <div className="lg:col-span-7">
                <CompetencyBreakdownCard
                  scores={report.dimensionScores}
                  benchmarkScore={session.experienceLevel === 'senior' || session.experienceLevel === 'lead' ? 80 : 70}
                />
              </div>

              {/* Executive Coaching Feedback (5 cols) */}
              <div className="lg:col-span-5">
                <ExecutiveFeedbackCard
                  strengths={report.strengths}
                  improvementAreas={report.improvementAreas}
                  recommendations={report.recommendations}
                />
              </div>
            </div>

            {/* 3. Detailed Question-by-Question Accordion Review */}
            <QuestionBreakdownAccordion
              items={questionItems}
              isPro={isPro}
            />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
