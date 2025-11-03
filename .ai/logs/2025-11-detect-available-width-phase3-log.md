# Phase 3: OSC-Based Width Detection

**Plan:** detect-available-width
**Phase:** 3
**Started:** 2025-11-03 10:55:26

## Phase Overview

Add active terminal probing using OSC (Operating System Command) escape sequences to detect terminal width when environment variables are unavailable or unreliable. This provides more reliable detection in scenarios where:

- Environment variables are not set
- `process.stdout.columns` is unavailable (non-TTY or unsupported terminals)
- Terminal was resized after the process started
- Running in terminal multiplexers (tmux/screen)

**Key changes:**

- Convert function signature from synchronous to `async function detectAvailableWidth()`
- Add OSC query implementation using terminal size queries
- Implement caching mechanism similar to `detectColorDepth`
- Add timeout handling (default: 100ms)

**Detection Priority Order (Updated):**

1. COLUMNS environment variable
2. process.stdout.columns property
3. **OSC query to terminal (NEW - active probing)**
4. User-provided fallback value (default: 80)

## Starting Test Position

```xml
<test-snapshot date="2025-11-03">
  <suite name="runtime-tests" total="179" passed="179" failed="0" skipped="5" />
  <suite name="type-tests" total="18" passed="18" failed="0" />
  <existing-failures>
    <!-- No existing failures -->
  </existing-failures>
</test-snapshot>
```

## Repo Starting Position

**Last local commit:** `a57495e74b677cb7ad7e9e9d21d405a7b1ce30f9`
**Last remote commit:** N/A (no remote tracking)
**Branch:** `main`
**Dirty files:**

```text
 M package.json
 M pnpm-lock.yaml
 M scripts/detection.ts
 D src/types/HexToDecimal.ts
 D src/types/IsRGB.ts
 D src/types/RGB.ts
 M src/types/color.ts
 M src/types/index.ts
 D src/utils/availableWidth.ts
 M src/utils/format.ts
 M src/utils/index.ts
 M src/utils/stripEscapeCodes.ts
 M src/utils/userShell.ts
 D tests/unit/detectColorDepth-env.test.ts
 D tests/unit/detectColorDepth-osc.test.ts
 D tests/unit/detectColorDepth-platform.test.ts
 D tests/unit/detectColorDepth.test.ts
 D tests/unit/hasProgram-builtins.test.ts
 D tests/unit/hasProgram-caching.test.ts
 D tests/unit/hasProgram-edge-cases.test.ts
 D tests/unit/hasProgram.test.ts
?? .ai/logs/2025-11-detect-available-width-phase1-log.md
?? .ai/plans/2025-11-detect-available-width.md
?? src/constants.ts
?? src/errors.ts
?? src/types/shell.ts
?? src/utils/color-conversion/
?? src/utils/detectAvailableWidth.ts
?? src/utils/detectTerminalApp.ts
?? src/utils/link.ts
?? tests/unit/detectAvailableWidth.test.ts
?? tests/unit/detectColorDepth/
?? tests/unit/hasProgram/
?? tests/unit/namedColor.test.ts
```

## Existing Code Exploration

### Files Found

- **`src/utils/detectAvailableWidth.ts`** - Exists with synchronous implementation (Phase 1)
  - Currently returns `number` synchronously
  - Uses COLUMNS env var and process.stdout.columns
  - No OSC query capability

- **`src/utils/detectColorDepth.ts`** - Reference implementation with OSC queries
  - Uses `queryColorDepthCapability()` helper for OSC queries
  - Implements proper raw mode handling
  - Has caching: `let cachedColorDepth: ColorDepth | null = null`
  - Returns `Promise<ColorDepth>` (async)
  - Timeout handling: 100ms default
  - Cleanup on success/failure

- **`tests/unit/detectColorDepth/osc.test.ts`** - Pattern for OSC testing
  - Tests OSC query success, timeout, fallback
  - Mocks TTY state with `Object.defineProperty(process.stdout, 'isTTY', ...)`
  - Tests caching behavior
  - Validates timeout limits
  - Error handling tests

### Architecture Notes

**OSC Query Pattern (from detectColorDepth):**

1. Check if TTY available (`process.stdin.isTTY && process.stdout.isTTY`)
2. Save current raw mode state
3. Set stdin to raw mode
4. Set up data listener for response
5. Set timeout (100ms default)
6. Write OSC query to stdout
7. Parse response in data listener
8. Cleanup: restore raw mode, remove listeners, clear timeout
9. Cache result to avoid repeated queries

**For width detection, we'll use:**

- OSC query: `\x1b[18t` (request terminal size in characters)
- Expected response: `\x1b[8;{rows};{columns}t`
- Alternative: Cursor position report (CPR) approach

### Decision

**Complete existing synchronous implementation by:**

1. Converting function to async (breaking change but necessary for OSC)
2. Adding `queryTerminalWidth()` helper function (similar to `queryColorDepthCapability`)
3. Implementing caching: `let cachedWidth: number | null = null`
4. Following the exact pattern from `detectColorDepth.ts`

## Work Log

### Tests Creation

**2025-11-03 10:55** - Starting test creation in `tests/unit/WIP/`

Following the plan's "Tests to Write" section and patterns from `detectColorDepth/osc.test.ts`.

**2025-11-03 11:03** - Created `tests/unit/WIP/phase3-osc-width-detection.test.ts`

Test coverage includes:

**Happy Path (4 tests):**

1. Should detect width via OSC query when terminal supports it
2. Should fall back to env var detection when OSC queries timeout
3. Should use OSC query results over environment variables when successful
4. Should cache OSC query results to avoid repeated queries

**Edge Cases (4 tests):**

1. Should handle OSC query failures gracefully (timeout, malformed, or partial responses)
2. Should work correctly in non-TTY environments (no OSC queries attempted)
3. Should respect timeout limits for OSC queries (don't hang indefinitely)
4. Should handle concurrent calls during OSC query (caching/queueing)

**Error Conditions (3 tests):**

1. Should not throw when OSC queries fail, timeout, or receive invalid data
2. Should fall back through priority chain when OSC fails
3. Should handle terminal rejecting OSC queries

**Integration Tests (2 tests):**

1. Should return Promise<number> (async function)
2. Should maintain backward compatibility with custom fallback values

**Initial test run:** 3 failed / 10 passed - failures expected because function is still synchronous:

- ❌ "should not throw when OSC queries fail..." - expects Promise, gets number
- ❌ "should handle terminal rejecting OSC queries" - expects Promise, gets number
- ❌ "should return Promise<number>" - expects Promise, gets number

These failures confirm tests are correctly checking for async behavior.

### Implementation Progress

**2025-11-03 11:04** - Implemented async OSC query functionality

**Files Modified:**

- `src/utils/detectAvailableWidth.ts`
  - Added `cachedWidth` cache variable
  - Created `queryTerminalWidth()` helper function
  - Converted `detectAvailableWidth()` to async function
  - Added OSC query to detection priority chain (Priority 3)
  - Updated JSDoc to reflect new async behavior and detection priority

**Key Implementation Details:**

- **OSC Query Method:** Uses `\x1b[18t` (terminal size query)
- **Response Parsing:** Handles both `\x1b[8;{rows};{columns}t` and cursor position responses
- **Timeout:** 100ms default (same as `detectColorDepth`)
- **Caching:** Results cached in `cachedWidth` to avoid repeated queries
- **Raw Mode:** Properly saves/restores stdin raw mode state
- **Cleanup:** Comprehensive cleanup on success, failure, or timeout
- **TTY Checking:** Only attempts OSC query when both stdin and stdout are TTY

**Detection Priority Order (Updated):**

1. COLUMNS environment variable (unchanged)
2. process.stdout.columns property (unchanged)
3. **OSC query to terminal (NEW - cached)**
4. Fallback parameter (default: 80)

**Breaking Change:**

- Function signature changed from `function detectAvailableWidth()` to `async function detectAvailableWidth()`
- Return type changed from `number` to `Promise<number>`

**2025-11-03 11:04** - Updated existing tests in `tests/unit/detectAvailableWidth.test.ts`

- Converted all 19 Phase 1 tests to async (added `await` to all function calls)
- Added TTY state mocking in beforeEach to prevent OSC queries in existing tests
- Updated error condition tests to use `.resolves.toBeDefined()`
- All tests now properly handle async behavior

**2025-11-03 11:06** - All tests passing ✅

**WIP Tests:** 13/13 passing
**Phase 1 Tests:** 19/19 passing (updated for async)
**All Runtime Tests:** 192/192 passing
**All Type Tests:** 18/18 passing (33 assertions)

## Phase Completion

**Completed:** 2025-11-03 11:06
**Duration:** ~11 minutes

### Final Test Results

- WIP tests: 13/13 passing ✅
- All runtime tests: 192/192 passing ✅
- All type tests: 18/18 passing (33 assertions) ✅
- No regressions ✅

### Files Changed

**Modified:**

- `src/utils/detectAvailableWidth.ts` - Converted to async with OSC query capability
- `tests/unit/detectAvailableWidth.test.ts` - Updated all tests to handle async behavior

**Created:**

- `tests/unit/WIP/phase3-osc-width-detection.test.ts` - 13 new tests for OSC functionality

### Tests Location

**IMPORTANT:** Tests remain in `tests/unit/WIP/` awaiting user review.

The user must review and approve tests before they are migrated to their permanent location.

### Success Criteria Verification

- ✅ Function converted to async (returns `Promise<number>`)
- ✅ OSC query implementation working in TTY environments
- ✅ All WIP tests pass (13/13)
- ✅ Proper timeout handling (queries don't hang)
- ✅ Graceful fallback when OSC fails
- ✅ Caching implemented to avoid repeated queries
- ✅ No regressions in existing tests
- ✅ Works in non-TTY environments (skips OSC, uses sync detection)

### Implementation Summary

Phase 3 successfully adds OSC-based width detection to `detectAvailableWidth()`, making it an async function that can actively probe the terminal for its width when environment variables are unavailable. The implementation follows the exact pattern established by `detectColorDepth()` and includes:

1. **OSC Query Helper:** `queryTerminalWidth()` function handles terminal communication
2. **Caching:** Results cached to avoid repeated terminal queries
3. **Proper Cleanup:** Stdin raw mode and event listeners properly cleaned up
4. **Timeout Handling:** 100ms timeout prevents hanging
5. **Fallback Chain:** Gracefully falls back through priority order when OSC fails

The function now provides the most reliable width detection possible by combining environment variables, Node.js properties, and active terminal probing.

## Tests Migrated

**2025-11-03 12:47** - Tests migrated to permanent locations

**Migration actions:**

1. Created `tests/unit/detectAvailableWidth/` subdirectory (matching `detectColorDepth` structure)
2. Migrated `tests/unit/WIP/phase3-osc-width-detection.test.ts` → `tests/unit/detectAvailableWidth/osc.test.ts`
3. Moved `tests/unit/detectAvailableWidth.test.ts` → `tests/unit/detectAvailableWidth/main.test.ts` (for consistency)
4. Removed empty `tests/unit/WIP/` directory

**Final test structure:**

```
tests/unit/detectAvailableWidth/
├── main.test.ts  (19 tests - Phase 1: basic detection)
└── osc.test.ts   (13 tests - Phase 3: OSC queries)
```

**Verification:** All tests passing in new locations ✅

- Runtime tests: 192/192 passing
- Type tests: 18/18 passing (33 assertions)

Phase 3 is now complete and all tests are in their permanent locations.
