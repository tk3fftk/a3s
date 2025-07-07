/**
 * @vitest-environment jsdom
 */
import {describe, it, expect, vi} from 'vitest';
import {renderHook, act} from '@testing-library/react';
import {useNavigation} from './useNavigation.js';

describe('useNavigation', () => {
	it('should start with selectedIndex 0', () => {
		const {result} = renderHook(() => useNavigation(4));

		expect(result.current.selectedIndex).toBe(0);
	});

	it('should move down correctly', () => {
		const {result} = renderHook(() => useNavigation(4));

		act(() => {
			result.current.moveDown();
		});

		expect(result.current.selectedIndex).toBe(1);
	});

	it('should move up correctly', () => {
		const {result} = renderHook(() => useNavigation(4));

		// First move down to index 1
		act(() => {
			result.current.moveDown();
		});

		// Then move up back to index 0
		act(() => {
			result.current.moveUp();
		});

		expect(result.current.selectedIndex).toBe(0);
	});

	it('should wrap around when moving down from last item', () => {
		const {result} = renderHook(() => useNavigation(4));

		// Move to last item (index 3)
		act(() => {
			result.current.setSelectedIndex(3);
		});

		// Move down should wrap to first item
		act(() => {
			result.current.moveDown();
		});

		expect(result.current.selectedIndex).toBe(0);
	});

	it('should wrap around when moving up from first item', () => {
		const {result} = renderHook(() => useNavigation(4));

		// Start at index 0, move up should wrap to last item
		act(() => {
			result.current.moveUp();
		});

		expect(result.current.selectedIndex).toBe(3);
	});

	it('should call onSelect with correct index', () => {
		let selectedIndex = -1;
		const handleSelect = (index: number) => {
			selectedIndex = index;
		};

		const {result} = renderHook(() => useNavigation(4, handleSelect));

		// Move to index 2 and select
		act(() => {
			result.current.setSelectedIndex(2);
		});

		act(() => {
			result.current.select();
		});

		expect(selectedIndex).toBe(2);
	});

	it('should handle single item navigation', () => {
		const {result} = renderHook(() => useNavigation(1));

		// Moving up or down with single item should stay at index 0
		act(() => {
			result.current.moveDown();
		});
		expect(result.current.selectedIndex).toBe(0);

		act(() => {
			result.current.moveUp();
		});
		expect(result.current.selectedIndex).toBe(0);
	});

	it('should call onQuit when quit method is called', () => {
		const mockQuit = vi.fn();
		const {result} = renderHook(() => useNavigation(4, undefined, mockQuit));

		act(() => {
			result.current.quit();
		});

		expect(mockQuit).toHaveBeenCalledTimes(1);
	});

	it('should handle onQuit callback with onSelect callback', () => {
		const mockSelect = vi.fn();
		const mockQuit = vi.fn();
		const {result} = renderHook(() => useNavigation(4, mockSelect, mockQuit));

		// Test that both callbacks work independently
		act(() => {
			result.current.select();
		});
		expect(mockSelect).toHaveBeenCalledWith(0);

		act(() => {
			result.current.quit();
		});
		expect(mockQuit).toHaveBeenCalledTimes(1);
	});
});
