'use client';

import React from 'react';
import { ResumeDocument } from '@/types/resume-document';
import { ResumeBuilderConfig } from '@/types/resume-builder.types';

/**
 * Downloads the candidate's resume as a high-fidelity vector PDF.
 * Uses @react-pdf/renderer to create a real, selectable-text ATS-compliant PDF.
 */
export async function exportResumeToPdf(
  document: ResumeDocument,
  config?: ResumeBuilderConfig | null,
  customFilename?: string
): Promise<void> {
  if (typeof window === 'undefined') {
    throw new Error('PDF export can only be run in browser context.');
  }

  // Dynamically import @react-pdf/renderer and ResumePdfDocument to isolate client bundle
  const [{ pdf }, { ResumePdfDocument }] = await Promise.all([
    import('@react-pdf/renderer'),
    import('@/components/resume-studio/pdf/ResumePdfDocument'),
  ]);

  // Construct PDF Document element
  const docElement = React.createElement(ResumePdfDocument, {
    document,
    config,
  });

  // Generate binary PDF Blob
  const blob = await pdf(docElement as any).toBlob();

  // Determine clean candidate filename
  const cleanName = (document.contact?.fullName || 'Candidate')
    .trim()
    .replace(/[^a-zA-Z0-9_\- ]/g, '')
    .replace(/\s+/g, '_');
  const filename = customFilename || `${cleanName}_Resume.pdf`;

  // Trigger native browser download
  const url = URL.createObjectURL(blob);
  const link = window.document.createElement('a');
  link.href = url;
  link.download = filename;
  window.document.body.appendChild(link);
  link.click();

  // Cleanup DOM and memory
  setTimeout(() => {
    window.document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 300);
}

/**
 * Opens the high-fidelity vector PDF in a new browser tab for immediate viewing.
 * Uses the existing @react-pdf/renderer and ResumePdfDocument component.
 */
export async function previewResumePdf(
  document: ResumeDocument,
  config?: ResumeBuilderConfig | null
): Promise<void> {
  if (typeof window === 'undefined') {
    throw new Error('PDF preview can only be run in browser context.');
  }

  const [{ pdf }, { ResumePdfDocument }] = await Promise.all([
    import('@react-pdf/renderer'),
    import('@/components/resume-studio/pdf/ResumePdfDocument'),
  ]);

  const docElement = React.createElement(ResumePdfDocument, {
    document,
    config,
  });

  const blob = await pdf(docElement as any).toBlob();
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 60000);
}

/**
 * Constructs a canonical ResumeDocument from application candidate data if an AST snapshot is absent.
 */
export function createCandidateResumeDocument(params: {
  candidateName?: string;
  email?: string;
  phone?: string;
  location?: string;
  headline?: string;
  bio?: string;
  skills?: string[];
}): ResumeDocument {
  const name = params.candidateName || 'Candidate';
  const email = params.email || 'candidate@example.com';
  const headline = params.headline || 'Full Stack Engineer';
  const skillsList =
    params.skills && params.skills.length > 0
      ? params.skills
      : ['React', 'TypeScript', 'Node.js', 'System Architecture'];

  return {
    id: `doc_${Date.now()}`,
    userId: 'usr_candidate',
    title: `${name} — Professional Resume`,
    contact: {
      fullName: name,
      email,
      phone: params.phone || '',
      location: params.location || 'India',
      links: [],
    },
    summary: {
      text: params.bio || `Candidate applying for ${headline}. Verified credentials on SKILLEZO AI Career OS.`,
      targetRole: headline,
      yearsOfExperience: 3,
    },
    skills: skillsList.map((skill, idx) => ({
      id: `sk_${idx}`,
      name: skill,
      category: 'OTHER',
      proficiency: 'ADVANCED',
      evidenceIds: [],
    })),
    experience: [],
    projects: [],
    education: [],
    achievements: [],
    evidence: [],
    templateConfig: {
      templateId: 'classic',
      fontFamily: 'Inter',
      fontSize: 'regular',
      margins: 'normal',
    },
    currentVersion: {
      versionId: 'v1',
      versionNumber: 1,
      name: 'Initial Submission',
      createdAt: new Date().toISOString(),
    },
    schemaVersion: '1.0.0',
    isMaster: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
