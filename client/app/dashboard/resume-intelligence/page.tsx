'use client';

import React, { useState } from 'react';
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
import { ResumeAnalysisData } from '@/types/resume';

export default function ResumeIntelligencePage() {
  const [analysis, setAnalysis] = useState<ResumeAnalysisData>(mockCareerIntelligence.resumeAnalysis);

  const handleSimulateUpload = () => {
    setAnalysis((prev) => ({
      ...prev,
      overallScore: Math.min(98, prev.overallScore + 2),
      atsScore: Math.min(96, prev.atsScore + 1),
      extractedData: {
        ...prev.extractedData,
        uploadedAt: new Date().toISOString().split('T')[0],
      },
    }));
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
            onSimulateUpload={handleSimulateUpload}
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
