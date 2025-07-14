import React from 'react';
import {describe, it, expect, vi} from 'vitest';
import {render} from 'ink-testing-library';
import {useInput} from 'ink';
import {ConfirmationDialog} from './ConfirmationDialog.js';

// Mock useInput hook for testing
vi.mock('ink', async () => {
	const actual = await vi.importActual('ink');
	return {
		...actual,
		useInput: vi.fn(),
	};
});

describe('ConfirmationDialog', () => {
	it('should render confirmation dialog with message', () => {
		const onConfirm = vi.fn();
		const onCancel = vi.fn();

		const {lastFrame} = render(
			<ConfirmationDialog
				message="Clear all cache?"
				onConfirm={onConfirm}
				onCancel={onCancel}
			/>,
		);

		expect(lastFrame()).toContain('Clear all cache?');
		expect(lastFrame()).toContain('(y/N)');
	});

	it('should display proper prompt format', () => {
		const onConfirm = vi.fn();
		const onCancel = vi.fn();

		const {lastFrame} = render(
			<ConfirmationDialog
				message="Delete resource?"
				onConfirm={onConfirm}
				onCancel={onCancel}
			/>,
		);

		const output = lastFrame();
		expect(output).toContain('Delete resource?');
		expect(output).toContain('(y/N)');
		// Should be on same line or properly formatted
		expect(output).toMatch(/Delete resource\?\s*\(y\/N\)/);
	});

	it('should render with custom styling', () => {
		const onConfirm = vi.fn();
		const onCancel = vi.fn();

		const {lastFrame} = render(
			<ConfirmationDialog
				message="Continue?"
				onConfirm={onConfirm}
				onCancel={onCancel}
			/>,
		);

		const output = lastFrame();
		// Test should pass regardless of specific styling
		expect(output).toBeTruthy();
		expect(output).toContain('Continue?');
	});

	it('should call onConfirm when y is pressed', () => {
		const onConfirm = vi.fn();
		const onCancel = vi.fn();

		// Mock useInput to simulate key press
		const mockUseInput = vi.mocked(useInput);

		mockUseInput.mockImplementation(callback => {
			// Simulate 'y' key press
			callback('y', {});
		});

		render(
			<ConfirmationDialog
				message="Confirm?"
				onConfirm={onConfirm}
				onCancel={onCancel}
			/>,
		);

		expect(onConfirm).toHaveBeenCalledTimes(1);
		expect(onCancel).not.toHaveBeenCalled();
	});

	it('should call onConfirm when Y is pressed', () => {
		const onConfirm = vi.fn();
		const onCancel = vi.fn();

		const mockUseInput = vi.mocked(useInput);

		mockUseInput.mockImplementation(callback => {
			// Simulate 'Y' key press
			callback('Y', {});
		});

		render(
			<ConfirmationDialog
				message="Confirm?"
				onConfirm={onConfirm}
				onCancel={onCancel}
			/>,
		);

		expect(onConfirm).toHaveBeenCalledTimes(1);
		expect(onCancel).not.toHaveBeenCalled();
	});

	it('should call onCancel when n is pressed', () => {
		const onConfirm = vi.fn();
		const onCancel = vi.fn();

		const mockUseInput = vi.mocked(useInput);

		mockUseInput.mockImplementation(callback => {
			// Simulate 'n' key press
			callback('n', {});
		});

		render(
			<ConfirmationDialog
				message="Confirm?"
				onConfirm={onConfirm}
				onCancel={onCancel}
			/>,
		);

		expect(onCancel).toHaveBeenCalledTimes(1);
		expect(onConfirm).not.toHaveBeenCalled();
	});

	it('should call onCancel when N is pressed', () => {
		const onConfirm = vi.fn();
		const onCancel = vi.fn();

		const mockUseInput = vi.mocked(useInput);

		mockUseInput.mockImplementation(callback => {
			// Simulate 'N' key press
			callback('N', {});
		});

		render(
			<ConfirmationDialog
				message="Confirm?"
				onConfirm={onConfirm}
				onCancel={onCancel}
			/>,
		);

		expect(onCancel).toHaveBeenCalledTimes(1);
		expect(onConfirm).not.toHaveBeenCalled();
	});

	it('should call onCancel when Escape is pressed', () => {
		const onConfirm = vi.fn();
		const onCancel = vi.fn();

		const mockUseInput = vi.mocked(useInput);

		mockUseInput.mockImplementation(callback => {
			// Simulate Escape key press
			callback('', {escape: true});
		});

		render(
			<ConfirmationDialog
				message="Confirm?"
				onConfirm={onConfirm}
				onCancel={onCancel}
			/>,
		);

		expect(onCancel).toHaveBeenCalledTimes(1);
		expect(onConfirm).not.toHaveBeenCalled();
	});

	it('should call onCancel when Enter is pressed (default to No)', () => {
		const onConfirm = vi.fn();
		const onCancel = vi.fn();

		const mockUseInput = vi.mocked(useInput);

		mockUseInput.mockImplementation(callback => {
			// Simulate Enter key press
			callback('', {return: true});
		});

		render(
			<ConfirmationDialog
				message="Confirm?"
				onConfirm={onConfirm}
				onCancel={onCancel}
			/>,
		);

		expect(onCancel).toHaveBeenCalledTimes(1);
		expect(onConfirm).not.toHaveBeenCalled();
	});

	it('should ignore other key presses', () => {
		const onConfirm = vi.fn();
		const onCancel = vi.fn();

		const mockUseInput = vi.mocked(useInput);

		mockUseInput.mockImplementation(callback => {
			// Simulate random key press
			callback('x', {});
		});

		render(
			<ConfirmationDialog
				message="Confirm?"
				onConfirm={onConfirm}
				onCancel={onCancel}
			/>,
		);

		expect(onConfirm).not.toHaveBeenCalled();
		expect(onCancel).not.toHaveBeenCalled();
	});

	it('should use isActive option for useInput in test environment', () => {
		const onConfirm = vi.fn();
		const onCancel = vi.fn();

		const mockUseInput = vi.mocked(useInput);

		render(
			<ConfirmationDialog
				message="Confirm?"
				onConfirm={onConfirm}
				onCancel={onCancel}
			/>,
		);

		// Verify that useInput was called with isActive: false in test environment
		expect(mockUseInput).toHaveBeenCalledWith(
			expect.any(Function),
			expect.objectContaining({
				isActive: false,
			}),
		);
	});
});
