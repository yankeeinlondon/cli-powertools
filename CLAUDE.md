# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**cli-powertools** is a TypeScript library providing fine-grained utilities for working with terminals and consoles. The library focuses on cross-platform terminal detection and capability discovery, including background color detection, terminal application identification, color depth detection, and available width determination.

## Commands

### Testing

```bash
# Run both runtime and type tests (local only)
pnpm test

# Run only runtime tests (Vitest)
pnpm test:runtime

# Run only type tests (typed-tester)
pnpm test:types

# Check type definitions
pnpm test:source

# Pass arguments to test runner (e.g., for filtering)
pnpm test -- [args]
```

**Note:** The `pnpm test` script automatically detects CI environments (via `CI` or `GITHUB_ACTIONS` env vars) and runs only runtime tests in CI. Locally, it runs both runtime and type tests sequentially. The test script is implemented in `scripts/test.mjs` for cross-platform compatibility.

### Building

```bash
# Build the project using tsdown
pnpm build
```

Build configuration is in `tsdown.config.ts`, which outputs ESM format to the `bin/` directory with sourcemaps enabled.

## Architecture

### Core Design Philosophy

This library emphasizes **both runtime behavior and type safety**. Unlike typical JavaScript libraries, this project treats TypeScript types as first-class citizens requiring explicit testing through the `typed-tester` package.

### Module Organization

The codebase follows a clean separation of concerns:

- **`src/utils/`** - Core utility functions (detection, formatting, validation)
- **`src/types/`** - Type definitions and TypeScript utilities
- **`src/constants.ts`** - Shared constants (terminal app definitions, environment variable mappings)
- **`src/errors.ts`** - Error handling utilities

All exports flow through `src/index.ts`, which re-exports from utils, types, constants, and errors.

### Key Utilities

#### Terminal Detection

The library provides several sophisticated detection utilities that follow a **fallback chain pattern**:

1. **`detectColorScheme()`** - Detects light/dark terminal background
   - Priority: OSC4/OSC11 terminal queries → ENV variables → OS-specific detection
   - Supports override via `VITE_THEME`/`THEME` environment variables
   - Falls back to `VITE_PREFERS`/`PREFERS` when detection fails
   - Implementation: `src/utils/detectColorScheme.ts`

2. **`detectColorDepth()`** - Detects terminal color capability (8, 16, 256, or 16.7M colors)
   - Priority: `COLORTERM` env var → `TERM` env var → OSC query → fallback (256)
   - Uses caching to avoid repeated terminal queries
   - Implementation: `src/utils/detectColorDepth.ts`

3. **`detectAvailableWidth()`** - Detects terminal width in characters
   - Priority: `COLUMNS` env var → `process.stdout.columns` → OSC query → fallback (80)
   - Accepts optional fallback parameter with preserved literal type
   - Uses caching for OSC query results
   - Implementation: `src/utils/detectAvailableWidth.ts`

4. **`detectTerminalApp()`** - Identifies the terminal application
   - Priority: `TERM_PROGRAM` → `TERM` patterns → terminal-specific env vars
   - Supports: iTerm2, Kitty, Alacritty, WezTerm, Windows Terminal, PowerShell, cmd.exe, ConEmu, mintty, Konsole, Ghostty
   - WSL-aware: detects actual terminal app rather than reporting "wsl"
   - Implementation: `src/utils/detectTerminalApp.ts`

5. **`hasProgram()`** - Checks if a program exists in PATH or is a shell builtin
   - Type-safe: rejects invalid command characters at compile time
   - Module-level caching for performance (clear with `hasProgram__Bust()`)
   - Cross-platform: handles Unix and Windows shell builtins
   - Implementation: `src/utils/hasProgram.ts`

#### OSC (Operating System Command) Queries

Several utilities use OSC escape sequences to query terminal capabilities. The OSC query pattern involves:

1. Setting stdin to raw mode to capture terminal responses
2. Writing OSC query sequences to stdout
3. Parsing responses with timeout protection (typically 100ms)
4. Proper cleanup of stdin state, even on errors
5. Caching results to avoid repeated queries

OSC implementations can be found in:
- `src/utils/background-color/queryTerminalColor.ts` - Background color queries
- `src/utils/detectColorDepth.ts` - Color depth queries
- `src/utils/detectAvailableWidth.ts` - Terminal width queries

### Cross-Platform Support

The library is designed for macOS, Linux, and Windows:

- **OS Detection**: `src/utils/os.ts` provides `discoverOs()` which returns NodeJS.Platform
- **Windows-specific**: Registry queries, batch file handling, Windows Terminal detection
- **macOS-specific**: `defaults` command for system preferences
- **Linux-specific**: `gsettings` for GNOME, GTK theme variables
- **WSL Detection**: `isRunningInWSL()` in `src/utils/detectTerminalApp.ts`

### Type Safety Patterns

This project leverages advanced TypeScript features from the `inferred-types` package:

- **Narrow types**: Using `narrow()` for const-like arrays and objects with literal types
- **Type predicates**: `Contains`, `IsEqual`, `Trim`, etc. for compile-time validation
- **Branded types**: `WithoutChars<T>` pattern prevents invalid characters at type level
- **Error types**: Type-level errors like `InvalidChar<T>` provide clear feedback

Example from `hasProgram.ts`:
```typescript
type WithoutChars<T extends string> = IsEqual<
    StripChars<T,InvalidCommandChar>,
    T
> extends true ? T : never;

export function hasProgram<T extends string>(cmd: T & WithoutChars<T>): Rtn<T>
```

### Testing Approach

Tests are organized in `tests/unit/` with subdirectories for complex utilities:

- **Runtime tests**: Vitest with `describe` and `it` blocks
- **Type tests**: Using `typed-tester` for explicit type checking
- **Test helpers**: `tests/helpers/` provides utilities like `createTestExecutable()` for cross-platform executable creation

**Testing Guidelines:**
- Type utilities: type tests only
- Functions: primarily runtime tests, add type tests for complex type signatures
- Classes: focus on runtime tests
- Use `tests/helpers/createTestExecutable.ts` when testing program existence checks

### Path Aliases

The project uses `~/*` as an alias for `src/*`:

- **tsconfig.json**: `"paths": { "~/*": ["./src/*"] }`
- **vitest.config.ts**: Configured with `resolve.alias` mapping
- Enables clean imports like `import { TerminalApp } from "~/types"`

## Project Configuration

- **Package manager**: pnpm 10.19.0
- **TypeScript**: Strict mode enabled with incremental compilation
- **Module system**: ESNext with Bundler resolution
- **Build tool**: tsdown (outputs to `bin/`)
- **Test runner**: Vitest + typed-tester
- **Lint**: eslint.config.ts (TypeScript format)

## GitHub Actions

- **PR workflow**: `.github/workflows/pr.yml`
- **Release workflow**: `.github/workflows/release.yml`
- **Test workflow**: `.github/workflows/test.yml`
  - Uses reusable workflow from `yankeeinlondon/gha`
  - Skips testing on commits with "release v" in message
  - Runs with `transpile: true` option

## Dependencies

Key dependencies:
- **inferred-types**: Advanced TypeScript type utilities and runtime helpers
- **@yankeeinlondon/kind-error**: Error handling utilities
- **typed-tester**: Type testing framework
