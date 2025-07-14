import React from 'react';
import {describe, it, expect, vi} from 'vitest';
import {render} from 'ink-testing-library';
import App from './app.js';

// Mock useInput to avoid stdin issues in tests
vi.mock('ink', async () => {
	const actual = await vi.importActual('ink');
	return {
		...actual,
		useInput: vi.fn(),
	};
});

describe('App', () => {
	it('should render home screen with all services', () => {
		const {lastFrame} = render(<App />);

		// Should show home screen
		expect(lastFrame()).toContain('AWS Resource Browser');
		expect(lastFrame()).toContain('EC2');
		expect(lastFrame()).toContain('S3');
		expect(lastFrame()).toContain('Lambda');
		expect(lastFrame()).toContain('RDS');
	});

	it('should navigate to EC2 screen when EC2 is selected', () => {
		const {lastFrame, stdin} = render(<App />);

		// Navigate to EC2
		stdin.write('\r'); // Press Enter to select EC2

		// Should show EC2 Resources screen
		expect(lastFrame()).toContain('EC2 Resources');
		expect(lastFrame()).toContain('No resources found');
	});

	it('should navigate to S3 screen when S3 is selected', () => {
		const {lastFrame, stdin} = render(<App />);

		// Navigate down to S3
		stdin.write('j'); // Move down to S3
		stdin.write('\r'); // Select S3

		// Should show S3 Resources screen
		expect(lastFrame()).toContain('S3 Resources');
		expect(lastFrame()).toContain('No resources found');
	});

	it('should navigate back to home when pressing back key', () => {
		const {lastFrame, stdin} = render(<App />);

		// Navigate to EC2
		stdin.write('\r');
		expect(lastFrame()).toContain('EC2 Resources');

		// Navigate back
		stdin.write('\x1B'); // Escape key

		// Should be back at home
		expect(lastFrame()).toContain('AWS Resource Browser');
		expect(lastFrame()).toContain('EC2');
		expect(lastFrame()).toContain('S3');
	});

	it('should quit when pressing q on home screen', () => {
		const onExit = vi.fn();
		const {stdin} = render(<App onExit={onExit} />);

		// Press q to quit
		stdin.write('q');

		// Should call onExit
		expect(onExit).toHaveBeenCalled();
	});

	it('should show status bar with backend info', () => {
		const originalBackend = process.env['A3S_BACKEND'];
		process.env['A3S_BACKEND'] = 'sdk';

		const {lastFrame} = render(<App />);

		expect(lastFrame()).toContain('Backend: SDK');

		// Restore original value
		if (originalBackend) {
			process.env['A3S_BACKEND'] = originalBackend;
		} else {
			delete process.env['A3S_BACKEND'];
		}
	});
});
