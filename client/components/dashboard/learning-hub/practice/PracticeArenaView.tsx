'use client';

import React, { useState, useEffect } from 'react';
import {
  Zap,
  Sparkles,
  Search,
  CheckCircle2,
  Award,
  Filter,
  Plus,
  RefreshCw,
  Clock,
  Layers,
} from 'lucide-react';
import { PracticeDrillItem, QuizSubmissionResult, PdfQuizQuestion } from '@/types/learning-hub';
import { learningHubService } from '@/services/learning-hub.service';
import { DrillCard } from './DrillCard';
import { QuizRunnerModal } from './QuizRunnerModal';
import { QuizResultModal } from './QuizResultModal';
import { GenerateBlitzModal } from './GenerateBlitzModal';

interface PracticeArenaViewProps {
  onGoToVerification?: () => void;
  initialDrillLaunch?: {
    title: string;
    questions: PdfQuizQuestion[];
    category?: string;
  } | null;
  onClearInitialDrillLaunch?: () => void;
}

export function PracticeArenaView({
  onGoToVerification,
  initialDrillLaunch,
  onClearInitialDrillLaunch,
}: PracticeArenaViewProps) {
  const [drills, setDrills] = useState<PracticeDrillItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Runner state
  const [isRunnerOpen, setIsRunnerOpen] = useState(false);
  const [runnerTitle, setRunnerTitle] = useState('');
  const [runnerCategory, setRunnerCategory] = useState('Technical Drill');
  const [runnerQuestions, setRunnerQuestions] = useState<PdfQuizQuestion[]>([]);
  const [runnerResourceId, setRunnerResourceId] = useState<string>('');
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false);

  // Result state
  const [isResultOpen, setIsResultOpen] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizSubmissionResult | null>(null);

  // Generate Blitz modal state
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch drills
  const fetchDrills = async () => {
    setLoading(true);
    try {
      const data = await learningHubService.listPracticeDrills({
        category: category !== 'All' ? category : undefined,
        search: searchQuery.trim() || undefined,
      });
      setDrills(data);
    } catch (err) {
      console.error('Failed to load practice drills:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrills();
  }, [category, searchQuery]);

  // Handle external launch from PDF Vault "Start Practice"
  useEffect(() => {
    if (initialDrillLaunch && initialDrillLaunch.questions.length > 0) {
      setRunnerTitle(initialDrillLaunch.title);
      setRunnerCategory(initialDrillLaunch.category || 'PDF Extraction Drill');
      setRunnerQuestions(initialDrillLaunch.questions);
      setRunnerResourceId(`pdf_drill_${Date.now()}`);
      setIsRunnerOpen(true);
      if (onClearInitialDrillLaunch) {
        onClearInitialDrillLaunch();
      }
    }
  }, [initialDrillLaunch, onClearInitialDrillLaunch]);

  // Start a drill from card
  const handleStartDrill = async (drill: PracticeDrillItem) => {
    try {
      setLoading(true);
      const session = await learningHubService.getResourceQuestions(drill.id);
      if (session && session.questions.length > 0) {
        setRunnerTitle(session.title);
        setRunnerCategory(session.category);
        setRunnerQuestions(session.questions);
        setRunnerResourceId(drill.id);
        setIsRunnerOpen(true);
      } else {
        // Fallback default questions
        setRunnerTitle(drill.title);
        setRunnerCategory(drill.category);
        setRunnerResourceId(drill.id);
        setRunnerQuestions([
          {
            id: `${drill.id}_q1`,
            question: `In production environments, what is the core architectural advantage of ${drill.skills[0] || 'this pattern'}?`,
            codeSnippet: `// Benchmark evaluation\nfunction verifyArchitecture() {\n  return resolveOptimizedState();\n}`,
            options: [
              'It minimizes computational overhead and prevents thread starvation.',
              'It bypasses memory allocation completely.',
              'It compiles directly into assembly instructions.',
              'It converts HTTP requests into synchronous file locks.',
            ],
            correctOptionIndex: 0,
            explanation: `${drill.skills[0] || 'This architectural approach'} reduces CPU overhead and maintains non-blocking operations across concurrent event streams.`,
            difficulty: drill.difficulty,
          },
          {
            id: `${drill.id}_q2`,
            question: `Which configuration mitigates unexpected bottlenecks when scaling ${drill.skills[1] || drill.skills[0] || 'these services'}?`,
            options: [
              'Implementing connection pooling with exponential backoff.',
              'Disabling keep-alive connections globally.',
              'Increasing database timeouts to infinity.',
              'Removing indexing on foreign keys.',
            ],
            correctOptionIndex: 0,
            explanation: 'Connection pooling prevents resource exhaustion under load while exponential backoff manages transient failures safely.',
            difficulty: drill.difficulty,
          },
        ]);
        setIsRunnerOpen(true);
      }
    } catch (err) {
      console.error('Failed to start drill:', err);
    } finally {
      setLoading(false);
    }
  };

  // Submit drill answers
  const handleSubmitQuiz = async (
    selectedAnswers: Record<string, number>,
    timeSpentSeconds: number
  ) => {
    setIsSubmittingQuiz(true);
    try {
      let result = await learningHubService.submitQuiz(runnerResourceId, {
        selectedAnswers,
        timeSpentSeconds,
      });

      if (!result) {
        // Fallback deterministic grading
        const total = runnerQuestions.length;
        const correctCount = runnerQuestions.filter(
          (q) => selectedAnswers[q.id] === q.correctOptionIndex
        ).length;
        const score = Math.round((correctCount / total) * 100);

        result = {
          resourceId: runnerResourceId,
          resourceTitle: runnerTitle,
          score,
          passingScore: 70,
          passed: score >= 70,
          totalQuestions: total,
          correctAnswersCount: correctCount,
          timeSpentSeconds,
          attemptedAt: new Date().toISOString(),
          results: runnerQuestions.map((q) => ({
            questionId: q.id,
            question: q.question,
            codeSnippet: q.codeSnippet,
            selectedOptionIndex: selectedAnswers[q.id] ?? -1,
            correctOptionIndex: q.correctOptionIndex,
            isCorrect: selectedAnswers[q.id] === q.correctOptionIndex,
            explanation: q.explanation,
          })),
        };
      }

      setQuizResult(result);
      setIsRunnerOpen(false);
      setIsResultOpen(true);
      // Refresh drill cards to show updated scores
      fetchDrills();
    } catch (err) {
      console.error('Failed to submit quiz:', err);
    } finally {
      setIsSubmittingQuiz(false);
    }
  };

  // Generate Blitz on demand via Gemini
  const handleGenerateBlitz = async (payload: {
    skill: string;
    category: string;
    difficulty: string;
  }) => {
    setIsGenerating(true);
    try {
      const blitz = await learningHubService.generateBlitz(payload);
      if (blitz && blitz.questions.length > 0) {
        setIsGenerateOpen(false);
        setRunnerTitle(blitz.title);
        setRunnerCategory(payload.category);
        setRunnerQuestions(blitz.questions);
        setRunnerResourceId(blitz.drillId);
        setIsRunnerOpen(true);
        fetchDrills();
      }
    } catch (err) {
      console.error('Failed to generate blitz:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const categories = ['All', 'Frontend', 'Backend', 'Database', 'DevOps', 'System Design'];

  return (
    <div className="space-y-6">
      {/* Hero Banner with Stats & AI Trigger */}
      <div className="relative rounded-3xl p-6 md:p-8 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 text-white overflow-hidden shadow-lg">
        {/* Glow backdrop */}
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-[#3D5AFE]/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#3D5AFE]/30 text-[#8C9EFF] border border-[#3D5AFE]/40 uppercase tracking-wider flex items-center gap-1">
                <Zap className="w-3 h-3 text-[#3D5AFE]" />
                Interactive Arena
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Instant Syntax Evaluation & Gemini Rationales
              </span>
            </div>

            <h2 className="text-xl md:text-2xl font-bold tracking-tight">
              Rapid-Fire Technical Practice Drills
            </h2>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
              Test your engineering intuition on focused 5-question code blitzes. Score ≥70% to prove
              competency and earn verified credentials for your candidate profile.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <button
              onClick={() => setIsGenerateOpen(true)}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl text-xs font-bold bg-white text-slate-900 hover:bg-slate-100 transition-all flex items-center justify-center gap-2 shadow-md hover:scale-[1.02]"
            >
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>Generate AI Code Blitz</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Chips & Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Category Chips */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                category === cat
                  ? 'bg-[#3D5AFE] text-white shadow-sm shadow-[#3D5AFE]/25'
                  : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search drills, topics, skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#3D5AFE] transition-colors placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Drill Cards Grid */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 mx-auto border-2 border-[#3D5AFE] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500">Loading practice drills...</p>
        </div>
      ) : drills.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center max-w-md mx-auto space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            No Drills Match Filters
          </h3>
          <p className="text-xs text-slate-500">
            Try adjusting your search terms or generate a custom AI blitz for your target skill.
          </p>
          <button
            onClick={() => {
              setCategory('All');
              setSearchQuery('');
            }}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#3D5AFE] text-white hover:bg-[#324bdf] transition-colors"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {drills.map((drill) => (
            <DrillCard key={drill.id} drill={drill} onStart={handleStartDrill} />
          ))}
        </div>
      )}

      {/* Quiz Runner Modal */}
      <QuizRunnerModal
        isOpen={isRunnerOpen}
        title={runnerTitle}
        category={runnerCategory}
        questions={runnerQuestions}
        onClose={() => setIsRunnerOpen(false)}
        onSubmit={handleSubmitQuiz}
        isSubmitting={isSubmittingQuiz}
      />

      {/* Quiz Result Modal */}
      <QuizResultModal
        isOpen={isResultOpen}
        result={quizResult}
        onClose={() => {
          setIsResultOpen(false);
          setQuizResult(null);
        }}
        onRetake={() => {
          setIsResultOpen(false);
          setIsRunnerOpen(true);
        }}
        onGoToVerification={onGoToVerification}
      />

      {/* Generate AI Blitz Modal */}
      <GenerateBlitzModal
        isOpen={isGenerateOpen}
        onClose={() => setIsGenerateOpen(false)}
        onGenerate={handleGenerateBlitz}
        isLoading={isGenerating}
      />
    </div>
  );
}
