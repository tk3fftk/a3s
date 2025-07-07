import {useState, useEffect} from 'react';
import {useInput} from 'ink';

export function useNavigation(
	itemCount: number,
	onSelect?: (index: number) => void,
	onQuit?: () => void,
	isActive: boolean = true,
) {
	const [selectedIndex, setSelectedIndex] = useState(0);

	// Reset selectedIndex when becoming active
	useEffect(() => {
		if (isActive && selectedIndex >= itemCount) {
			setSelectedIndex(0);
		}
	}, [isActive, itemCount, selectedIndex]);

	// Always call useInput to follow React Hooks rules
	useInput(
		(input, key) => {
			// Debug logging for input conflicts
			if (process.env['NODE_ENV'] !== 'test') {
				console.log(`useNavigation input: ${input}, isActive: ${isActive}`);
			}

			if (key.upArrow || input === 'k') {
				setSelectedIndex(prev => (prev === 0 ? itemCount - 1 : prev - 1));
			} else if (key.downArrow || input === 'j') {
				setSelectedIndex(prev => (prev === itemCount - 1 ? 0 : prev + 1));
			} else if (key.return && onSelect) {
				setSelectedIndex(currentIndex => {
					onSelect(currentIndex);
					return currentIndex;
				});
			} else if (input === 'q' && onQuit) {
				onQuit();
			}
		},
		{
			// Disable input in test environment to avoid stdin.ref errors
			// Also disable when not active to prevent input conflicts
			isActive:
				isActive &&
				(typeof process === 'undefined' || process.env['NODE_ENV'] !== 'test'),
		},
	);

	return {
		selectedIndex,
		setSelectedIndex,
		moveUp: () =>
			setSelectedIndex(prev => (prev === 0 ? itemCount - 1 : prev - 1)),
		moveDown: () =>
			setSelectedIndex(prev => (prev === itemCount - 1 ? 0 : prev + 1)),
		select: () => onSelect?.(selectedIndex),
		quit: () => onQuit?.(),
	};
}
