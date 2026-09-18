import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ActionService, CreateProposalDTO } from '@/services/action.service';

describe('Phase 7: Frontend Action Client Service Contract', () => {
  let service: ActionService;
  const originalFetch = global.fetch;

  beforeEach(() => {
    service = new ActionService('/api/ai/actions');
    vi.restoreAllMocks();
  });

  it('createProposal formats request body and returns parsed proposal', async () => {
    const mockProposal = {
      proposalId: 'prop_test_01',
      ownerId: 'user_01',
      actionType: 'RESUME_UPDATE',
      status: 'PROPOSED',
      title: 'Optimize Experience Section',
      description: 'Add metric-driven bullets',
      rationale: 'ATS score improvement',
      evidenceIds: ['ev_01'],
      targetEntity: { type: 'resume', id: 'res_01', version: 2 },
      preview: { before: 'Old', after: 'New' },
      payload: { resumeId: 'res_01', sectionId: 'experience' },
      expiresAt: '2026-09-19T12:00:00.000Z',
      createdAt: '2026-09-18T12:00:00.000Z',
      updatedAt: '2026-09-18T12:00:00.000Z',
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: mockProposal }),
    });

    const createDto: CreateProposalDTO = {
      actionType: 'RESUME_UPDATE',
      title: 'Optimize Experience Section',
      description: 'Add metric-driven bullets',
      rationale: 'ATS score improvement',
      evidenceIds: ['ev_01'],
      targetEntity: { type: 'resume', id: 'res_01', version: 2 },
      preview: { before: 'Old', after: 'New' },
      payload: { resumeId: 'res_01', sectionId: 'experience' },
    };

    const result = await service.createProposal(createDto);

    expect(result.proposalId).toBe('prop_test_01');
    expect(result.status).toBe('PROPOSED');
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/ai/actions/proposals',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify(createDto),
      })
    );
  });

  it('approveProposal attaches idempotencyKey header and payload', async () => {
    const mockActionResult = {
      proposalId: 'prop_test_01',
      status: 'COMPLETED',
      summary: 'Action executed successfully',
      affectedEntity: { type: 'resume', id: 'res_01' },
      verification: {
        verified: true,
        metrics: [{ metric: 'ATS Score', value: 85, delta: 12 }],
      },
      executedAt: '2026-09-18T12:05:00.000Z',
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: mockActionResult }),
    });

    const result = await service.approveProposal('prop_test_01', 'idemp_key_123');

    expect(result.status).toBe('COMPLETED');
    expect(result.verification.verified).toBe(true);
    expect(result.verification.metrics?.[0].delta).toBe(12);

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/ai/actions/prop_test_01/approve',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'idempotency-key': 'idemp_key_123',
        }),
        body: JSON.stringify({ idempotencyKey: 'idemp_key_123' }),
      })
    );
  });

  it('rejectProposal transmits rejection reason cleanly', async () => {
    const mockRejectedProposal = {
      proposalId: 'prop_test_01',
      status: 'REJECTED',
      error: 'Not applicable to current career goals',
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: mockRejectedProposal }),
    });

    const result = await service.rejectProposal(
      'prop_test_01',
      'Not applicable to current career goals'
    );

    expect(result.status).toBe('REJECTED');
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/ai/actions/prop_test_01/reject',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ reason: 'Not applicable to current career goals' }),
      })
    );
  });

  it('handles stale or expired rejection errors honestly', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({
        success: false,
        message: 'This proposal has expired. Please generate a fresh recommendation.',
      }),
    });

    await expect(service.approveProposal('prop_expired')).rejects.toThrow(
      'This proposal has expired. Please generate a fresh recommendation.'
    );
  });

  it('lists proposals with status filtering query param', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: [] }),
    });

    await service.listProposals('PROPOSED');

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/ai/actions/proposals?status=PROPOSED',
      expect.objectContaining({
        method: 'GET',
        credentials: 'include',
      })
    );
  });
});
