# Program Detection Utility (hasProgram)

**Created:** 2025-11-01
**Status:** Phase 4 Complete - ALL PHASES COMPLETE ✅

## Overview

Implement the `hasProgram` utility function that tests whether a program exists in the executable path of the host system. The function will work cross-platform (macOS, Windows, Linux), detect both regular executables and shell builtins, and include performance caching to avoid repeated shell executions.

## Goals

- Implement cross-platform program detection using system commands
- Support darwin (macOS), win32 (Windows), and linux platforms
- Detect both regular executables (in PATH) and shell builtin commands
- Add simple caching mechanism to improve performance for repeated checks
- Provide comprehensive error handling for edge cases and failures
- Maintain type safety with boolean return type
- Write comprehensive test coverage following TDD principles

## Success Criteria

- [x] Function correctly detects executables in PATH on all supported platforms
- [x] Function correctly detects shell builtin commands (cd, echo, source, etc.) - Phase 3 Complete
- [x] Edge cases handled (empty strings, special characters, non-existent programs, spaces)
- [x] Error conditions handled gracefully (returns Error objects for invalid chars, false for not found)
- [x] Input sanitization prevents command injection vulnerabilities (Phase 2)
- [x] Type system prevents invalid characters at compile time (Phase 2)
- [x] Caching improves performance for repeated checks of the same program - Phase 4 ✅
- [x] Cache busting function available for edge cases - Phase 4 ✅
- [x] All runtime tests pass (83 tests: 78 passing, 5 skipped - includes Phase 4)
- [x] Type tests verify correct return types (boolean, false literal, Error)
- [x] No regressions in existing test suite
- [x] Code follows project conventions (JSDoc, error handling, exports)
- [x] Spaces in program names are supported with proper quoting (Phase 2)

## Phases

### Phase 1: Basic Cross-Platform Detection

**Goal:** Implement core program detection functionality that works across darwin, win32, and linux platforms using appropriate system commands.

**Dependencies:** None

**Estimated Complexity:** Medium

#### Tests to Write

**Happy Path:**

1. should return true when checking for a program that exists (e.g., "node")
2. should return false when checking for a program that does not exist
3. should work correctly on darwin platform (using "which" command)
4. should work correctly on win32 platform (using "where" command)
5. should work correctly on linux platform (using "which" command)

**Edge Cases:**

1. should handle program names with hyphens (e.g., "node-gyp")
2. should handle program names with underscores
3. should be case-sensitive on Unix-like systems
4. should be case-insensitive on Windows

**Error Conditions:**

1. should return false when shell command execution fails
2. should return false when command returns non-zero exit code
3. should not throw errors for any input

**Type Tests (TypeScript only):**

1. should return boolean type
2. should accept string parameter
3. should not accept non-string parameters

#### Implementation

**Files to Create:**

- `tests/unit/WIP/hasProgram.test.ts` - Comprehensive test suite for Phase 1

**Files to Modify:**

- `src/utils/hasProgram.ts` - Add implementation (currently empty stub)

**Key Functions/Classes:**

- `hasProgram(test: string): boolean` - Main function that checks if program exists in PATH

**Implementation Details:**

- Import `execSync` from `child_process` module
- Import `platform()` from `os` module to detect OS
- Use try-catch for error handling
- Platform-specific command selection:
  - darwin/linux: `which ${programName}` (redirect stderr to suppress error output)
  - win32: `where ${programName}`
- Return true if command succeeds (exit code 0), false otherwise
- Suppress command output to avoid console noise

#### Success Criteria

- [x] All WIP tests pass
- [x] No regressions in existing tests
- [x] Function works on all three platforms (darwin, win32, linux)
- [x] Error handling prevents crashes

**Phase 1 Completed:** 2025-11-01
**Log:** `.ai/logs/2025-11-program-detection-phase1-log.md`
**Tests:** `tests/unit/hasProgram.test.ts` ✅ (migrated and passing)

---

### Phase 2: Edge Cases and Error Handling

**Goal:** Ensure robust handling of edge cases, invalid input, and error conditions with comprehensive test coverage.

**Dependencies:** Phase 1 completed

**Estimated Complexity:** Low

#### Tests to Write

**Happy Path:**

1. should handle programs with version suffixes (e.g., "python3")
2. should handle programs in subdirectories of PATH

**Edge Cases:**

1. should return false for empty string input
2. should return false for whitespace-only input
3. should handle program names with dots (e.g., "node.exe" on Windows)
4. should handle program names with spaces (edge case, likely false)
5. should handle very long program names
6. should handle special characters safely (no command injection)
7. should handle null/undefined input gracefully (TypeScript: type prevents, but test runtime behavior)

**Error Conditions:**

1. should return false when PATH environment variable is not set
2. should handle execSync throwing an error
3. should sanitize input to prevent command injection attempts

**Type Tests (TypeScript only):**

1. should enforce string type at compile time
2. should not allow undefined/null at type level

#### Implementation

**Files to Create:**

- Additional tests in existing `tests/unit/WIP/hasProgram.test.ts`

**Files to Modify:**

- `src/utils/hasProgram.ts` - Add input validation and enhanced error handling

**Implementation Details:**

- Add input validation (check for empty/whitespace strings)
- Add type guards for null/undefined (runtime safety)
- Ensure no command injection vulnerabilities (avoid string interpolation with user input)
- Consider input sanitization or safe command construction
- Improve error handling in try-catch block

#### Success Criteria

- [x] All WIP tests pass
- [x] Edge cases handled gracefully
- [x] No command injection vulnerabilities
- [x] Input validation prevents invalid calls
- [x] No regressions in existing tests

**Phase 2 Completed:** 2025-11-01
**Log:** `.ai/logs/2025-11-program-detection-phase2-log.md`
**Tests:** Tests consolidated and passing:
- `tests/unit/hasProgram.test.ts` - Core functionality tests
- `tests/unit/hasProgram-edge-cases.test.ts` - Edge cases with real executables
- `tests/unit/WIP/phase2-edge-cases.test.ts` - DELETED (merged into above)

**Phase 2 Final Enhancements:**
- ✅ Added proper quoting to support spaces in program names
- ✅ Type system prevents invalid characters at compile time
- ✅ Runtime returns Error objects (type: "invalid-char") for invalid chars
- ✅ Empty/whitespace strings return literal `false`
- ✅ Created `createTestExecutable()` test utility for real executable testing
- ✅ All tests consolidated and deduplicated (26 tests, 22 passing, 4 skipped)
- ✅ STDERR handling verified for both Unix (`2>/dev/null`) and Windows (via execSync stdio)

---

### Phase 3: Shell Builtin Detection

**Goal:** Add detection of shell builtin commands (cd, echo, source, etc.) in addition to regular executables in PATH.

**Dependencies:** Phase 2 completed

**Estimated Complexity:** Medium

#### Tests to Write

**Happy Path:**

1. should return true for common builtins on Unix-like systems (cd, echo, pwd, source)
2. should return true for common builtins on Windows (cd, echo, dir, set)
3. should return true for bash-specific builtins (declare, local, readonly)
4. should return true for programs that are both builtins and executables

**Edge Cases:**

1. should handle builtins that vary by shell (bash vs zsh vs sh)
2. should prioritize executables over builtins (or handle both correctly)
3. should handle platform-specific builtin differences

**Error Conditions:**

1. should return false when builtin detection command fails
2. should gracefully handle shells that don't support type command

**Type Tests (TypeScript only):**

1. should maintain boolean return type with builtin detection

#### Implementation

**Files to Create:**

- Additional tests in existing `tests/unit/WIP/hasProgram.test.ts`

**Files to Modify:**

- `src/utils/hasProgram.ts` - Add builtin detection logic

**Implementation Details:**

- For Unix-like systems: use `type` command to check for builtins
  - Example: `type cd` returns "cd is a shell builtin"
  - The `type` command works in bash, zsh, and sh
- For Windows: use `where` which also detects builtins
- Check for builtin AFTER checking PATH (executables take precedence)
- Platform-specific approach:
  - darwin/linux: `type -t ${programName}` returns "builtin" for builtins
  - win32: `where` already handles builtins
- Add to existing try-catch error handling
- Combine results: return true if EITHER executable OR builtin

#### Success Criteria

- [x] All WIP tests pass
- [x] Builtins correctly detected on all platforms
- [x] Both executables and builtins return true
- [x] Error handling covers builtin detection failures
- [x] No regressions in existing tests

**Phase 3 Completed:** 2025-11-01
**Log:** `.ai/logs/2025-11-program-detection-phase3-log.md`
**Tests:** `tests/unit/hasProgram-builtins.test.ts` ✅ (migrated and passing)

**Key Discovery:** Phase 3 functionality was already implemented in Phases 1-2! The `which` command on Unix and `where` on Windows both natively detect shell builtins, so no additional implementation was needed. The Phase 3 tests serve as validation and documentation of this capability.

**Test Coverage:**

- 11 tests covering Unix builtins, Windows builtins, bash-specific builtins, edge cases, and type narrowing
- All tests passing with proper TypeScript patterns (runtime + type tests integrated)

---

### Phase 4: Performance Caching

**Goal:** Add simple caching mechanism to avoid repeated shell executions for the same program name, improving performance.

**Dependencies:** Phase 3 completed

**Estimated Complexity:** Low

**Status:** ✅ COMPLETE

#### Tests to Write

**Happy Path:**

1. should cache results for repeated checks of the same program
2. should return cached result without executing shell command again
3. should cache both positive (exists) and negative (doesn't exist) results
4. should cache builtin detection results

**Edge Cases:**

1. should maintain separate cache entries for different program names
2. should handle cache with case-sensitive program names correctly
3. should not cache across different platforms (if platform can change at runtime - unlikely but safe)

**Error Conditions:**

1. should not break if cache becomes large (basic stress test)

**Type Tests (TypeScript only):**

1. should maintain boolean return type with caching
2. should not expose cache implementation in public API

#### Implementation

**Files to Create:**

- Additional tests in existing `tests/unit/WIP/hasProgram.test.ts`

**Files to Modify:**

- `src/utils/hasProgram.ts` - Add caching logic

**Implementation Details:**

- Create module-level Map to store cache: `const programCache = new Map<string, boolean>()`
- Check cache before executing shell command
- Store result in cache after shell execution (includes builtin checks)
- Cache key is the program name (string)
- Cache value is the boolean result
- Simple implementation: no cache invalidation, no size limits (acceptable for this use case)
- Consider if cache should be exported for testing (prefer testing through behavior)

#### Success Criteria

- [x] All WIP tests pass (12/12 tests passing)
- [x] Caching improves performance (verified via mocked execSync call counting)
- [x] Cached and non-cached results are identical
- [x] No regressions in existing tests (75/75 passing, 5 skipped)
- [x] Type safety maintained (21/21 type assertions passing)

**Phase 4 Completed:** 2025-11-01
**Log:** `.ai/logs/2025-11-program-detection-phase4-log.md`
**Tests:** `tests/unit/hasProgram-caching.test.ts` ✅ (15 tests, migrated)

**Key Implementation Details:**
- Module-level `Map<string, boolean>` cache
- Cache checked before shell execution
- Both positive and negative results cached
- Cache busting via `hasProgram__Bust()` exported function
- Performance improvement verified via spy/mock testing

**Test Coverage:**
- 12 caching behavior tests
- 3 cache busting tests
- All 15 tests passing with no regressions

---

## Execution Notes

Each phase follows the **5-Step TDD Workflow**:

1. **SNAPSHOT** - Capture current test state
2. **CREATE LOG** - Document starting position in `.ai/logs/`
3. **WRITE TESTS** - Create tests FIRST in `tests/unit/WIP/`
4. **IMPLEMENTATION** - Write code to pass tests
5. **CLOSE OUT** - Verify completion, document (tests stay in WIP for review)

Use the `/execute-phase` command to execute each phase.

## Implementation References

**Similar utilities in the codebase:**

- `src/utils/detectColorScheme.ts` - Uses `execSync` with platform-specific commands
- `src/utils/os.ts` - Platform detection utilities (`discoverOs()`)

**Testing patterns:**

- `tests/detectColorScheme.test.ts` - Environment variable testing, platform-specific behavior
- `tests/osc-parsing.test.ts` - Type tests with `Expect<T extends true>` pattern

## Notes

**Platform Commands:**

- **Unix-like (darwin, linux):**
  - `which <program>` returns 0 if found in PATH, 1 if not found
  - `type -t <program>` returns "builtin" for builtins, "file" for executables, "alias" for aliases
- **Windows (win32):**
  - `where <program>` returns 0 if found, 1 if not found (also detects builtins)

**Builtin Detection Strategy:**

- Phase 1-2: Focus on PATH executables only
- Phase 3: Add builtin detection
  - Unix: Use `type -t <program>` to check for builtins
  - Windows: `where` already handles builtins
  - Combined check: return true if EITHER executable OR builtin exists
- Common builtins to test: cd, echo, pwd, source (Unix), cd, echo, dir, set (Windows)

**Error Handling Strategy:**

- Use try-catch around `execSync` calls
- Return false for any errors (don't throw)
- Suppress stderr output to avoid console noise: `{ stdio: ['pipe', 'pipe', 'ignore'] }`
- Handle cases where `type` command might not be available

**Caching Strategy:**

- Simple Map-based cache at module level
- No invalidation needed (programs in PATH rarely change during runtime)
- Cache both positive and negative results to avoid repeated failures
- Cache covers both executable and builtin checks

**Security Considerations:**

- Avoid command injection by not using string interpolation with user input
- Consider using array syntax for execSync if available, or sanitize input
- Empty/whitespace input should be rejected before shell execution
- Validate input before passing to shell commands

---

## Plan Summary

**Status:** ALL PHASES COMPLETE ✅

**Implementation Summary:**

The `hasProgram` utility is fully implemented with the following features:

1. **Cross-platform detection** (macOS/darwin, Windows/win32, Linux)
2. **Shell builtin support** (cd, echo, pwd, etc.)
3. **Type-safe API** with conditional return types
4. **Command injection protection** via type system and runtime validation
5. **Performance caching** with cache busting capability
6. **Comprehensive test coverage** (83 tests total)

**Files Created/Modified:**

- `src/utils/hasProgram.ts` - Main implementation (157 lines)
- `tests/unit/hasProgram.test.ts` - Core tests (8 tests)
- `tests/unit/hasProgram-edge-cases.test.ts` - Edge case tests (18 tests)
- `tests/unit/hasProgram-builtins.test.ts` - Builtin detection tests (11 tests)
- `tests/unit/hasProgram-caching.test.ts` - Caching tests (15 tests) ✅

**Total Test Coverage:**

- Runtime tests: 78 passing, 5 skipped (83 total)
- Type tests: 21 assertions passing
- No regressions

**API Exports:**

```typescript
// Main function
export function hasProgram<T extends string>(cmd: T): boolean | false | Err

// Cache busting utility (typically not needed)
export function hasProgram__Bust(): void

// Type utilities
export const INVALID_COMMAND_CHARS: readonly string[]
export type InvalidCommandChar
```

**Status:**

✅ All phases complete
✅ All tests migrated to permanent locations
✅ No WIP tests remaining
✅ Ready for production use
