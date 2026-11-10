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

export type GeneratedQuestionItem = z.infer<typeof GeneratedQuestionItemSchema>;
export type GeneratedQuestionPlan = z.infer<typeof GeneratedQuestionPlanSchema>;

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
          `[InterviewAIService] Gemini call failed or quota limited. Falling back to deterministic pack.`,
          err
        );
      }
    }

    // Graceful offline/quota fallback
    return this.generateFallbackQuestions(input);
  }

  private async callGeminiQuestionGenerator(
    input: GenerateInterviewQuestionsInput
  ): Promise<GeneratedQuestionPlan | null> {
    const competenciesHint =
      input.competencyAreas && input.competencyAreas.length > 0
        ? `Focus primarily on these key competencies:\n${input.competencyAreas
            .map((c) => `- ${c}`)
            .join("\n")}`
        : "";

    const resumeContext =
      input.resumeSkills && input.resumeSkills.length > 0
        ? `Candidate's declared resume skills to calibrate against:\n${input.resumeSkills
            .slice(0, 15)
            .join(", ")}`
        : "";

    const prompt = `
Generate a structured, professional mock interview question plan for the following candidate profile:
- Role: ${input.role}
- Seniority Tier: ${input.experienceLevel}
- Interview Type: ${input.interviewType} (e.g. technical, hr, behavioral, managerial)
- Difficulty Level: ${input.difficulty}
- Total Questions: ${input.totalQuestions}
- Allocated Duration: ${input.durationMinutes} minutes

${competenciesHint}
${resumeContext}

Requirements:
1. Generate EXACTLY ${input.totalQuestions} distinct questions.
2. Calibrate depth strictly for a ${input.experienceLevel} level candidate.
3. For ${input.interviewType} format:
   - If technical: Focus on architectural reasoning, core engineering fundamentals, real-world edge cases, and runtime trade-offs.
   - If behavioral: Frame questions using the STAR methodology (Situation, Task, Action, Result).
   - If HR: Focus on collaboration, culture, professional goals, and conflict resolution.
   - If managerial: Focus on team leadership, resource allocation, technical debt trade-offs, and delivery execution.
4. Each question must list 2 to 5 "expectedConcepts" (key concepts, patterns, or terminology a strong answer should demonstrate).

Respond strictly in valid JSON matching this schema:
{
  "role": "${input.role}",
  "seniority": "${input.experienceLevel}",
  "questions": [
    {
      "sequence": 1,
      "questionText": "...",
      "category": "...",
      "difficulty": "${input.difficulty}",
      "questionType": "${input.interviewType}",
      "expectedConcepts": ["concept1", "concept2", "concept3"]
    }
  ]
}
`.trim();

    const systemInstruction =
      "You are an expert enterprise technical interviewer and talent evaluator at SKILLEZO.AI. Generate strict JSON question plans with high technical signal and zero markdown fluff.";

    const rawResponse = await this.geminiProvider.generateStructured<any>(
      prompt,
      "InterviewQuestionPlan",
      {
        temperature: 0.3,
        systemInstruction,
        maxOutputTokens: 2048,
      }
    );

    if (!rawResponse) return null;

    const parsed = GeneratedQuestionPlanSchema.safeParse(rawResponse);
    if (!parsed.success) {
      console.warn(
        "[InterviewAIService] Schema validation error on Gemini response:",
        parsed.error.format()
      );
      return null;
    }

    return parsed.data;
  }

  /**
   * Deterministic, high-signal fallback question generator for offline/quota resiliency
   */
  public generateFallbackQuestions(
    input: GenerateInterviewQuestionsInput
  ): GeneratedQuestionItem[] {
    const matchingBlueprint = INITIAL_ROLE_CATALOG.find(
      (b) => b.role.toLowerCase() === input.role.toLowerCase()
    );

    const competencies =
      matchingBlueprint?.competencyAreas ||
      input.competencyAreas || [
        "Core Architecture & Foundations",
        "Performance Tuning & Optimization",
        "Error Handling & Resiliency",
        "Data Integrity & Concurrency",
        "Testing & CI/CD Deployment",
      ];

    const questions: GeneratedQuestionItem[] = [];
    const count = Math.max(1, input.totalQuestions);

    for (let i = 0; i < count; i++) {
      const competency = competencies[i % competencies.length];
      const sequence = i + 1;

      let questionText = "";
      let expectedConcepts: string[] = [];

      if (input.interviewType === InterviewType.BEHAVIORAL) {
        questionText = `Describe a complex challenge involving ${competency} that you encountered in a previous project. What was the situation, what specific actions did you take, and what measurable result did you achieve?`;
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

