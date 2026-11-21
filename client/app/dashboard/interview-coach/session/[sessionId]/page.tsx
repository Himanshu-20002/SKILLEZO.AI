'use client';

import React, { useEffect, useState, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import {
  InterviewSession,
  InterviewQuestion,
  InterviewAnswer,
  StartOrResumeSessionResponse,
  SubmitAnswerResponse,
} from '@/types/interview-coach';
import {
  InterviewArenaHeader,
  QuestionDisplayCard,
  LiveCountdownTimer,
  InterviewCompletionView,
  AIInterviewAvatarStage,
  CandidateWebcamMirror,
  InteractiveResponseDock,
  ReadyCountdownOverlay,
} from '@/components/dashboard/interview-coach/arena';
import { useSpeechSynthesis } from '@/hooks/interview-coach/useSpeechSynthesis';
import { AlertCircle, Loader2 } from 'lucide-react';

interface ArenaPageProps {
  params: Promise<{
    sessionId: string;
  }>;
}

export default function InterviewArenaPage({ params }: ArenaPageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const sessionId = resolvedParams.sessionId;

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [session, setSession] = useState<InterviewSession | null>(null);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [answers, setAnswers] = useState<InterviewAnswer[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<InterviewQuestion | null>(null);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showEndModal, setShowEndModal] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [readyCountdown, setReadyCountdown] = useState<number | null>(null);

  // Speech Synthesis for AI Interviewer Voice
  const {
    speak,
    stop,
    isSpeaking,
  } = useSpeechSynthesis();

  // Fullscreen Focus Toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Initialize or resume the interview session
  const initSession = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const res = await fetch(`/api/interviews/sessions/${sessionId}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to start interview session.');
      }

      const payload = await res.json();
      const data: StartOrResumeSessionResponse = payload.data;

      setSession(data.session);
      setQuestions(data.questions);
      setAnswers(data.answers || []);
      setCurrentQuestion(data.currentQuestion);
      setIsCompleted(data.progress.isCompleted);

      // Start 3-second preparation countdown before the interview begins
      if (!data.progress.isCompleted && data.currentQuestion) {
        setReadyCountdown(3);
      }
    } catch (err: unknown) {
      console.error('[InterviewArenaPage] Initialization error:', err);
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred loading this interview session.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    initSession();
  }, [initSession]);

  // 3-Second Ready Timer: counts down 3 -> 2 -> 1 -> Go! before AI speaks
  useEffect(() => {
    if (readyCountdown === null) return;

    if (readyCountdown > 0) {
      const timer = setTimeout(() => {
        setReadyCountdown((prev) => (prev !== null && prev > 1 ? prev - 1 : 0));
      }, 1000);
      return () => clearTimeout(timer);
    } else if (readyCountdown === 0) {
      const timer = setTimeout(() => {
        setReadyCountdown(null);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [readyCountdown]);

  // Automatically speak question aloud when currentQuestion loads or changes, once candidate is ready
  useEffect(() => {
    // Hold off AI speech while candidate is preparing during the 3-second ready countdown
    if (readyCountdown !== null) {
      return;
    }

    if (currentQuestion?.questionText && !isCompleted && !isLoading) {
      const timer = setTimeout(() => {
        speak(currentQuestion.questionText);
      }, 400);

      return () => {
        clearTimeout(timer);
        stop();
      };
    }
    return () => {
      stop();
    };
  }, [currentQuestion?._id, isCompleted, isLoading, readyCountdown, speak, stop]);

  // Handle answer submission
  const handleSubmitAnswer = async (answerText: string) => {
    if (!currentQuestion || isSubmitting) return;

    // Silence active speech playback immediately upon submission
    stop();

    try {
      setIsSubmitting(true);

      const res = await fetch(`/api/interviews/sessions/${sessionId}/answers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: currentQuestion._id,
          answerText,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message || 'Failed to submit response.');
      }

      const payload = await res.json();
      const data: SubmitAnswerResponse = payload.data;

      setAnswers((prev) => [...prev, data.answer]);

      if (data.isCompleted || !data.nextQuestion) {
        setIsCompleted(true);
        setCurrentQuestion(null);
      } else {
        setCurrentQuestion(data.nextQuestion);
        if (data.followUpGenerated) {
          const qRes = await fetch(`/api/interviews/sessions/${sessionId}/questions`);
          if (qRes.ok) {
            const qPayload = await qRes.json();
            setQuestions(qPayload.data);
          }
        }
      }
    } catch (err: unknown) {
      console.error('[InterviewArenaPage] Submit error:', err);
      const msg = err instanceof Error ? err.message : 'Failed to submit answer. Please try again.';
      alert(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Conclude interview session early
  const handleEndEarly = async () => {
    stop();
    try {
      await fetch(`/api/interviews/sessions/${sessionId}/complete`, {
        method: 'POST',
      });
      setShowEndModal(false);
      setIsCompleted(true);
    } catch (err) {
      console.error('[InterviewArenaPage] Complete session error:', err);
    }
  };

  // Loading View
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-indigo-600 dark:text-indigo-400 animate-spin" />
          </div>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            Initializing AI Virtual Meeting Room...
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Calibrating camera, microphone, and AI interviewer audio
          </p>
        </div>
      </div>
    );
  }

  // Error View
  if (error || !session) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/50 mx-auto flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-rose-500" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Unable to Load Session
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {error || 'The requested interview session could not be found or you do not have permission to view it.'}
          </p>
          <button
            onClick={() => router.push('/dashboard/interview-coach')}
            className="w-full py-2.5 px-4 rounded-xl font-bold text-sm bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:opacity-90 transition-opacity"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Seamless Integrated Header Bar */}
      <InterviewArenaHeader
        session={session}
        currentSequence={currentQuestion ? currentQuestion.sequence : questions.length}
        totalQuestions={questions.length}
        onEndEarly={() => setShowEndModal(true)}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
      />

      {/* Main Dual-Column Virtual Stage */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {isCompleted ? (
          <div className="max-w-4xl mx-auto">
            <InterviewCompletionView
              session={session}
              totalQuestions={questions.length}
              totalAnswers={answers.length}
            />
          </div>
        ) : currentQuestion ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* COLUMN 1: VIRTUAL STAGE (Left - 5 Cols on desktop) */}
            {/* Contains the two symmetric video conference participant tiles */}
            <div className="lg:col-span-5 flex flex-col gap-4 h-full">
              {/* Tile 1: AI Interviewer Persona Stage */}
              <AIInterviewAvatarStage
                status={isSubmitting ? 'analyzing' : isSpeaking ? 'speaking' : 'idle'}
                isSpeaking={isSpeaking}
                onReplayQuestion={() => speak(currentQuestion.questionText)}
                onStopAudio={stop}
                roleTitle={session.role}
                interviewerTitle="Senior Technical Evaluator"
                className="flex-1 min-h-[280px]"
              />

              {/* Tile 2: Candidate Live Webcam Mirror (Directly below AI Interviewer with exact same dimensions) */}
              <CandidateWebcamMirror
                candidateName="You (Candidate)"
                className="flex-1 min-h-[280px]"
              />
            </div>

            {/* COLUMN 2: INTERACTION HUB (Right - 7 Cols on desktop) */}
            {/* Contains the question prompt and the interactive response center */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              {/* Active Question Display Card with Integrated Live Countdown Timer */}
              <QuestionDisplayCard
                question={currentQuestion}
                totalQuestions={questions.length}
                timerNode={
                  <LiveCountdownTimer
                    questionSequence={currentQuestion.sequence}
                    allocatedMinutes={Math.max(2, Math.round(session.durationMinutes / Math.max(1, questions.length)))}
                  />
                }
              />

              {/* Interactive Response Dock (Voice Mode + Text Mode) */}
              <InteractiveResponseDock
                sessionId={session._id}
                questionId={currentQuestion._id}
                isSubmitting={isSubmitting}
                isAISpeaking={isSpeaking}
                onSubmit={handleSubmitAnswer}
              />
            </div>
          </div>
        ) : null}
      </main>

      {/* 3-Second Ready Preparation Overlay */}
      {readyCountdown !== null && session && (
        <ReadyCountdownOverlay
          countdown={readyCountdown}
          role={session.role}
          onSkip={() => setReadyCountdown(null)}
        />
      )}

      {/* End Session Early Confirmation Modal */}
      {showEndModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Conclude Interview Early?
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Are you sure you want to finish this session now? Answers submitted so far will be saved and evaluated, but unanswered questions will be marked as skipped.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowEndModal(false)}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Continue Practice
              </button>
              <button
                onClick={handleEndEarly}
                className="px-4 py-2 rounded-xl text-sm font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/30 transition-all"
              >
                Conclude Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
