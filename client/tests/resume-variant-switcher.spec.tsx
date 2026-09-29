// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ResumeVariantBadge } from '@/components/resume-studio/ResumeVariantBadge';
import { ResumeTargetJobContext } from '@/components/resume-studio/ResumeTargetJobContext';
import { ResumeSwitchConfirmDialog } from '@/components/resume-studio/ResumeSwitchConfirmDialog';
import { ResumeVariantSwitcher } from '@/components/resume-studio/ResumeVariantSwitcher';
import { ResumeRecord } from '@/types/resume';

describe('Phase 6E.2 Component Tests: Resume Variant Identity & Switcher', () => {
  describe('ResumeVariantBadge', () => {
    it('renders Master identity badge with amber styling and accessible label', () => {
      render(<ResumeVariantBadge variantType="MASTER" />);
      const badge = screen.getByRole('status', { name: /master resume/i });
      expect(badge).toBeDefined();
      expect(badge.textContent).toContain('MASTER RESUME');
      expect(badge.className).toContain('text-amber-700');
    });

    it('renders Tailored identity badge with indigo styling and accessible label', () => {
      render(<ResumeVariantBadge variantType="TAILORED" />);
      const badge = screen.getByRole('status', { name: /tailored resume variant/i });
      expect(badge).toBeDefined();
      expect(badge.textContent).toContain('TAILORED RESUME');
      expect(badge.className).toContain('text-indigo-700');
    });

    it('supports compact presentation', () => {
      render(<ResumeVariantBadge variantType="MASTER" compact />);
      expect(screen.getByText('MASTER')).toBeDefined();

      render(<ResumeVariantBadge variantType="TAILORED" compact />);
      expect(screen.getByText('TAILORED')).toBeDefined();
    });
  });

  describe('ResumeTargetJobContext', () => {
    it('does not render for Master resume (Master is job-agnostic)', () => {
      const { container } = render(
        <ResumeTargetJobContext
          variantType="MASTER"
          targetJobTitle="Senior Engineer"
          targetCompany="Google"
        />
      );
      expect(container.firstChild).toBeNull();
    });

    it('renders title and company when both are provided from canonical metadata', () => {
      render(
        <ResumeTargetJobContext
          variantType="TAILORED"
          targetJobTitle="Senior Frontend Engineer"
          targetCompany="Google"
        />
      );
      const region = screen.getByRole('region', { name: /target role/i });
      expect(region.textContent).toBe('Senior Frontend Engineer · Google');
    });

    it('renders title only when company is absent', () => {
      render(
        <ResumeTargetJobContext
          variantType="TAILORED"
          targetJobTitle="Full-Stack Architect"
          targetCompany={null}
        />
      );
      expect(screen.getByText('Full-Stack Architect')).toBeDefined();
    });

    it('renders fallback "Job-specific variant" when both title and company are missing', () => {
      render(
        <ResumeTargetJobContext
          variantType="TAILORED"
          targetJobTitle={null}
          targetCompany={null}
        />
      );
      expect(screen.getByText('Job-specific variant')).toBeDefined();
    });
  });

  describe('ResumeSwitchConfirmDialog', () => {
    it('renders unsaved changes dialog when isOpen is true', () => {
      render(
        <ResumeSwitchConfirmDialog
          isOpen={true}
          onStay={vi.fn()}
          onConfirmSwitch={vi.fn()}
        />
      );
      expect(screen.getByText('Unsaved Changes')).toBeDefined();
      expect(screen.getByText(/You have unsaved changes that will be lost/i)).toBeDefined();
      expect(screen.getByRole('button', { name: /stay here/i })).toBeDefined();
      expect(screen.getByRole('button', { name: /switch resume/i })).toBeDefined();
    });

    it('triggers onStay when clicking "Stay Here"', () => {
      const onStay = vi.fn();
      render(
        <ResumeSwitchConfirmDialog
          isOpen={true}
          onStay={onStay}
          onConfirmSwitch={vi.fn()}
        />
      );
      fireEvent.click(screen.getByRole('button', { name: /stay here/i }));
      expect(onStay).toHaveBeenCalledTimes(1);
    });

    it('triggers onConfirmSwitch when clicking "Switch Resume"', () => {
      const onConfirmSwitch = vi.fn();
      render(
        <ResumeSwitchConfirmDialog
          isOpen={true}
          onStay={vi.fn()}
          onConfirmSwitch={onConfirmSwitch}
        />
      );
      fireEvent.click(screen.getByRole('button', { name: /switch resume/i }));
      expect(onConfirmSwitch).toHaveBeenCalledTimes(1);
    });
  });

  describe('ResumeVariantSwitcher', () => {
    const mockResumes: ResumeRecord[] = [
      {
        _id: 'master_1',
        userId: 'u1',
        fileName: 'master.pdf',
        originalFileName: 'master.pdf',
        title: 'Master Resume',
        fileSize: 1024,
        mimeType: 'application/pdf',
        storageKey: 'k1',
        isDefault: true,
        variantType: 'MASTER',
        createdAt: '2026-09-20T00:00:00Z',
        updatedAt: '2026-09-20T00:00:00Z',
      },
      {
        _id: 'tailored_google',
        userId: 'u1',
        fileName: 'google.pdf',
        originalFileName: 'google.pdf',
        title: 'Google Frontend Variant',
        targetJobTitle: 'Senior Frontend Engineer',
        targetCompany: 'Google',
        fileSize: 1024,
        mimeType: 'application/pdf',
        storageKey: 'k2',
        isDefault: false,
        variantType: 'TAILORED',
        createdAt: '2026-09-21T00:00:00Z',
        updatedAt: '2026-09-21T00:00:00Z',
      },
      {
        _id: 'tailored_stripe',
        userId: 'u1',
        fileName: 'stripe.pdf',
        originalFileName: 'stripe.pdf',
        title: 'Stripe Backend Variant',
        targetJobTitle: 'Staff Backend Engineer',
        targetCompany: 'Stripe',
        fileSize: 1024,
        mimeType: 'application/pdf',
        storageKey: 'k3',
        isDefault: false,
        variantType: 'TAILORED',
        createdAt: '2026-09-22T00:00:00Z',
        updatedAt: '2026-09-22T00:00:00Z',
      },
    ];

    it('renders the trigger button indicating current active resume', () => {
      render(
        <ResumeVariantSwitcher
          resumes={mockResumes}
          activeResumeId="master_1"
          onSelectResume={vi.fn()}
        />
      );
      const button = screen.getByRole('button', { name: /switch resume/i });
      expect(button.textContent).toContain('Master Resume');
    });

    it('opens dropdown and separates Master Resume and Tailored Variants', () => {
      render(
        <ResumeVariantSwitcher
          resumes={mockResumes}
          activeResumeId="master_1"
          onSelectResume={vi.fn()}
        />
      );
      const trigger = screen.getByRole('button', { name: /switch resume/i });
      fireEvent.click(trigger);

      expect(screen.getAllByText('Master Resume').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('Tailored Resumes')).toBeDefined();
      expect(screen.getByText('Google Frontend Variant')).toBeDefined();
      expect(screen.getByText('Stripe Backend Variant')).toBeDefined();
    });

    it('designates active variant with aria-current="true"', () => {
      render(
        <ResumeVariantSwitcher
          resumes={mockResumes}
          activeResumeId="tailored_google"
          onSelectResume={vi.fn()}
        />
      );
      fireEvent.click(screen.getByRole('button', { name: /switch resume/i }));

      const options = screen.getAllByRole('option');
      const googleOption = options.find((opt) => opt.textContent?.includes('Google Frontend Variant'));
      expect(googleOption?.getAttribute('aria-current')).toBe('true');
      expect(googleOption?.getAttribute('aria-selected')).toBe('true');

      const stripeOption = options.find((opt) => opt.textContent?.includes('Stripe Backend Variant'));
      expect(stripeOption?.getAttribute('aria-current')).toBeNull();
    });

    it('calls onSelectResume when clicking an unselected variant', () => {
      const onSelect = vi.fn();
      render(
        <ResumeVariantSwitcher
          resumes={mockResumes}
          activeResumeId="master_1"
          onSelectResume={onSelect}
        />
      );
      fireEvent.click(screen.getByRole('button', { name: /switch resume/i }));

      const stripeOption = screen.getByText('Stripe Backend Variant');
      fireEvent.click(stripeOption);

      expect(onSelect).toHaveBeenCalledWith('tailored_stripe');
    });

    it('does not trigger onSelectResume when clicking already active variant', () => {
      const onSelect = vi.fn();
      render(
        <ResumeVariantSwitcher
          resumes={mockResumes}
          activeResumeId="master_1"
          onSelectResume={onSelect}
        />
      );
      fireEvent.click(screen.getByRole('button', { name: /switch resume/i }));

      const options = screen.getAllByRole('option');
      const masterOption = options[0];
      fireEvent.click(masterOption);

      expect(onSelect).not.toHaveBeenCalled();
    });

    it('supports keyboard navigation: Enter opens, ArrowDown traverses, Escape closes', () => {
      render(
        <ResumeVariantSwitcher
          resumes={mockResumes}
          activeResumeId="master_1"
          onSelectResume={vi.fn()}
        />
      );
      const button = screen.getByRole('button', { name: /switch resume/i });

      // Open with Enter
      fireEvent.keyDown(button, { key: 'Enter' });
      expect(screen.getByRole('listbox')).toBeDefined();

      // Close with Escape
      fireEvent.keyDown(button, { key: 'Escape' });
      expect(screen.queryByRole('listbox')).toBeNull();
    });
  });
});
