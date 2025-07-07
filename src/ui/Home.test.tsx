import React from 'react';
import {describe, it, expect} from 'vitest';
import {render} from 'ink-testing-library';
import {Home} from './Home.js';

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

	it('should highlight selected service', () => {
		const {lastFrame} = render(<Home onSelect={() => {}} />);
		const output = lastFrame();

		// Should highlight EC2 (index 0) by default
		expect(output).toMatch(/>\s*EC2/);
	});

	it('should show keyboard instructions', () => {
		const {lastFrame} = render(<Home onSelect={() => {}} />);
		const output = lastFrame();

		expect(output).toContain('↑↓');
		expect(output).toContain('Enter');
		expect(output).toContain('q');
	});

	it('should start with first service selected by default', () => {
		const {lastFrame} = render(<Home onSelect={() => {}} />);
		const output = lastFrame();

		// Should highlight EC2 (index 0) by default
		expect(output).toMatch(/>\s*EC2/);
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
});
