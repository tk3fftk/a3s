import React from 'react';
import {describe, it, expect} from 'vitest';
import {render} from 'ink-testing-library';
import {StatusBar} from './StatusBar.js';

describe('StatusBar', () => {
	it('should render backend information', () => {
		const {lastFrame} = render(<StatusBar backend="sdk" />);
		const output = lastFrame();

		expect(output).toContain('Backend: SDK');
	});

	it('should render CLI backend', () => {
		const {lastFrame} = render(<StatusBar backend="cli" />);
		const output = lastFrame();

		expect(output).toContain('Backend: CLI');
	});

	it('should render auto backend', () => {
		const {lastFrame} = render(<StatusBar backend="auto" />);
		const output = lastFrame();

		expect(output).toContain('Backend: Auto');
	});

	it('should render profile information when provided', () => {
		const {lastFrame} = render(
			<StatusBar backend="sdk" profile="dev-profile" />,
		);
		const output = lastFrame();

		expect(output).toContain('Profile: dev-profile');
		expect(output).toContain('Backend: SDK');
	});

	it('should render region information when provided', () => {
		const {lastFrame} = render(<StatusBar backend="sdk" region="us-west-2" />);
		const output = lastFrame();

		expect(output).toContain('Region: us-west-2');
		expect(output).toContain('Backend: SDK');
	});

	it('should render all information together', () => {
		const {lastFrame} = render(
			<StatusBar
				backend="cli"
				profile="production"
				region="eu-west-1"
				accountId="123456789012"
			/>,
		);
		const output = lastFrame();

		expect(output).toContain('Backend: CLI');
		expect(output).toContain('Profile: production');
		expect(output).toContain('Region: eu-west-1');
		expect(output).toContain('Account: 123456789012');
	});

	it('should handle missing optional information', () => {
		const {lastFrame} = render(<StatusBar backend="auto" />);
		const output = lastFrame();

		expect(output).toContain('Backend: Auto');
		expect(output).not.toContain('Profile:');
		expect(output).not.toContain('Region:');
		expect(output).not.toContain('Account:');
	});

	it('should format as a single line', () => {
		const {lastFrame} = render(
			<StatusBar
				backend="sdk"
				profile="test"
				region="us-east-1"
				accountId="987654321098"
			/>,
		);
		const output = lastFrame();

		// Should be a single line format
		const lines = output.split('\n').filter(line => line.trim());
		expect(lines.length).toBe(1);
	});
});
