import React from 'react';
import {Box, Text} from 'ink';

export interface HomeProps {
	onSelect: (service: string) => void;
	selectedIndex?: number;
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

export function Home({onSelect: _onSelect, selectedIndex = 0}: HomeProps) {
	// TODO: Re-enable useInput after resolving test environment issues
	// useInput((input, key) => {
	// 	if (key.return) {
	// 		onSelect(services[selectedIndex].name);
	// 	}
	// });

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
						<Text color="gray" marginLeft={2}>
							- {service.description}
						</Text>
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
