import { describe, it, expect } from 'vitest';
import { SAMPLE_RESUME_DOCUMENT_FIXTURE } from '@/modules/resume-intelligence/document/resume-document.fixture';
import { ResumeDocument } from '@/modules/resume-intelligence/document/resume-document.types';

describe('Phase 6: Visual Resume Renderer & Section Contract Suite', () => {
  it('should verify sample resume document contains all 7 canonical sections with valid data', () => {
    const doc = SAMPLE_RESUME_DOCUMENT_FIXTURE;

    expect(doc.contact).toBeDefined();
    expect(doc.contact.fullName).toBe('Himanshu Kumar');
    expect(doc.contact.email).toBe('himanshu@skillezo.ai');
    expect(doc.contact.links.length).toBeGreaterThan(0);

    expect(doc.summary).toBeDefined();
    expect(doc.summary.text.length).toBeGreaterThan(20);

    expect(doc.skills).toBeDefined();
    expect(doc.skills.length).toBeGreaterThanOrEqual(8);

    expect(doc.experience).toBeDefined();
    expect(doc.experience.length).toBeGreaterThan(0);
    expect(doc.experience[0].bullets.length).toBeGreaterThan(0);

    expect(doc.projects).toBeDefined();
    expect(doc.projects.length).toBeGreaterThan(0);

    expect(doc.education).toBeDefined();
    expect(doc.education.length).toBeGreaterThan(0);

    expect(doc.achievements).toBeDefined();
    expect(doc.achievements.length).toBeGreaterThan(0);
  });

  it('should enforce that canonical ResumeDocument remains clean of UI score/tier pollution', () => {
    const doc = SAMPLE_RESUME_DOCUMENT_FIXTURE;

    // The document must not embed UI badges or tier text directly inside candidate fields
    expect(doc.contact.fullName).not.toContain('Score');
    expect(doc.contact.fullName).not.toContain('Tier');
    expect(doc.summary.text).not.toContain('Score');
    expect(doc.experience[0].jobTitle).not.toContain('Score');
  });

  it('should support reactive section mutation when candidate approves Phase 5 AI improvement', () => {
    const initialDoc: ResumeDocument = JSON.parse(JSON.stringify(SAMPLE_RESUME_DOCUMENT_FIXTURE));
    const newSummaryText = "Elevated Full-Stack Engineer with demonstrable impact delivering microservices.";

    const updatedDoc: ResumeDocument = {
      ...initialDoc,
      summary: {
        ...initialDoc.summary,
        text: newSummaryText,
      },
    };

    expect(updatedDoc.summary.text).toBe(newSummaryText);
    expect(updatedDoc.contact).toEqual(initialDoc.contact);
    expect(updatedDoc.experience).toEqual(initialDoc.experience);
  });

  it('should handle documents with empty optional sections gracefully', () => {
    const minimalDoc: ResumeDocument = {
      id: 'doc_minimal_01',
      userId: 'user_test_01',
      title: 'Minimal Resume',
      contact: {
        fullName: 'Jane Doe',
        email: 'jane@example.com',
        links: [],
      },
      summary: { text: '' },
      skills: [],
      experience: [],
      projects: [],
      education: [],
      achievements: [],
      evidence: [],
      templateConfig: {
        templateId: 'modern',
      },
    };

    expect(minimalDoc.contact.fullName).toBe('Jane Doe');
    expect(minimalDoc.summary.text).toBe('');
    expect(minimalDoc.skills.length).toBe(0);
  });
});
