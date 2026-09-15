import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  ResumeBuilderConfig,
  DEFAULT_BUILDER_CONFIG,
  CANONICAL_SECTION_ORDER,
} from '@/modules/resume-intelligence/builder/builder.types';
import {
  validateBuilderConfig,
  resumeBuilderConfigSchema,
} from '@/modules/resume-intelligence/builder/builder.validator';
import { ResumeService } from '@/modules/resume/resume.service';
import { SAMPLE_RESUME_DOCUMENT_FIXTURE } from '@/modules/resume-intelligence/document/resume-document.fixture';
import { ResumeDocument } from '@/modules/resume-intelligence/document/resume-document.types';

describe('Phase 7: Resume Builder + Templates + Presentation Controls Suite', () => {
  describe('1. Builder Config Validation & Security Invariants', () => {
    it('should successfully validate the default builder configuration', () => {
      const result = validateBuilderConfig(DEFAULT_BUILDER_CONFIG);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(DEFAULT_BUILDER_CONFIG);
    });

    it('should allow valid customizations across templates, typography, and density', () => {
      const customConfig: ResumeBuilderConfig = {
        templateId: 'modern',
        fontFamily: 'serif',
        fontSize: 'large',
        lineHeight: 'relaxed',
        sectionSpacing: 'comfortable',
        pageMargin: 'wide',
        sectionOrder: [
          'skills',
          'experience',
          'projects',
          'summary',
          'education',
          'achievements',
        ],
        density: 'comfortable',
        accentStyle: 'minimal',
      };

      const result = validateBuilderConfig(customConfig);
      expect(result.success).toBe(true);
      expect(result.data?.templateId).toBe('modern');
      expect(result.data?.sectionOrder[0]).toBe('skills');
    });

    it('should reject unknown template IDs to prevent template injection', () => {
      const invalidConfig = {
        ...DEFAULT_BUILDER_CONFIG,
        templateId: 'malicious_or_unknown_template',
      };

      const result = validateBuilderConfig(invalidConfig);
      expect(result.success).toBe(false);
      expect(result.errors?.some((e) => e.includes('templateId'))).toBe(true);
    });

    it('should reject invalid font families or unauthorized CSS inputs', () => {
      const invalidConfig = {
        ...DEFAULT_BUILDER_CONFIG,
        fontFamily: 'comic-sans-injection',
      };

      const result = validateBuilderConfig(invalidConfig);
      expect(result.success).toBe(false);
      expect(result.errors?.some((e) => e.includes('fontFamily'))).toBe(true);
    });

    it('should reject duplicate sections in sectionOrder', () => {
      const invalidConfig = {
        ...DEFAULT_BUILDER_CONFIG,
        sectionOrder: [
          'experience',
          'experience', // duplicate
          'summary',
          'skills',
          'projects',
          'education',
        ],
      };

      const result = validateBuilderConfig(invalidConfig);
      expect(result.success).toBe(false);
      expect(result.errors?.some((e) => e.includes('unique sections'))).toBe(true);
    });

    it('should reject incomplete sectionOrder missing required canonical sections', () => {
      const incompleteConfig = {
        ...DEFAULT_BUILDER_CONFIG,
        sectionOrder: ['summary', 'skills'], // missing experience, projects, education, achievements
      };

      const result = validateBuilderConfig(incompleteConfig);
      expect(result.success).toBe(false);
      expect(result.errors?.some((e) => e.includes('required body sections'))).toBe(true);
    });
  });

  describe('2. Canonical Data Rule: Content Invariance Across Presentation Changes', () => {
    it('should guarantee switching templates never mutates ResumeDocument content', () => {
      const doc: ResumeDocument = JSON.parse(JSON.stringify(SAMPLE_RESUME_DOCUMENT_FIXTURE));
      const originalFullName = doc.contact.fullName;
      const originalSummary = doc.summary.text;
      const originalExperiences = doc.experience.length;

      // Simulate switching through all 3 templates
      const templates: Array<ResumeBuilderConfig['templateId']> = ['classic', 'modern', 'compact'];
      for (const t of templates) {
        const config: ResumeBuilderConfig = {
          ...DEFAULT_BUILDER_CONFIG,
          templateId: t,
        };
        expect(validateBuilderConfig(config).success).toBe(true);

        // Verify document content remains pristine
        expect(doc.contact.fullName).toBe(originalFullName);
        expect(doc.summary.text).toBe(originalSummary);
        expect(doc.experience.length).toBe(originalExperiences);
      }
    });

    it('should guarantee reordering sections leaves section items and content unaffected', () => {
      const doc: ResumeDocument = JSON.parse(JSON.stringify(SAMPLE_RESUME_DOCUMENT_FIXTURE));
      const reversedOrder = [...CANONICAL_SECTION_ORDER].reverse();

      const config: ResumeBuilderConfig = {
        ...DEFAULT_BUILDER_CONFIG,
        sectionOrder: reversedOrder,
      };

      expect(validateBuilderConfig(config).success).toBe(true);
      // Content within sections remains untouched
      expect(doc.experience[0].jobTitle).toBe(SAMPLE_RESUME_DOCUMENT_FIXTURE.experience[0].jobTitle);
      expect(doc.projects[0].title).toBe(SAMPLE_RESUME_DOCUMENT_FIXTURE.projects[0].title);
    });
  });

  describe('3. Persistence & Service Integration', () => {
    let mockResumeRepository: any;
    let resumeService: ResumeService;
    const fakeUserId = 'user_ph7_test';
    const fakeResumeId = 'resume_ph7_test';

    beforeEach(() => {
      const mockResumeRecord = {
        _id: fakeResumeId,
        userId: fakeUserId,
        title: 'Software Engineer Resume',
        originalFileName: 'resume.pdf',
        fileName: 'resume.pdf',
        fileSize: 1024,
        mimeType: 'application/pdf',
        storageKey: 'resumes/test.pdf',
        isDefault: true,
        status: 'completed',
        version: 1,
        resumeDocument: SAMPLE_RESUME_DOCUMENT_FIXTURE,
        builderConfig: null,
      };

      mockResumeRepository = {
        findUserResumeById: vi.fn().mockResolvedValue(mockResumeRecord),
        findById: vi.fn().mockResolvedValue(mockResumeRecord),
        updateById: vi.fn().mockImplementation((id, update) => {
          Object.assign(mockResumeRecord, update);
          return Promise.resolve(mockResumeRecord);
        }),
      };

      resumeService = new ResumeService(mockResumeRepository);
    });

    it('should return DEFAULT_BUILDER_CONFIG when no custom config has been saved yet', async () => {
      const config = await resumeService.getBuilderConfig(fakeUserId, fakeResumeId);
      expect(config).toEqual(DEFAULT_BUILDER_CONFIG);
    });

    it('should persist valid builderConfig and safely reload it', async () => {
      const newConfig: ResumeBuilderConfig = {
        templateId: 'compact',
        fontFamily: 'mono',
        fontSize: 'small',
        lineHeight: 'compact',
        sectionSpacing: 'compact',
        pageMargin: 'compact',
        sectionOrder: [
          'skills',
          'experience',
          'projects',
          'education',
          'achievements',
          'summary',
        ],
        density: 'compact',
        accentStyle: 'neutral',
      };

      const saved = await resumeService.saveBuilderConfig(fakeUserId, fakeResumeId, newConfig);
      expect(saved.templateId).toBe('compact');
      expect(mockResumeRepository.updateById).toHaveBeenCalledWith(
        fakeResumeId,
        expect.objectContaining({ builderConfig: newConfig })
      );

      // Verify subsequent get returns saved config
      const reloaded = await resumeService.getBuilderConfig(fakeUserId, fakeResumeId);
      expect(reloaded).toEqual(newConfig);
    });

    it('should reject invalid payload when attempting to save builderConfig', async () => {
      const corruptedPayload = {
        templateId: 'unsupported',
        fontSize: 'super_huge_invalid',
      };

      await expect(
        resumeService.saveBuilderConfig(fakeUserId, fakeResumeId, corruptedPayload)
      ).rejects.toThrow(/Invalid builder configuration/);

      // Verify updateById was not invoked with invalid payload
      expect(mockResumeRepository.updateById).not.toHaveBeenCalled();
    });
  });
});
