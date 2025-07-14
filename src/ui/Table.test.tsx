import React from 'react';
import {describe, it, expect} from 'vitest';
import {render} from 'ink-testing-library';
import {Table} from './Table.js';

interface TestRow {
	id: string;
	name: string;
	status: string;
}

const testData: TestRow[] = [
	{id: 'i-123', name: 'web-server', status: 'running'},
	{id: 'i-456', name: 'db-server', status: 'stopped'},
	{id: 'i-789', name: 'cache-server', status: 'running'},
];

const testColumns = [
	{key: 'id', header: 'Instance ID', width: '30%'},
	{key: 'name', header: 'Name', width: '40%'},
	{key: 'status', header: 'Status', width: '30%'},
];

describe('Table', () => {
	it('should render table headers', () => {
		const {lastFrame} = render(<Table data={testData} columns={testColumns} />);
		const output = lastFrame();

		expect(output).toContain('Instance ID');
		expect(output).toContain('Name');
		expect(output).toContain('Status');
	});

	it('should render table data', () => {
		const {lastFrame} = render(<Table data={testData} columns={testColumns} />);
		const output = lastFrame();

		expect(output).toContain('i-123');
		expect(output).toContain('web-server');
		expect(output).toContain('running');
		expect(output).toContain('i-456');
		expect(output).toContain('db-server');
		expect(output).toContain('stopped');
	});

	it('should highlight selected row', () => {
		const {lastFrame} = render(
			<Table data={testData} columns={testColumns} selectedIndex={1} />,
		);
		const output = lastFrame();

		// Should highlight the second row (db-server)
		expect(output).toMatch(/>\s*i-456/);
	});

	it('should handle empty data', () => {
		const {lastFrame} = render(<Table data={[]} columns={testColumns} />);
		const output = lastFrame();

		expect(output).toContain('Instance ID');
		expect(output).toContain('Name');
		expect(output).toContain('Status');
		expect(output).toContain('No data available');
	});

	it('should use responsive column layout', () => {
		const {lastFrame} = render(<Table data={testData} columns={testColumns} />);
		const output = lastFrame();

		// Headers should be properly displayed with responsive layout
		const lines = output.split('\n');
		const headerLine = lines.find(line => line.includes('Instance ID'));
		expect(headerLine).toBeDefined();
		expect(headerLine).toContain('Name');
		expect(headerLine).toContain('Status');
	});

	it('should show loading state', () => {
		const {lastFrame} = render(
			<Table data={testData} columns={testColumns} loading={true} />,
		);
		const output = lastFrame();

		expect(output).toContain('Loading...');
	});

	it('should truncate long cell content', () => {
		const longData = [
			{
				id: 'i-123456789012345678901234567890',
				name: 'this-is-a-very-long-server-name-that-definitely-exceeds-the-fifty-character-limit-for-truncation',
				status: 'running',
			},
		];

		const {lastFrame} = render(<Table data={longData} columns={testColumns} />);
		const output = lastFrame();

		// Should contain truncated content (default maxLength is 50, so should end with '...')
		expect(output).toContain('...');
		expect(output).toContain('this-is-a-very-long');
	});
});
