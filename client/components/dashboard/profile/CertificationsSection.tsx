'use client';

import React from 'react';
import { ShieldCheck, Plus } from 'lucide-react';
import { UserCertification } from '@/types/profile';
import { CardHeader } from '@/components/dashboard/common/CardHeader';

interface CertificationsSectionProps {
  certifications: UserCertification[];
  onAddCertification?: () => void;
}

export const CertificationsSection: React.FC<CertificationsSectionProps> = ({
  certifications,
  onAddCertification
}) => {
  return (
    <div className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-md space-y-4">
      <CardHeader
        title="Certifications & Badges"
        subtitle="Verified professional certifications"
        icon={<ShieldCheck className="w-5 h-5 text-indigo-400" />}
        action={
          <button
            onClick={onAddCertification}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Badge</span>
          </button>
        }
      />

      <div className="space-y-3">
        {certifications.map((cert) => (
          <div
            key={cert.id}
            className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-100">{cert.title}</h4>
              <p className="text-xs text-slate-400">
                {cert.issuer} • Issued: {cert.issueDate}
                {cert.expiryDate ? ` (Expires: ${cert.expiryDate})` : ''}
              </p>
              {cert.credentialId && (
                <span className="inline-block font-mono text-[11px] text-[#00D9C0]">
                  ID: {cert.credentialId}
                </span>
              )}
            </div>

            <span className="self-start sm:self-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
              {cert.verificationBadge}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
