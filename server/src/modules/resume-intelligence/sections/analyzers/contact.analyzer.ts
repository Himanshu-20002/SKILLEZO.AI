import { ResumeContact, ResumeEvidence } from "../../document/resume-document.types";
import { ContactSectionAnalysis, ContactSignals, SectionStatus } from "../section.types";

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export class ContactAnalyzer {
  analyze(contact?: ResumeContact | null, evidenceLedger: ResumeEvidence[] = []): ContactSectionAnalysis {
    const evidenceIds: string[] = [];
    const missing: string[] = [];
    const warnings: string[] = [];
    const strengths: string[] = [];
    const weaknesses: string[] = [];

    // Check evidence IDs for links & contact
    for (const ev of evidenceLedger) {
      if (ev.type === "LINK" || ev.sectionId === "contact") {
        evidenceIds.push(ev.id);
      }
    }

    if (!contact) {
      return {
        sectionId: "contact",
        title: "Contact Information",
        status: "MISSING",
        completeness: 0,
        itemCount: 0,
        strengths: [],
        weaknesses: ["Contact information is completely missing."],
        missing: ["contact.fullName", "contact.email", "contact.phone", "contact.location", "contact.links"],
        warnings: ["No contact information provided."],
        evidenceIds: [],
        signals: {
          hasFullName: false,
          hasEmail: false,
          hasValidEmail: false,
          hasPhone: false,
          hasLocation: false,
          hasLinkedIn: false,
          hasGitHub: false,
          hasPortfolio: false,
          hasTwitter: false,
          hasProfessionalLinks: false,
          linksCount: 0,
          duplicateLinksCount: 0,
          isMinimal: true,
        },
      };
    }

    const fullName = (contact.fullName || "").trim();
    const email = (contact.email || "").trim();
    const phone = (contact.phone || "").trim();
    const location = (contact.location || "").trim();
    const links = Array.isArray(contact.links) ? contact.links : [];

    const hasFullName = fullName.length >= 2 && fullName.toLowerCase() !== "candidate";
    const hasValidEmail = EMAIL_REGEX.test(email) && email.toLowerCase() !== "candidate@example.com";
    const hasEmail = Boolean(email);
    const hasPhone = phone.length >= 7;
    const hasLocation = location.length >= 2;

    // Analyze links
    const seenUrls = new Set<string>();
    let duplicateLinksCount = 0;
    let hasLinkedIn = false;
    let hasGitHub = false;
    let hasPortfolio = false;
    let hasTwitter = false;

    for (const link of links) {
      if (!link || !link.url) continue;
      const lowerUrl = link.url.trim().toLowerCase();
      if (seenUrls.has(lowerUrl)) {
        duplicateLinksCount++;
        warnings.push(`Duplicate link detected: ${link.url}`);
      } else {
        seenUrls.add(lowerUrl);
      }

      if (link.label === "LinkedIn" || /linkedin\.com/i.test(link.url)) hasLinkedIn = true;
      if (link.label === "GitHub" || /github\.com/i.test(link.url)) hasGitHub = true;
      if (link.label === "Portfolio" || link.label === "Website") hasPortfolio = true;
      if (link.label === "Twitter" || /twitter\.com|x\.com/i.test(link.url)) hasTwitter = true;

      // Validate URL syntax
      try {
        new URL(link.url);
      } catch {
        warnings.push(`Invalid URL format: ${link.url}`);
      }
    }

    const linksCount = links.length;
    const hasProfessionalLinks = linksCount > 0;

    // Check missing fields
    if (!hasFullName) missing.push("contact.fullName");
    if (!hasValidEmail) missing.push("contact.email");
    if (!hasPhone) missing.push("contact.phone");
    if (!hasLocation) missing.push("contact.location");
    if (!hasProfessionalLinks) missing.push("contact.links");

    // Check invalid data
    if (email && !EMAIL_REGEX.test(email)) {
      warnings.push(`Invalid email format: ${email}`);
    }

    // Derive strengths
    if (hasFullName && hasValidEmail) {
      strengths.push("Candidate name and verified email address present.");
    }
    if (hasPhone && hasLocation) {
      strengths.push("Direct phone number and geographic location provided.");
    }
    if (hasLinkedIn && hasGitHub) {
      strengths.push("Professional LinkedIn and GitHub profiles linked.");
    } else if (hasProfessionalLinks) {
      strengths.push(`${linksCount} professional web link(s) provided.`);
    }

    // Derive weaknesses
    if (!hasPhone) {
      weaknesses.push("Phone number is not provided for recruiter contact.");
    }
    if (!hasLocation) {
      weaknesses.push("Location / residence region is not specified.");
    }
    if (!hasLinkedIn && !hasGitHub && !hasPortfolio) {
      weaknesses.push("No professional links (LinkedIn, GitHub, or Portfolio) provided.");
    }

    // Completeness calculation (weighted checklist: Name=25%, Email=25%, Phone=15%, Loc=15%, Links=20%)
    let completeness = 0;
    if (hasFullName) completeness += 0.25;
    if (hasValidEmail) completeness += 0.25;
    if (hasPhone) completeness += 0.15;
    if (hasLocation) completeness += 0.15;
    if (hasProfessionalLinks) completeness += 0.20;

    completeness = Math.min(1.0, Math.max(0.0, Number(completeness.toFixed(2))));

    // Determine status
    let status: SectionStatus = "PARTIAL";
    if (completeness >= 0.9 && warnings.length === 0) {
      status = "COMPLETE";
    } else if (!hasFullName && !hasEmail) {
      status = "MISSING";
    } else if (email && !EMAIL_REGEX.test(email)) {
      status = "INVALID";
    }

    const signals: ContactSignals = {
      hasFullName,
      hasEmail,
      hasValidEmail,
      hasPhone,
      hasLocation,
      hasLinkedIn,
      hasGitHub,
      hasPortfolio,
      hasTwitter,
      hasProfessionalLinks,
      linksCount,
      duplicateLinksCount,
      isMinimal: !hasPhone && !hasLocation && linksCount === 0,
    };

    return {
      sectionId: "contact",
      title: "Contact Information",
      status,
      completeness,
      itemCount: 1 + linksCount,
      strengths,
      weaknesses,
      missing,
      warnings,
      evidenceIds: Array.from(new Set(evidenceIds)),
      signals,
    };
  }
}

export const contactAnalyzer = new ContactAnalyzer();
