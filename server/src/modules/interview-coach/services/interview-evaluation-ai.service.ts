import { z } from "zod";
import { GeminiProvider } from "@/core/ai/providers/gemini.provider";
import { InterviewType, InterviewDifficulty } from "../domain/interview.enums";

export const SingleAnswerEvaluationSchema = z.object({
  scores: z.object({
    technicalAccuracy: z.number().min(0).max(100),
    problemSolvingDepth: z.number().min(0).max(100),
    answerStructure: z.number().min(0).max(100),
    conceptCoverage: z.number().min(0).max(100),
    communicationTone: z.number().min(0).max(100),
  }),
  evidence: z.array(z.string()).min(1),
  strengths: z.array(z.string()).min(1),
  improvementAreas: z.array(z.string()).min(1),
  keyConceptsIdentified: z.array(z.string()).default([]),
  modelAnswerSuggestion: z.string().min(10),
});

export type SingleAnswerEvaluation = z.infer<typeof SingleAnswerEvaluationSchema>;

export interface EvaluateAnswerInput {
  role: string;
  experienceLevel: string;
  interviewType: InterviewType;
  difficulty: InterviewDifficulty;
  questionText: string;
  category: string;
  expectedConcepts?: string[];
  candidateAnswerText: string;
  responseDurationSeconds?: number;
}

export class InterviewEvaluationAIService {
  private readonly geminiProvider: GeminiProvider;

  constructor(geminiProvider?: GeminiProvider) {
    this.geminiProvider = geminiProvider || new GeminiProvider();
  }

  /**
   * Evaluates a single candidate answer against the 5-dimension rubric using Gemini
   * with automatic fallback to deterministic heuristic analysis if unavailable.
   */
  async evaluateAnswer(input: EvaluateAnswerInput): Promise<SingleAnswerEvaluation> {
    if (this.geminiProvider.isAvailable()) {
      try {
        const evaluation = await this.callGeminiEvaluator(input);
        if (evaluation) {
          return evaluation;
        }
      } catch (err) {
        console.warn(
          "[InterviewEvaluationAIService] Gemini evaluation call failed, falling back to heuristic engine:",
          err
        );
      }
    }

    // Deterministic heuristic fallback evaluator
    return this.evaluateHeuristically(input);
  }

  /**
   * Direct LLM evaluation via Gemini with strict structured output
   */
  private async callGeminiEvaluator(
    input: EvaluateAnswerInput
  ): Promise<SingleAnswerEvaluation | null> {
    const prompt = this.buildEvaluationPrompt(input);

    const rawResponse = await this.geminiProvider.generateText(prompt, {
      temperature: 0.2,
      maxOutputTokens: 1500,
    });

    const parsed = this.safeParseJson(rawResponse || "");
    if (!parsed) return null;

    const validated = SingleAnswerEvaluationSchema.safeParse(parsed);
    if (!validated.success) {
      console.warn(
        "[InterviewEvaluationAIService] Zod validation failed for Gemini evaluation output:",
        validated.error.format()
      );
      return null;
    }

    return validated.data;
  }

  /**
   * Safe JSON parse supporting markdown code fences
   */
  private safeParseJson(raw: string): any {
    try {
      let cleaned = raw.trim();
      if (cleaned.startsWith("```")) {
        cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
      }
      return JSON.parse(cleaned);
    } catch {
      return null;
    }
  }

  /**
   * Structured prompt for v1.0.0 scoring rubric
   */
  private buildEvaluationPrompt(input: EvaluateAnswerInput): string {
    const expectedList =
      input.expectedConcepts && input.expectedConcepts.length > 0
        ? input.expectedConcepts.join(", ")
        : input.category;

    return `You are a calibrated, objective technical hiring evaluator and interview coach at SKILLEZO.
Evaluate the candidate's response to the interview question below with strict adherence to evidence and rubric guidelines.

Context:
- Target Role: ${input.role} (${input.experienceLevel} tier)
- Interview Format: ${input.interviewType} (Difficulty: ${input.difficulty})
- Category: ${input.category}

Question:
"${input.questionText}"

Expected Discussion Areas / Concepts:
${expectedList}

Candidate's Answer:
"${input.candidateAnswerText}"

Evaluation Guidelines:
1. Technical Accuracy (0-100): Are the technical facts, tools, APIs, and concepts correct?
2. Problem Solving Depth (0-100): Does the candidate explore trade-offs, scalability, edge cases, and reasoning?
3. Answer Structure (0-100): Is the response logically structured, cohesive, and easy to follow?
4. Concept Coverage (0-100): How thoroughly did the candidate address the expected discussion areas?
5. Communication Tone (0-100): Is the tone articulate, professional, concise, and free of filler/rambling?
6. Evidence: Quote or summarize exact parts of their response that justify the scores.
7. Strengths: Provide 1 to 3 specific positive technical or behavioral elements.
8. Improvement Areas: Provide 1 to 3 concrete technical corrections or gaps to address.
9. Model Answer Suggestion: Provide a concise (2-4 sentence) benchmark answer demonstrating senior-level mastery.

Output STRICTLY JSON conforming to this schema:
{
  "scores": {
    "technicalAccuracy": 85,
    "problemSolvingDepth": 75,
    "answerStructure": 80,
    "conceptCoverage": 80,
    "communicationTone": 85
  },
  "evidence": ["Direct evidence point 1", "Direct evidence point 2"],
  "strengths": ["Strength 1", "Strength 2"],
  "improvementAreas": ["Actionable improvement 1", "Actionable improvement 2"],
  "keyConceptsIdentified": ["Concept1", "Concept2"],
  "modelAnswerSuggestion": "A comprehensive model answer..."
}`;
  }

  /**
   * Deterministic heuristic fallback evaluator guaranteeing 100% uptime
   * Calculates scores based on expected concept keyword matches, word count, and structure.
   */
  evaluateHeuristically(input: EvaluateAnswerInput): SingleAnswerEvaluation {
    const answer = input.candidateAnswerText.trim();
    const words = answer.split(/\s+/).filter(Boolean);
    const wordCount = words.length;

    // 1. Concept keyword matching
    const expected = input.expectedConcepts || [input.category];
    const lowerAnswer = answer.toLowerCase();
    const matchedConcepts = expected.filter((c) =>
      lowerAnswer.includes(c.toLowerCase())
    );
    const matchRatio = expected.length > 0 ? matchedConcepts.length / expected.length : 0.5;

    // 2. Length & depth heuristic
    let depthScore = 50;
    if (wordCount >= 100) depthScore = 80;
    else if (wordCount >= 50) depthScore = 70;
    else if (wordCount >= 25) depthScore = 60;
    else depthScore = 40;

    // 3. Technical accuracy heuristic
    const accuracyScore = Math.min(100, Math.round(50 + matchRatio * 40 + (wordCount > 40 ? 10 : 0)));

    // 4. Structure heuristic (check for punctuation, bulleting, or multi-sentences)
    const sentenceCount = (answer.match(/[.!?]+/g) || []).length;
    const structureScore = Math.min(100, Math.max(45, sentenceCount >= 3 ? 78 : sentenceCount >= 2 ? 68 : 55));

    // 5. Concept coverage score
    const coverageScore = Math.min(100, Math.round(45 + matchRatio * 50));

    // 6. Communication tone
    const commScore = wordCount >= 30 && wordCount <= 250 ? 80 : 70;

    return {
      scores: {
        technicalAccuracy: accuracyScore,
        problemSolvingDepth: depthScore,
        answerStructure: structureScore,
        conceptCoverage: coverageScore,
        communicationTone: commScore,
      },
      evidence: [
        `Candidate provided a ${wordCount}-word response addressing ${input.category}.`,
        matchedConcepts.length > 0
          ? `Referenced relevant concepts: ${matchedConcepts.join(", ")}.`
          : `Did not explicitly mention primary expected keywords (${expected.slice(0, 3).join(", ")}).`,
      ],
      strengths: [
        `Clear introductory focus on ${input.category}.`,
        wordCount >= 40
          ? "Good explanation length with practical context."
          : "Direct and straightforward answer.",
      ],
      improvementAreas: [
        matchedConcepts.length < expected.length
          ? `Explicitly discuss architectural trade-offs related to: ${expected.filter((c) => !matchedConcepts.includes(c)).slice(0, 2).join(", ")}.`
          : "Elaborate further on concrete production failure scenarios.",
        "Structure responses with problem context followed by measurable implementation decisions.",
      ],
      keyConceptsIdentified: matchedConcepts,
      modelAnswerSuggestion: `In a production ${input.role} environment, best practices for ${input.category} require balancing trade-offs between system complexity and throughput. Implementing robust error handling and monitoring ensures high availability under scale.`,
    };
  }
}

export const interviewEvaluationAIService = new InterviewEvaluationAIService();

