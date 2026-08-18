'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/dashboard/common/PageHeader';
import { AccountSettings } from '@/components/dashboard/settings/AccountSettings';
import { ProfileSettings } from '@/components/dashboard/settings/ProfileSettings';
import { PasswordSettings } from '@/components/dashboard/settings/PasswordSettings';
import { NotificationSettings } from '@/components/dashboard/settings/NotificationSettings';
import { AppearanceSettings } from '@/components/dashboard/settings/AppearanceSettings';

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        <PageHeader
          title="Account Settings"
          description="Manage your account preferences, security options, notification settings, and system appearance."
          badge="Preferences"
        />

        <div className="space-y-6">
          <ProfileSettings />
          <PasswordSettings />
          <NotificationSettings />
          <AppearanceSettings />
          <AccountSettings />
        </div>
      </div>
    </DashboardLayout>
  );
}
