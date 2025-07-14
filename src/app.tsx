import React, {useState} from 'react';
import {Box} from 'ink';
import {Home} from './ui/Home.js';
import {ResourceList} from './ui/ResourceList.js';
import {StatusBar} from './ui/StatusBar.js';
import {useResources} from './hooks/useResources.js';
import {ResourceCacheProvider} from './hooks/ResourceCacheContext.js';

type Screen = 'home' | 'ec2' | 's3' | 'lambda' | 'rds';

interface AppProps {
	onExit?: () => void;
}

export default function App({onExit}: AppProps = {}) {
	const [currentScreen, setCurrentScreen] = useState<Screen>('home');
	const [shouldQuit, setShouldQuit] = useState(false);

	// Use the useResources hook to fetch data
	const {data, loading, error, refresh, fromCache, cacheAge} =
		useResources(currentScreen);

	const handleServiceSelect = (service: string) => {
		const serviceMap: Record<string, Screen> = {
			EC2: 'ec2',
			S3: 's3',
			Lambda: 'lambda',
			RDS: 'rds',
		};

		const screen = serviceMap[service];
		if (screen) {
			// Defer state update to next tick to avoid updating App during Home's render
			setTimeout(() => setCurrentScreen(screen), 0);
		}
	};

	const handleBack = () => {
		setCurrentScreen('home');
	};

	const handleQuit = () => {
		if (onExit) {
			onExit();
		} else {
			setShouldQuit(true);
		}
	};

	// Global quit handling is now handled by individual components to avoid input conflicts

	if (shouldQuit) {
		return null;
	}

	return (
		<ResourceCacheProvider>
			<Box flexDirection="column" height="100%">
				<Box flexGrow={1}>
					{currentScreen === 'home' ? (
						<Home
							onSelect={handleServiceSelect}
							onQuit={handleQuit}
							currentScreen={currentScreen}
						/>
					) : (
						<ResourceList
							resourceType={currentScreen}
							data={data}
							loading={loading}
							error={error}
							onRefresh={refresh}
							onBack={handleBack}
							onQuit={handleQuit}
							currentScreen={currentScreen}
							fromCache={fromCache}
							cacheAge={cacheAge}
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
		</ResourceCacheProvider>
	);
}
