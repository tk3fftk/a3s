# Code Review Guidelines

**Date**: 2025-07-07  
**Context**: Guidelines for integrating GitHub Copilot feedback and maintaining code quality  
**Experience**: Based on PR #1 navigation implementation

## Overview

This document establishes guidelines for effective code review processes, with particular focus on integrating GitHub Copilot feedback, maintaining code quality standards, and ensuring systematic improvement cycles.

## 1. GitHub Copilot Feedback Integration

### Types of Copilot Feedback

1. **Rule Violations**: React Hooks rules, linting violations
2. **Code Quality**: Test duplication, maintainability issues
3. **Best Practices**: Performance optimizations, architecture suggestions
4. **Security**: Potential vulnerabilities, unsafe patterns

### Feedback Response Protocol

#### 1. Immediate Assessment

- **Read feedback carefully**: Understand the specific issue
- **Verify the concern**: Check if feedback applies to current context
- **Prioritize severity**: Address critical issues (rules violations) first

#### 2. Resolution Process

```bash
# 1. Create focused branch for feedback resolution
git checkout -b fix/copilot-hooks-rules

# 2. Implement fix with clear intent
# 3. Verify fix with tests
npm run test

# 4. Ensure linting passes
npm run lint

# 5. Commit with reference to feedback
git commit -m "Fix React Hooks rules violation

- Use isActive option instead of conditional useInput calls
- Addresses GitHub Copilot feedback on PR #1

🤖 Generated with [Claude Code](https://claude.ai/code)"
```

#### 3. Documentation Requirements

- **Reference feedback in commit message**: Make resolution traceable
- **Update documentation**: Add patterns to prevent similar issues
- **Share learnings**: Document insights in lessons-learned.md

### Example Feedback Integration

#### Feedback: React Hooks Rules Violation

```typescript
// GitHub Copilot: "Calling useInput conditionally can break the rules of hooks"

// ❌ BEFORE (violates rules)
if (process.env.NODE_ENV !== 'test') {
	useInput(callback);
}

// ✅ AFTER (compliant)
useInput(callback, {
	isActive: process.env.NODE_ENV !== 'test',
});
```

**Commit Message Pattern**:

```
Fix React Hooks rules violation in useNavigation

- Call useInput unconditionally with isActive option
- Integrate quit functionality into navigation hook
- Add comprehensive tests for quit functionality

Addresses GitHub Copilot feedback on PR #1

🤖 Generated with [Claude Code](https://claude.ai/code)
```

## 2. Code Quality Standards

### Pre-Review Checklist

#### Before Requesting Review

- [ ] All tests pass (`npm run test`)
- [ ] No linting errors (`npm run lint`)
- [ ] TypeScript compilation successful (`npm run build`)
- [ ] Changes follow established patterns
- [ ] Documentation updated if necessary

#### Code Quality Checks

- [ ] **DRY Principle**: No duplicate code or logic
- [ ] **Single Responsibility**: Functions/components have clear purpose
- [ ] **Testability**: Code is structured for easy testing
- [ ] **Error Handling**: Appropriate error handling in place
- [ ] **Performance**: No obvious performance bottlenecks

### Quality Improvement Patterns

#### Test Quality Enhancement

```typescript
// ❌ DUPLICATE TESTS
it('should highlight selected service', () => {
	expect(output).toMatch(/>\s*EC2/);
});
it('should start with first service selected', () => {
	expect(output).toMatch(/>\s*EC2/);
});

// ✅ CONSOLIDATED WITH ENHANCED COVERAGE
it('should highlight first service by default', () => {
	expect(output).toMatch(/>\s*EC2/);
	expect(output).not.toMatch(/>\s*S3/);
	expect(output).not.toMatch(/>\s*Lambda/);
});
```

#### Architecture Improvement

```typescript
// ❌ MIXED CONCERNS
function Home() {
	const [selectedIndex, setSelectedIndex] = useState(0);

	useInput((input, key) => {
		// Navigation + quit logic mixed
	});

	// Rendering logic
}

// ✅ SEPARATED CONCERNS
function Home() {
	const {selectedIndex} = useNavigation(
		services.length,
		onSelect,
		onQuit, // Navigation hook handles all keyboard logic
	);

	// Pure rendering logic
}
```

## 3. Review Process Guidelines

### For Review Authors

#### 1. Self-Review First

- Review your own changes before requesting review
- Check for obvious issues and fix them
- Ensure commit messages are descriptive
- Verify all checks pass

#### 2. Provide Context

- Clear PR description with summary of changes
- Reference related issues or feedback
- Explain architectural decisions
- Include test plan when relevant

#### 3. Respond to Feedback

- Address feedback promptly (within 24 hours)
- Ask clarifying questions if feedback is unclear
- Update documentation based on review insights
- Thank reviewers for their time and insights

### For Reviewers

#### 1. Focus Areas

- **Correctness**: Does the code work as intended?
- **Quality**: Is the code maintainable and well-structured?
- **Testing**: Are changes adequately tested?
- **Documentation**: Are changes properly documented?

#### 2. Feedback Guidelines

- Be specific and actionable
- Explain the "why" behind suggestions
- Suggest alternatives when pointing out problems
- Balance critical feedback with positive observations

#### 3. Copilot Feedback Integration

- Pay attention to Copilot suggestions in PR
- Validate Copilot feedback before requesting changes
- Help author understand the reasoning behind suggestions
- Document patterns for future reference

## 4. Systematic Quality Improvement

### Quality Metrics Tracking

#### Code Health Indicators

- Test coverage percentage
- Linting error count
- TypeScript strict mode compliance
- Performance benchmarks

#### Process Metrics

- Time to address feedback
- Number of review cycles per PR
- Frequency of similar issues
- Documentation completeness

### Continuous Improvement Cycle

#### 1. Pattern Recognition

- **Identify recurring issues**: Track common feedback themes
- **Document solutions**: Create reusable patterns
- **Update guidelines**: Evolve standards based on experience
- **Share knowledge**: Conduct team learning sessions

#### 2. Automation Enhancement

```json
// package.json scripts for quality gates
{
	"scripts": {
		"quality:check": "npm run lint && npm run test && npm run build",
		"quality:fix": "npm run lint:fix && npm run format",
		"pre-commit": "npm run quality:check"
	}
}
```

#### 3. Documentation Updates

- Update CLAUDE.md with new patterns
- Create specific guides for common issues
- Maintain lessons-learned.md
- Update testing patterns based on experience

## 5. React Hooks Specific Guidelines

### Hooks Rules Compliance Checklist

#### Before Writing Hooks

- [ ] Plan hook call order and ensure consistency
- [ ] Consider test environment constraints
- [ ] Design for testability with programmatic interfaces
- [ ] Plan for environment-specific behavior

#### During Implementation

- [ ] Always call hooks in the same order
- [ ] Use hook options for conditional behavior
- [ ] Extract complex logic to custom hooks
- [ ] Provide testable interfaces

#### Code Review Focus

- [ ] Check for conditional hook calls
- [ ] Verify proper use of hook options
- [ ] Ensure testability of hook logic
- [ ] Validate environment handling

### Common Hooks Patterns

#### Environment-Aware Pattern

```typescript
// ✅ RECOMMENDED PATTERN
function useInput(callback, options = {}) {
	return useInputHook(callback, {
		isActive: process.env.NODE_ENV !== 'test',
		...options,
	});
}
```

#### Testable Hook Interface

```typescript
// ✅ PROVIDE PROGRAMMATIC INTERFACE
function useNavigation(itemCount, onSelect, onQuit) {
	// Hook implementation...

	return {
		// State for testing
		selectedIndex,

		// Actions for testing
		moveUp,
		moveDown,
		select,
		quit,

		// Direct state setter for testing
		setSelectedIndex,
	};
}
```

## 6. Testing-Focused Review Guidelines

### Test Quality Assessment

#### Test Coverage Evaluation

- [ ] All new functionality has tests
- [ ] Edge cases are covered
- [ ] Error conditions are tested
- [ ] Integration points are validated

#### Test Quality Indicators

- [ ] Tests are focused and specific
- [ ] No duplicate test logic
- [ ] Clear test names and descriptions
- [ ] Appropriate use of mocks and stubs

### Testing Anti-Patterns to Catch

#### ❌ Avoid These Patterns

```typescript
// Testing implementation details
expect(component.state.selectedIndex).toBe(0);

// Duplicate test logic
it('should do X', () => {
	/* same logic */
});
it('should also do X', () => {
	/* same logic */
});

// Unclear test intent
it('should work', () => {
	/* what should work? */
});
```

#### ✅ Prefer These Patterns

```typescript
// Test user-observable behavior
expect(output).toMatch(/>\s*EC2/);

// Consolidated, comprehensive tests
it('should highlight first service by default', () => {
	expect(output).toMatch(/>\s*EC2/);
	expect(output).not.toMatch(/>\s*S3/);
});

// Clear, descriptive test names
it('should wrap around when moving up from first item', () => {
	// Clear what behavior is being tested
});
```

## 7. Documentation Standards

### Required Documentation Updates

#### For New Features

- [ ] Update CLAUDE.md with relevant patterns
- [ ] Add to appropriate phase plan
- [ ] Document testing approaches
- [ ] Update architecture decisions

#### For Bug Fixes

- [ ] Document root cause in lessons-learned.md
- [ ] Update prevention guidelines
- [ ] Add regression test patterns
- [ ] Share insights with team

### Documentation Quality Standards

#### Clarity Requirements

- Clear, actionable guidance
- Specific examples with code samples
- Rationale explanation for decisions
- References to related resources

#### Maintenance Requirements

- Regular review and updates
- Removal of outdated information
- Consolidation of related content
- Version control of document changes

## 8. Escalation and Conflict Resolution

### When to Escalate

#### Technical Disagreements

- Fundamental architectural decisions
- Performance vs. maintainability trade-offs
- Testing strategy conflicts
- Security-related concerns

#### Process Issues

- Repeated pattern violations
- Inadequate feedback response
- Timeline constraints affecting quality
- Resource allocation problems

### Resolution Approach

#### 1. Discussion First

- Schedule focused discussion
- Present technical evidence
- Consider alternative approaches
- Document decision rationale

#### 2. Prototype if Necessary

- Create proof-of-concept implementations
- Measure performance implications
- Test alternative approaches
- Validate assumptions with data

#### 3. Team Decision

- Present options with trade-offs
- Seek team consensus
- Document final decision
- Update guidelines accordingly

## 9. Tools and Automation

### Quality Gates Integration

#### Pre-commit Hooks

```bash
#!/bin/bash
# .husky/pre-commit
npm run lint
npm run test
npm run build
```

#### CI/CD Pipeline Checks

```yaml
# GitHub Actions example
- name: Quality Checks
  run: |
    npm run lint
    npm run test
    npm run build

- name: Code Coverage
  run: npm run test:coverage
```

### Automated Code Review

#### GitHub Settings

- Require review from code owners
- Require status checks to pass
- Require branches to be up to date
- Require linear history

#### Copilot Integration

- Enable Copilot suggestions in PRs
- Configure sensitivity levels
- Document common suggestion patterns
- Train team on feedback interpretation

## 10. Success Metrics and KPIs

### Code Quality Metrics

#### Quantitative Measures

- Test coverage percentage (target: >85%)
- Linting error count (target: 0)
- Code review cycle time (target: <48 hours)
- Defect escape rate (target: <5%)

#### Qualitative Measures

- Code readability and maintainability
- Documentation completeness
- Team knowledge sharing
- Pattern consistency

### Process Improvement Indicators

#### Efficiency Metrics

- Time from feedback to resolution
- Number of review iterations per PR
- Frequency of similar issues
- Team satisfaction with process

#### Learning Metrics

- Documentation usage frequency
- Pattern adoption rate
- Knowledge sharing sessions
- Continuous improvement initiatives

---

## Summary

Effective code review process requires:

1. **Systematic feedback integration** with proper documentation
2. **Quality-focused standards** that prevent technical debt
3. **Continuous improvement** based on team learning
4. **Clear escalation paths** for complex decisions
5. **Automated quality gates** to maintain consistency

These guidelines ensure that code review becomes a learning and improvement mechanism rather than just a checkpoint.
