// @ts-ignore
import PDFDocument from "pdfkit";
import { IResume } from "@/database/models/Resume.model";

export class ResumePdfService {
  /**
   * Compiles a structured, professional, printable vector PDF from a Resume document in memory.
   */
  public static async generatePdfBuffer(resume: IResume): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          margin: 40,
          size: "A4",
          info: {
            Title: resume.title || resume.originalFileName || "Resume",
            Author: "SKILLEZO.AI Candidate",
            Creator: "SKILLEZO.AI Career Platform",
          },
        });

        const buffers: Buffer[] = [];
        doc.on("data", (chunk: Buffer) => buffers.push(chunk));
        doc.on("end", () => resolve(Buffer.concat(buffers)));
        doc.on("error", (err: any) => reject(err));

        const extracted = resume.extractedData || ({} as any);
        const resumeDoc = (resume as any).resumeDocument || ({} as any);

        const personalInfo =
          extracted.personalInfo ||
          resumeDoc.contact ||
          resumeDoc.personalInfo ||
          {};

        const fullName =
          personalInfo.fullName ||
          personalInfo.name ||
          resume.title ||
          "Candidate";

        const contactDetails: string[] = [
          personalInfo.email,
          personalInfo.phone,
          personalInfo.location,
          personalInfo.linkedin,
          personalInfo.github,
          personalInfo.portfolio,
        ].filter(Boolean);

        // Primary Header
        doc.fillColor("#0F172A").fontSize(22).font("Helvetica-Bold").text(fullName, {
          align: "center",
        });
        doc.moveDown(0.3);

        if (contactDetails.length > 0) {
          doc
            .fillColor("#475569")
            .fontSize(9)
            .font("Helvetica")
            .text(contactDetails.join("  |  "), { align: "center" });
          doc.moveDown(0.6);
        }

        // Target role badge if present
        const targetRole = resume.targetJobTitle || resumeDoc.targetRole;
        if (targetRole) {
          doc
            .fillColor("#3D5AFE")
            .fontSize(10)
            .font("Helvetica-Bold")
            .text(targetRole.toUpperCase(), { align: "center" });
          doc.moveDown(0.6);
        }

        // Horizontal Rule
        doc.strokeColor("#CBD5E1").lineWidth(1).moveTo(40, doc.y).lineTo(555, doc.y).stroke();
        doc.moveDown(1);

        const addSectionHeader = (title: string) => {
          doc.moveDown(0.6);
          doc
            .fillColor("#1E293B")
            .fontSize(12)
            .font("Helvetica-Bold")
            .text(title.toUpperCase());
          doc.strokeColor("#3D5AFE").lineWidth(1.5).moveTo(40, doc.y + 2).lineTo(120, doc.y + 2).stroke();
          doc.moveDown(0.6);
        };

        // Summary
        const summary =
          extracted.summary ||
          resumeDoc.summary ||
          (resume.rawText && resume.rawText.length > 50 && resume.rawText.length < 500
            ? resume.rawText
            : null);

        if (summary) {
          addSectionHeader("Professional Summary");
          doc.fillColor("#334155").fontSize(9.5).font("Helvetica").text(summary, {
            lineGap: 3,
            align: "justify",
          });
        }

        // Skills
        const skills: any[] = extracted.skills || resumeDoc.skills || [];
        if (skills.length > 0) {
          addSectionHeader("Technical Skills");
          const skillNames = skills.map((s) => (typeof s === "string" ? s : s.name)).filter(Boolean);
          doc.fillColor("#334155").fontSize(9.5).font("Helvetica").text(skillNames.join("  •  "), {
            lineGap: 3,
          });
        }

        // Experience
        const experience: any[] = extracted.experience || resumeDoc.experience || [];
        if (experience.length > 0) {
          addSectionHeader("Experience");
          for (const exp of experience) {
            const titleLine = [exp.jobTitle, exp.companyName].filter(Boolean).join("  —  ");
            doc.fillColor("#0F172A").fontSize(10.5).font("Helvetica-Bold").text(titleLine || "Software Engineer");

            if (exp.startDate || exp.endDate) {
              const start = exp.startDate ? new Date(exp.startDate).toLocaleDateString(undefined, { year: "numeric", month: "short" }) : "";
              const end = exp.isCurrent ? "Present" : exp.endDate ? new Date(exp.endDate).toLocaleDateString(undefined, { year: "numeric", month: "short" }) : "";
              const dateRange = [start, end].filter(Boolean).join(" - ");
              if (dateRange) {
                doc.fillColor("#64748B").fontSize(8.5).font("Helvetica").text(dateRange);
              }
            }

            if (exp.description) {
              doc.moveDown(0.2);
              doc.fillColor("#334155").fontSize(9).font("Helvetica").text(exp.description, { lineGap: 2 });
            }

            if (Array.isArray(exp.bullets) && exp.bullets.length > 0) {
              doc.moveDown(0.2);
              for (const b of exp.bullets) {
                doc.fillColor("#334155").fontSize(9).font("Helvetica").text(`•  ${b}`, { indent: 10, lineGap: 2 });
              }
            }
            doc.moveDown(0.6);
          }
        }

        // Projects
        const projects: any[] = extracted.projects || resumeDoc.projects || [];
        if (projects.length > 0) {
          addSectionHeader("Projects");
          for (const proj of projects) {
            doc.fillColor("#0F172A").fontSize(10.5).font("Helvetica-Bold").text(proj.title || "Technical Project");

            const techStack = proj.technologies || proj.techStack;
            if (Array.isArray(techStack) && techStack.length > 0) {
              doc.fillColor("#3D5AFE").fontSize(8.5).font("Helvetica-Bold").text(`Technologies: ${techStack.join(", ")}`);
            }

            if (proj.description) {
              doc.moveDown(0.2);
              doc.fillColor("#334155").fontSize(9).font("Helvetica").text(proj.description, { lineGap: 2 });
            }

            if (Array.isArray(proj.bullets) && proj.bullets.length > 0) {
              doc.moveDown(0.2);
              for (const b of proj.bullets) {
                doc.fillColor("#334155").fontSize(9).font("Helvetica").text(`•  ${b}`, { indent: 10, lineGap: 2 });
              }
            }

            const projectLink = proj.link || proj.liveDemoUrl || proj.githubUrl;
            if (projectLink) {
              doc.moveDown(0.2);
              doc.fillColor("#2563EB").fontSize(8.5).font("Helvetica").text(`Link: ${projectLink}`);
            }

            doc.moveDown(0.6);
          }
        }

        // Education
        const education: any[] = extracted.education || resumeDoc.education || [];
        if (education.length > 0) {
          addSectionHeader("Education");
          for (const edu of education) {
            const eduTitle = [edu.degree, edu.fieldOfStudy].filter(Boolean).join(" in ");
            doc.fillColor("#0F172A").fontSize(10).font("Helvetica-Bold").text(eduTitle || "Degree");
            if (edu.institution) {
              doc.fillColor("#475569").fontSize(9).font("Helvetica").text(edu.institution);
            }
            const years = [edu.startYear, edu.endYear].filter(Boolean).join(" - ");
            if (years) {
              doc.fillColor("#64748B").fontSize(8.5).font("Helvetica").text(years);
            }
            doc.moveDown(0.5);
          }
        }

        // Certifications
        const certs: any[] = extracted.certifications || resumeDoc.certifications || [];
        if (certs.length > 0) {
          addSectionHeader("Certifications");
          for (const cert of certs) {
            const certName = typeof cert === "string" ? cert : cert.name;
            const certIssuer = typeof cert === "object" ? cert.issuer : null;
            const certText = certIssuer ? `${certName} — ${certIssuer}` : certName;
            doc.fillColor("#334155").fontSize(9).font("Helvetica").text(`•  ${certText}`, { indent: 10 });
            doc.moveDown(0.3);
          }
        }

        // If no sections were present, fall back to rawText
        if (!summary && skills.length === 0 && experience.length === 0 && projects.length === 0 && resume.rawText) {
          addSectionHeader("Extracted Content");
          doc.fillColor("#334155").fontSize(9).font("Helvetica").text(resume.rawText, { lineGap: 3 });
        }

        // Footer
        doc.moveDown(1.5);
        doc.fillColor("#94A3B8").fontSize(7.5).font("Helvetica").text(
          "Verified by SKILLEZO.AI — Career Intelligence & Deterministic Evaluation Platform",
          { align: "center" }
        );

        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }
}
