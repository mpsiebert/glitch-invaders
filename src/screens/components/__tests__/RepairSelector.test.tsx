import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { RepairSelector } from '../RepairSelector';
import type { RepairOption } from '../../../types';

const mockRepairs: RepairOption[] = [
  {
    id: 0,
    title: 'Correct Repair Option',
    description: 'Fixes the issue properly.',
    codeSnippet: 'const fixed = true;',
    isCorrect: true,
    successExplanation: 'Patch applied successfully and passes all checks.',
  },
  {
    id: 1,
    title: 'Wrong Option 1',
    description: 'Superficial patch.',
    codeSnippet: 'const fixed = false;',
    isCorrect: false,
    incorrectFeedback: 'This patch only masks the symptom instead of fixing the root cause.',
  },
  {
    id: 2,
    title: 'Wrong Option 2',
    description: 'Broken workaround.',
    codeSnippet: 'throw new Error();',
    isCorrect: false,
    incorrectFeedback: 'This workaround causes a secondary error.',
  },
];

describe('RepairSelector Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders all repair options as accessible buttons', () => {
    render(
      <RepairSelector
        repairs={mockRepairs}
        onAttemptRepair={() => false}
        onApplyAndVerify={() => {}}
      />
    );

    const buttons = screen.getAllByRole('radio');
    expect(buttons).toHaveLength(3);
    expect(screen.getByText('Correct Repair Option')).toBeTruthy();
    expect(screen.getByText('Wrong Option 1')).toBeTruthy();
    expect(screen.getByText('Wrong Option 2')).toBeTruthy();
  });

  it('selecting an incorrect repair marks only that option as incorrect with contextual feedback', () => {
    const onAttemptRepair = vi.fn().mockReturnValue(false);
    render(
      <RepairSelector
        repairs={mockRepairs}
        onAttemptRepair={onAttemptRepair}
        onApplyAndVerify={() => {}}
      />
    );

    const wrongButton = screen.getByRole('radio', { name: /Wrong Option 1/i });
    fireEvent.click(wrongButton);

    // Fast forward applying timer (250ms)
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(onAttemptRepair).toHaveBeenCalledWith(1);
    expect(onAttemptRepair).toHaveBeenCalledTimes(1);

    // Wrong option has incorrect feedback
    expect(screen.getByText('This patch only masks the symptom instead of fixing the root cause.')).toBeTruthy();
    expect(screen.getByText('❌ Unsuccessful')).toBeTruthy();

    // Other options are NOT marked incorrect
    expect(screen.queryByText('This workaround causes a secondary error.')).toBeNull();
  });

  it('prevents duplicate attempt count when the same wrong option is clicked repeatedly', () => {
    const onAttemptRepair = vi.fn().mockReturnValue(false);
    render(
      <RepairSelector
        repairs={mockRepairs}
        onAttemptRepair={onAttemptRepair}
        onApplyAndVerify={() => {}}
      />
    );

    const wrongButton = screen.getByRole('radio', { name: /Wrong Option 1/i });

    // Click first time
    fireEvent.click(wrongButton);
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(onAttemptRepair).toHaveBeenCalledTimes(1);

    // Click second time on SAME wrong option
    fireEvent.click(wrongButton);
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // Should NOT call onAttemptRepair again
    expect(onAttemptRepair).toHaveBeenCalledTimes(1);
  });

  it('allows retrying with a different option after a failed attempt', () => {
    const onAttemptRepair = vi.fn().mockImplementation((id: number) => id === 0);
    render(
      <RepairSelector
        repairs={mockRepairs}
        onAttemptRepair={onAttemptRepair}
        onApplyAndVerify={() => {}}
      />
    );

    // Click wrong option 1
    fireEvent.click(screen.getByRole('radio', { name: /Wrong Option 1/i }));
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(onAttemptRepair).toHaveBeenCalledWith(1);

    // Click wrong option 2
    fireEvent.click(screen.getByRole('radio', { name: /Wrong Option 2/i }));
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(onAttemptRepair).toHaveBeenCalledWith(2);
    expect(onAttemptRepair).toHaveBeenCalledTimes(2);

    // Click correct option
    fireEvent.click(screen.getByRole('radio', { name: /Correct Repair Option/i }));
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(onAttemptRepair).toHaveBeenCalledWith(0);
    expect(onAttemptRepair).toHaveBeenCalledTimes(3);

    expect(screen.getByText('Patch applied successfully and passes all checks.')).toBeTruthy();
  });

  it('selecting the correct repair shows success feedback and "Apply Patch and Verify" action', () => {
    const onAttemptRepair = vi.fn().mockReturnValue(true);
    const onApplyAndVerify = vi.fn();

    render(
      <RepairSelector
        repairs={mockRepairs}
        onAttemptRepair={onAttemptRepair}
        onApplyAndVerify={onApplyAndVerify}
      />
    );

    const correctButton = screen.getByRole('radio', { name: /Correct Repair Option/i });
    fireEvent.click(correctButton);

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(onAttemptRepair).toHaveBeenCalledWith(0);
    expect(screen.getByText('✅ Patch Verified')).toBeTruthy();
    expect(screen.getByText('Patch applied successfully and passes all checks.')).toBeTruthy();

    // Click "Apply Patch and Verify →" button
    const verifyBtn = screen.getByText('Apply Patch and Verify →');
    fireEvent.click(verifyBtn);

    expect(onApplyAndVerify).toHaveBeenCalledTimes(1);
  });
});
