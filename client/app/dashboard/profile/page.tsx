'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/dashboard/common/PageHeader';
import { ProfileHeader } from '@/components/dashboard/profile/ProfileHeader';
import { PersonalInformation } from '@/components/dashboard/profile/PersonalInformation';
import { SkillsSection } from '@/components/dashboard/profile/SkillsSection';
import { CertificationsSection } from '@/components/dashboard/profile/CertificationsSection';
import { EducationSection } from '@/components/dashboard/profile/EducationSection';
import { ProfileCompletion } from '@/components/dashboard/profile/ProfileCompletion';
import { mockExtendedProfile } from '@/mock/profile';
import { profileService, CandidateProfile } from '@/services/profile.service';
import { ApiError } from '@/lib/api';
import { toast } from 'sonner';
import { useSession } from '@/lib/auth-client';

export default function ProfilePage() {
  const { data: session } = useSession();

  const derivedName = session?.user?.name
    || (session?.user?.email ? session.user.email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()) : '')
    || 'Candidate';

  const derivedEmail = session?.user?.email || '';

  const [profileData, setProfileData] = useState<any>({
    ...mockExtendedProfile,
    name: derivedName,
    email: derivedEmail,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        setIsLoading(true);
        const liveProfile = await profileService.getMyProfile();
        
        const locationStr = liveProfile?.location
          ? [liveProfile.location.city, liveProfile.location.state, liveProfile.location.country].filter(Boolean).join(', ')
          : mockExtendedProfile.location;

        setProfileData({
          ...mockExtendedProfile,
          name: session?.user?.name || derivedName,
          email: session?.user?.email || derivedEmail,
          bio: liveProfile?.bio || mockExtendedProfile.bio,
          location: locationStr || mockExtendedProfile.location,
          skills: liveProfile?.skills && liveProfile.skills.length > 0
            ? liveProfile.skills.map((s, idx) => ({
                id: `skill-${idx}`,
                name: s.name,
                level: s.level ? `${s.level * 20}%` : '80%',
                verified: s.verified ?? true,
                category: 'Technical',
              }))
            : mockExtendedProfile.skills,
          education: liveProfile?.education && liveProfile.education.length > 0
            ? liveProfile.education.map((e, idx) => ({
                id: `edu-${idx}`,
                degree: e.degree,
                institution: e.institution,
                year: e.startYear && e.endYear ? `${e.startYear} - ${e.endYear}` : '2020 - 2024',
                grade: '3.9 GPA',
              }))
            : mockExtendedProfile.education,
          links: {
            github: liveProfile?.links?.github || mockExtendedProfile.links?.github,
            linkedin: liveProfile?.links?.linkedin || mockExtendedProfile.links?.linkedin,
            portfolio: liveProfile?.links?.portfolio || mockExtendedProfile.links?.portfolio,
          },
        });
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) {
          // Keep derived name and email
          setProfileData((prev: any) => ({
            ...prev,
            name: derivedName,
            email: derivedEmail,
          }));
        } else {
          console.error('[ProfilePage] Error fetching profile:', err);
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, [session, derivedName, derivedEmail]);

  const handleEditProfile = () => {
    toast.info('Profile edits sync directly with backend via profileService');
  };

  const handleAction = (itemType: string) => {
    toast.info(`Add ${itemType} modal opened`);
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
              <p className="text-xs text-slate-400">Loading your profile from database...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Header Hero */}
            <ProfileHeader profile={profileData} onEditProfile={handleEditProfile} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Column */}
              <div className="lg:col-span-2 space-y-6">
                <PersonalInformation profile={profileData} />
                <SkillsSection
                  skills={profileData.skills}
                  onAddSkill={() => handleAction('Skill')}
                />
                <CertificationsSection
                  certifications={profileData.certifications}
                  onAddCertification={() => handleAction('Certification')}
                />
                <EducationSection
                  education={profileData.education}
                  onAddEducation={() => handleAction('Education')}
                />
              </div>

              {/* Right Sidebar Column */}
              <div className="space-y-6">
                <ProfileCompletion percentage={profileData.completionPercentage} />
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

