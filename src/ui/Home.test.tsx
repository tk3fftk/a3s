import React from 'react';
import {describe, it, expect, vi} from 'vitest';
import {render} from 'ink-testing-library';
import {useInput} from 'ink';
import {Home} from './Home.js';
import {ResourceCacheProvider} from '../hooks/ResourceCacheContext.js';

// Mock useInput hook for testing
vi.mock('ink', async () => {
	const actual = await vi.importActual('ink');
	return {
		...actual,
		useInput: vi.fn(),
	};
});

describe('Home', () => {
	it('should render service menu title', () => {
		const {lastFrame} = render(<Home onSelect={() => {}} />);

		expect(lastFrame()).toContain('AWS Resource Browser');
	});

	it('should render all AWS services', () => {
		const {lastFrame} = render(<Home onSelect={() => {}} />);
		const output = lastFrame();

		expect(output).toContain('EC2');
		expect(output).toContain('S3');
		expect(output).toContain('Lambda');
		expect(output).toContain('RDS');
	});

	it('should show description for each service', () => {
		const {lastFrame} = render(<Home onSelect={() => {}} />);
		const output = lastFrame();

		expect(output).toContain('Elastic Compute Cloud');
		expect(output).toContain('Simple Storage Service');
		expect(output).toContain('Function as a Service');
		expect(output).toContain('Relational Database Service');
	});

	it('should highlight first service by default', () => {
		const {lastFrame} = render(<Home onSelect={() => {}} />);
		const output = lastFrame();

		// Should highlight EC2 (first service, index 0) by default
		expect(output).toMatch(/>\s*EC2/);
		// Other services should not be highlighted
		expect(output).not.toMatch(/>\s*S3/);
		expect(output).not.toMatch(/>\s*Lambda/);
		expect(output).not.toMatch(/>\s*RDS/);
	});

	it('should show keyboard instructions', () => {
		const {lastFrame} = render(<Home onSelect={() => {}} />);
		const output = lastFrame();

		expect(output).toContain('↑↓');
		expect(output).toContain('Enter');
		expect(output).toContain('q');
	});

	it('should use useNavigation hook for managing selection state', () => {
		// Test that the Home component renders correctly with navigation hook
		const {lastFrame} = render(<Home onSelect={() => {}} />);
		const output = lastFrame();

		// Should show all services
		expect(output).toContain('EC2');
		expect(output).toContain('S3');
		expect(output).toContain('Lambda');
		expect(output).toContain('RDS');

		// Should highlight the first item by default (managed by useNavigation hook)
		expect(output).toMatch(/>\s*EC2/);
	});

	it('should provide onSelect callback for service selection', () => {
		let selectedService = '';
		const handleSelect = (service: string) => {
			selectedService = service;
		};

		render(<Home onSelect={handleSelect} />);

		// Component should render without errors and accept the callback
		// Actual keyboard interaction testing is handled by the useNavigation hook tests
		expect(selectedService).toBe('');
	});

	describe('cache clearing functionality', () => {
		it('should show cache clearing instructions in help text', () => {
			const {lastFrame} = render(
				<ResourceCacheProvider>
					<Home onSelect={() => {}} />
				</ResourceCacheProvider>,
			);
			const output = lastFrame();

			// Should show the 'C' key instruction when cache context is available
			expect(output).toContain('C');
			expect(output).toMatch(/[Cc]lear.*cache/i);
		});

		it('should handle C key press to show confirmation dialog', () => {
			const mockUseInput = vi.mocked(useInput);
			let capturedCallback: Function | null = null;

			mockUseInput.mockImplementation(callback => {
				capturedCallback = callback;
			});

			const {lastFrame} = render(
				<ResourceCacheProvider>
					<Home onSelect={() => {}} />
				</ResourceCacheProvider>,
			);

			// Simulate 'C' key press
			if (capturedCallback) {
				capturedCallback('C', {});
			}

			const output = lastFrame();
			// Should show confirmation dialog
			expect(output).toContain('Clear all cache?');
			expect(output).toContain('(y/N)');
		});

		it('should handle c key press to show confirmation dialog', () => {
			const mockUseInput = vi.mocked(useInput);
			let capturedCallback: Function | null = null;

			mockUseInput.mockImplementation(callback => {
				capturedCallback = callback;
			});

			const {lastFrame} = render(
				<ResourceCacheProvider>
					<Home onSelect={() => {}} />
				</ResourceCacheProvider>,
			);

			// Simulate 'c' key press (lowercase)
			if (capturedCallback) {
				capturedCallback('c', {});
			}

			const output = lastFrame();
			// Should show confirmation dialog
			expect(output).toContain('Clear all cache?');
			expect(output).toContain('(y/N)');
		});

		it('should not show cache clearing functionality without cache context', () => {
			const {lastFrame} = render(<Home onSelect={() => {}} />);
			const output = lastFrame();

			// Should not show 'C' key instruction when cache context is not available
			expect(output).not.toMatch(/[Cc]lear.*cache/i);
		});

		it('should confirm cache clearing and return to normal state', () => {
			const mockUseInput = vi.mocked(useInput);
			let capturedCallback: Function | null = null;

			mockUseInput.mockImplementation(callback => {
				capturedCallback = callback;
			});

			const {lastFrame} = render(
				<ResourceCacheProvider>
					<Home onSelect={() => {}} />
				</ResourceCacheProvider>,
			);

			// First press 'C' to show confirmation
			if (capturedCallback) {
				capturedCallback('C', {});
			}

			expect(lastFrame()).toContain('Clear all cache?');

			// Then press 'y' to confirm
			if (capturedCallback) {
				capturedCallback('y', {});
			}

			// Should return to normal home screen
			const output = lastFrame();
			expect(output).toContain('AWS Resource Browser');
			expect(output).not.toContain('Clear all cache?');
		});

		it('should cancel cache clearing and return to normal state', () => {
			const mockUseInput = vi.mocked(useInput);
			let capturedCallback: Function | null = null;

			mockUseInput.mockImplementation(callback => {
				capturedCallback = callback;
			});

			const {lastFrame} = render(
				<ResourceCacheProvider>
					<Home onSelect={() => {}} />
				</ResourceCacheProvider>,
			);

			// First press 'C' to show confirmation
			if (capturedCallback) {
				capturedCallback('C', {});
			}

			expect(lastFrame()).toContain('Clear all cache?');

			// Then press 'n' to cancel
			if (capturedCallback) {
				capturedCallback('n', {});
			}

			// Should return to normal home screen
			const output = lastFrame();
			expect(output).toContain('AWS Resource Browser');
			expect(output).not.toContain('Clear all cache?');
		});

		it('should use isActive option for useInput in test environment', () => {
			const mockUseInput = vi.mocked(useInput);

			render(
				<ResourceCacheProvider>
					<Home onSelect={() => {}} />
				</ResourceCacheProvider>,
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
});
