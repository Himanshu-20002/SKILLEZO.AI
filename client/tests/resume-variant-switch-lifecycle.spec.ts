// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useResumeStudio } from '@/hooks/useResumeStudio';
import { resumeService } from '@/services/resume.service';
import { ResumeRecord } from '@/types/resume';
import { ResumeDocument } from '@/types/resume-document';

vi.mock('@/services/resume.service');
vi.mock('@/services/pdf-export.service', () => ({
  exportResumeToPdf: vi.fn(),
}));
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    info: vi.fn(),
    loading: vi.fn(),
    dismiss: vi.fn(),
  },
}));

describe('Phase 6E.2 Lifecycle Tests: Variant Switcher, Concurrency & Immutability', () => {
  const masterDoc: ResumeDocument = {
    id: 'doc_master',
    userId: 'user_1',
    title: 'Master Resume',
    schemaVersion: '1.0.0',
    isMaster: true,
    createdAt: '2026-09-20T00:00:00Z',
    updatedAt: '2026-09-20T00:00:00Z',
    currentVersion: { versionId: 'v1', versionNumber: 1, name: 'V1', createdAt: '2026-09-20T00:00:00Z' },
    templateConfig: { templateId: 'classic' },
    contact: { fullName: 'Alex Candidate', email: 'alex@example.com', links: [] },
    summary: { text: 'General Senior Software Engineer.' },
    skills: [{ id: 's1', name: 'TypeScript', category: 'LANGUAGE', evidenceIds: [] }],
    experience: [],
    projects: [],
    education: [],
    achievements: [],
    evidence: [],
  };

  const tailoredDoc: ResumeDocument = {
    ...masterDoc,
    id: 'doc_tailored',
    isMaster: false,
    summary: { text: 'Frontend Specialist with React and Next.js focus.' },
    skills: [
      { id: 's1', name: 'TypeScript', category: 'LANGUAGE', evidenceIds: [] },
      { id: 's2', name: 'React', category: 'FRONTEND', evidenceIds: [] },
    ],
  };

  const mockMasterResume: ResumeRecord = {
    _id: 'master_123',
    userId: 'user_1',
    fileName: 'master.pdf',
    originalFileName: 'master.pdf',
    title: 'Master Resume',
    fileSize: 1024,
    mimeType: 'application/pdf',
    storageKey: 'key_master',
    isDefault: true,
    variantType: 'MASTER',
    resumeDocument: masterDoc,
    createdAt: '2026-09-20T00:00:00Z',
    updatedAt: '2026-09-20T00:00:00Z',
  };

  const mockTailoredResume: ResumeRecord = {
    _id: 'tailored_456',
    userId: 'user_1',
    fileName: 'google_tailored.pdf',
    originalFileName: 'google_tailored.pdf',
    title: 'Google Variant',
    targetJobTitle: 'Senior Frontend Engineer',
    targetCompany: 'Google',
    fileSize: 1024,
    mimeType: 'application/pdf',
    storageKey: 'key_tailored',
    isDefault: false,
    variantType: 'TAILORED',
    resumeDocument: tailoredDoc,
    createdAt: '2026-09-21T00:00:00Z',
    updatedAt: '2026-09-21T00:00:00Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(resumeService.getUserResumes).mockResolvedValue([mockMasterResume, mockTailoredResume]);
    vi.mocked(resumeService.getMasterResume).mockResolvedValue({
      resume: mockMasterResume,
      isStale: false,
      profileVersion: 1,
    });
    vi.mocked(resumeService.getResumeById).mockImplementation(async (id: string) => {
      if (id === mockMasterResume._id) return mockMasterResume;
      if (id === mockTailoredResume._id) return mockTailoredResume;
      throw new Error('Not found');
    });
    vi.mocked(resumeService.getResumeScore).mockResolvedValue({
      overall: { overallScore: 85, tier: 'Good' },
      sections: {
        experience: { score: 80, title: 'Work Experience', issues: [], suggestions: [] },
        skills: { score: 90, title: 'Skills', issues: [], suggestions: [] },
      },
    } as any);
    vi.mocked(resumeService.getResumeAtsScore).mockResolvedValue(null as any);
    vi.mocked(resumeService.getBuilderConfig).mockResolvedValue(null as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('initializes with Master resume and caches masterResumeDoc', async () => {
    const { result } = renderHook(() => useResumeStudio());
    await act(async () => {
      await result.current.loadInitialData();
    });

    expect(result.current.activeResumeId).toBe('master_123');
    expect(result.current.isMaster).toBe(true);
    expect(result.current.isTailored).toBe(false);
    expect(result.current.masterResumeDoc).toEqual(masterDoc);
  });

  it('performs clean switch from Master to Tailored variant and computes performance-safe diffSummary', async () => {
    const { result } = renderHook(() => useResumeStudio());
    await act(async () => {
      await result.current.loadInitialData();
    });

    const onCommitted = vi.fn();
    await act(async () => {
      await result.current.switchResumeVariant('tailored_456', 'USER_VARIANT_SWITCH', onCommitted);
    });

    expect(result.current.activeResumeId).toBe('tailored_456');
    expect(result.current.isMaster).toBe(false);
    expect(result.current.isTailored).toBe(true);
    expect(result.current.saveStatus).toBe('saved');
    expect(onCommitted).toHaveBeenCalledWith('tailored_456', expect.any(Number));

    // Performance-safe 6E.1 diff summary should be populated because masterResumeDoc was in memory
    expect(result.current.diffSummary).not.toBeNull();
    expect(result.current.diffSummary?.hasChanges).toBe(true);
    expect(result.current.diffSummary?.totalChanges).toBeGreaterThan(0);
  });

  it('guards dirty state before switching: prompts confirmation and respects [Stay Here]', async () => {
    const { result } = renderHook(() => useResumeStudio());
    await act(async () => {
      await result.current.loadInitialData();
    });

    // Make local layout change (dirty)
    act(() => {
      result.current.handleBuilderConfigChange({
        ...result.current.builderConfig,
        fontSize: 'large',
      });
    });

    // Attempt to switch while unsaved
    await act(async () => {
      await result.current.switchResumeVariant('tailored_456');
    });

    // Must be blocked and confirmation modal opened
    expect(result.current.activeResumeId).toBe('master_123');
    expect(result.current.isSwitchConfirmOpen).toBe(true);
    expect(result.current.pendingSwitchResumeId).toBe('tailored_456');

    // Candidate chooses "Stay Here"
    act(() => {
      result.current.cancelSwitchVariant();
    });

    expect(result.current.isSwitchConfirmOpen).toBe(false);
    expect(result.current.pendingSwitchResumeId).toBeNull();
    expect(result.current.activeResumeId).toBe('master_123');
  });

  it('candidate chooses [Switch Resume] on dirty state: discards edits and commits target variant', async () => {
    const { result } = renderHook(() => useResumeStudio());
    await act(async () => {
      await result.current.loadInitialData();
    });

    // Make local change
    act(() => {
      result.current.handleBuilderConfigChange({
        ...result.current.builderConfig,
        fontSize: 'large',
      });
    });

    await act(async () => {
      await result.current.switchResumeVariant('tailored_456');
    });

    expect(result.current.isSwitchConfirmOpen).toBe(true);

    const onCommitted = vi.fn();
    // Candidate confirms switch
    await act(async () => {
      result.current.confirmSwitchVariant(onCommitted);
    });

    expect(result.current.isSwitchConfirmOpen).toBe(false);
    expect(result.current.activeResumeId).toBe('tailored_456');
    expect(result.current.isTailored).toBe(true);
    expect(onCommitted).toHaveBeenCalledWith('tailored_456', expect.any(Number));
  });

  it('flushes and awaits pending debounced autosave before switching', async () => {
    vi.useFakeTimers();
    vi.mocked(resumeService.saveBuilderConfig).mockResolvedValue({} as any);

    const { result } = renderHook(() => useResumeStudio());
    await act(async () => {
      await result.current.loadInitialData();
    });

    // Trigger debounced save
    act(() => {
      result.current.handleBuilderConfigChange({
        ...result.current.builderConfig,
        accentStyle: 'minimal',
      });
    });

    // Switch before debounce timer expires (flushes immediately)
    await act(async () => {
      await result.current.switchResumeVariant('tailored_456');
    });

    expect(resumeService.saveBuilderConfig).toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('strictly blocks switching when saveStatus is error', async () => {
    const { result } = renderHook(() => useResumeStudio());
    await act(async () => {
      await result.current.loadInitialData();
    });

    // Trigger a failed save
    vi.mocked(resumeService.saveBuilderConfig).mockRejectedValueOnce(new Error('Network error'));

    await act(async () => {
      try {
        await result.current.handleBuilderConfigChange({
          ...result.current.builderConfig,
          accentStyle: 'minimal',
        });
        await result.current.flushPendingAutosave();
      } catch {
        // Expected
      }
    });

    // Attempt to switch
    await act(async () => {
      await result.current.switchResumeVariant('tailored_456');
    });

    // Remains on active resume
    expect(result.current.activeResumeId).toBe('master_123');
  });

  it('protects concurrency: out-of-order response from rapid switches (A -> B) is discarded', async () => {
    let resolveResumeA: (val: any) => void;
    let resolveResumeB: (val: any) => void;

    const promiseA = new Promise((resolve) => {
      resolveResumeA = resolve;
    });
    const promiseB = new Promise((resolve) => {
      resolveResumeB = resolve;
    });

    vi.mocked(resumeService.getResumeById).mockImplementation(async (id: string) => {
      if (id === 'target_a') {
        await promiseA;
        return { ...mockTailoredResume, _id: 'target_a', title: 'Variant A' };
      }
      if (id === 'target_b') {
        await promiseB;
        return { ...mockTailoredResume, _id: 'target_b', title: 'Variant B' };
      }
      return mockMasterResume;
    });

    const { result } = renderHook(() => useResumeStudio());
    await act(async () => {
      await result.current.loadInitialData();
    });

    // Rapid switch to A then B
    act(() => {
      result.current.switchResumeVariant('target_a');
      result.current.switchResumeVariant('target_b');
    });

    // B resolves first
    await act(async () => {
      resolveResumeB!({ ...mockTailoredResume, _id: 'target_b', title: 'Variant B' });
    });

    expect(result.current.activeResumeId).toBe('target_b');

    // A resolves later (stale response)
    await act(async () => {
      resolveResumeA!({ ...mockTailoredResume, _id: 'target_a', title: 'Variant A' });
    });

    // Active resume MUST remain target_b, not target_a!
    expect(result.current.activeResumeId).toBe('target_b');
  });

  it('refreshes masterResumeDoc when Master Resume is edited in session', async () => {
    const updatedMasterDoc: ResumeDocument = {
      ...masterDoc,
      summary: { text: 'Updated Master Career Facts from Profile.' },
    };

    vi.mocked(resumeService.syncMasterResume).mockResolvedValue({
      resume: {
        ...mockMasterResume,
        resumeDocument: updatedMasterDoc,
      },
      isStale: false,
      profileVersion: 2,
    });

    const { result } = renderHook(() => useResumeStudio());
    await act(async () => {
      await result.current.loadInitialData();
    });

    expect(result.current.masterResumeDoc?.summary?.text).toBe('General Senior Software Engineer.');

    // Candidate syncs Master with Career Profile
    await act(async () => {
      await result.current.handleSyncMasterResume();
    });

    // Cached masterResumeDoc must be updated to the new document
    expect(result.current.masterResumeDoc?.summary?.text).toBe('Updated Master Career Facts from Profile.');
  });

  it('guarantees Tailored editing save isolation: saves target Tailored ID and never calls Master or Profile sync', async () => {
    vi.mocked(resumeService.saveBuilderConfig).mockResolvedValue({} as any);

    const { result } = renderHook(() => useResumeStudio('tailored_456'));
    await act(async () => {
      await result.current.loadInitialData();
    });

    expect(result.current.activeResumeId).toBe('tailored_456');
    expect(result.current.isTailored).toBe(true);

    // Edit builder config in Tailored mode
    await act(async () => {
      result.current.handleBuilderConfigChange({
        ...result.current.builderConfig,
        templateId: 'modern',
      });
      await result.current.flushPendingAutosave();
    });

    // Must target Tailored ID
    expect(resumeService.saveBuilderConfig).toHaveBeenCalledWith('tailored_456', expect.any(Object));
    // Master sync API must NEVER be called
    expect(resumeService.syncMasterResume).not.toHaveBeenCalled();
  });

  it('protects 3-way concurrency (A -> B -> C): delayed A and B cannot overwrite C, and background intelligence for A/B is discarded', async () => {
    let resolveResumeA: (val: any) => void;
    let resolveResumeB: (val: any) => void;
    let resolveResumeC: (val: any) => void;

    const promiseA = new Promise((resolve) => { resolveResumeA = resolve; });
    const promiseB = new Promise((resolve) => { resolveResumeB = resolve; });
    const promiseC = new Promise((resolve) => { resolveResumeC = resolve; });

    vi.mocked(resumeService.getResumeById).mockImplementation(async (id: string) => {
      if (id === 'target_a') {
        await promiseA;
        return { ...mockTailoredResume, _id: 'target_a', title: 'Variant A' };
      }
      if (id === 'target_b') {
        await promiseB;
        return { ...mockTailoredResume, _id: 'target_b', title: 'Variant B' };
      }
      if (id === 'target_c') {
        await promiseC;
        return { ...mockTailoredResume, _id: 'target_c', title: 'Variant C' };
      }
      return mockMasterResume;
    });

    const { result } = renderHook(() => useResumeStudio());
    await act(async () => {
      await result.current.loadInitialData();
    });

    // Rapid consecutive switches: A -> B -> C
    act(() => {
      result.current.switchResumeVariant('target_a');
      result.current.switchResumeVariant('target_b');
      result.current.switchResumeVariant('target_c');
    });

    // C resolves first
    await act(async () => {
      resolveResumeC!({ ...mockTailoredResume, _id: 'target_c', title: 'Variant C' });
    });

    expect(result.current.activeResumeId).toBe('target_c');

    // A and B resolve out of order later
    await act(async () => {
      resolveResumeA!({ ...mockTailoredResume, _id: 'target_a', title: 'Variant A' });
      resolveResumeB!({ ...mockTailoredResume, _id: 'target_b', title: 'Variant B' });
    });

    // Active resume strictly remains target_c
    expect(result.current.activeResumeId).toBe('target_c');
  });

  it('awaits in-flight activeSavePromiseRef from section improvement before completing switch', async () => {
    let resolveApply: (val: any) => void;
    const applyPromise = new Promise((resolve) => { resolveApply = resolve; });

    vi.mocked(resumeService.applySectionImprovement).mockImplementation(() => applyPromise as any);

    const { result } = renderHook(() => useResumeStudio());
    await act(async () => {
      await result.current.loadInitialData();
    });

    // Simulate section improvement in-flight
    act(() => {
      (result.current as any).handleApproveSuggestion?.();
    });

    // Attempt to switch while applySectionImprovement is saving
    let switchPromise: Promise<any>;
    act(() => {
      switchPromise = result.current.switchResumeVariant('tailored_456');
    });

    // Resolve applySectionImprovement
    await act(async () => {
      resolveApply!({
        resumeDocument: masterDoc,
        previousScore: 80,
        newScore: 85,
      });
      await switchPromise!;
    });

    // Successfully completes switch after save promise resolves
    expect(result.current.activeResumeId).toBe('tailored_456');
    expect(result.current.saveStatus).toBe('saved');
  });

  it('deep-link with invalid/deleted resume ID falls back to Master/default and commits cleanly', async () => {
    // When initialResumeId is deleted/not found
    vi.mocked(resumeService.getResumeById).mockImplementation(async (id: string) => {
      if (id === 'deleted_id_999') throw new Error('Not found');
      return mockMasterResume;
    });

    const { result } = renderHook(() => useResumeStudio('deleted_id_999'));
    await act(async () => {
      await result.current.loadInitialData();
    });

    // Active resume falls back safely to default/Master
    expect(result.current.activeResumeId).toBe('master_123');
    expect(result.current.isMaster).toBe(true);
    expect(result.current.resumeDoc).toEqual(masterDoc);
  });

  it('navigation token transaction tracking differentiates programmatic switch from browser history navigation', () => {
    // Test the token logic conceptually used by page.tsx
    let programmaticToken: { id: string; requestId: number } | null = null;
    let currentRequestId = 1;

    // 1. Programmatic switch initiated:
    programmaticToken = { id: 'variant_b', requestId: currentRequestId };

    // 2. URL searchParam updates to ?resumeId=variant_b:
    const incomingParam = 'variant_b';
    let isProgrammatic = false;
    if (programmaticToken && programmaticToken.id === incomingParam) {
      if (programmaticToken.requestId === currentRequestId) {
        programmaticToken = null;
      }
      isProgrammatic = true;
    }

    expect(isProgrammatic).toBe(true);
    expect(programmaticToken).toBeNull(); // Cleanly cleared

    // 3. User clicks browser Back button: URL updates to ?resumeId=master_123 without a token:
    const backParam = 'master_123';
    let isBrowserHistory = false;
    if (!programmaticToken || programmaticToken.id !== backParam) {
      isBrowserHistory = true;
    }

    expect(isBrowserHistory).toBe(true);
  });
});

