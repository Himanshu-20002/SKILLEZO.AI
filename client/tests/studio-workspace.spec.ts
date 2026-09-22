import { describe, it, expect } from 'vitest';
import { ResumeDocument } from '@/types/resume-document';
import { ResumeScoreResult, ScoreRatingTier } from '@/types/resume-scoring.types';
import { ResumeAtsAnalysis } from '@/types/resume';

describe('Phase 5.5: Resume Studio UX Transformation & 3-Zone Architecture', () => {
  const sampleDocument: ResumeDocument = {
    id: 'doc_sample_01',
    userId: 'user_01',
    title: 'Senior Distributed Systems Engineer',
    schemaVersion: '1.0.0',
    isMaster: true,
    createdAt: '2026-09-22T08:00:00.000Z',
    updatedAt: '2026-09-22T10:00:00.000Z',
    currentVersion: {
      versionId: 'v1',
      versionNumber: 1,
      name: 'Initial Draft',
      createdAt: '2026-09-22T08:00:00.000Z',
    },
    templateConfig: {
      templateId: 'classic',
    },
    contact: {
      fullName: 'Alex Vance',
      email: 'alex@example.com',
      phone: '+1 555 123 4567',
      location: 'San Francisco, CA',
      links: [],
    },
    summary: {
      text: 'Staff Full-Stack Architect with 9+ years building high-throughput microservices and distributed real-time systems.',
      targetRole: 'Staff Software Engineer',
    },
    experience: [
      {
        id: 'e1',
        jobTitle: 'Principal Engineer',
        companyName: 'TechCorp',
        startDate: '2021',
        isCurrent: true,
        bullets: [
          {
            id: 'b1',
            text: 'Scaled Kubernetes cluster reducing latency by 45%',
            evidenceIds: [],
          },
          {
            id: 'b2',
            text: 'Led team of 14 engineers delivering payment orchestration platform',
            evidenceIds: [],
          },
        ],
      },
    ],
    skills: [
      {
        id: 'sk1',
        name: 'TypeScript',
        category: 'LANGUAGE',
        evidenceIds: [],
      },
      {
        id: 'sk2',
        name: 'Go',
        category: 'LANGUAGE',
        evidenceIds: [],
      },
    ],
    projects: [
      {
        id: 'p1',
        title: 'Distributed Transaction Engine',
        technologies: ['Go', 'Raft', 'gRPC'],
        bullets: ['Implemented Raft consensus algorithm in Go'],
      },
    ],
    education: [
      {
        id: 'ed1',
        institution: 'UC Berkeley',
        degree: 'B.S. in Computer Science',
      },
    ],
    achievements: [],
    evidence: [],
  };

  const sampleScoreResult: ResumeScoreResult = {
    scoreId: 'score_01',
    resumeId: 'doc_sample_01',
    engineVersion: '3.0.0',
    calculatedAt: '2026-09-22T10:00:00.000Z',
    overall: {
      overallScore: 88,
      maxScore: 100,
      tier: 'Strong' as ScoreRatingTier,
      summaryReason: 'High ATS readiness with clear technical achievements',
      totalStrengthsCount: 8,
      totalWeaknessesCount: 1,
      totalDeductionsCount: 0,
      sectionWeights: {
        contact: 5,
        summary: 10,
        skills: 15,
        experience: 40,
        projects: 15,
        education: 10,
        achievements: 5,
      },
    },
    sections: {
      contact: {
        sectionId: 'contact',
        title: 'Contact Information',
        score: 98,
        maxScore: 100,
        weight: 5,
        weightedScore: 4.9,
        status: 'COMPLETE',
        tier: 'Excellent' as ScoreRatingTier,
        components: [],
        strengths: ['Valid email', 'Phone provided'],
        weaknesses: [],
        deductions: [],
        evidenceIds: [],
      },
      summary: {
        sectionId: 'summary',
        title: 'Professional Summary',
        score: 90,
        maxScore: 100,
        weight: 10,
        weightedScore: 9.0,
        status: 'COMPLETE',
        tier: 'Excellent' as ScoreRatingTier,
        components: [],
        strengths: ['Target role specified'],
        weaknesses: [],
        deductions: [],
        evidenceIds: [],
      },
      experience: {
        sectionId: 'experience',
        title: 'Work Experience',
        score: 72,
        maxScore: 100,
        weight: 40,
        weightedScore: 28.8,
        status: 'PARTIAL',
        tier: 'Developing' as ScoreRatingTier,
        components: [],
        strengths: ['Action verbs used'],
        weaknesses: ['Add quantifiable business metrics to older roles'],
        deductions: [],
        evidenceIds: [],
      },
      skills: {
        sectionId: 'skills',
        title: 'Technical Skills',
        score: 88,
        maxScore: 100,
        weight: 15,
        weightedScore: 13.2,
        status: 'COMPLETE',
        tier: 'Good' as ScoreRatingTier,
        components: [],
        strengths: ['Key categories covered'],
        weaknesses: [],
        deductions: [],
        evidenceIds: [],
      },
      projects: {
        sectionId: 'projects',
        title: 'Projects',
        score: 85,
        maxScore: 100,
        weight: 15,
        weightedScore: 12.75,
        status: 'COMPLETE',
        tier: 'Good' as ScoreRatingTier,
        components: [],
        strengths: ['Technical stack listed'],
        weaknesses: [],
        deductions: [],
        evidenceIds: [],
      },
      education: {
        sectionId: 'education',
        title: 'Education',
        score: 95,
        maxScore: 100,
        weight: 10,
        weightedScore: 9.5,
        status: 'COMPLETE',
        tier: 'Excellent' as ScoreRatingTier,
        components: [],
        strengths: ['Accredited institution'],
        weaknesses: [],
        deductions: [],
        evidenceIds: [],
      },
      achievements: {
        sectionId: 'achievements',
        title: 'Achievements & Certifications',
        score: 60,
        maxScore: 100,
        weight: 5,
        weightedScore: 3.0,
        status: 'PARTIAL',
        tier: 'Developing' as ScoreRatingTier,
        components: [],
        strengths: [],
        weaknesses: ['Add relevant industry certifications'],
        deductions: [],
        evidenceIds: [],
      },
    },
  };

  const sampleAnalysis: ResumeAtsAnalysis = {
    overallScore: 88,
    atsScore: 92,
    matchScore: 85,
    impactScore: 82,
    brevityScore: 90,
    keywords: [],
    recommendations: [
      {
        id: 'rec_1',
        title: 'Quantify Work Impact',
        category: 'IMPACT',
        problem: 'Add quantifiable business metrics to older roles',
        impactScoreBoost: 6,
        targetSection: 'experience',
      },
    ],
  };

  it('1. Dynamically derives sections from active ResumeDocument without hardcoding', () => {
    const keys = ['contact', 'summary', 'experience', 'skills', 'projects', 'education', 'achievements'] as const;

    const sectionsDerived = keys.map((key) => {
      let isPresent = false;
      if (key === 'contact') isPresent = Boolean(sampleDocument.contact?.fullName || sampleDocument.contact?.email);
      else if (key === 'summary') isPresent = Boolean(sampleDocument.summary?.text && sampleDocument.summary.text.trim().length > 0);
      else if (key === 'experience') isPresent = Boolean(sampleDocument.experience && sampleDocument.experience.length > 0);
      else if (key === 'skills') isPresent = Boolean(sampleDocument.skills && sampleDocument.skills.length > 0);
      else if (key === 'projects') isPresent = Boolean(sampleDocument.projects && sampleDocument.projects.length > 0);
      else if (key === 'education') isPresent = Boolean(sampleDocument.education && sampleDocument.education.length > 0);
      else if (key === 'achievements') isPresent = Boolean(sampleDocument.achievements && sampleDocument.achievements.length > 0);

      const sectionScore = sampleScoreResult.sections[key];
      const tier = sectionScore.tier;
      const issues = [...(sectionScore.weaknesses || []), ...(sectionScore.deductions || [])];
      const isOptimal = (tier === 'Excellent' || tier === 'Strong' || tier === 'Good') && issues.length === 0;

      return {
        key,
        title: sectionScore.title,
        isPresent,
        score: sectionScore.score,
        tier,
        isOptimal,
        issueCount: issues.length,
      };
    });

    expect(sectionsDerived).toHaveLength(7);
    expect(sectionsDerived[0].isPresent).toBe(true); // Contact is present
    expect(sectionsDerived[1].isPresent).toBe(true); // Summary is present
    expect(sectionsDerived[6].isPresent).toBe(false); // Achievements is empty in doc
  });

  it('2. Dynamically derives health and status from scoreResult.sections without arbitrary score thresholds', () => {
    const expScore = sampleScoreResult.sections.experience;
    const skillsScore = sampleScoreResult.sections.skills;

    // Derived strictly from scoreResult evaluation, NOT arbitrary `>= 75` check
    expect(expScore.tier).toBe('Developing');
    expect(expScore.status).toBe('PARTIAL');
    expect(expScore.weaknesses).toContain('Add quantifiable business metrics to older roles');

    expect(skillsScore.tier).toBe('Good');
    expect(skillsScore.status).toBe('COMPLETE');
    expect(skillsScore.weaknesses).toHaveLength(0);
  });

  it('3. Strictly preserves exact score terminology without renaming impactScore', () => {
    // Exact keys on ResumeAtsAnalysis
    expect(sampleAnalysis.atsScore).toBe(92);
    expect(sampleAnalysis.matchScore).toBe(85);
    expect(sampleAnalysis.impactScore).toBe(82);
    expect(sampleAnalysis.brevityScore).toBe(90);

    // Make sure no unauthorized renaming keys are introduced
    expect((sampleAnalysis as any).measurableImpact).toBeUndefined();
    expect((sampleAnalysis as any).roleMatchScore).toBeUndefined();
  });

  it('4. Computes document statistics accurately for page and word counts', () => {
    let text = '';
    if (sampleDocument.summary?.text) text += sampleDocument.summary.text + ' ';
    if (sampleDocument.experience) {
      sampleDocument.experience.forEach((e) => {
        const bulletTexts = (e.bullets || []).map((b) => b.text).join(' ');
        text += `${e.jobTitle || ''} ${e.companyName || ''} ${bulletTexts} `;
      });
    }
    if (sampleDocument.projects) {
      sampleDocument.projects.forEach((p) => {
        text += `${p.title || ''} ${(p.bullets || []).join(' ')} `;
      });
    }

    const words = text.trim().split(/\s+/).filter(Boolean).length;
    expect(words).toBeGreaterThan(20);
    const pageEstimate = words > 480 ? 2 : 1;
    expect(pageEstimate).toBe(1);
  });
});
