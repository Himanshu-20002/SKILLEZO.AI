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

function mapResumeToExtractedData(resume: ResumeRecord): ResumeAnalysisData['extractedData'] {
  const extracted = resume.extractedData;
  const candidateName = extracted?.personalInfo?.fullName || extracted?.candidateName || undefined;
  const rawLoc = extracted?.personalInfo?.location || extracted?.location || undefined;
  const cleanLocation =
    rawLoc && candidateName
      ? rawLoc.replace(new RegExp(candidateName, 'gi'), '').replace(/^[,\s|/.-]+/, '').trim() || undefined
      : rawLoc;

  const skillsList =
    extracted?.skillsExtracted ||
    (extracted?.skills || []).map((s: any) => (typeof s === 'string' ? s : s.name)) ||
    [];

  return {
    fileName: resume.originalFileName || resume.fileName || resume.title,
    fileSize: formatFileSize(resume.fileSize),
    uploadedAt: new Date(resume.createdAt || Date.now()).toLocaleDateString(),
    candidateName,
    location: cleanLocation,
    email: extracted?.personalInfo?.email || extracted?.email || undefined,
    phone: extracted?.personalInfo?.phone || extracted?.phone || undefined,
    summary: extracted?.summary || null,
    skillsExtracted: skillsList,
    skills: extracted?.skills || [],
    education: extracted?.education || [],
    experience: extracted?.experience || [],
    totalExperienceYears: extracted?.totalExperienceYears || null,
    personalInfo: extracted?.personalInfo || null,
  };
}

const TARGET_ROLES = [
  'Full-Stack Engineer',
  'Frontend Engineer',
  'Backend Engineer',
  'AI/ML Specialist',
  'DevOps & Cloud Engineer',
  'Mobile App Developer',
];

export default function ResumeIntelligencePage() {
  const [analysis, setAnalysis] = useState<ResumeAnalysisData>(mockCareerIntelligence.resumeAnalysis);
  const [userResumes, setUserResumes] = useState<ResumeRecord[]>([]);
  const [activeResume, setActiveResume] = useState<ResumeRecord | null>(null);
  const [targetRole, setTargetRole] = useState('Full-Stack Engineer');
  const [isUploading, setIsUploading] = useState(false);

  const applyResumeToAnalysis = async (resume: ResumeRecord) => {
    setActiveResume(resume);
    const extracted = mapResumeToExtractedData(resume);

    try {
      const liveAts = await resumeService.getResumeAtsScore(resume._id || resume.id);
      if (liveAts) {
        setAnalysis({
          overallScore: liveAts.overallScore,
          atsScore: liveAts.atsScore,
          impactScore: liveAts.impactScore,
          brevityScore: liveAts.brevityScore,
          extractedData: extracted,
          atsCompatibility: liveAts.atsCompatibility || [],
          keywords: liveAts.keywords || [],
          missingSkills: liveAts.missingKeywords || [],
          recommendations: liveAts.recommendations || [],
        });
        return;
      }
    } catch {
      // If live ATS call fails, fallback to extracted data keyword mapping
    }

    const skillKeywords = (resume.extractedData?.skills || []).map((s: any) => ({
      keyword: typeof s === 'string' ? s : s.name,
      category: (s.category as any) || 'Frontend',
      matched: true,
      frequency: 3,
      importance: 'Required' as const,
    }));

    setAnalysis((prev) => ({
      ...prev,
      extractedData: extracted,
      keywords: skillKeywords.length > 0 ? skillKeywords : prev.keywords,
    }));
  };

  useEffect(() => {
    let isMounted = true;
    const fetchResumes = async () => {
      try {
        const resumes = await resumeService.getUserResumes();
        if (isMounted && resumes && resumes.length > 0) {
          setUserResumes(resumes);
          const defaultResume = resumes.find((r) => r.isDefault) || resumes[0];
          await applyResumeToAnalysis(defaultResume);
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
      await applyResumeToAnalysis(uploaded);
      toast.success(`"${file.name}" uploaded & parsed successfully!`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload resume. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSelectResume = (resume: ResumeRecord) => {
    applyResumeToAnalysis(resume);
    toast.info(`Switched active resume to "${resume.title || resume.fileName}"`);
  };

  const handleTargetRoleChange = (role: string) => {
    setTargetRole(role);
    toast.info(`Target role benchmark set to "${role}"`);
  };

  const handleDeleteResume = async (resumeId: string) => {
    try {
      await resumeService.deleteResume(resumeId);
      const remaining = userResumes.filter((r) => (r._id || r.id) !== resumeId);
      setUserResumes(remaining);

      if (remaining.length > 0) {
        const nextResume = remaining.find((r) => r.isDefault) || remaining[0];
        applyResumeToAnalysis(nextResume);
      } else {
        setActiveResume(null);
        setAnalysis((prev) => ({
          ...prev,
          extractedData: {
            fileName: 'No resume uploaded',
            fileSize: '0 KB',
            uploadedAt: 'N/A',
            candidateName: 'No Candidate',
            location: '',
            summary: null,
            skillsExtracted: [],
            skills: [],
          },
        }));
      }

      toast.success('Resume deleted successfully.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete resume. Please try again.');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="AI Resume Intelligence"
          description={`Benchmarking your resume against ${targetRole} industry requirements with automated ATS scoring & keyword audit.`}
          badge=" • Resume Intelligence"
          actions={
            <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1.5 shadow-sm">
              <div className="flex items-center gap-1.5 px-2.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="hidden sm:inline">Target Role:</span>
              </div>
              <div className="relative">
                <select
                  aria-label="Target Role Selector"
                  value={targetRole}
                  onChange={(e) => handleTargetRoleChange(e.target.value)}
                  className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold py-1.5 pl-2.5 pr-7 rounded-lg border-0 focus:ring-2 focus:ring-[#3D5AFE] cursor-pointer appearance-none"
                >
                  {TARGET_ROLES.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
                <span className="text-slate-400 text-[10px] absolute right-2.5 top-2 pointer-events-none">▼</span>
              </div>
            </div>
          }
        />

        {/* Upload & Score Card Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ResumeUploader
            currentFileName={analysis.extractedData?.fileName || activeResume?.originalFileName || activeResume?.fileName || 'No resume uploaded'}
            fileSize={analysis.extractedData?.fileSize || formatFileSize(activeResume?.fileSize)}
            uploadedAt={analysis.extractedData?.uploadedAt || (activeResume ? new Date(activeResume.createdAt).toLocaleDateString() : 'N/A')}
            isUploading={isUploading}
            onUpload={handleFileUpload}
            userResumes={userResumes}
            selectedResumeId={activeResume?._id || activeResume?.id}
            onSelectResume={handleSelectResume}
            onDeleteResume={handleDeleteResume}
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
            <KeywordAnalysis keywords={analysis.keywords} targetRole={targetRole} />
            <AIRecommendations recommendations={analysis.recommendations} />
            <MissingSkills missingSkills={analysis.missingSkills || analysis.missingKeywords || []} targetRole={targetRole} />
          </div>

          <div className="space-y-6">
            <ResumePreview data={analysis.extractedData || { fileName: 'No resume selected' }} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}



