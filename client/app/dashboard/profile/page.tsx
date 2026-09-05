'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/dashboard/common/PageHeader';
import { ProfileHeader } from '@/components/dashboard/profile/ProfileHeader';
import { PersonalInformation } from '@/components/dashboard/profile/PersonalInformation';
import { SkillsSection } from '@/components/dashboard/profile/SkillsSection';
import { ProfileCompletion } from '@/components/dashboard/profile/ProfileCompletion';
import { CertificationsSection } from '@/components/dashboard/profile/CertificationsSection';
import { EducationSection } from '@/components/dashboard/profile/EducationSection';
import { EditProfileModal } from '@/components/dashboard/profile/EditProfileModal';
import { AddSkillModal } from '@/components/dashboard/profile/AddSkillModal';
import { profileService, CandidateProfile, CandidateSkill } from '@/services/profile.service';
import { mockExtendedProfile } from '@/mock/profile';
import { useSession } from '@/lib/auth-client';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { data: session } = useSession();

  const derivedName = session?.user?.name
    || (session?.user?.email ? session.user.email.split('@')[0].replace(/[._]/g, ' ') : '')
    || 'testuser';

  const derivedEmail = session?.user?.email || 'testuser@gmail.com';

  const [profile, setProfile] = useState<CandidateProfile>({
    userId: session?.user?.id || 'demo-user',
    headline: 'Building AI-driven Enterprise Systems | Next.js, React & Node.js Specialist',
    phone: '+1 (555) 234-5678',
    targetRole: 'Senior Full Stack Engineer',
    bio: 'Passionate software engineer with 6+ years of experience designing scalable cloud solutions, microservices, and modern web applications. Focused on automated skill verification and AI integrations.',
    skills: [
      { name: 'React 19 & Next.js 15', category: 'Frontend', level: 5, proficiency: 'Expert', score: 98, verified: true },
      { name: 'TypeScript & Node.js', category: 'Language / Backend', level: 4, proficiency: 'Advanced', score: 94, verified: true },
      { name: 'Tailwind CSS & Design Systems', category: 'UI / UX', level: 5, proficiency: 'Expert', score: 96, verified: true },
      { name: 'GraphQL & REST APIs', category: 'Backend', level: 4, proficiency: 'Advanced', score: 91, verified: true },
      { name: 'PostgreSQL & Redis Caching', category: 'Database', level: 3, proficiency: 'Intermediate', score: 85, verified: false },
      { name: 'Docker & Kubernetes', category: 'DevOps', level: 3, proficiency: 'Intermediate', score: 82, verified: false },
    ],
    education: [],
    experience: [],
    links: {
      github: 'https://github.com/Himanshu-20002',
      linkedin: 'https://linkedin.com/in/candidate',
      portfolio: 'https://candidate.dev',
    },
    location: { city: 'San Francisco', state: 'California', country: 'United States' },
    completionPercentage: 92,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddSkillModalOpen, setIsAddSkillModalOpen] = useState(false);

  const loadProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      const liveProfile = await profileService.getMyProfile();
      if (liveProfile) {
        setProfile((prev) => ({
          ...prev,
          ...liveProfile,
          headline: liveProfile.headline || prev.headline,
          phone: liveProfile.phone || prev.phone,
          targetRole: liveProfile.targetRole || prev.targetRole,
          bio: liveProfile.bio || prev.bio,
          links: liveProfile.links || prev.links,
          location: liveProfile.location || prev.location,
          skills: liveProfile.skills && liveProfile.skills.length > 0 ? liveProfile.skills : prev.skills,
          completionPercentage: liveProfile.completionPercentage || prev.completionPercentage,
        }));
      }
    } catch {
      // Fallback seamlessly to initialized demo state
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="User Profile & Portfolio"
          description="Manage your identity, verified skill credentials, and career readiness overview."
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
              {/* Left Column (8 cols): Personal Info & Skills Grid */}
              <div className="lg:col-span-8 space-y-6">
                <PersonalInformation profile={profile} email={derivedEmail} />

                {/* Technical Skills & Competencies */}
                <SkillsSection
                  skills={profile.skills}
                  onAddSkill={() => setIsAddSkillModalOpen(true)}
                  onDeleteSkill={handleDeleteSkill}
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
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
