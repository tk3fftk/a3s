import React from 'react';
import {Box, Text} from 'ink';

export interface StatusBarProps {
	backend: 'sdk' | 'cli' | 'auto';
	profile?: string;
	region?: string;
	accountId?: string;
}

export function StatusBar({
	backend,
	profile,
	region,
	accountId,
}: StatusBarProps) {
	const formatBackend = (backend: string) => {
		switch (backend) {
			case 'sdk':
				return 'SDK';
			case 'cli':
				return 'CLI';
			case 'auto':
				return 'Auto';
			default:
				return backend.toUpperCase();
		}
	};

	const statusItems = [
		`Backend: ${formatBackend(backend)}`,
		profile && `Profile: ${profile}`,
		region && `Region: ${region}`,
		accountId && `Account: ${accountId}`,
	].filter(Boolean);

	return (
		<Box>
			<Text color="gray">{statusItems.join(' | ')}</Text>
		</Box>
	);
}
