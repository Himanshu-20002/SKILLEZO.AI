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
