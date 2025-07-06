import React from 'react';
import {Box, Text, useInput} from 'ink';

export interface HomeProps {
	onSelect: (service: string) => void;
	selectedIndex?: number;
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

export function Home({onSelect, selectedIndex = 0, onQuit}: HomeProps) {
	// Only enable useInput in non-test environment
	if (typeof process !== 'undefined' && process.env['NODE_ENV'] !== 'test') {
		useInput((input, key) => {
			if (key.return) {
				const service = services[selectedIndex];
				if (service) {
					onSelect(service.name);
				}
			} else if (input === 'q' && onQuit) {
				onQuit();
			}
		});
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
				<Text color="gray">↑↓ Navigate • Enter Select • q Quit</Text>
			</Box>
		</Box>
	);
}
