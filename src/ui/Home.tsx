import React from 'react';
import {Box, Text} from 'ink';
import {useNavigation} from '../hooks/useNavigation.js';

export interface HomeProps {
	onSelect: (service: string) => void;
	onQuit?: () => void;
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

export function Home({onSelect, onQuit}: HomeProps) {
	const {selectedIndex} = useNavigation(
		services.length,
		index => {
			const service = services[index];
			if (service) {
				onSelect(service.name);
			}
		},
		onQuit,
	);

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
				<Text color="gray">↑↓ Navigate • Enter Select • q Quit</Text>
			</Box>
		</Box>
	);
}
