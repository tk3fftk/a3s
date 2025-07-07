import React from 'react';
import {Box, Text, useInput} from 'ink';
import {Table, type TableColumn} from './Table.js';
import type {EC2Instance} from '../types/resources.js';

export interface ResourceListProps {
	resourceType: string;
	data: EC2Instance[];
	selectedIndex?: number;
	loading?: boolean;
	onBack?: () => void;
	onQuit?: () => void;
	currentScreen: string;
}

const ec2Columns: TableColumn[] = [
	{key: 'id', header: 'Instance ID', width: 20},
	{key: 'name', header: 'Name', width: 15},
	{key: 'state', header: 'State', width: 10},
	{key: 'type', header: 'Type', width: 10},
	{key: 'publicIp', header: 'Public IP', width: 15},
	{key: 'privateIp', header: 'Private IP', width: 15},
	{key: 'availabilityZone', header: 'AZ', width: 12},
];

export function ResourceList({
	resourceType,
	data,
	selectedIndex = -1,
	loading = false,
	onBack,
	onQuit,
	currentScreen,
}: ResourceListProps) {
	const getResourceTitle = (type: string) => {
		switch (type) {
			case 'EC2':
				return 'EC2 Instances';
			case 'S3':
				return 'S3 Buckets';
			case 'Lambda':
				return 'Lambda Functions';
			case 'RDS':
				return 'RDS Instances';
			default:
				return `${type} Resources`;
		}
	};

	const getColumns = (type: string) => {
		switch (type) {
			case 'EC2':
				return ec2Columns;
			default:
				return ec2Columns; // Default to EC2 for now
		}
	};

	useInput(
		(input, key) => {
			// Debug logging for input conflicts
			if (process.env['NODE_ENV'] !== 'test') {
				console.log(
					`ResourceList input: ${input}, active: ${
						currentScreen === resourceType
					}`,
				);
			}

			if (key.leftArrow || key.escape) {
				if (onBack) {
					onBack();
				}
			} else if (input === 'q' && onQuit) {
				onQuit();
			}
		},
		{
			isActive:
				currentScreen === resourceType &&
				(typeof process === 'undefined' || process.env['NODE_ENV'] !== 'test'),
		},
	);

	return (
		<Box flexDirection="column" padding={1}>
			{/* Header */}
			<Box flexDirection="row" justifyContent="space-between" marginBottom={1}>
				<Text bold color="blue">
					{getResourceTitle(resourceType)}
				</Text>
				<Text color="gray">← Back</Text>
			</Box>

			{/* Table */}
			<Table
				data={data}
				columns={getColumns(resourceType)}
				selectedIndex={selectedIndex}
				loading={loading}
			/>

			{/* Footer with navigation instructions */}
			<Box marginTop={1} borderStyle="single" padding={1}>
				<Text color="yellow" bold>
					Navigation:
				</Text>
				<Text color="gray"> ↑↓ Navigate • Enter Select • ← Back • q Quit</Text>
			</Box>
		</Box>
	);
}
