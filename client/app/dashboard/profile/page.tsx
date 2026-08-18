'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/dashboard/common/PageHeader';
import { ProfileHeader } from '@/components/dashboard/profile/ProfileHeader';
import { PersonalInformation } from '@/components/dashboard/profile/PersonalInformation';
import { SkillsSection } from '@/components/dashboard/profile/SkillsSection';
import { CertificationsSection } from '@/components/dashboard/profile/CertificationsSection';
import { EducationSection } from '@/components/dashboard/profile/EducationSection';
import { ProfileCompletion } from '@/components/dashboard/profile/ProfileCompletion';
import { mockExtendedProfile } from '@/mock/profile';
import { toast } from 'sonner';

export default function ProfilePage() {
  const handleEditProfile = () => {
    toast.info('Edit Profile Modal opened (UI Prototype Mode)');
  };

  const handleAction = (itemType: string) => {
    toast.info(`Add ${itemType} Modal opened (UI Prototype Mode)`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="User Profile & Portfolio"
          description="Manage your identity, verified skill credentials, and career readiness overview."
          badge="Verified Profile"
        />

        {/* Header Hero */}
        <ProfileHeader profile={mockExtendedProfile} onEditProfile={handleEditProfile} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            <PersonalInformation profile={mockExtendedProfile} />
            <SkillsSection
              skills={mockExtendedProfile.skills}
              onAddSkill={() => handleAction('Skill')}
            />
            <CertificationsSection
              certifications={mockExtendedProfile.certifications}
              onAddCertification={() => handleAction('Certification')}
            />
            <EducationSection
              education={mockExtendedProfile.education}
              onAddEducation={() => handleAction('Education')}
            />
          </div>

          {/* Right Sidebar Column */}
          <div className="space-y-6">
            <ProfileCompletion percentage={mockExtendedProfile.completionPercentage} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
