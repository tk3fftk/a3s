import React, {useState} from 'react';
import {Box, Text, useInput} from 'ink';
import {useNavigation} from '../hooks/useNavigation.js';
import {useResourceCache} from '../hooks/ResourceCacheContext.js';
import {ConfirmationDialog} from './ConfirmationDialog.js';

export interface HomeProps {
	onSelect: (service: string) => void;
	onQuit?: () => void;
	currentScreen?: string;
}

interface Service {
	name: string;
	description: string;
}

const services: Service[] = [
	{name: 'EC2', description: 'Elastic Compute Cloud'},
	{name: 'S3', description: 'Simple Storage Service'},
	{name: 'Lambda', description: 'Function as a Service'},
	{name: 'RDS', description: 'Relational Database Service'},
];

export function Home({onSelect, onQuit, currentScreen}: HomeProps) {
	const [showConfirmation, setShowConfirmation] = useState(false);

	// Try to use cache context, but make it optional for backwards compatibility
	let cacheContext: ReturnType<typeof useResourceCache> | null = null;
	try {
		cacheContext = useResourceCache();
	} catch {
		// Cache context not available - continue without caching
	}

	const {selectedIndex} = useNavigation(
		services.length,
		index => {
			const service = services[index];
			if (service) {
				onSelect(service.name);
			}
		},
		onQuit,
		currentScreen !== 'home' ? false : true,
		true, // allowTestInput for integration tests
	);

	// Handle cache clearing with separate useInput hook
	useInput(
		(input, _key) => {
			// Handle cache clearing with 'C' or 'c' key
			if (cacheContext && (input === 'C' || input === 'c')) {
				setShowConfirmation(true);
			}
		},
		{
			// Follow the same pattern as useNavigation for test environment
			isActive:
				(currentScreen !== 'home' ? false : true) &&
				(typeof process === 'undefined' || process.env['NODE_ENV'] !== 'test'),
		},
	);

	const handleConfirmCache = () => {
		if (cacheContext) {
			cacheContext.clearCache();
		}
		setShowConfirmation(false);
	};

	const handleCancelCache = () => {
		setShowConfirmation(false);
	};

	// Show confirmation dialog if requested
	if (showConfirmation) {
		return (
			<ConfirmationDialog
				message="Clear all cache?"
				onConfirm={handleConfirmCache}
				onCancel={handleCancelCache}
			/>
		);
	}

	return (
		<Box flexDirection="column" padding={1}>
			{/* Title */}
			<Box marginBottom={1}>
				<Text bold color="blue">
					AWS Resource Browser
				</Text>
			</Box>

			{/* Service Menu */}
			<Box flexDirection="column" marginBottom={2}>
				{services.map((service, index) => (
					<Box key={service.name} flexDirection="row" paddingY={0}>
						<Text color={index === selectedIndex ? 'green' : 'gray'}>
							{index === selectedIndex ? '> ' : '  '}
							{service.name}
						</Text>
						<Text color="gray"> - {service.description}</Text>
					</Box>
				))}
			</Box>

			{/* Instructions */}
			<Box flexDirection="column" borderStyle="single" padding={1}>
				<Text color="yellow" bold>
					Navigation:
				</Text>
				<Text color="gray">
					↑↓ Navigate • Enter Select • q Quit
					{cacheContext && ' • C Clear cache'}
				</Text>
			</Box>
		</Box>
	);
}
