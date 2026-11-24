// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DashboardFooter } from '../components/layout/DashboardFooter';

describe('DashboardFooter Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders corporate attribution, copyright and action buttons without privacy/terms/security links', () => {
    render(<DashboardFooter />);

    expect(screen.getByTestId('dashboard-footer')).toBeDefined();
    expect(screen.getByText(/All rights reserved/i)).toBeDefined();
    expect(screen.getByText(/SKILLEDHYRE LABS/i)).toBeDefined();
    expect(screen.getByText(/DEVAADYA TECHNOLOGIES PRIVATE LIMITED/i)).toBeDefined();

    // Verify Help & Feedback buttons are present
    expect(screen.getByTestId('footer-help-btn')).toBeDefined();
    expect(screen.getByTestId('footer-feedback-btn')).toBeDefined();

    // Verify Privacy, Terms, and Security links are removed as requested
    expect(screen.queryByText('Privacy')).toBeNull();
    expect(screen.queryByText('Terms')).toBeNull();
    expect(screen.queryByText('Security')).toBeNull();
  });

  it('opens and closes the Help dialog on button click', async () => {
    render(<DashboardFooter />);

    const helpBtn = screen.getByTestId('footer-help-btn');
    fireEvent.click(helpBtn);

    expect(screen.getByTestId('help-modal')).toBeDefined();
    expect(screen.getByText('Help & Resources')).toBeDefined();
    expect(screen.getByText(/support@skillezo.com/i)).toBeDefined();

    // Close button
    const closeBtn = screen.getByText('Close');
    fireEvent.click(closeBtn);

    await waitFor(() => {
      expect(screen.queryByTestId('help-modal')).toBeNull();
    });
  });

  it('opens Feedback dialog, fills text, and submits successfully', async () => {
    render(<DashboardFooter />);

    const feedbackBtn = screen.getByTestId('footer-feedback-btn');
    fireEvent.click(feedbackBtn);

    expect(screen.getByTestId('feedback-modal')).toBeDefined();
    expect(screen.getByText('Share Your Feedback')).toBeDefined();

    const textarea = screen.getByPlaceholderText(/Tell us what you liked/i);
    fireEvent.change(textarea, { target: { value: 'Love the new FTUX dashboard tour!' } });

    const submitBtn = screen.getByTestId('feedback-submit-btn');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.queryByTestId('feedback-modal')).toBeNull();
    });
  });
});
