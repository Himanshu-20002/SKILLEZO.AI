import { GeminiProvider } from "@/core/ai/providers/gemini.provider";
import { IQuizQuestion } from "@/database/models/LearningResource.model";
import { LearningDifficultyType } from "@/database/models/LearningTrack.model";

export interface GeneratedSkillDrillResult {
  lessonTitle: string;
  category: string;
  skills: string[];
  difficulty: LearningDifficultyType;
  estimatedMinutes: number;
  markdown: string;
  questions: IQuizQuestion[];
}

export class GeminiContentGenerator {
  private static geminiProvider = new GeminiProvider();

  /**
   * Extract high-signal technical multiple-choice questions from raw text using Gemini
   */
  public static async extractQuestionsFromPdfText(
    pdfText: string,
    topicHint: string = "Technical Engineering"
  ): Promise<IQuizQuestion[]> {
    // Truncate text to fit context window safely (~6000 chars of representative content)
    const truncatedText = pdfText.slice(0, 7000).trim();

    if (this.geminiProvider.isAvailable() && truncatedText.length > 50) {
      const prompt = `
You are an elite software engineering technical interviewer.
Analyze the following technical PDF document excerpt regarding "${topicHint}".
Extract exactly 5 accurate, high-signal technical multiple choice questions based on the content.

DOCUMENT EXCERPT:
\"\"\"
${truncatedText}
\"\"\"

RESPONSE JSON FORMAT:
Return a JSON array of question objects matching this exact schema:
[
  {
    "id": "q1",
    "question": "Clear, precise technical question",
    "codeSnippet": "// optional code snippet if relevant, otherwise omit",
    "options": ["Option A text", "Option B text", "Option C text", "Option D text"],
    "correctOptionIndex": 0, // 0, 1, 2, or 3
    "explanation": "2-sentence clear rationale explaining why this option is correct and why other options are incorrect.",
    "difficulty": "intermediate" // "beginner" | "intermediate" | "advanced"
  }
]
`;

      try {
        const result = await this.geminiProvider.generateStructured<IQuizQuestion[]>(
          prompt,
          "Technical Quiz Question Array",
          {
            temperature: 0.2,
            systemInstruction:
              "You are an expert technical interviewer. Return strictly valid JSON array of questions without markdown wrappers.",
          }
        );

        if (Array.isArray(result) && result.length > 0) {
          return result.map((q, idx) => ({
            id: q.id || `pdf_q_${Date.now()}_${idx + 1}`,
            question: q.question,
            codeSnippet: q.codeSnippet || undefined,
            options: Array.isArray(q.options) && q.options.length === 4 ? q.options : [
              "Option A",
              "Option B",
              "Option C",
              "Option D",
            ],
            correctOptionIndex: typeof q.correctOptionIndex === "number" && q.correctOptionIndex >= 0 && q.correctOptionIndex <= 3
              ? q.correctOptionIndex
              : 0,
            explanation: q.explanation || "Valid technical option based on official specifications.",
            difficulty: (["beginner", "intermediate", "advanced"].includes(q.difficulty)
              ? q.difficulty
              : "intermediate") as LearningDifficultyType,
          }));
        }
      } catch (err: any) {
        console.warn(`[GeminiContentGenerator] Extraction failed: ${err.message}. Falling back to deterministic bank.`);
      }
    }

    // Deterministic fallback question set
    return this.getFallbackQuestions(topicHint);
  }

  /**
   * On-demand generation of a targeted lesson + 5-question blitz for any given skill
   */
  public static async generateSkillDrill(
    skillName: string,
    category: string = "Technical",
    difficulty: LearningDifficultyType = "intermediate"
  ): Promise<GeneratedSkillDrillResult> {
    if (this.geminiProvider.isAvailable()) {
      const prompt = `
You are an expert senior engineering mentor at SKILLEZO.AI.
Create a comprehensive 10-minute micro-lesson and 5 interview-grade multiple-choice practice questions for:
Skill: "${skillName}"
Category: "${category}"
Target Level: "${difficulty}"

RESPONSE JSON FORMAT:
Return a JSON object matching this schema:
{
  "lessonTitle": "Deep Dive into ${skillName}: Architecture & Patterns",
  "category": "${category}",
  "skills": ["${skillName}"],
  "difficulty": "${difficulty}",
  "estimatedMinutes": 15,
  "markdown": "# Comprehensive Markdown tutorial with architectural explanation, best practices, and code snippets...",
  "questions": [
    {
      "id": "drill_q1",
      "question": "Technical question about ${skillName}",
      "codeSnippet": "// optional code snippet",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctOptionIndex": 0,
      "explanation": "Why Option A is correct",
      "difficulty": "${difficulty}"
    }
  ]
}
`;

      try {
        const result = await this.geminiProvider.generateStructured<GeneratedSkillDrillResult>(
          prompt,
          "Skill Drill and Lesson Object",
          {
            temperature: 0.25,
            systemInstruction: "You are an elite software engineering instructor. Return strictly valid JSON.",
          }
        );

        if (result && result.lessonTitle && Array.isArray(result.questions)) {
          return {
            ...result,
            difficulty,
            questions: result.questions.map((q, idx) => ({
              id: q.id || `drill_${Date.now()}_${idx + 1}`,
              question: q.question,
              codeSnippet: q.codeSnippet || undefined,
              options: Array.isArray(q.options) && q.options.length === 4 ? q.options : [
                "Option A", "Option B", "Option C", "Option D"
              ],
              correctOptionIndex: typeof q.correctOptionIndex === "number" ? q.correctOptionIndex : 0,
              explanation: q.explanation || "Correct option.",
              difficulty,
            })),
          };
        }
      } catch (err: any) {
        console.warn(`[GeminiContentGenerator] Drill generation failed: ${err.message}. Using deterministic fallback.`);
      }
    }

    // Deterministic fallback drill
    return {
      lessonTitle: `Mastering ${skillName}: Production Engineering Guide`,
      category,
      skills: [skillName],
      difficulty,
      estimatedMinutes: 15,
      markdown: `# Mastering ${skillName}\n\nThis guide covers fundamental concepts, production patterns, and anti-patterns for **${skillName}**.\n\n### Key Principles\n- Maintain clean decoupling between layers.\n- Always validate inputs at system boundaries.\n- Profile memory and I/O bottlenecks in production environments.`,
      questions: this.getFallbackQuestions(skillName),
    };
  }

  /**
   * Deterministic high-signal fallback questions
   */
  private static getFallbackQuestions(topic: string): IQuizQuestion[] {
    return [
      {
        id: `fb_q1_${Date.now()}`,
        question: `What is the primary architectural advantage of utilizing ${topic} in production environments?`,
        options: [
          "It provides predictable scaling, type safety, and modular isolation of responsibilities.",
          "It completely removes the need for database indexing and caching.",
          "It guarantees zero CPU consumption on client browsers.",
          "It automatically compiles synchronous code into native machine assembly without a runtime."
        ],
        correctOptionIndex: 0,
        explanation: `${topic} improves predictability, testability, and clean separation of concerns in production services.`,
        difficulty: "intermediate",
      },
      {
        id: `fb_q2_${Date.now()}`,
        question: `When handling high concurrency in ${topic}, which defensive strategy prevents cascading failures?`,
        options: [
          "Circuit Breakers, rate limiters, and exponential backoff jitter.",
          "Removing all timeout constraints on upstream database drivers.",
          "Spawning unlimited worker processes on a single CPU core.",
          "Switching all asynchronous I/O operations to synchronous polling."
        ],
        correctOptionIndex: 0,
        explanation: "Circuit breakers and backoff jitter isolate failing downstream dependencies and avoid resource exhaustion.",
        difficulty: "advanced",
      },
      {
        id: `fb_q3_${Date.now()}`,
        question: `Which metrics best validate that a ${topic} service is performing within healthy SLA boundaries?`,
        options: [
          "p95 / p99 latency percentiles, error rate, and saturation (CPU/memory).",
          "Average lines of code added per pull request.",
          "Count of console.log statements executed per second.",
          "Total number of external dependencies installed in package manifest."
        ],
        correctOptionIndex: 0,
        explanation: "Golden signals (latency, traffic, errors, saturation) provide true real-time visibility into system health.",
        difficulty: "intermediate",
      },
    ];
  }
}
