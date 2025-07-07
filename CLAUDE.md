# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- **Build**: `npm run build` - Compiles TypeScript to JavaScript in the `dist/` directory
- **Development**: `npm run dev` - Runs TypeScript compiler in watch mode
- **Test**: `npm run test` - Runs the full test suite (Prettier, oxlint, and Vitest tests)
- **Test Watch**: `npm run test:watch` - Runs tests in watch mode for TDD with Vitest
- **Single test**: `npx vitest run <test-file>` - Run a specific test file
- **Lint**: `npm run lint` - Run oxlint to check code quality
- **Lint Fix**: `npm run lint:fix` - Auto-fix linting issues where possible

**IMPORTANT**: Always run `npm run lint` after writing code to ensure code quality.

## Architecture

This is a k9s-like AWS resource browsing TUI built with:

- **Ink v4**: React-based framework for building command-line interfaces
- **AWS SDK v3**: Primary backend for AWS API calls
- **AWS CLI**: Fallback backend via execa
- **TypeScript**: All source code is in TypeScript with ES modules
- **Vitest**: Modern test framework with fast watch mode and esbuild
- **ink-testing-library**: Testing utilities for Ink components
- **ink-table**: Table display component

### Code Structure

- `src/cli.tsx`: Entry point that handles CLI argument parsing and renders the Ink app
- `src/app.tsx`: Main application with screen routing
- `src/providers/`: Backend providers (SDK, CLI, Factory)
- `src/ui/`: UI components (Home, ResourceList, StatusBar)
- `src/hooks/`: Custom hooks (useResources for data fetching)
- `src/types/`: TypeScript type definitions
- `dist/`: Compiled JavaScript output directory

### TDD Development Rules

**MUST FOLLOW TDD CYCLE:**

1. **Red**: Write failing test first
2. **Green**: Write minimal code to pass test
3. **Refactor**: Improve code while keeping tests green

**Key Principles:**

- Never write implementation code without a failing test
- Each commit must have all tests passing
- Use `npm run test:watch` for continuous feedback with Vitest
- Write tests for all Provider implementations, UI components, and business logic

### Key Technical Details

- Uses ES modules (`"type": "module"` in package.json)
- Binary entry point is `dist/cli.js`
- Hybrid backend: AWS SDK v3 with CLI fallback
- Environment variables: `A3S_BACKEND`, `AWS_PROFILE`, `COLOR_BLIND`
- Requires Node.js >=20

## React Hooks Best Practices

**CRITICAL: Always follow React Hooks Rules**

### Hooks Rules Compliance

- **Never call hooks conditionally**: Always call hooks in the same order
- **Use options for conditional behavior**: Prefer `isActive` option over conditional hook calls
- **Example pattern for Ink useInput**:

  ```typescript
  // ❌ WRONG - Violates hooks rules
  if (process.env.NODE_ENV !== 'test') {
  	useInput(callback);
  }

  // ✅ CORRECT - Use isActive option
  useInput(callback, {
  	isActive: process.env.NODE_ENV !== 'test',
  });
  ```

### Ink v4 Testing Patterns

**Testing Environment Considerations:**

- Use `isActive: false` in test environments to avoid `stdin.ref` errors
- Extract navigation logic into custom hooks for easier testing
- Test hooks separately from components when keyboard interaction is involved

**Example navigation hook pattern**:

```typescript
export function useNavigation(
	itemCount: number,
	onSelect?: Function,
	onQuit?: Function,
) {
	const [selectedIndex, setSelectedIndex] = useState(0);

	useInput(
		(input, key) => {
			// Navigation logic here
		},
		{
			isActive: process.env.NODE_ENV !== 'test',
		},
	);

	return {selectedIndex, moveUp, moveDown, select, quit};
}
```

## Testing Excellence Guidelines

### Test Quality Standards

- **Eliminate duplicate tests**: Consolidate tests with identical assertions
- **Comprehensive coverage**: Test both positive and negative cases
- **Clear test intent**: Use descriptive test names and comments
- **DRY principle**: Avoid repeating test logic

### Example of good test consolidation:

```typescript
// ❌ DUPLICATE TESTS
it('should highlight selected service', () => {
	expect(output).toMatch(/>\s*EC2/);
});
it('should start with first service selected', () => {
	expect(output).toMatch(/>\s*EC2/);
});

// ✅ CONSOLIDATED TEST
it('should highlight first service by default', () => {
	expect(output).toMatch(/>\s*EC2/);
	expect(output).not.toMatch(/>\s*S3/);
	expect(output).not.toMatch(/>\s*Lambda/);
});
```

## Code Review Integration

### GitHub Copilot Feedback

- **Act on Copilot suggestions**: Address feedback promptly with proper commits
- **Document decisions**: Reference Copilot feedback in commit messages
- **Learn from patterns**: Use feedback to improve coding practices

### Quality Checks

- Always run linting after making changes based on feedback
- Ensure all tests pass after refactoring
- Verify no regression in functionality

## Implementation Plans

Detailed implementation plans for complex features are stored in `.claude/plans/`. These plans contain:

- Step-by-step implementation details
- Architecture decisions and rationale
- Dependencies and prerequisites
- Testing strategies

**Usage Guidelines:**

- Consult existing plans before implementing complex features
- Plans are version-controlled and should be updated if implementation deviates from the original design
- Create new plans for significant feature additions or architectural changes
