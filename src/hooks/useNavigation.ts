import {useState, useEffect} from 'react';
import {useInput} from 'ink';
import {debugLog} from '../utils/debug.js';

export function useNavigation(
	itemCount: number,
	onSelect?: (index: number) => void,
	onQuit?: () => void,
	isActive: boolean = true,
	allowTestInput: boolean = false,
) {
	const [selectedIndex, setSelectedIndex] = useState(0);

	// Reset selectedIndex when becoming active or itemCount changes
	useEffect(() => {
		if (isActive) {
			// Reset to 0 if index is out of bounds or when first becoming active
			setSelectedIndex(prev => {
				if (prev >= itemCount) {
					return 0;
				}
				return prev;
			});
		}
	}, [isActive, itemCount]);

	// Always call useInput to follow React Hooks rules
	useInput(
		(input, key) => {
			// Debug logging for input conflicts
			debugLog(`useNavigation input: ${input}, isActive: ${isActive}`);

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
			// Disable input in test environment to avoid stdin.ref errors, unless allowTestInput is true
			// Also disable when not active to prevent input conflicts
			isActive:
				isActive &&
				(allowTestInput ||
					typeof process === 'undefined' ||
					process.env['NODE_ENV'] !== 'test'),
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
