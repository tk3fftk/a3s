# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- **Build**: `npm run build` - Compiles TypeScript to JavaScript in the `dist/` directory
- **Development**: `npm run dev` - Runs TypeScript compiler in watch mode
- **Test**: `npm run test` - Runs the full test suite (Prettier, XO linting, and AVA tests)
- **Single test**: `npx ava test.tsx` - Run a specific test file

## Architecture

This is a CLI application built with:

- **Ink**: React-based framework for building command-line interfaces
- **Meow**: CLI argument parsing
- **TypeScript**: All source code is in TypeScript with ES modules
- **AVA**: Test framework with TypeScript support via ts-node/esm loader

### Code Structure

- `source/cli.tsx`: Entry point that handles CLI argument parsing with meow and renders the Ink app
- `source/app.tsx`: Main React component that displays the greeting with optional name parameter
- `test.tsx`: Test file using AVA and ink-testing-library for component testing
- `dist/`: Compiled JavaScript output directory (created by build process)

### Key Technical Details

- Uses ES modules (`"type": "module"` in package.json)
- Binary entry point is `dist/cli.js`
- XO linting with React extensions and Prettier integration
- AVA configured with TypeScript support and ts-node/esm loader
- Requires Node.js >=16