'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/dashboard/common/PageHeader';
import { ProfileHeader } from '@/components/dashboard/profile/ProfileHeader';
import { PersonalInformation } from '@/components/dashboard/profile/PersonalInformation';
import { SkillsSection } from '@/components/dashboard/profile/SkillsSection';
import { ProjectsPortfolioSection } from '@/components/dashboard/profile/ProjectsPortfolioSection';
import { EducationSection } from '@/components/dashboard/profile/EducationSection';
import { ProfileCompletion } from '@/components/dashboard/profile/ProfileCompletion';
import { EditProfileModal } from '@/components/dashboard/profile/EditProfileModal';
import { AddSkillModal } from '@/components/dashboard/profile/AddSkillModal';
import { AddProjectModal } from '@/components/dashboard/profile/AddProjectModal';
import { AddEducationModal } from '@/components/dashboard/profile/AddEducationModal';
import {
  profileService,
  CandidateProfile,
  CandidateSkill,
  CandidateProject,
  CandidateEducation,
} from '@/services/profile.service';
import { resumeService } from '@/services/resume.service';
import { useSession } from '@/lib/auth-client';
import { toast } from 'sonner';
import { Sparkles, UploadCloud, RefreshCw, Loader2 } from 'lucide-react';

export default function ProfilePage() {
  const { data: session } = useSession();

  const [profile, setProfile] = useState<CandidateProfile>({
    userId: session?.user?.id || '',
    headline: '',
    phone: '',
    targetRole: '',
    bio: '',
    skills: [],
    projects: [],
    education: [],
    experience: [],
    links: {
      github: '',
      linkedin: '',
      portfolio: '',
    },
    location: {
      city: '',
      state: '',
      country: '',
    },
    completionPercentage: 0,
  });

  const derivedName =
    session?.user?.name ||
    (session?.user?.email
      ? session.user.email.split('@')[0].replace(/[._]/g, ' ')
      : '') ||
    'Candidate';

  const derivedEmail =
    session?.user?.email || profile.links?.portfolio || '';

  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddSkillModalOpen, setIsAddSkillModalOpen] = useState(false);
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);
  const [isAddEducationModalOpen, setIsAddEducationModalOpen] = useState(false);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [isSyncingResume, setIsSyncingResume] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingResume(true);
      toast.loading('Analyzing and extracting profile details from resume...', { id: 'resume-upload' });
      await resumeService.uploadResume(file);
      await loadProfile();
      toast.success('Profile successfully populated from resume! Any missing fields can be edited below.', { id: 'resume-upload' });
    } catch (err: any) {
      toast.error(err?.message || 'Failed to process resume', { id: 'resume-upload' });
    } finally {
      setIsUploadingResume(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleSyncResume = async () => {
    try {
      setIsSyncingResume(true);
      toast.loading('Syncing profile from your default resume...', { id: 'resume-sync' });
      await profileService.syncResume();
      await loadProfile();
      toast.success('Profile synchronized with your latest resume!', { id: 'resume-sync' });
    } catch (err: any) {
      toast.error(err?.message || 'No uploaded resume found to sync from', { id: 'resume-sync' });
    } finally {
      setIsSyncingResume(false);
    }
  };

  const loadProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      const liveProfile = await profileService.getMyProfile();
      if (liveProfile) {
        setProfile({
          ...liveProfile,
          headline: liveProfile.headline || '',
          phone: liveProfile.phone || '',
          targetRole: liveProfile.targetRole || '',
          bio: liveProfile.bio || '',
          links: liveProfile.links || { github: '', linkedin: '', portfolio: '' },
          location: liveProfile.location || { city: '', state: '', country: '' },
          skills: Array.isArray(liveProfile.skills) ? liveProfile.skills : [],
          projects: Array.isArray(liveProfile.projects) ? liveProfile.projects : [],
          completionPercentage: liveProfile.completionPercentage ?? 0,
        });
      }
    } catch {
      // Keep clean zero state on fetch failure
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleSaveProfile = async (updatedData: Partial<CandidateProfile>) => {
    try {
      const updated = await profileService.updateProfile(updatedData);
      setProfile(updated);
      toast.success('Candidate profile updated successfully!');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update profile');
    }
  };

  const handleAddSkill = async (newSkill: CandidateSkill) => {
    try {
      const updated = await profileService.addSkill(newSkill);
      setProfile(updated);
      toast.success(`Skill "${newSkill.name}" attached to portfolio!`);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to add skill');
    }
  };

  const handleDeleteSkill = async (skillName: string) => {
    try {
      const updated = await profileService.deleteSkill(skillName);
      setProfile(updated);
      toast.success(`Skill "${skillName}" removed`);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete skill');
    }
  };

  const handleAddProject = async (newProject: CandidateProject) => {
    try {
      const updated = await profileService.addProject(newProject);
      setProfile(updated);
      toast.success(`Project "${newProject.title}" attached to portfolio!`);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to add project');
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      const updated = await profileService.deleteProject(projectId);
      if (updated && updated.projects) {
        setProfile((prev) => ({
          ...prev,
          projects: updated.projects,
          completionPercentage: updated.completionPercentage || prev.completionPercentage,
        }));
      } else {
        setProfile((prev) => ({
          ...prev,
          projects: (prev.projects || []).filter(
            (p) => p._id !== projectId && p.title !== projectId
          ),
        }));
      }
      toast.success('Project removed from portfolio');
    } catch (err: any) {
      setProfile((prev) => ({
        ...prev,
        projects: (prev.projects || []).filter(
          (p) => p._id !== projectId && p.title !== projectId
        ),
      }));
      toast.success('Project removed from portfolio');
    }
  };

  const handleAddEducation = async (newEdu: CandidateEducation) => {
    try {
      const updatedEducation = [...(profile.education || []), newEdu];
      const updated = await profileService.updateEducation(updatedEducation);
      setProfile((prev) => ({
        ...prev,
        education: updated.education || updatedEducation,
        completionPercentage: updated.completionPercentage || prev.completionPercentage,
      }));
      toast.success(`Education at "${newEdu.institution}" added!`);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to add education');
    }
  };

  const handleDeleteEducation = async (index: number) => {
    try {
      const updatedEducation = (profile.education || []).filter((_, i) => i !== index);
      const updated = await profileService.updateEducation(updatedEducation);
      setProfile((prev) => ({
        ...prev,
        education: updated.education || updatedEducation,
        completionPercentage: updated.completionPercentage || prev.completionPercentage,
      }));
      toast.success('Education entry removed');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete education');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="User Profile & Portfolio"
          description="Manage your identity, technical projects, verified skill credentials, and career readiness overview."
          badge="Verified Profile"
        />

        {/* Hidden File Input for Resume Auto-Fill */}
        <input
          type="file"
          ref={fileInputRef}
          accept=".pdf,.docx"
          className="hidden"
          onChange={handleResumeUpload}
        />

        {/* AI Resume Auto-Fill Banner */}
        <div className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-[#3D5AFE]/15 border border-indigo-500/20 backdrop-blur-xl shadow-lg">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#3D5AFE]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div className="space-y-1.5 max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#3D5AFE]/15 text-[#3D5AFE] dark:text-[#38BDF8] border border-[#3D5AFE]/30">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Profile Auto-Fill</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Upload your resume to instantly auto-fill your profile
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Upload your resume PDF and our AI engine will automatically extract your contact information, target role, technical skills, and portfolio links. Any missing fields can be completed manually below.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingResume}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#3D5AFE] to-[#00D9C0] hover:opacity-95 text-white text-xs font-bold shadow-md transition-all disabled:opacity-50 cursor-pointer"
              >
                {isUploadingResume ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <UploadCloud className="w-4 h-4" />
                )}
                <span>{isUploadingResume ? 'Analyzing Resume...' : 'Upload Resume PDF'}</span>
              </button>

              <button
                type="button"
                onClick={handleSyncResume}
                disabled={isSyncingResume || isUploadingResume}
                className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-all disabled:opacity-50 cursor-pointer"
                title="Re-sync from previously uploaded resume"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncingResume ? 'animate-spin' : ''}`} />
                <span>Re-sync</span>
              </button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 rounded-3xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-[#3D5AFE] border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-slate-400">Loading your profile...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Identity Hero Header */}
            <ProfileHeader
              profile={profile}
              name={derivedName}
              email={derivedEmail}
              onEditProfile={() => setIsEditModalOpen(true)}
            />

            {/* Grid Row: Personal Information + Profile Completion */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column (8 cols): Personal Info, Skills Grid, and Projects Portfolio */}
              <div className="lg:col-span-8 space-y-6">
                <PersonalInformation
                  profile={profile}
                  email={derivedEmail}
                  onEditProfile={() => setIsEditModalOpen(true)}
                />

                {/* Technical Skills & Competencies */}
                <SkillsSection
                  skills={profile.skills}
                  onAddSkill={() => setIsAddSkillModalOpen(true)}
                  onDeleteSkill={handleDeleteSkill}
                />

                {/* Technical Portfolio & Projects */}
                <ProjectsPortfolioSection
                  projects={profile.projects}
                  onAddProject={() => setIsAddProjectModalOpen(true)}
                  onDeleteProject={handleDeleteProject}
                />

                {/* Academic Background & Education */}
                <EducationSection
                  education={profile.education}
                  onAddEducation={() => setIsAddEducationModalOpen(true)}
                  onDeleteEducation={handleDeleteEducation}
                />
              </div>

              {/* Right Column (4 cols): Profile Completion Card */}
              <div className="lg:col-span-4 space-y-6">
                <ProfileCompletion percentage={profile.completionPercentage} />
              </div>
            </div>

            {/* Modals */}
            <EditProfileModal
              isOpen={isEditModalOpen}
              onClose={() => setIsEditModalOpen(false)}
              profile={profile}
              onSave={handleSaveProfile}
            />

            <AddSkillModal
              isOpen={isAddSkillModalOpen}
              onClose={() => setIsAddSkillModalOpen(false)}
              onAdd={handleAddSkill}
            />

            <AddProjectModal
              isOpen={isAddProjectModalOpen}
              onClose={() => setIsAddProjectModalOpen(false)}
              onAdd={handleAddProject}
            />

            <AddEducationModal
              isOpen={isAddEducationModalOpen}
              onClose={() => setIsAddEducationModalOpen(false)}
              onAdd={handleAddEducation}
            />
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
