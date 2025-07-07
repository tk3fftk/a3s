import {useState} from 'react';
import {useInput} from 'ink';

export function useNavigation(
	itemCount: number,
	onSelect?: (index: number) => void,
) {
	const [selectedIndex, setSelectedIndex] = useState(0);

	// Only enable useInput in non-test environment
	if (typeof process !== 'undefined' && process.env['NODE_ENV'] !== 'test') {
		useInput((input, key) => {
			if (key.upArrow || input === 'k') {
				setSelectedIndex(prev => (prev === 0 ? itemCount - 1 : prev - 1));
			} else if (key.downArrow || input === 'j') {
				setSelectedIndex(prev => (prev === itemCount - 1 ? 0 : prev + 1));
			} else if (key.return && onSelect) {
				onSelect(selectedIndex);
			}
		});
	}

	return {
		selectedIndex,
		setSelectedIndex,
		moveUp: () =>
			setSelectedIndex(prev => (prev === 0 ? itemCount - 1 : prev - 1)),
		moveDown: () =>
			setSelectedIndex(prev => (prev === itemCount - 1 ? 0 : prev + 1)),
		select: () => onSelect?.(selectedIndex),
	};
}
