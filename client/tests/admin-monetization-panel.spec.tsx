// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AdminMonetizationPanel } from '../components/dashboard/admin/AdminMonetizationPanel';
import { adminService, AdminMonetizationConfig } from '../services/admin.service';

const mockConfig: AdminMonetizationConfig = {
  pricing: {
    sprintPass7Day: {
      amountInRupees: 199,
      amountInPaise: 19900,
      isActive: true,
      name: '7-Day Sprint Pass',
      description: 'Full unlimited access for 7 days',
    },
    proMonthly: {
      amountInRupees: 499,
      amountInPaise: 49900,
      isActive: true,
      name: 'SKILLEZO Pro Monthly',
      description: 'Continuous unlimited practice',
    },
    proYearly: {
      amountInRupees: 3999,
      amountInPaise: 399900,
      isActive: true,
      name: 'SKILLEZO Pro Annual',
      description: '12 months access with 33% discount',
    },
  },
  interviewQuotas: {
    freeMonthlySessions: 1,
    freeMaxQuestionsPerSession: 5,
    freeMaxAnswerSeconds: 180,
    lockModelAnswersForFree: true,
    enableVoiceForFree: true,
    enableVideoForFree: true,
  },
  resumeQuotas: {
    freeMaxResumes: 1,
    freeMonthlyAtsScans: 2,
    lockDocxExportForFree: true,
    lockCoverLetterAiForFree: true,
    lockMultiJobTailoringForFree: true,
  },
  globalSettings: {
    promoBannerActive: false,
    promoBannerText: 'Placement Season Sprint: Unlock 7-Day Pro for just ₹199!',
    updatedByAdminEmail: 'admin@skillezo.ai',
  },
};

vi.mock('../services/admin.service', () => ({
  adminService: {
    getMonetizationConfig: vi.fn(),
    updateMonetizationConfig: vi.fn(),
    resetMonetizationConfig: vi.fn(),
  },
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('AdminMonetizationPanel Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (adminService.getMonetizationConfig as any).mockResolvedValue(mockConfig);
    (adminService.updateMonetizationConfig as any).mockImplementation(async (c: any) => c);
    (adminService.resetMonetizationConfig as any).mockResolvedValue(mockConfig);
    vi.spyOn(window, 'confirm').mockReturnValue(true);
  });

  it('loads and displays dynamic monetization configuration', async () => {
    render(<AdminMonetizationPanel />);

    // Shows loading initially
    expect(screen.getByText(/Loading dynamic monetization engine/)).toBeDefined();

    // After loading resolves
    await waitFor(() => {
      expect(screen.getByText('Monetization & Quota Control')).toBeDefined();
    });

    const sprintInput = screen.getByTestId('input-sprint-pass-price') as HTMLInputElement;
    expect(sprintInput.value).toBe('199');

    const proMonthlyInput = screen.getByTestId('input-pro-monthly-price') as HTMLInputElement;
    expect(proMonthlyInput.value).toBe('499');

    const freeSessionsInput = screen.getByTestId('input-free-monthly-sessions') as HTMLInputElement;
    expect(freeSessionsInput.value).toBe('1');
  });

  it('updates price and saves configuration via adminService', async () => {
    render(<AdminMonetizationPanel />);

    await waitFor(() => {
      expect(screen.getByTestId('input-sprint-pass-price')).toBeDefined();
    });

    const sprintInput = screen.getByTestId('input-sprint-pass-price');
    fireEvent.change(sprintInput, { target: { value: '249' } });

    const saveBtn = screen.getByTestId('btn-save-monetization');
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(adminService.updateMonetizationConfig).toHaveBeenCalledTimes(1);
      const callArg = (adminService.updateMonetizationConfig as any).mock.calls[0][0];
      expect(callArg.pricing.sprintPass7Day.amountInRupees).toBe(249);
      expect(callArg.pricing.sprintPass7Day.amountInPaise).toBe(24900);
    });
  });

  it('toggles lock model answers and resets defaults on confirmation', async () => {
    render(<AdminMonetizationPanel />);

    await waitFor(() => {
      expect(screen.getByTestId('toggle-lock-model-answers')).toBeDefined();
    });

    const toggle = screen.getByTestId('toggle-lock-model-answers') as HTMLInputElement;
    expect(toggle.checked).toBe(true);
    fireEvent.click(toggle);
    expect(toggle.checked).toBe(false);

    const resetBtn = screen.getByTestId('btn-reset-monetization');
    fireEvent.click(resetBtn);

    await waitFor(() => {
      expect(adminService.resetMonetizationConfig).toHaveBeenCalledTimes(1);
    });
  });
});
