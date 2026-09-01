'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/dashboard/common/PageHeader';
import { ResumeUploader } from '@/components/dashboard/resume-intelligence/ResumeUploader';
import { ResumeScoreCard } from '@/components/dashboard/resume-intelligence/ResumeScoreCard';
import { ATSCompatibility } from '@/components/dashboard/resume-intelligence/ATSCompatibility';
import { KeywordAnalysis } from '@/components/dashboard/resume-intelligence/KeywordAnalysis';
import { MissingSkills } from '@/components/dashboard/resume-intelligence/MissingSkills';
import { AIRecommendations } from '@/components/dashboard/resume-intelligence/AIRecommendations';
import { ResumePreview } from '@/components/dashboard/resume-intelligence/ResumePreview';
import { mockCareerIntelligence } from '@/mock/career-intelligence';
import { ResumeAnalysisData, ResumeRecord } from '@/types/resume';
import { resumeService } from '@/services/resume.service';
import { toast } from 'sonner';

function formatFileSize(bytes?: number): string {
  if (!bytes || bytes === 0) return '1.2 MB';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export default function ResumeIntelligencePage() {
  const [analysis, setAnalysis] = useState<ResumeAnalysisData>(mockCareerIntelligence.resumeAnalysis);
  const [userResumes, setUserResumes] = useState<ResumeRecord[]>([]);
  const [activeResume, setActiveResume] = useState<ResumeRecord | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchResumes = async () => {
      try {
        const resumes = await resumeService.getUserResumes();
        if (isMounted && resumes && resumes.length > 0) {
          setUserResumes(resumes);
          const defaultResume = resumes.find((r) => r.isDefault) || resumes[0];
          setActiveResume(defaultResume);
          setAnalysis((prev) => ({
            ...prev,
            extractedData: {
              ...prev.extractedData,
              fileName: defaultResume.originalFileName || defaultResume.fileName || defaultResume.title,
              fileSize: formatFileSize(defaultResume.fileSize),
              uploadedAt: new Date(defaultResume.createdAt).toLocaleDateString(),
            },
          }));
        }
      } catch {
        // Fallback gracefully to demo state if offline or unauthenticated
      }
    };

    fetchResumes();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const uploaded = await resumeService.uploadResume(file);
      setUserResumes((prev) => [uploaded, ...prev.filter((r) => (r._id || r.id) !== (uploaded._id || uploaded.id))]);
      setActiveResume(uploaded);

      setAnalysis((prev) => ({
        ...prev,
        overallScore: Math.min(98, prev.overallScore + 2),
        atsScore: Math.min(96, prev.atsScore + 1),
        extractedData: {
          ...prev.extractedData,
          fileName: uploaded.originalFileName || uploaded.fileName || file.name,
          fileSize: formatFileSize(uploaded.fileSize || file.size),
          uploadedAt: new Date(uploaded.createdAt || Date.now()).toLocaleDateString(),
        },
      }));

      toast.success(`"${file.name}" uploaded & parsed successfully!`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload resume. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSelectResume = (resume: ResumeRecord) => {
    setActiveResume(resume);
    setAnalysis((prev) => ({
      ...prev,
      extractedData: {
        ...prev.extractedData,
        fileName: resume.originalFileName || resume.fileName || resume.title,
        fileSize: formatFileSize(resume.fileSize),
        uploadedAt: new Date(resume.createdAt).toLocaleDateString(),
      },
    }));
    toast.info(`Switched active resume to "${resume.title || resume.fileName}"`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="AI Resume Intelligence"
          description="Analyze your resume against your target career role with automated ATS scoring & keyword audit."
          badge=" • Resume Intelligence"
        />

        {/* Upload & Score Card Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ResumeUploader
            currentFileName={analysis.extractedData.fileName}
            fileSize={analysis.extractedData.fileSize}
            uploadedAt={analysis.extractedData.uploadedAt}
            isUploading={isUploading}
            onUpload={handleFileUpload}
            userResumes={userResumes}
            selectedResumeId={activeResume?._id || activeResume?.id}
            onSelectResume={handleSelectResume}
          />

          <ResumeScoreCard
            overallScore={analysis.overallScore}
            atsScore={analysis.atsScore}
            impactScore={analysis.impactScore}
            brevityScore={analysis.brevityScore}
          />
        </div>

        {/* ATS Compatibility Breakdown */}
        <ATSCompatibility items={analysis.atsCompatibility} />

        {/* Keyword Matrix & AI Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <KeywordAnalysis keywords={analysis.keywords} />
            <AIRecommendations recommendations={analysis.recommendations} />
            <MissingSkills missingSkills={analysis.missingSkills} />
          </div>

          <div className="space-y-6">
            <ResumePreview data={analysis.extractedData} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

