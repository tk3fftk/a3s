import React, {useState} from 'react';
import {Box} from 'ink';
import {Home} from './ui/Home.js';
import {ResourceList} from './ui/ResourceList.js';
import {StatusBar} from './ui/StatusBar.js';

type Screen = 'home' | 'ec2' | 's3' | 'lambda' | 'rds';

export default function App() {
	const [currentScreen, setCurrentScreen] = useState<Screen>('home');
	const [selectedIndex, setSelectedIndex] = useState(0);

	const handleServiceSelect = (service: string) => {
		const serviceMap: Record<string, Screen> = {
			EC2: 'ec2',
			S3: 's3',
			Lambda: 'lambda',
			RDS: 'rds',
		};

		const screen = serviceMap[service];
		if (screen) {
			setCurrentScreen(screen);
			setSelectedIndex(0);
		}
	};

	const handleBack = () => {
		setCurrentScreen('home');
		setSelectedIndex(0);
	};

	return (
		<Box flexDirection="column" height="100%">
			<Box flexGrow={1}>
				{currentScreen === 'home' ? (
					<Home onSelect={handleServiceSelect} selectedIndex={selectedIndex} />
				) : (
					<ResourceList
						resourceType={currentScreen}
						data={[]}
						onBack={handleBack}
					/>
				)}
			</Box>
			<StatusBar
				backend={
					(process.env['A3S_BACKEND'] as 'sdk' | 'cli' | 'auto') || 'auto'
				}
				profile={process.env['AWS_PROFILE']}
			/>
		</Box>
	);
}
