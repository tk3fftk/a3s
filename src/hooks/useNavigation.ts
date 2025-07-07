import {useState} from 'react';
import {useInput} from 'ink';

export function useNavigation(
	itemCount: number,
	onSelect?: (index: number) => void,
	onQuit?: () => void,
) {
	const [selectedIndex, setSelectedIndex] = useState(0);

	// Always call useInput to follow React Hooks rules
	useInput(
		(input, key) => {
			if (key.upArrow || input === 'k') {
				setSelectedIndex(prev => (prev === 0 ? itemCount - 1 : prev - 1));
			} else if (key.downArrow || input === 'j') {
				setSelectedIndex(prev => (prev === itemCount - 1 ? 0 : prev + 1));
			} else if (key.return && onSelect) {
				onSelect(selectedIndex);
			} else if (input === 'q' && onQuit) {
				onQuit();
			}
		},
		{
			// Disable input in test environment to avoid stdin.ref errors
			isActive:
				typeof process === 'undefined' || process.env['NODE_ENV'] !== 'test',
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
