import React from 'react';
import { ResumeContact } from '@/types/resume-document';
import { Mail, Phone, MapPin, Globe } from 'lucide-react';

interface ResumeHeaderProps {
  contact?: ResumeContact;
  targetRole?: string;
  isHighlighted?: boolean;
  onClick?: () => void;
}

export const ResumeHeader: React.FC<ResumeHeaderProps> = ({
  contact,
  targetRole,
  isHighlighted,
  onClick,
}) => {
  if (!contact) return null;

  return (
    <header
      id="resume-section-contact"
      onClick={onClick}
      className={`transition-all duration-200 border-b border-slate-200 dark:border-slate-800 pb-5 mb-5 ${
        isHighlighted
          ? 'ring-2 ring-indigo-500/40 bg-indigo-50/30 dark:bg-indigo-950/20 rounded-lg p-3 -m-3'
          : onClick
          ? 'cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/30 rounded-lg p-1 -m-1'
          : ''
      }`}
    >
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-serif">
          {contact.fullName || 'Candidate Name'}
        </h1>
        {targetRole && (
          <p className="text-sm sm:text-base font-medium text-slate-700 dark:text-slate-300">
            {targetRole}
          </p>
        )}
      </div>

      {/* Contact & Links Row */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-xs text-slate-600 dark:text-slate-400">
        {contact.location && (
          <span className="inline-flex items-center gap-1">
            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
            <span>{contact.location}</span>
          </span>
        )}

        {contact.email && (
          <a
            href={`mailto:${contact.email}`}
            className="inline-flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            <Mail className="w-3 h-3 text-slate-400 shrink-0" />
            <span>{contact.email}</span>
          </a>
        )}

        {contact.phone && (
          <span className="inline-flex items-center gap-1">
            <Phone className="w-3 h-3 text-slate-400 shrink-0" />
            <span>{contact.phone}</span>
          </span>
        )}

        {contact.links &&
          contact.links.map((link, idx) => (
            <a
              key={idx}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
            >
              <Globe className="w-3 h-3 shrink-0" />
              <span>{link.label || link.url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]}</span>
            </a>
          ))}
      </div>
    </header>
  );
};
