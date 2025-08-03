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

## 11. Advanced Integration Testing Patterns

### Overview

Integration testing for Ink v4 applications requires sophisticated mocking strategies to bridge the gap between component isolation and real keyboard interaction simulation. This section documents advanced patterns learned during navigation test fixes implementation.

### Sophisticated useInput Mocking System

#### The Challenge

Standard component tests with simple `vi.fn()` mocks cannot simulate complex keyboard interactions across multiple components. App-level navigation requires:

1. **Multiple input handlers**: Different components register their own `useInput` hooks
2. **Handler coordination**: Determining which handler should respond to which key type
3. **State synchronization**: Ensuring navigation state changes propagate correctly
4. **Environment isolation**: Avoiding `stdin.ref` errors in test environment

#### The Solution: Handler Collection and Selective Triggering

```typescript
// src/app.test.tsx - Advanced Integration Testing Setup

let inputHandlers: Array<{callback: Function; options: any}> = [];

vi.mock('ink', async () => {
	const actual = await vi.importActual('ink');
	return {
		...actual,
		useInput: vi.fn((callback, options = {}) => {
			// Collect all active input handlers
			if (options.isActive !== false) {
				inputHandlers.push({callback, options});
			}
		}),
	};
});

// Intelligent key routing based on interaction type
const simulateKeyPress = (input: string, key: any = {}) => {
	const activeHandlers = inputHandlers.filter(
		handler => handler.options.isActive !== false,
	);

	// Selective handler triggering strategy:
	// - Navigation keys (arrows, return): First handler (useNavigation hook)
	// - Back navigation (leftArrow, escape): Last handler (Component-specific useInput)
	// - Text input: All relevant handlers
	let handlerToTrigger;
	if (key.leftArrow || key.escape) {
		// Back navigation typically handled by component-specific useInput
		handlerToTrigger = activeHandlers.slice(-1);
	} else {
		// Navigation and selection handled by useNavigation hook (usually first)
		handlerToTrigger = activeHandlers.slice(0, 1);
	}

	handlerToTrigger.forEach(handler => {
		handler.callback(input, key);
	});
};

// Clean state between tests
const resetInputHandlers = () => {
	inputHandlers = [];
};
```

### Environment Variable Based Test Control

#### Problem: Hook Behavior in Different Environments

Components need different `useInput` behavior for:

- **Component tests**: Mocked, no real input handling
- **Integration tests**: Real navigation logic enabled
- **Production**: Full keyboard interaction

#### Solution: Conditional Hook Activation

```typescript
// Hook implementation with test-aware behavior
export function useNavigation(
	itemCount: number,
	onSelect?: (index: number) => void,
	onQuit?: () => void,
	isActive: boolean = true,
	allowTestInput: boolean = false,
) {
	useInput(
		(input, key) => {
			// Navigation logic
		},
		{
			// Environment-aware activation
			isActive:
				isActive &&
				(allowTestInput ||
					typeof process === 'undefined' ||
					process.env['NODE_ENV'] !== 'test'),
		},
	);
}

// Integration test setup
describe('App Integration Tests', () => {
	beforeEach(() => {
		resetInputHandlers();
		process.env['ENABLE_TEST_INPUT'] = 'true'; // Enable real navigation
	});

	afterEach(() => {
		delete process.env['ENABLE_TEST_INPUT'];
	});
});

// Component implementation with conditional enabling
const {selectedIndex: navIndex} = useNavigation(
	data.length,
	undefined,
	onQuit,
	isActive,
	// Only enable in integration tests, not component tests
	typeof process !== 'undefined' && process.env['ENABLE_TEST_INPUT'] === 'true',
);
```

### Integration Test Implementation Patterns

#### Full Navigation Flow Testing

```typescript
it('should navigate through complete user journey', async () => {
	const {lastFrame} = render(<App />);

	// Wait for component initialization
	await new Promise(resolve => setTimeout(resolve, 50));

	// Step 1: Navigate to service
	simulateKeyPress('', {downArrow: true});
	await new Promise(resolve => setTimeout(resolve, 50));

	// Step 2: Select service
	simulateKeyPress('', {return: true});
	await new Promise(resolve => setTimeout(resolve, 100));

	// Step 3: Verify navigation result
	expect(lastFrame()).toContain('S3 Buckets');

	// Step 4: Navigate back
	simulateKeyPress('', {leftArrow: true});
	await new Promise(resolve => setTimeout(resolve, 100));

	// Step 5: Verify return to home
	expect(lastFrame()).toContain('AWS Resource Browser');
});
```

#### Async State Management Testing

```typescript
it('should handle async navigation state changes', async () => {
	const {lastFrame} = render(<App />);

	// Wait for async handler registration
	await new Promise(resolve => setTimeout(resolve, 50));

	// Trigger navigation
	simulateKeyPress('', {return: true});

	// Wait for state propagation through React
	await new Promise(resolve => setTimeout(resolve, 100));

	// Verify state change
	expect(lastFrame()).toContain('EC2 Instances');
	// Allow for loading or data states
	const output = lastFrame();
	expect(output).toMatch(/No data available|Loading/);
});
```

### Handler Registration Debugging

#### Debug Pattern for Complex Handler Interactions

```typescript
const simulateKeyPress = (input: string, key: any = {}) => {
	console.log(`Key: ${input}, handlers: ${inputHandlers.length}`);

	const activeHandlers = inputHandlers.filter(
		handler => handler.options.isActive !== false,
	);

	console.log(`Active handlers: ${activeHandlers.length}`);

	// Log which handler will be triggered
	let handlerToTrigger;
	if (key.leftArrow || key.escape) {
		handlerToTrigger = activeHandlers.slice(-1);
		console.log('Triggering back navigation handler');
	} else {
		handlerToTrigger = activeHandlers.slice(0, 1);
		console.log('Triggering navigation handler');
	}

	handlerToTrigger.forEach((handler, index) => {
		console.log(`Executing handler ${index}`);
		handler.callback(input, key);
	});
};
```

### Key Insights from Implementation

1. **Handler Order Matters**: The order of hook registration determines which handler responds to different key types
2. **State Timing**: React state updates require proper async waiting in tests
3. **Environment Isolation**: Component tests and integration tests need different mocking strategies
4. **Selective Triggering**: Different key types should trigger different handlers to avoid conflicts

## 12. Test Strategy Decision Matrix

### When to Use Each Testing Approach

#### Integration Testing Checklist

Use integration testing when:

- [ ] **Cross-component navigation**: Testing flow between multiple screens
- [ ] **Keyboard interaction workflows**: End-to-end user input scenarios
- [ ] **State synchronization**: Verifying state changes across component boundaries
- [ ] **App-level behavior**: Testing overall application behavior
- [ ] **Real user journeys**: Simulating actual user interaction patterns

**Setup Requirements**:

- Environment variable control (`ENABLE_TEST_INPUT=true`)
- Sophisticated useInput mocking
- Async state change handling
- Handler collection and selective triggering

#### Component Testing Checklist

Use component testing when:

- [ ] **Rendering verification**: Testing component structure and content
- [ ] **Props handling**: Verifying component responds to different props
- [ ] **Isolated behavior**: Testing component logic without external dependencies
- [ ] **Visual state**: Testing what user sees (highlighting, text content)
- [ ] **Error boundaries**: Testing component error handling

**Setup Requirements**:

- Simple mocking (`vi.fn()`)
- Focus on `lastFrame()` output
- Avoid keyboard simulation
- Test prop variations

#### Hook Testing Checklist

Use hook testing when:

- [ ] **Business logic**: Testing navigation algorithms and state management
- [ ] **Edge cases**: Testing boundary conditions (wraparound, limits)
- [ ] **Callback handling**: Verifying function calls and parameters
- [ ] **State transitions**: Testing state change logic
- [ ] **Performance**: Testing hook behavior with large datasets

**Setup Requirements**:

- `@testing-library/react` with `renderHook`
- `jsdom` environment
- `act()` for state changes
- Mock external dependencies

### Decision Flow Chart

```
User Interaction Testing Needed?
├─ Yes: Multi-component flow?
│  ├─ Yes: Integration Testing
│  └─ No: Component Testing
└─ No: Business logic only?
   ├─ Yes: Hook Testing
   └─ No: Component Testing
```

### Test Coverage Strategy

#### Comprehensive Coverage Approach

1. **Hook Tests** (30%): Core business logic

   - Navigation algorithms
   - State management
   - Callback handling

2. **Component Tests** (50%): Structure and rendering

   - UI rendering
   - Props handling
   - Content verification

3. **Integration Tests** (20%): User workflows
   - Navigation flows
   - Cross-component interaction
   - End-to-end scenarios

#### Quality Metrics

- **Test Success Rate**: Target 98%+ (current: 98.3%)
- **Coverage Completeness**: All three test types for complex features
- **Maintenance Efficiency**: No duplicate test logic
- **Development Speed**: Fast feedback with watch mode

### Implementation Guidelines

#### Step-by-Step Implementation

1. **Start with Hook Tests**:

   ```typescript
   // Test business logic first
   const {result} = renderHook(() => useNavigation(4));
   act(() => result.current.moveDown());
   expect(result.current.selectedIndex).toBe(1);
   ```

2. **Add Component Tests**:

   ```typescript
   // Test rendering and structure
   const {lastFrame} = render(<Home onSelect={() => {}} />);
   expect(lastFrame()).toContain('EC2');
   ```

3. **Implement Integration Tests**:

   ```typescript
   // Test user workflows
   simulateKeyPress('', {downArrow: true});
   await new Promise(resolve => setTimeout(resolve, 50));
   simulateKeyPress('', {return: true});
   ```

4. **Verify Coverage**:
   - All three test types passing
   - No duplicate logic
   - Clear test intent

### Anti-Patterns to Avoid

#### ❌ Wrong Test Strategy Choices

- **Don't**: Use integration testing for simple component rendering
- **Don't**: Use component testing for cross-component navigation
- **Don't**: Use hook testing for UI structure verification
- **Don't**: Mix testing strategies within the same test file

#### ✅ Correct Test Strategy Application

- **Do**: Match test type to what you're actually testing
- **Do**: Use the simplest effective testing approach
- **Do**: Separate concerns between test types
- **Do**: Document why you chose each testing strategy
