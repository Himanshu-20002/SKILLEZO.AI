import React, { useCallback } from 'react';
import { ResumeContact } from '@/types/resume-document';
import { ResumeBuilderConfig } from '@/types/resume-builder.types';
import { Mail, Phone, MapPin, Globe } from 'lucide-react';
import { resolveConfigClasses } from './templates';
import { InlineText } from './InlineText';

interface ResumeHeaderProps {
  contact?: ResumeContact;
  targetRole?: string;
  isHighlighted?: boolean;
  onClick?: () => void;
  config?: ResumeBuilderConfig | null;
  onUpdateContact?: (updatedContact: ResumeContact) => void;
  onUpdateRole?: (updatedRole: string) => void;
}

export const ResumeHeader: React.FC<ResumeHeaderProps> = React.memo(({
  contact,
  targetRole,
  isHighlighted,
  onClick,
  config,
  onUpdateContact,
  onUpdateRole,
}) => {
  if (!contact && !onUpdateContact) return null;

  const currentContact = contact || { fullName: '', email: '', links: [] };
  const { template, accentTextClass } = resolveConfigClasses(config);
  const isCompact = config?.templateId === 'compact';
  const isModern = config?.templateId === 'modern';

  const handleNameChange = useCallback((name: string) => {
    if (onUpdateContact) {
      onUpdateContact({ ...currentContact, fullName: name });
    }
  }, [currentContact, onUpdateContact]);

  const handleRoleChange = useCallback((role: string) => {
    if (onUpdateRole) {
      onUpdateRole(role);
    }
  }, [onUpdateRole]);

  const handleLocationChange = useCallback((loc: string) => {
    if (onUpdateContact) {
      onUpdateContact({ ...currentContact, location: loc });
    }
  }, [currentContact, onUpdateContact]);

  const handleEmailChange = useCallback((email: string) => {
    if (onUpdateContact) {
      onUpdateContact({ ...currentContact, email: email });
    }
  }, [currentContact, onUpdateContact]);

  const handlePhoneChange = useCallback((phone: string) => {
    if (onUpdateContact) {
      onUpdateContact({ ...currentContact, phone: phone });
    }
  }, [currentContact, onUpdateContact]);

  const displayName =
    currentContact.fullName && currentContact.fullName.trim().toLowerCase() !== 'resume'
      ? currentContact.fullName.trim()
      : 'Candidate Name';

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
        {onUpdateContact ? (
          <InlineText
            as="h1"
            value={displayName}
            onChange={handleNameChange}
            placeholder="Your Full Name"
            className={`font-black tracking-tight text-slate-900 dark:text-slate-100 block ${
              isCompact ? 'text-xl sm:text-2xl' : isModern ? 'text-3xl sm:text-4xl' : 'text-2xl sm:text-3xl'
            }`}
          />
        ) : (
          <h1
            className={`font-black tracking-tight text-slate-900 dark:text-slate-100 ${
              isCompact ? 'text-xl sm:text-2xl' : isModern ? 'text-3xl sm:text-4xl' : 'text-2xl sm:text-3xl'
            }`}
          >
            {displayName}
          </h1>
        )}

        {(targetRole || onUpdateRole) && (
          onUpdateRole ? (
            <InlineText
              as="p"
              value={targetRole || ''}
              onChange={handleRoleChange}
              placeholder="Target Role (e.g. Senior Full Stack Engineer)"
              className={`font-semibold text-slate-600 dark:text-slate-300 block ${
                isCompact ? 'text-xs' : 'text-sm sm:text-base'
              }`}
            />
          ) : (
            <p
              className={`font-semibold text-slate-600 dark:text-slate-300 ${
                isCompact ? 'text-xs' : 'text-sm sm:text-base'
              }`}
            >
              {targetRole}
            </p>
          )
        )}
      </div>

      {/* Contact Items Row */}
      <div
        className={`flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-500 dark:text-slate-400 ${
          isCompact ? 'text-[11px] pt-1.5' : 'text-xs pt-2.5'
        }`}
      >
        {(currentContact.location || onUpdateContact) && (
          <div className="inline-flex items-center gap-1">
            <MapPin className="w-3 h-3 shrink-0 text-slate-400" />
            {onUpdateContact ? (
              <InlineText
                value={currentContact.location || ''}
                onChange={handleLocationChange}
                placeholder="City, Country"
                className="min-w-[60px]"
              />
            ) : (
              <span>{currentContact.location}</span>
            )}
          </div>
        )}

        {(currentContact.email || onUpdateContact) && (
          <div className="inline-flex items-center gap-1">
            <Mail className="w-3 h-3 shrink-0 text-slate-400" />
            {onUpdateContact ? (
              <InlineText
                value={currentContact.email || ''}
                onChange={handleEmailChange}
                placeholder="your.email@example.com"
                className="min-w-[80px]"
              />
            ) : (
              <a
                href={`mailto:${currentContact.email}`}
                className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
              >
                {currentContact.email}
              </a>
            )}
          </div>
        )}

        {(currentContact.phone || onUpdateContact) && (
          <div className="inline-flex items-center gap-1">
            <Phone className="w-3 h-3 shrink-0 text-slate-400" />
            {onUpdateContact ? (
              <InlineText
                value={currentContact.phone || ''}
                onChange={handlePhoneChange}
                placeholder="+1 234 567 8900"
                className="min-w-[60px]"
              />
            ) : (
              <a
                href={`tel:${currentContact.phone}`}
                className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
              >
                {currentContact.phone}
              </a>
            )}
          </div>
        )}

        {currentContact.links &&
          currentContact.links.map((link, idx) => (
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
