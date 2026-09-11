import { ContactSectionAnalysis } from "../../sections/section.types";
import { SectionScore, ScoreComponent, RESUME_STUDIO_SECTION_WEIGHTS, getScoreRatingTier } from "../scoring.types";

export class ContactScorer {
  score(analysis?: ContactSectionAnalysis | null): SectionScore {
    const sectionId = "contact";
    const title = "Contact Information";
    const weight = RESUME_STUDIO_SECTION_WEIGHTS.contact; // 0.05
    const evidenceIds = analysis?.evidenceIds || [];

    if (!analysis || analysis.status === "MISSING") {
      return {
        sectionId,
        title,
        score: 0,
        maxScore: 100,
        weight,
        weightedScore: 0,
        status: "MISSING",
        tier: "Needs Work",
        components: [
          {
            id: "contact.identity",
            label: "Candidate Identity",
            score: 0,
            maxScore: 30,
            weight: 0.30,
            rule: "Name (+15) and Valid Email (+15)",
            reason: "Contact identity information is completely missing.",
            evidenceIds: [],
          },
          {
            id: "contact.reachability",
            label: "Reachability & Location",
            score: 0,
            maxScore: 30,
            weight: 0.30,
            rule: "Phone (+20) and Location (+10)",
            reason: "Phone number and location details are missing.",
            evidenceIds: [],
          },
          {
            id: "contact.professional_presence",
            label: "Professional Presence",
            score: 0,
            maxScore: 25,
            weight: 0.25,
            rule: "LinkedIn/GitHub/Portfolio (+15 for 1, +25 for >=2)",
            reason: "No professional portfolio or profile links provided.",
            evidenceIds: [],
          },
          {
            id: "contact.link_cleanliness",
            label: "Link Quality & Cleanliness",
            score: 0,
            maxScore: 15,
            weight: 0.15,
            rule: "Zero duplicate links (+15), zero invalid URLs",
            reason: "No links to evaluate.",
            evidenceIds: [],
          },
        ],
        strengths: [],
        weaknesses: ["Contact details are completely missing from the resume."],
        deductions: ["Missing name, email, phone, and professional links (-100 pts)"],
        evidenceIds: [],
      };
    }

    const { signals } = analysis;
    const components: ScoreComponent[] = [];
    const deductions: string[] = [];
    const strengths: string[] = [...(analysis.strengths || [])];
    const weaknesses: string[] = [...(analysis.weaknesses || [])];

    // 1. Identity Component (Max 30)
    let identityScore = 0;
    if (signals.hasFullName) identityScore += 15;
    else deductions.push("Missing full candidate name (-15 pts)");

    if (signals.hasValidEmail) identityScore += 15;
    else if (signals.hasEmail) {
      identityScore += 8;
      deductions.push("Email address does not adhere to standard RFC format (-7 pts)");
    } else {
      deductions.push("Missing contact email address (-15 pts)");
    }

    components.push({
      id: "contact.identity",
      label: "Candidate Identity",
      score: identityScore,
      maxScore: 30,
      weight: 0.30,
      rule: "Full Name (+15) and Valid RFC 5322 Email (+15)",
      reason: signals.hasFullName && signals.hasValidEmail
        ? "Full name and valid email address confirmed."
        : "Incomplete candidate identification.",
      evidenceIds,
    });

    // 2. Reachability Component (Max 30)
    let reachabilityScore = 0;
    if (signals.hasPhone) reachabilityScore += 20;
    else deductions.push("Missing phone number (-20 pts)");

    if (signals.hasLocation) reachabilityScore += 10;
    else deductions.push("Missing geographic location / city (-10 pts)");

    components.push({
      id: "contact.reachability",
      label: "Reachability & Location",
      score: reachabilityScore,
      maxScore: 30,
      weight: 0.30,
      rule: "Phone number (+20) and Location (+10)",
      reason: signals.hasPhone && signals.hasLocation
        ? "Phone number and location are properly specified."
        : signals.hasPhone
        ? "Phone is present, but geographic location is missing."
        : "Reachability details are incomplete.",
      evidenceIds,
    });

    // 3. Professional Presence Component (Max 25)
    let presenceScore = 0;
    const proLinksCount = [signals.hasLinkedIn, signals.hasGitHub, signals.hasPortfolio, signals.hasTwitter]
      .filter(Boolean).length;

    if (proLinksCount >= 2) presenceScore = 25;
    else if (proLinksCount === 1) presenceScore = 15;
    else deductions.push("No professional links (LinkedIn, GitHub, Portfolio) provided (-25 pts)");

    components.push({
      id: "contact.professional_presence",
      label: "Professional Presence",
      score: presenceScore,
      maxScore: 25,
      weight: 0.25,
      rule: "LinkedIn/GitHub/Portfolio (+15 for 1 link, +25 for >=2 links)",
      reason: proLinksCount >= 2
        ? `${proLinksCount} professional profile links included.`
        : proLinksCount === 1
        ? "1 professional link provided (adding GitHub/Portfolio recommended)."
        : "No professional links found.",
      evidenceIds,
    });

    // 4. Link Quality & Cleanliness (Max 15)
    let cleanlinessScore = 15;
    if (signals.duplicateLinksCount > 0) {
      cleanlinessScore = Math.max(0, cleanlinessScore - (signals.duplicateLinksCount * 8));
      deductions.push(`Duplicate URLs detected in contact links (-${signals.duplicateLinksCount * 8} pts)`);
    }

    components.push({
      id: "contact.link_cleanliness",
      label: "Link Quality & Cleanliness",
      score: cleanlinessScore,
      maxScore: 15,
      weight: 0.15,
      rule: "Zero duplicate links (+15), -8 per duplicate link",
      reason: signals.duplicateLinksCount === 0
        ? "All contact links are clean and unique."
        : `${signals.duplicateLinksCount} duplicate contact links detected.`,
      evidenceIds,
    });

    // Sum total section score
    const rawScore = components.reduce((acc, c) => acc + c.score, 0);
    const score = Math.min(100, Math.max(0, Math.round(rawScore)));
    const weightedScore = Number((score * weight).toFixed(2));
    const tier = getScoreRatingTier(score);

    return {
      sectionId,
      title,
      score,
      maxScore: 100,
      weight,
      weightedScore,
      status: analysis.status,
      tier,
      components,
      strengths,
      weaknesses,
      deductions,
      evidenceIds,
    };
  }
}

export const contactScorer = new ContactScorer();
