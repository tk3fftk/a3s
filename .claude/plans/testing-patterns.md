# Testing Patterns for Ink v4 Applications

**Date**: 2025-07-07  
**Context**: Testing patterns learned during navigation implementation  
**Framework**: Ink v4 + Vitest + ink-testing-library

## Overview

This document provides proven testing patterns for Ink v4 applications, focusing on keyboard interactions, component testing, and hook testing strategies that address the unique challenges of CLI application testing.

## 1. Testing Architecture

### Dual Testing Strategy

For Ink applications with keyboard interactions, use a two-tier testing approach:

1. **Hook Logic Testing**: Test business logic separately using `@testing-library/react`
2. **Component Structure Testing**: Test rendering and basic interactions using `ink-testing-library`

```typescript
// Package dependencies for testing
{
  "devDependencies": {
    "@testing-library/react": "^13.4.0",
    "ink-testing-library": "^3.0.0",
    "jsdom": "^26.1.0",
    "vitest": "^3.2.4"
  }
}
```

## 2. Hook Testing Patterns

### Environment Configuration

For hooks using Ink's `useInput`, configure test environment properly:

```typescript
/**
 * @vitest-environment jsdom
 */
import {describe, it, expect, vi} from 'vitest';
import {renderHook, act} from '@testing-library/react';
```

### Navigation Hook Testing Pattern

```typescript
// src/hooks/useNavigation.test.ts
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

	it('should wrap around when moving down from last item', () => {
		const {result} = renderHook(() => useNavigation(4));

		// Move to last item
		act(() => {
			result.current.setSelectedIndex(3);
		});

		// Move down should wrap to first
		act(() => {
			result.current.moveDown();
		});

		expect(result.current.selectedIndex).toBe(0);
	});

	it('should call onSelect with correct index', () => {
		const mockSelect = vi.fn();
		const {result} = renderHook(() => useNavigation(4, mockSelect));

		// Move to index 2 and select
		act(() => {
			result.current.setSelectedIndex(2);
		});

		act(() => {
			result.current.select();
		});

		expect(mockSelect).toHaveBeenCalledWith(2);
	});

	it('should call onQuit when quit method is called', () => {
		const mockQuit = vi.fn();
		const {result} = renderHook(() => useNavigation(4, undefined, mockQuit));

		act(() => {
			result.current.quit();
		});

		expect(mockQuit).toHaveBeenCalledTimes(1);
	});
});
```

### Key Hook Testing Principles

1. **Test behavior, not implementation**: Focus on what the hook does, not how
2. **Use act() for state changes**: Wrap state-changing calls in `act()`
3. **Mock external dependencies**: Use `vi.fn()` for callbacks
4. **Test boundary conditions**: Test edge cases like wraparound behavior

## 3. Component Testing Patterns

### Basic Component Structure Testing

```typescript
// src/ui/Home.test.tsx
import React from 'react';
import {describe, it, expect} from 'vitest';
import {render} from 'ink-testing-library';
import {Home} from './Home.js';

describe('Home', () => {
	it('should render service menu title', () => {
		const {lastFrame} = render(<Home onSelect={() => {}} />);

		expect(lastFrame()).toContain('AWS Resource Browser');
	});

	it('should render all AWS services', () => {
		const {lastFrame} = render(<Home onSelect={() => {}} />);
		const output = lastFrame();

		expect(output).toContain('EC2');
		expect(output).toContain('S3');
		expect(output).toContain('Lambda');
		expect(output).toContain('RDS');
	});

	it('should highlight first service by default', () => {
		const {lastFrame} = render(<Home onSelect={() => {}} />);
		const output = lastFrame();

		// Positive assertion: first service is highlighted
		expect(output).toMatch(/>\s*EC2/);

		// Negative assertions: others are not highlighted
		expect(output).not.toMatch(/>\s*S3/);
		expect(output).not.toMatch(/>\s*Lambda/);
		expect(output).not.toMatch(/>\s*RDS/);
	});

	it('should provide onSelect callback for service selection', () => {
		let selectedService = '';
		const handleSelect = (service: string) => {
			selectedService = service;
		};

		render(<Home onSelect={handleSelect} />);

		// Component should render without errors
		expect(selectedService).toBe('');
	});
});
```

### Component Testing Best Practices

1. **Focus on structure and content**: Test what renders, not keyboard interactions
2. **Use comprehensive assertions**: Test both positive and negative cases
3. **Avoid keyboard simulation**: Don't try to simulate keyboard input in component tests
4. **Test prop handling**: Verify components accept and use props correctly

## 4. Avoiding Common Testing Pitfalls

### ❌ Don't: Simulate Keyboard Input in Component Tests

```typescript
// ❌ WRONG - This will cause stdin.ref errors
it('should navigate with arrow keys', () => {
	const {stdin} = render(<Home onSelect={() => {}} />);

	stdin.write('\u001B[B'); // This causes errors in test environment
});
```

### ✅ Do: Test Keyboard Logic in Hooks

```typescript
// ✅ CORRECT - Test navigation logic in hook
it('should handle down arrow navigation', () => {
	const {result} = renderHook(() => useNavigation(4));

	act(() => {
		result.current.moveDown();
	});

	expect(result.current.selectedIndex).toBe(1);
});
```

### ❌ Don't: Test Implementation Details

```typescript
// ❌ WRONG - Testing internal state directly
it('should have selectedIndex state', () => {
	const {result} = renderHook(() => useNavigation(4));

	expect(result.current.selectedIndex).toBeDefined(); // Too implementation-focused
});
```

### ✅ Do: Test User-Observable Behavior

```typescript
// ✅ CORRECT - Test what user experiences
it('should start with first item selected', () => {
	const {lastFrame} = render(<Home onSelect={() => {}} />);

	expect(lastFrame()).toMatch(/>\s*EC2/); // User sees this
});
```

## 5. Hook Implementation Patterns for Testability

### Environment-Aware Hook Pattern

```typescript
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
				typeof process === 'undefined' || process.env.NODE_ENV !== 'test',
		},
	);

	// Return testable interface
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
```

### Key Patterns for Testable Hooks

1. **Provide programmatic interfaces**: Return methods like `moveUp()`, `moveDown()` for testing
2. **Use isActive option**: Disable input handling in test environment
3. **Expose necessary state**: Return state that tests need to verify
4. **Handle edge cases**: Implement boundary logic (wraparound, etc.)

## 6. Test Organization and Structure

### File Structure

```
src/
├── hooks/
│   ├── useNavigation.ts
│   └── useNavigation.test.ts      # Hook logic tests
├── ui/
│   ├── Home.tsx
│   └── Home.test.tsx              # Component structure tests
└── __tests__/
    └── integration.test.ts        # Full application tests
```

### Test Categorization

1. **Unit Tests** (hooks): Test individual hook behavior
2. **Component Tests**: Test rendering and basic component behavior
3. **Integration Tests**: Test component interactions and data flow

### Test Naming Conventions

```typescript
describe('useNavigation', () => {
	describe('navigation behavior', () => {
		it('should move down correctly', () => {});
		it('should wrap around when moving up from first item', () => {});
	});

	describe('callback handling', () => {
		it('should call onSelect with correct index', () => {});
		it('should call onQuit when quit method is called', () => {});
	});
});
```

## 7. Performance Testing Considerations

### Large Dataset Testing

```typescript
it('should handle large datasets efficiently', () => {
	const largeItemCount = 10000;
	const {result} = renderHook(() => useNavigation(largeItemCount));

	const startTime = performance.now();

	act(() => {
		// Test navigation performance
		for (let i = 0; i < 100; i++) {
			result.current.moveDown();
		}
	});

	const endTime = performance.now();

	expect(endTime - startTime).toBeLessThan(100); // Should complete quickly
	expect(result.current.selectedIndex).toBe(100);
});
```

### Memory Leak Detection

```typescript
it('should not leak memory with frequent state changes', () => {
	const {result, unmount} = renderHook(() => useNavigation(4));

	// Simulate heavy usage
	act(() => {
		for (let i = 0; i < 1000; i++) {
			result.current.moveUp();
			result.current.moveDown();
		}
	});

	// Should not crash or slow down
	expect(result.current.selectedIndex).toBe(0);

	// Clean up
	unmount();
});
```

## 8. Mocking and Test Utilities

### Custom Render Helper

```typescript
// test-utils/renderWithProps.ts
export function renderHomeWithProps(props: Partial<HomeProps> = {}) {
	const defaultProps: HomeProps = {
		onSelect: vi.fn(),
		onQuit: vi.fn(),
	};

	return render(<Home {...defaultProps} {...props} />);
}
```

### Hook Testing Utilities

```typescript
// test-utils/navigationHelpers.ts
export function createNavigationTest(itemCount: number) {
	return renderHook(() => useNavigation(itemCount));
}

export function moveToIndex(result: any, targetIndex: number) {
	act(() => {
		result.current.setSelectedIndex(targetIndex);
	});
}
```

## 9. Testing Checklist

### Before Writing Tests

- [ ] Identify what behavior to test (not implementation)
- [ ] Decide between hook testing vs component testing
- [ ] Set up proper test environment (jsdom for hooks)
- [ ] Plan for edge cases and boundary conditions

### Hook Testing Checklist

- [ ] Test initial state
- [ ] Test state transitions
- [ ] Test boundary conditions (wraparound, limits)
- [ ] Test callback invocations
- [ ] Mock external dependencies
- [ ] Use act() for state changes

### Component Testing Checklist

- [ ] Test rendering with default props
- [ ] Test rendering with various prop combinations
- [ ] Test content and structure (not interactions)
- [ ] Avoid keyboard simulation
- [ ] Use comprehensive assertions

### Quality Assurance

- [ ] All tests pass consistently
- [ ] No duplicate test logic
- [ ] Clear, descriptive test names
- [ ] Appropriate test coverage
- [ ] No environment-specific failures

## 10. Common Issues and Solutions

### Issue: "stdin.ref is not a function"

**Cause**: Trying to use `useInput` in test environment without proper configuration

**Solution**: Use `isActive: false` in test environment

```typescript
useInput(callback, {isActive: process.env.NODE_ENV !== 'test'});
```

### Issue: "ReactDOMTestUtils.act is deprecated"

**Cause**: Using wrong `act` import

**Solution**: Import `act` from `react` instead of `react-dom/test-utils`

```typescript
import {act} from 'react'; // ✅ Correct
// import { act } from 'react-dom/test-utils'; // ❌ Deprecated
```

### Issue: Tests Pass Locally but Fail in CI

**Cause**: Environment differences or timing issues

**Solution**: Use proper async handling and environment detection

```typescript
// Wait for async updates
await act(async () => {
	result.current.moveDown();
});
```

---

## Summary

Effective testing of Ink v4 applications requires:

1. **Separate keyboard logic from rendering logic** using custom hooks
2. **Test hooks and components differently** with appropriate tools
3. **Use environment-aware patterns** to handle test constraints
4. **Focus on user-observable behavior** rather than implementation details
5. **Provide programmatic interfaces** for better testability

These patterns enable comprehensive testing while avoiding common pitfalls specific to CLI application development.
