import React from 'react';
import { ResumeContact } from '@/types/resume-document';
import { ResumeBuilderConfig } from '@/types/resume-builder.types';
import { Mail, Phone, MapPin, Globe } from 'lucide-react';
import { resolveConfigClasses } from './templates';

interface ResumeHeaderProps {
  contact?: ResumeContact;
  targetRole?: string;
  isHighlighted?: boolean;
  onClick?: () => void;
  config?: ResumeBuilderConfig | null;
}

export const ResumeHeader: React.FC<ResumeHeaderProps> = React.memo(({
  contact,
  targetRole,
  isHighlighted,
  onClick,
  config,
}) => {
  if (!contact) return null;

  const { template, accentTextClass } = resolveConfigClasses(config);
  const isCompact = config?.templateId === 'compact';
  const isModern = config?.templateId === 'modern';

  return (
    <header
      id="resume-section-contact"
      onClick={onClick}
      className={`transition-all duration-200 ${template.headerStyle} ${
        isHighlighted
          ? 'ring-2 ring-indigo-500/40 bg-indigo-50/30 dark:bg-indigo-950/20 rounded-lg p-3 -m-3'
          : onClick
          ? 'cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/30 rounded-lg p-1 -m-1'
          : ''
      }`}
    >
      <div className={isCompact ? 'space-y-0.5' : 'space-y-1'}>
        <h1
          className={`font-black tracking-tight text-slate-900 dark:text-slate-100 ${
            isCompact ? 'text-xl sm:text-2xl' : isModern ? 'text-3xl sm:text-4xl' : 'text-2xl sm:text-3xl'
          }`}
        >
          {contact.fullName || 'Candidate Name'}
        </h1>

        {targetRole && (
          <p
            className={`font-semibold text-slate-600 dark:text-slate-300 ${
              isCompact ? 'text-xs' : 'text-sm sm:text-base'
            }`}
          >
            {targetRole}
          </p>
        )}
      </div>

      {/* Contact Items Row */}
      <div
        className={`flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-500 dark:text-slate-400 ${
          isCompact ? 'text-[11px] pt-1.5' : 'text-xs pt-2.5'
        }`}
      >
        {contact.location && (
          <div className="inline-flex items-center gap-1">
            <MapPin className="w-3 h-3 shrink-0" />
            <span>{contact.location}</span>
          </div>
        )}

        {contact.email && (
          <a
            href={`mailto:${contact.email}`}
            className="inline-flex items-center gap-1 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <Mail className="w-3 h-3 shrink-0" />
            <span>{contact.email}</span>
          </a>
        )}

        {contact.phone && (
          <a
            href={`tel:${contact.phone}`}
            className="inline-flex items-center gap-1 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <Phone className="w-3 h-3 shrink-0" />
            <span>{contact.phone}</span>
          </a>
        )}

        {contact.links &&
          contact.links.map((link, idx) => (
            <a
              key={idx}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-1 hover:underline font-medium ${accentTextClass}`}
            >
              <Globe className="w-3 h-3 shrink-0" />
              <span>{link.label || link.url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]}</span>
            </a>
          ))}
      </div>
    </header>
  );
});

ResumeHeader.displayName = 'ResumeHeader';
