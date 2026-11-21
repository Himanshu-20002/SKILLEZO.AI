// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  ReadinessScoreHero,
  CompetencyBreakdownCard,
  ExecutiveFeedbackCard,
  QuestionBreakdownAccordion,
  QuestionEvaluationItem,
} from '../components/dashboard/interview-coach/report';
import {
  InterviewSession,
  InterviewReport,
  InterviewQuestion,
  InterviewAnswer,
  InterviewEvaluation,
} from '../types/interview-coach';

// Mock Next.js router
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('Candidate Readiness Report & Evaluation Dashboard', () => {
  const mockSession: InterviewSession = {
    _id: 'sess-101',
    userId: 'user-001',
    role: 'React Developer',
    experienceLevel: 'senior',
    interviewType: 'technical',
    difficulty: 'medium',
    mode: 'voice',
    durationMinutes: 15,
    totalQuestions: 3,
    currentQuestionIndex: 3,
    status: 'completed',
    createdAt: '2026-11-14T10:00:00.000Z',
    updatedAt: '2026-11-14T10:15:00.000Z',
  };

  const mockReport: InterviewReport = {
    _id: 'report-202',
    sessionId: 'sess-101',
    userId: 'user-001',
    rubricVersion: '1.0',
    overallScore: 84,
    dimensionScores: {
      technicalAccuracy: 88,
      problemSolvingDepth: 82,
      answerStructure: 85,
      conceptCoverage: 80,
      communicationTone: 86,
    },
    readinessLevel: 'interview_ready',
    strengths: [
      'Accurate understanding of React 19 useTransition hook mechanics',
      'Clear trade-off analysis between client-side mutations and server actions',
    ],
    improvementAreas: [
      'Incorporate concrete latency metrics when discussing optimistic UI updates',
    ],
    recommendations: [
      'Practice explaining full-stack data flow with Next.js Server Components',
    ],
    generatedAt: '2026-11-14T10:15:30.000Z',
  };

  const mockQuestion: InterviewQuestion = {
    _id: 'q-1',
    sessionId: 'sess-101',
    sequence: 1,
    questionText: 'Explain the difference between useTransition and useState in React 19.',
    category: 'React 19 State',
    difficulty: 'medium',
    questionType: 'technical',
    expectedConcepts: ['non-blocking updates', 'isPending flag'],
  };

  const mockAnswer: InterviewAnswer = {
    _id: 'ans-1',
    sessionId: 'sess-101',
    questionId: 'q-1',
    userId: 'user-001',
    answerText: 'useTransition marks state updates as non-blocking transitions while useState updates are immediate.',
    submittedAt: '2026-11-14T10:05:00.000Z',
  };

  const mockEvaluation: InterviewEvaluation = {
    _id: 'eval-1',
    sessionId: 'sess-101',
    questionId: 'q-1',
    answerId: 'ans-1',
    userId: 'user-001',
    rubricVersion: '1.0',
    provider: 'gemini',
    aiModel: 'gemini-flash-lite-latest',
    promptVersion: '1.0',
    scores: {
      technicalAccuracy: 88,
      problemSolvingDepth: 80,
      answerStructure: 85,
      conceptCoverage: 82,
      communicationTone: 86,
    },
    evidence: ['non-blocking transitions'],
    strengths: ['Correct distinction between blocking and non-blocking renders'],
    improvementAreas: ['Explain how isPending integrates with Suspense boundaries'],
    modelAnswerSuggestion: 'In React 19, useTransition allows developers to mark state updates as non-urgent transitions...',
    evaluatedAt: '2026-11-14T10:15:20.000Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('1. ReadinessScoreHero (ReadinessScoreHero.tsx)', () => {
    it('renders overall score, readiness level, and role title', () => {
      render(
        <ReadinessScoreHero
          session={mockSession}
          report={mockReport}
          totalQuestions={3}
          totalAnswers={3}
        />
      );

      expect(screen.getByTestId('overall-score-number').textContent).toBe('84');
      expect(screen.getByTestId('readiness-level-badge').textContent).toContain('Interview Ready');
      expect(screen.getByText(/React Developer Interview Assessment/)).toBeDefined();
      expect(screen.getByText(/senior Tier/i)).toBeDefined();
    });

    it('renders Role Model badge correctly for 90+ score', () => {
      const topReport: InterviewReport = {
        ...mockReport,
        overallScore: 94,
        readinessLevel: 'role_model',
      };

      render(
        <ReadinessScoreHero
          session={mockSession}
          report={topReport}
        />
      );

      expect(screen.getByTestId('overall-score-number').textContent).toBe('94');
      expect(screen.getByTestId('readiness-level-badge').textContent).toContain('Role Model');
    });

    it('triggers window.print when print button is clicked', () => {
      const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});

      render(
        <ReadinessScoreHero
          session={mockSession}
          report={mockReport}
        />
      );

      const printBtn = screen.getByTestId('btn-print-report');
      fireEvent.click(printBtn);
      expect(printSpy).toHaveBeenCalledTimes(1);

      printSpy.mockRestore();
    });

    it('triggers practice again callback or navigation', () => {
      const onPractice = vi.fn();

      render(
        <ReadinessScoreHero
          session={mockSession}
          report={mockReport}
          onPracticeAgain={onPractice}
        />
      );

      const restartBtn = screen.getByTestId('btn-practice-again');
      fireEvent.click(restartBtn);
      expect(onPractice).toHaveBeenCalledTimes(1);
    });
  });

  describe('2. CompetencyBreakdownCard (CompetencyBreakdownCard.tsx)', () => {
    it('renders all 5 core competency dimensions with scores', () => {
      render(
        <CompetencyBreakdownCard
          scores={mockReport.dimensionScores}
          benchmarkScore={75}
        />
      );

      expect(screen.getByText('Technical Accuracy')).toBeDefined();
      expect(screen.getByTestId('score-technicalAccuracy').textContent).toBe('88%');

      expect(screen.getByText('Problem-Solving Depth')).toBeDefined();
      expect(screen.getByTestId('score-problemSolvingDepth').textContent).toBe('82%');

      expect(screen.getByText('Answer Structure')).toBeDefined();
      expect(screen.getByTestId('score-answerStructure').textContent).toBe('85%');

      expect(screen.getByText('Concept & Domain Coverage')).toBeDefined();
      expect(screen.getByTestId('score-conceptCoverage').textContent).toBe('80%');

      expect(screen.getByText('Communication & Fluency')).toBeDefined();
      expect(screen.getByTestId('score-communicationTone').textContent).toBe('86%');
    });
  });

  describe('3. ExecutiveFeedbackCard (ExecutiveFeedbackCard.tsx)', () => {
    it('renders demonstrated strengths and improvement recommendations', () => {
      render(
        <ExecutiveFeedbackCard
          strengths={mockReport.strengths}
          improvementAreas={mockReport.improvementAreas}
          recommendations={mockReport.recommendations}
        />
      );

      const strengthItems = screen.getAllByTestId('feedback-strength-item');
      expect(strengthItems.length).toBe(2);
      expect(strengthItems[0].textContent).toContain('React 19 useTransition');

      const improvementItems = screen.getAllByTestId('feedback-improvement-item');
      expect(improvementItems.length).toBe(1);
      expect(improvementItems[0].textContent).toContain('concrete latency metrics');

      expect(screen.getByText(/Practice explaining full-stack data flow/)).toBeDefined();
    });
  });

  describe('4. QuestionBreakdownAccordion (QuestionBreakdownAccordion.tsx)', () => {
    const mockItems: QuestionEvaluationItem[] = [
      {
        question: mockQuestion,
        answer: mockAnswer,
        evaluation: mockEvaluation,
      },
    ];

    it('renders question prompt, candidate response, and senior model answer', () => {
      render(<QuestionBreakdownAccordion items={mockItems} />);

      expect(screen.getByText('Question 1')).toBeDefined();
      expect(screen.getByText('React 19 State')).toBeDefined();
      expect(screen.getByTestId('candidate-answer-text-1').textContent).toContain('marks state updates as non-blocking');
      expect(screen.getByText(/Senior Engineer Model Answer/)).toBeDefined();
      expect(screen.getByTestId('model-answer-1').textContent).toContain('useTransition allows developers');
    });

    it('toggles expansion state when header is clicked', () => {
      render(<QuestionBreakdownAccordion items={mockItems} />);

      const toggleBtn = screen.getByTestId('btn-toggle-question-1');
      // Initially open
      expect(screen.getByTestId('candidate-answer-text-1')).toBeDefined();

      // Click to collapse
      fireEvent.click(toggleBtn);
      expect(screen.queryByTestId('candidate-answer-text-1')).toBeNull();

      // Click to expand again
      fireEvent.click(toggleBtn);
      expect(screen.getByTestId('candidate-answer-text-1')).toBeDefined();
    });

    it('expands all and collapses all items when top action buttons are clicked', () => {
      const multiItems: QuestionEvaluationItem[] = [
        mockItems[0],
        {
          question: {
            ...mockQuestion,
            _id: 'q-2',
            sequence: 2,
            questionText: 'What are React Server Components?',
          },
          answer: mockAnswer,
          evaluation: mockEvaluation,
        },
      ];

      render(<QuestionBreakdownAccordion items={multiItems} />);

      const expandAllBtn = screen.getByTestId('btn-expand-all');
      const collapseAllBtn = screen.getByTestId('btn-collapse-all');

      // Click Expand All
      fireEvent.click(expandAllBtn);
      expect(screen.getByTestId('candidate-answer-text-1')).toBeDefined();
      expect(screen.getByTestId('candidate-answer-text-2')).toBeDefined();

      // Click Collapse All
      fireEvent.click(collapseAllBtn);
      expect(screen.queryByTestId('candidate-answer-text-1')).toBeNull();
      expect(screen.queryByTestId('candidate-answer-text-2')).toBeNull();
    });

    it('renders empty state placeholder gracefully when items list is empty', () => {
      render(<QuestionBreakdownAccordion items={[]} />);

      expect(screen.getByText('No Questions Recorded for This Session')).toBeDefined();
      expect(screen.getByTestId('btn-expand-all')).toHaveProperty('disabled', true);
      expect(screen.getByTestId('btn-collapse-all')).toHaveProperty('disabled', true);
    });

    it('renders paywall overlay when candidate is on free tier (isPro = false)', () => {
      render(<QuestionBreakdownAccordion items={mockItems} isPro={false} />);

      expect(screen.getByTestId('paywall-teaser-1')).toBeDefined();
      expect(screen.getByText('Unlock Staff Engineer Model Answer')).toBeDefined();
      expect(screen.getByText(/Get 7-Day Sprint Pass \(₹199\)/)).toBeDefined();
      expect(screen.getByText(/PRO ONLY/)).toBeDefined();
    });

    it('does not render paywall overlay when candidate is on pro tier (isPro = true)', () => {
      render(<QuestionBreakdownAccordion items={mockItems} isPro={true} />);

      expect(screen.queryByTestId('paywall-teaser-1')).toBeNull();
      expect(screen.queryByText('Unlock Staff Engineer Model Answer')).toBeNull();
    });
  });
});
