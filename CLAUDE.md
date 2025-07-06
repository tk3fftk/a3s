# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- **Build**: `npm run build` - Compiles TypeScript to JavaScript in the `dist/` directory
- **Development**: `npm run dev` - Runs TypeScript compiler in watch mode
- **Test**: `npm run test` - Runs the full test suite (Prettier, oxlint, and AVA tests)
- **Test Watch**: `npm run test:watch` - Runs tests in watch mode for TDD
- **Single test**: `npx ava <test-file>` - Run a specific test file
- **Lint**: `npm run lint` - Run oxlint to check code quality
- **Lint Fix**: `npm run lint:fix` - Auto-fix linting issues where possible

**IMPORTANT**: Always run `npm run lint` after writing code to ensure code quality.

## Architecture

This is a k9s-like AWS resource browsing TUI built with:

- **Ink v4**: React-based framework for building command-line interfaces
- **AWS SDK v3**: Primary backend for AWS API calls
- **AWS CLI**: Fallback backend via execa
- **TypeScript**: All source code is in TypeScript with ES modules
- **Jest**: Test framework with TypeScript support
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
- Use `npm run test:watch` for continuous feedback
- Write tests for all Provider implementations, UI components, and business logic

### Key Technical Details

- Uses ES modules (`"type": "module"` in package.json)
- Binary entry point is `dist/cli.js`
- Hybrid backend: AWS SDK v3 with CLI fallback
- Environment variables: `A3S_BACKEND`, `AWS_PROFILE`, `COLOR_BLIND`
- Requires Node.js >=20
