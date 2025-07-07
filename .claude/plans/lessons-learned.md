# Lessons Learned: Navigation Implementation

**Date**: 2025-07-07  
**Context**: Arrow key navigation implementation with TDD approach  
**PR**: #1 - Add arrow key navigation with TDD implementation

## Overview

This document captures key lessons learned during the implementation of arrow key navigation functionality, including React Hooks rules violations, testing patterns for Ink v4, and GitHub Copilot feedback integration.

## 1. React Hooks Rules Violation and Resolution

### Problem Identified

**Issue**: Conditional `useInput` hook calls violated React Hooks rules

```typescript
// ❌ WRONG - Violates hooks rules
if (typeof process !== 'undefined' && process.env['NODE_ENV'] !== 'test') {
	useInput((input, key) => {
		// Handle input
	});
}
```

**Error Symptoms**:

- Inconsistent hook call order between environments
- Potential React internal state corruption
- GitHub Copilot flagged as rules violation

### Solution Applied

**Fix**: Use `isActive` option to control hook behavior without conditional calls

```typescript
// ✅ CORRECT - Hooks rules compliant
useInput(
	(input, key) => {
		// Handle input logic
	},
	{
		isActive:
			typeof process === 'undefined' || process.env['NODE_ENV'] !== 'test',
	},
);
```

### Key Learnings

1. **Always call hooks in the same order**: Never use conditions to control hook calls
2. **Use hook options for environment control**: Most hooks provide options for conditional behavior
3. **Test environment considerations**: Handle test-specific constraints through configuration, not conditional logic

## 2. Ink v4 Testing Challenges and Solutions

### Problem: stdin.ref Errors in Tests

**Issue**: Testing Ink components with `useInput` caused `stdin.ref is not a function` errors

**Root Cause**: Test environment doesn't provide proper stdin interface that Ink expects

### Solution Strategy

1. **Hook Extraction Pattern**:

   ```typescript
   // Extract navigation logic to testable hook
   export function useNavigation(
   	itemCount: number,
   	onSelect?: Function,
   	onQuit?: Function,
   ) {
   	const [selectedIndex, setSelectedIndex] = useState(0);

   	useInput(
   		(input, key) => {
   			// Navigation logic
   		},
   		{
   			isActive: process.env.NODE_ENV !== 'test',
   		},
   	);

   	return {selectedIndex, moveUp, moveDown, select, quit};
   }
   ```

2. **Separate Testing Strategies**:
   - **Hook Logic**: Test with `@testing-library/react` and `renderHook`
   - **Component Structure**: Test with `ink-testing-library` (without keyboard simulation)

### Key Learnings

1. **Separate concerns for testing**: Extract keyboard logic into hooks for easier testing
2. **Environment-aware hook behavior**: Use options to disable input handling in tests
3. **Test what you can control**: Focus on logic testing rather than keyboard simulation in test environment

## 3. TDD Implementation Success Patterns

### Effective TDD Cycle Applied

1. **RED**: Write failing tests first
   - Hook tests for navigation logic
   - Component tests for rendering
2. **GREEN**: Minimal implementation to pass tests
   - Basic navigation state management
   - Simple keyboard input handling
3. **REFACTOR**: Improve while keeping tests green
   - Extract reusable hook
   - Improve test organization
   - Address code quality feedback

### Testing Strategy That Worked

```typescript
// Hook-focused testing
describe('useNavigation', () => {
	it('should handle navigation correctly', () => {
		const {result} = renderHook(() => useNavigation(4));

		act(() => {
			result.current.moveDown();
		});

		expect(result.current.selectedIndex).toBe(1);
	});
});

// Component structure testing
describe('Home Component', () => {
	it('should render with correct structure', () => {
		const {lastFrame} = render(<Home onSelect={() => {}} />);
		expect(lastFrame()).toContain('EC2');
	});
});
```

### Key Learnings

1. **Hook extraction enables better testing**: Separate keyboard logic from rendering logic
2. **Mock external dependencies**: Use `vi.fn()` for callback testing
3. **Test behavior, not implementation**: Focus on what the user experiences

## 4. GitHub Copilot Feedback Integration

### Feedback Received and Actions Taken

1. **React Hooks Rules Violation**:

   - **Feedback**: "Calling useInput conditionally can break the rules of hooks"
   - **Action**: Refactored to use `isActive` option
   - **Commit**: `e7a8f63` - Fix React Hooks rules violation

2. **Test Duplication**:
   - **Feedback**: "This assertion duplicates the default selection check already covered"
   - **Action**: Consolidated duplicate tests with enhanced assertions
   - **Commit**: `7007ff3` - Consolidate duplicate tests

### Best Practices for Copilot Integration

1. **Address feedback promptly**: Don't let violations accumulate
2. **Reference feedback in commits**: Make feedback resolution traceable
3. **Learn from patterns**: Use feedback to improve overall coding practices
4. **Verify fixes comprehensively**: Ensure changes don't introduce regressions

### Key Learnings

1. **Copilot catches subtle issues**: Violations that might be missed in review
2. **Systematic approach to feedback**: Address, commit, document
3. **Quality improvement cycle**: Each fix improves overall code quality

## 5. Code Organization and Architecture Insights

### Successful Patterns

1. **Custom Hook for Complex Logic**:

   ```typescript
   // Reusable, testable navigation logic
   const {selectedIndex} = useNavigation(items.length, onSelect, onQuit);
   ```

2. **Separation of Concerns**:

   - Navigation logic: `useNavigation` hook
   - Rendering logic: Component
   - State management: Hook internal state

3. **Environment-Aware Implementation**:
   ```typescript
   // Handles test and production environments gracefully
   useInput(callback, {isActive: process.env.NODE_ENV !== 'test'});
   ```

### Key Learnings

1. **Extract complex logic to hooks**: Makes code more testable and reusable
2. **Plan for different environments**: Consider test constraints during design
3. **Gradual enhancement**: Start with basic functionality, add features incrementally

## 6. Testing Quality and Maintenance

### Test Consolidation Benefits

**Before** (duplicate tests):

- 8 tests with redundant assertions
- Maintenance overhead for identical logic
- Unclear test intent

**After** (consolidated tests):

- 7 tests with unique, comprehensive coverage
- Single source of truth for each assertion
- Clear test purpose and scope

### Test Quality Improvements

```typescript
// Enhanced test with comprehensive assertions
it('should highlight first service by default', () => {
	const output = lastFrame();

	// Positive assertion
	expect(output).toMatch(/>\s*EC2/);

	// Negative assertions for completeness
	expect(output).not.toMatch(/>\s*S3/);
	expect(output).not.toMatch(/>\s*Lambda/);
	expect(output).not.toMatch(/>\s*RDS/);
});
```

### Key Learnings

1. **Eliminate redundancy**: Consolidate tests with identical logic
2. **Comprehensive assertions**: Test both positive and negative cases
3. **Clear test intent**: Use descriptive names and comments

## 7. Phase Planning and Execution Insights

### Early Implementation Benefits

**Original Plan**: Arrow key navigation scheduled for Phase 5
**Actual**: Implemented in Phase 3 as foundational feature

**Benefits of early implementation**:

- Immediate user experience improvement
- Foundation for future navigation features
- Earlier feedback on navigation patterns

### Key Learnings

1. **Prioritize foundational UX features**: Basic navigation is essential, not optional
2. **Flexible phase planning**: Adapt plans based on actual development needs
3. **Document plan deviations**: Update documentation to reflect actual implementation

## 8. Development Workflow Improvements

### Effective Workflow Pattern

1. **Plan with clear objectives**: Define what "done" looks like
2. **Implement with TDD**: Write tests first, implement incrementally
3. **Address feedback immediately**: Don't accumulate technical debt
4. **Document learning**: Capture insights for future reference

### Key Learnings

1. **Consistent feedback loop**: TDD + linting + code review creates quality assurance
2. **Incremental commits**: Small, focused commits make issues easier to track
3. **Documentation investment**: Time spent documenting pays off in future development

## Summary of Critical Insights

1. **React Hooks Rules are non-negotiable**: Always call hooks in the same order
2. **Ink v4 testing requires special patterns**: Extract logic to hooks for better testability
3. **TDD with Ink is achievable**: Separate keyboard logic from rendering logic
4. **Copilot feedback is valuable**: Address promptly and learn from patterns
5. **Test quality matters**: Eliminate duplication, enhance coverage
6. **Early UX implementation pays off**: Don't delay foundational user experience features

## Action Items for Future Development

1. **Always check for conditional hook calls** during code review
2. **Extract keyboard logic to hooks** when implementing new input features
3. **Consolidate tests regularly** to maintain quality and reduce maintenance
4. **Address Copilot feedback systematically** with proper documentation
5. **Update phase plans** when implementation deviates from original planning

---

**Next Steps**: Apply these lessons to upcoming phases, particularly Phase 4 (Data Integration) and remaining Phase 5 features (pagination, search).
