import React from 'react';
import {Box, Text, useInput} from 'ink';
import {Table, type TableColumn} from './Table.js';
import {useNavigation} from '../hooks/useNavigation.js';
import type {EC2Instance} from '../types/resources.js';

export interface ResourceListProps {
	resourceType: string;
	data: EC2Instance[];
	loading?: boolean;
	error?: string | null;
	onRefresh?: () => void;
	onBack?: () => void;
	onQuit?: () => void;
	currentScreen?: string;
	fromCache?: boolean;
	cacheAge?: number | null;
}

const ec2Columns: TableColumn[] = [
	{key: 'id', header: 'Instance ID', width: '20%'},
	{key: 'name', header: 'Name', width: '25%'},
	{key: 'state', header: 'State', width: '12%'},
	{key: 'type', header: 'Type', width: '15%'},
	{key: 'publicIp', header: 'Public IP', width: '18%'},
	{key: 'privateIp', header: 'Private IP', width: '18%'},
	{key: 'availabilityZone', header: 'AZ', width: '12%'},
];

export function ResourceList({
	resourceType,
	data,
	loading = false,
	error = null,
	onRefresh,
	onBack,
	onQuit,
	currentScreen,
	fromCache = false,
	cacheAge = null,
}: ResourceListProps) {
	// Use navigation hook for arrow key navigation
	const isActive =
		currentScreen?.toLowerCase() === resourceType.toLowerCase() &&
		!loading &&
		!error;
	const {selectedIndex: navIndex} = useNavigation(
		data.length,
		undefined, // onSelect not needed yet
		onQuit,
		isActive,
	);

	const getResourceTitle = (type: string) => {
		switch (type.toLowerCase()) {
			case 'ec2':
				return 'EC2 Instances';
			case 's3':
				return 'S3 Buckets';
			case 'lambda':
				return 'Lambda Functions';
			case 'rds':
				return 'RDS Instances';
			default:
				return `${type.toUpperCase()} Resources`;
		}
	};

	const getColumns = (type: string) => {
		switch (type.toLowerCase()) {
			case 'ec2':
				return ec2Columns;
			default:
				return ec2Columns; // Default to EC2 for now
		}
	};

	const formatCacheAge = (ageMs: number | null): string => {
		if (ageMs === null) return '';

		const seconds = Math.floor(ageMs / 1000);
		if (seconds < 60) {
			return `${seconds}s ago`;
		}

		const minutes = Math.floor(seconds / 60);
		if (minutes < 60) {
			return `${minutes}m ago`;
		}

		const hours = Math.floor(minutes / 60);
		return `${hours}h ago`;
	};

	// Handle non-navigation keys (back, refresh)
	useInput(
		(input, key) => {
			if (key.leftArrow || key.escape) {
				if (onBack) {
					onBack();
				}
			} else if (input === 'r' && onRefresh && error) {
				// Allow refresh only when there's an error
				onRefresh();
			}
			// Note: 'q' is handled by useNavigation hook
		},
		{
			isActive:
				isActive &&
				(typeof process === 'undefined' || process.env['NODE_ENV'] !== 'test'),
		},
	);

	return (
		<Box flexDirection="column" padding={1}>
			{/* Header */}
			<Box flexDirection="row" justifyContent="space-between" marginBottom={1}>
				<Box flexDirection="column">
					<Text bold color="blue">
						{getResourceTitle(resourceType)}
					</Text>
					{fromCache && cacheAge !== null && (
						<Text color="gray" dimColor>
							Cached {formatCacheAge(cacheAge)}
						</Text>
					)}
				</Box>
				<Text color="gray">← Back</Text>
			</Box>

			{/* Content */}
			{loading ? (
				<Box paddingTop={2} paddingBottom={2}>
					<Text color="yellow">Loading...</Text>
				</Box>
			) : error ? (
				<Box flexDirection="column" paddingTop={2} paddingBottom={2}>
					<Text color="red" bold>
						Error: {error}
					</Text>
					<Box marginTop={1}>
						<Text color="gray">Press 'r' to retry or '←' to go back</Text>
					</Box>
				</Box>
			) : (
				/* Table */
				<Table
					data={data}
					columns={getColumns(resourceType)}
					selectedIndex={navIndex}
					loading={loading}
				/>
			)}

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
