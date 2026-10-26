import { Types } from "mongoose";
// @ts-ignore
import pdfParse from "pdf-parse/lib/pdf-parse.js";
// @ts-ignore
import PDFDocument from "pdfkit";
import { LearningResourceModel, ILearningResource, IQuizQuestion } from "@/database/models/LearningResource.model";
import { LearningDifficultyType } from "@/database/models/LearningTrack.model";
import { GeminiContentGenerator } from "./gemini-content.generator";

export interface PdfDocumentSummaryDTO {
  id: string;
  title: string;
  slug: string;
  category: string;
  skills: string[];
  difficulty: LearningDifficultyType;
  estimatedMinutes: number;
  pdfPageCount: number;
  provider: string;
  downloadAllowed: boolean;
  summary: string;
  hasExtractedQuiz: boolean;
  questionsCount: number;
  questions?: IQuizQuestion[];
}

export class PdfVaultService {
  /**
   * List all technical PDF documents and cheat-sheets
   */
  public static async listPdfs(
    category?: string,
    search?: string
  ): Promise<PdfDocumentSummaryDTO[]> {
    const filter: Record<string, any> = {
      type: "pdf_document",
      reviewStatus: "published",
    };

    if (category && category.toLowerCase() !== "all") {
      filter.category = new RegExp(`^${category}$`, "i");
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");
      filter.$or = [
        { title: searchRegex },
        { "content.markdown": searchRegex },
        { skills: searchRegex },
      ];
    }

    const resources = await LearningResourceModel.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    return resources.map((r) => {
      const questions = r.content?.questions || [];
      return {
        id: r._id.toString(),
        title: r.title,
        slug: r.slug,
        category: r.category,
        skills: r.skills,
        difficulty: r.difficulty,
        estimatedMinutes: r.estimatedMinutes,
        pdfPageCount: r.content?.pdfPageCount || 10,
        provider: r.content?.provider || "SKILLEZO Curated Vault",
        downloadAllowed: r.content?.downloadAllowed ?? true,
        summary: r.content?.markdown?.slice(0, 220) || "Technical question bank and interview preparation guide.",
        hasExtractedQuiz: questions.length > 0,
        questionsCount: questions.length,
      };
    });
  }

  /**
   * Get single PDF details
   */
  public static async getPdfById(id: string): Promise<PdfDocumentSummaryDTO> {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error("Invalid PDF resource ID");
    }

    const r = await LearningResourceModel.findOne({
      _id: new Types.ObjectId(id),
      type: "pdf_document",
    }).lean();

    if (!r) {
      throw new Error("PDF document not found");
    }

    const questions = r.content?.questions || [];

    return {
      id: r._id.toString(),
      title: r.title,
      slug: r.slug,
      category: r.category,
      skills: r.skills,
      difficulty: r.difficulty,
      estimatedMinutes: r.estimatedMinutes,
      pdfPageCount: r.content?.pdfPageCount || 10,
      provider: r.content?.provider || "SKILLEZO Curated Vault",
      downloadAllowed: r.content?.downloadAllowed ?? true,
      summary: r.content?.markdown || "",
      hasExtractedQuiz: questions.length > 0,
      questionsCount: questions.length,
      questions,
    };
  }

  /**
   * Generate an inline printable technical guide PDF binary for a resource
   */
  public static async generatePdfBinary(id: string): Promise<{ buffer: Buffer; filename: string }> {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error("Invalid PDF resource ID");
    }

    const r = await LearningResourceModel.findById(id).lean();
    if (!r || r.type !== "pdf_document") {
      throw new Error("PDF document not found");
    }

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50, size: "A4" });
      const buffers: Buffer[] = [];

      doc.on("data", (chunk: Buffer) => buffers.push(chunk));
      doc.on("end", () => {
        resolve({
          buffer: Buffer.concat(buffers),
          filename: `${r.slug || "skillezo-technical-guide"}.pdf`,
        });
      });
      doc.on("error", (err: any) => reject(err));

      // Header Banner
      doc.rect(0, 0, 595, 80).fill("#1E293B");
      doc.fillColor("#FFFFFF").fontSize(20).font("Helvetica-Bold").text("SKILLEZO LEARNING HUB", 50, 25);
      doc.fontSize(10).font("Helvetica").text("Curated Technical Interview Vault & Engineering Cheat-Sheets", 50, 50);

      // Title & Category
      doc.moveDown(4);
      doc.fillColor("#0F172A").fontSize(18).font("Helvetica-Bold").text(r.title);
      doc.moveDown(0.5);

      doc.fontSize(10).font("Helvetica-Bold").fillColor("#3D5AFE").text(`CATEGORY: ${r.category.toUpperCase()}   |   DIFFICULTY: ${r.difficulty.toUpperCase()}   |   PAGES: ${r.content?.pdfPageCount || 20}`);
      doc.moveDown(0.5);

      // Tested Skills
      if (r.skills && r.skills.length > 0) {
        doc.fontSize(10).font("Helvetica").fillColor("#475569").text(`Target Skills: ${r.skills.join(", ")}`);
        doc.moveDown(1);
      }

      // Divider
      doc.strokeColor("#E2E8F0").lineWidth(1).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(1.5);

      // Guide Summary / Overview
      doc.fontSize(13).font("Helvetica-Bold").fillColor("#0F172A").text("Technical Guide Overview & Syllabus");
      doc.moveDown(0.5);
      const summaryText = r.content?.markdown || "Comprehensive technical guide for senior software engineering interviews.";
      doc.fontSize(10).font("Helvetica").fillColor("#334155").text(summaryText, {
        align: "justify",
        lineGap: 4,
      });

      // Extracted Questions Section
      const questions = r.content?.questions || [];
      if (questions.length > 0) {
        doc.moveDown(1.5);
        doc.fontSize(13).font("Helvetica-Bold").fillColor("#0F172A").text(`Interactive Question Bank (${questions.length} Extracted Questions)`);
        doc.moveDown(0.5);

        questions.forEach((q, idx) => {
          doc.moveDown(0.8);
          doc.fontSize(11).font("Helvetica-Bold").fillColor("#1E293B").text(`Q${idx + 1}: ${q.question}`);
          
          if (q.codeSnippet) {
            doc.moveDown(0.3);
            doc.fontSize(9).font("Courier").fillColor("#0284C7").text(q.codeSnippet);
          }

          doc.moveDown(0.3);
          q.options.forEach((opt, optIdx) => {
            const isCorrect = optIdx === q.correctOptionIndex;
            const prefix = `${String.fromCharCode(65 + optIdx)}. `;
            doc.fontSize(9).font(isCorrect ? "Helvetica-Bold" : "Helvetica").fillColor(isCorrect ? "#15803D" : "#475569").text(`   ${prefix}${opt} ${isCorrect ? "✓ (Correct)" : ""}`);
          });

          doc.moveDown(0.3);
          doc.fontSize(8.5).font("Helvetica-Oblique").fillColor("#64748B").text(`   Rationale: ${q.explanation}`);
        });
      }

      // Footer
      doc.fontSize(8).fillColor("#94A3B8").text("Generated by SKILLEZO.AI — Elite Engineering Career Accelerator", 50, 780, {
        align: "center",
      });

      doc.end();
    });
  }

  /**
   * Convert a PDF resource into an interactive quiz via Gemini AI extraction
   */
  public static async convertToQuiz(id: string): Promise<{
    pdfTitle: string;
    questionsCount: number;
    questions: IQuizQuestion[];
  }> {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error("Invalid PDF resource ID");
    }

    const resource = await LearningResourceModel.findById(id);
    if (!resource || resource.type !== "pdf_document") {
      throw new Error("PDF document not found");
    }

    // 1. If questions already extracted, return cached questions
    if (resource.content?.questions && resource.content.questions.length > 0) {
      return {
        pdfTitle: resource.title,
        questionsCount: resource.content.questions.length,
        questions: resource.content.questions,
      };
    }

    // 2. Extract using Gemini based on summary/markdown text
    const textToAnalyze = resource.content?.markdown || resource.title;
    const extractedQuestions = await GeminiContentGenerator.extractQuestionsFromPdfText(
      textToAnalyze,
      resource.title
    );

    // 3. Save extracted questions back into the resource
    if (!resource.content) {
      resource.content = {};
    }
    resource.content.questions = extractedQuestions;
    await resource.save();

    return {
      pdfTitle: resource.title,
      questionsCount: extractedQuestions.length,
      questions: extractedQuestions,
    };
  }

  /**
   * Admin: Ingest and index new technical PDF document
   */
  public static async uploadAndIndexPdf(
    file: Express.Multer.File,
    data: {
      title: string;
      category: string;
      skills: string[];
      difficulty?: LearningDifficultyType;
    }
  ): Promise<PdfDocumentSummaryDTO> {
    if (!file || !file.buffer) {
      throw new Error("No PDF file buffer provided");
    }

    let parsedText = "";
    let pageCount = 1;

    try {
      const pdfData = await (pdfParse as any)(file.buffer);
      parsedText = pdfData.text || "";
      pageCount = pdfData.numpages || 1;
    } catch (parseErr: any) {
      console.warn("[PdfVaultService] pdf-parse warning:", parseErr.message);
      parsedText = `Technical PDF Document: ${data.title}`;
    }

    // Extract initial question bank using Gemini
    const questions = await GeminiContentGenerator.extractQuestionsFromPdfText(
      parsedText,
      data.title
    );

    const slug = `${data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-pdf-${Date.now().toString().slice(-4)}`;

    const newResource = await LearningResourceModel.create({
      title: data.title,
      slug,
      type: "pdf_document",
      category: data.category,
      skills: data.skills,
      difficulty: data.difficulty || "intermediate",
      estimatedMinutes: Math.max(15, pageCount * 2),
      content: {
        provider: "SKILLEZO Curated Vault",
        pdfKey: file.originalname,
        pdfPageCount: pageCount,
        downloadAllowed: true,
        markdown: parsedText.slice(0, 2000),
        questions,
      },
      source: "public_bank",
      reviewStatus: "published",
    });

    return {
      id: newResource._id.toString(),
      title: newResource.title,
      slug: newResource.slug,
      category: newResource.category,
      skills: newResource.skills,
      difficulty: newResource.difficulty,
      estimatedMinutes: newResource.estimatedMinutes,
      pdfPageCount: pageCount,
      provider: "SKILLEZO Curated Vault",
      downloadAllowed: true,
      summary: parsedText.slice(0, 220),
      hasExtractedQuiz: questions.length > 0,
      questionsCount: questions.length,
      questions,
    };
  }

  /**
   * Admin: Delete a PDF document from the vault
   */
  public static async deletePdf(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error("Invalid PDF resource ID");
    }
    const result = await LearningResourceModel.deleteOne({
      _id: new Types.ObjectId(id),
      type: "pdf_document",
    });
    return result.deletedCount > 0;
  }
}

