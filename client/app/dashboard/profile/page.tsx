'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/dashboard/common/PageHeader';
import { ProfileHeader } from '@/components/dashboard/profile/ProfileHeader';
import { PersonalInformation } from '@/components/dashboard/profile/PersonalInformation';
import { SkillsSection } from '@/components/dashboard/profile/SkillsSection';
import { ProjectsPortfolioSection } from '@/components/dashboard/profile/ProjectsPortfolioSection';
import { ProfileCompletion } from '@/components/dashboard/profile/ProfileCompletion';
import { EditProfileModal } from '@/components/dashboard/profile/EditProfileModal';
import { AddSkillModal } from '@/components/dashboard/profile/AddSkillModal';
import { AddProjectModal } from '@/components/dashboard/profile/AddProjectModal';
import {
  profileService,
  CandidateProfile,
  CandidateSkill,
  CandidateProject,
} from '@/services/profile.service';
import { useSession } from '@/lib/auth-client';
import { toast } from 'sonner';

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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="User Profile & Portfolio"
          description="Manage your identity, technical projects, verified skill credentials, and career readiness overview."
          badge="Verified Profile"
        />

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
                <PersonalInformation profile={profile} email={derivedEmail} />

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
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
