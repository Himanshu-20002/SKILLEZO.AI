import { z } from "zod";
import { GeminiProvider } from "@/core/ai/providers/gemini.provider";
import {
  InterviewDifficulty,
  InterviewType,
} from "../domain/interview.enums";
import { INITIAL_ROLE_CATALOG } from "./interview-template.service";

export const GeneratedQuestionItemSchema = z.object({
  sequence: z.number().int().positive(),
  questionText: z.string().min(10),
  category: z.string().min(2),
  difficulty: z.nativeEnum(InterviewDifficulty),
  questionType: z.nativeEnum(InterviewType),
  expectedConcepts: z.array(z.string()).min(1),
});

export const GeneratedQuestionPlanSchema = z.object({
  role: z.string(),
  seniority: z.string(),
  questions: z.array(GeneratedQuestionItemSchema).min(1),
});

export const GeneratedFollowUpSchema = z.object({
  followUpQuestionText: z.string().min(10),
  category: z.string().min(2),
  expectedConcepts: z.array(z.string()).min(1),
});

export type GeneratedQuestionItem = z.infer<typeof GeneratedQuestionItemSchema>;
export type GeneratedQuestionPlan = z.infer<typeof GeneratedQuestionPlanSchema>;
export type GeneratedFollowUp = z.infer<typeof GeneratedFollowUpSchema>;

export interface GenerateInterviewQuestionsInput {
  role: string;
  experienceLevel: string;
  interviewType: InterviewType;
  difficulty: InterviewDifficulty;
  totalQuestions: number;
  durationMinutes: number;
  resumeSkills?: string[];
  competencyAreas?: string[];
}

export interface GenerateFollowUpInput {
  role: string;
  experienceLevel: string;
  interviewType: InterviewType;
  difficulty: InterviewDifficulty;
  questionText: string;
  category: string;
  candidateAnswerText: string;
  expectedConcepts?: string[];
}

export class InterviewAIService {
  private readonly geminiProvider: GeminiProvider;

  constructor(geminiProvider?: GeminiProvider) {
    this.geminiProvider = geminiProvider || new GeminiProvider();
  }

  /**
   * Generates a structured, role-calibrated interview question plan
   */
  async generateQuestionPlan(
    input: GenerateInterviewQuestionsInput
  ): Promise<GeneratedQuestionItem[]> {
    if (this.geminiProvider.isAvailable()) {
      try {
        const plan = await this.callGeminiQuestionGenerator(input);
        if (plan && plan.questions && plan.questions.length > 0) {
          // Normalise sequences 1..N
          return plan.questions.map((q, idx) => ({
            ...q,
            sequence: idx + 1,
            difficulty: input.difficulty,
            questionType: input.interviewType,
          }));
        }
      } catch (err) {
        console.warn(
          "[InterviewAIService] Gemini question generation failed, falling back to deterministic bank:",
          err
        );
      }
    }

    return this.generateFallbackQuestions(input);
  }

  /**
   * Generates an adaptive probe follow-up question when candidate answer needs deeper elaboration
   */
  async generateFollowUpQuestion(
    input: GenerateFollowUpInput
  ): Promise<GeneratedFollowUp> {
    if (this.geminiProvider.isAvailable()) {
      try {
        const prompt = `You are an expert technical interviewer interviewing a candidate for a ${input.experienceLevel} ${input.role} position.
The interview format is ${input.interviewType} (Difficulty: ${input.difficulty}).

Original Question:
"${input.questionText}"

Expected Concepts:
${(input.expectedConcepts || []).join(", ") || input.category}

Candidate's Answer:
"${input.candidateAnswerText}"

Task:
Generate a concise, insightful follow-up question (1 to 2 sentences) that asks the candidate to dive deeper into practical technical implementation, architectural trade-offs, edge cases, or specific metrics.

Respond STRICTLY with valid JSON conforming to this schema:
{
  "followUpQuestionText": "string (15-200 chars)",
  "category": "${input.category}",
  "expectedConcepts": ["concept1", "concept2"]
}`;

        const rawResponse = await this.geminiProvider.generateText(prompt, {
          temperature: 0.4,
          maxOutputTokens: 500,
        });

        const parsed = this.safeParseJson(rawResponse || "");
        const validated = GeneratedFollowUpSchema.safeParse(parsed);
        if (validated.success) {
          return validated.data;
        }
      } catch (err) {
        console.warn("[InterviewAIService] Gemini follow-up generation failed, using fallback:", err);
      }
    }

    // Deterministic fallback follow-up
    return {
      followUpQuestionText: `Can you walk through how you would handle performance bottlenecks, edge cases, or error recovery in your proposed approach to ${input.category}?`,
      category: input.category,
      expectedConcepts: ["Edge Case Handling", "Performance Optimization", "Failure Recovery"],
    };
  }

  /**
   * Direct Gemini LLM caller with strict JSON prompt structure
   */
  private async callGeminiQuestionGenerator(
    input: GenerateInterviewQuestionsInput
  ): Promise<GeneratedQuestionPlan | null> {
    const prompt = this.buildPrompt(input);
    const rawResponse = await this.geminiProvider.generateText(prompt, {
      temperature: 0.3,
      maxOutputTokens: 2500,
    });

    const parsed = this.safeParseJson(rawResponse || "");
    if (!parsed) return null;

    const validated = GeneratedQuestionPlanSchema.safeParse(parsed);
    if (!validated.success) {
      console.warn(
        "[InterviewAIService] Zod validation failed for Gemini question plan:",
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
   * Builds prompt v1.0.0
   */
  private buildPrompt(input: GenerateInterviewQuestionsInput): string {
    const competenciesList =
      input.competencyAreas && input.competencyAreas.length > 0
        ? input.competencyAreas.join(", ")
        : "Core fundamentals, Problem-solving, Best practices, Scalability";

    const resumeContext =
      input.resumeSkills && input.resumeSkills.length > 0
        ? `Candidate's declared resume skills: ${input.resumeSkills.slice(0, 10).join(", ")}.`
        : "";

    return `You are a world-class technical hiring manager and interview coach at SKILLEZO.
Generate exactly ${input.totalQuestions} calibrated mock interview questions for the following candidate profile:

- Target Role: ${input.role}
- Experience Tier: ${input.experienceLevel}
- Interview Format: ${input.interviewType} (e.g. technical, behavioral, hr, managerial)
- Difficulty Level: ${input.difficulty}
- Target Session Duration: ${input.durationMinutes} minutes
- Target Competencies: ${competenciesList}
${resumeContext}

Requirements:
1. Generate realistic, challenging, and relevant questions for a ${input.experienceLevel} ${input.role}.
2. Ensure progressive difficulty throughout the interview (earlier questions establish baseline, later test depth).
3. For each question, supply 2 to 5 specific expected concepts/keywords an expert candidate should mention.
4. Output STRICTLY JSON matching this schema:
{
  "role": "${input.role}",
  "seniority": "${input.experienceLevel}",
  "questions": [
    {
      "sequence": 1,
      "questionText": "Question text here...",
      "category": "Topic Name",
      "difficulty": "${input.difficulty}",
      "questionType": "${input.interviewType}",
      "expectedConcepts": ["concept1", "concept2", "concept3"]
    }
  ]
}`;
  }

  /**
   * Deterministic fallback generator guaranteeing zero-downtime
   */
  generateFallbackQuestions(
    input: GenerateInterviewQuestionsInput
  ): GeneratedQuestionItem[] {
    const catalogItem = INITIAL_ROLE_CATALOG.find(
      (c) => c.role.toLowerCase() === input.role.toLowerCase()
    );

    const competencies =
      input.competencyAreas && input.competencyAreas.length > 0
        ? input.competencyAreas
        : catalogItem?.competencyAreas || [
            "Architecture & System Design",
            "Performance Optimization",
            "Error Handling & Resiliency",
            "Security & Best Practices",
            "Testing & Observability",
          ];

    const questions: GeneratedQuestionItem[] = [];

    for (let i = 0; i < input.totalQuestions; i++) {
      const sequence = i + 1;
      const competency = competencies[i % competencies.length];

      let questionText = "";
      let expectedConcepts: string[] = [];

      if (input.interviewType === InterviewType.BEHAVIORAL) {
        questionText = `Describe a complex challenge you faced when implementing ${competency}. What was your strategy and measurable outcome?`;
        expectedConcepts = [
          "Situation Context",
          "Ownership & Action",
          "Measurable Impact",
          "Lessons Learned",
        ];
      } else if (input.interviewType === InterviewType.HR) {
        questionText = `When collaborating with team members on ${competency}, how do you handle conflicting technical opinions or shifting deadline pressures?`;
        expectedConcepts = [
          "Cross-functional Collaboration",
          "Constructive Communication",
          "Prioritization",
          "Conflict Resolution",
        ];
      } else if (input.interviewType === InterviewType.MANAGERIAL) {
        questionText = `As a technical leader overseeing ${competency}, how do you balance shipping fast product features against refactoring critical technical debt?`;
        expectedConcepts = [
          "Engineering Velocity",
          "Risk Assessment",
          "Technical Debt Management",
          "Stakeholder Alignment",
        ];
      } else {
        // Technical default
        questionText = `In a production ${input.role} environment, how do you architect and troubleshoot ${competency} under high scale and concurrent traffic?`;
        expectedConcepts = [
          competency,
          "Scalability & Throughput",
          "Fault Tolerance",
          "Trade-off Analysis",
        ];
      }

      questions.push({
        sequence,
        questionText,
        category: competency,
        difficulty: input.difficulty,
        questionType: input.interviewType,
        expectedConcepts,
      });
    }

    return questions;
  }
}

export const interviewAIService = new InterviewAIService();
