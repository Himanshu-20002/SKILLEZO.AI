import { describe, it, expect, vi, beforeEach } from 'vitest';
import { resumeService } from '@/services/resume.service';
import { ResumePortfolioResponse, CreateVariantInput } from '@/types/resume';

describe('Phase 5: Resume Portfolio & Variant Service Client Contracts', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('getResumePortfolio fetches portfolio summary metadata', async () => {
    const mockResponse: ResumePortfolioResponse = {
      master: {
        id: 'res_master_01',
        displayName: 'Master Resume',
        variantType: 'MASTER',
        targetJobTitle: 'Staff Engineer',
        targetCompany: '',
        parentResumeId: null,
        updatedAt: '2026-09-22T08:00:00.000Z',
        createdAt: '2026-09-20T08:00:00.000Z',
        sourceProfileVersion: 2,
        isMasterStale: false,
      },
      variants: [
        {
          id: 'res_variant_01',
          displayName: 'Fintech Specialist',
          variantType: 'TAILORED',
          targetJobTitle: 'Staff Backend Engineer',
          targetCompany: 'Stripe',
          parentResumeId: 'res_master_01',
          updatedAt: '2026-09-22T09:00:00.000Z',
          createdAt: '2026-09-22T09:00:00.000Z',
          sourceProfileVersion: 2,
          isMasterStale: false,
        },
      ],
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: mockResponse }),
    });

    const result = await resumeService.getResumePortfolio();

    expect(result.master?.id).toBe('res_master_01');
    expect(result.variants.length).toBe(1);
    expect(result.variants[0].displayName).toBe('Fintech Specialist');
    expect(result.variants[0].targetCompany).toBe('Stripe');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/resumes/portfolio'),
      expect.objectContaining({
        credentials: 'include',
      })
    );
  });

  it('createResumeVariant posts variant details without requiring targetJobId', async () => {
    const mockCreatedVariant = {
      _id: 'res_variant_02',
      userId: 'user_01',
      title: 'ML Platform Lead - Databricks',
      variantType: 'TAILORED',
      parentResumeId: 'res_master_01',
      targetJobTitle: 'ML Platform Lead',
      targetCompany: 'Databricks',
      createdAt: '2026-09-22T10:00:00.000Z',
      updatedAt: '2026-09-22T10:00:00.000Z',
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: mockCreatedVariant }),
    });

    const input: CreateVariantInput = {
      displayName: 'ML Platform Lead - Databricks',
      targetJobTitle: 'ML Platform Lead',
      targetCompany: 'Databricks',
    };

    const result = await resumeService.createResumeVariant(input);

    expect(result._id).toBe('res_variant_02');
    expect(result.title).toBe('ML Platform Lead - Databricks');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/resumes/variants'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(input),
      })
    );
  });

  it('renameResume reuses updateResume PATCH mechanism with trimmed title', async () => {
    const mockUpdatedResume = {
      _id: 'res_variant_01',
      title: 'Senior Distributed Systems Engineer',
      variantType: 'TAILORED',
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: mockUpdatedResume }),
    });

    const result = await resumeService.renameResume('res_variant_01', '  Senior Distributed Systems Engineer  ');

    expect(result.title).toBe('Senior Distributed Systems Engineer');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/resumes/res_variant_01'),
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ title: 'Senior Distributed Systems Engineer' }),
      })
    );
  });

  it('deleteResume calls DELETE /api/resumes/:resumeId', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, message: 'Deleted' }),
    });

    await resumeService.deleteResume('res_variant_01');

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/resumes/res_variant_01'),
      expect.objectContaining({
        method: 'DELETE',
      })
    );
  });
});
