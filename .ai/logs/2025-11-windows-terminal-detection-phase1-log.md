# Phase 1: Extend Type System and Constants

**Plan:** windows-terminal-detection
**Phase:** 1
**Started:** 2025-11-03

## Phase Overview

Add Windows terminal types to the type system and define the environment variables used for detection.

**Goal:** Add Windows terminal types to the type system and define the environment variables used for detection.

**Dependencies:** None

**Estimated Complexity:** Low

## Starting Test Position

```xml
<test-snapshot date="2025-11-03">
  <suite name="runtime-tests" total="254" passed="249" skipped="5" failed="0" />
  <suite name="type-tests" total="114" passed="29" skipped="0" failed="0" type-assertions="54" />
  <existing-failures>
    <!-- No existing failures -->
  </existing-failures>
</test-snapshot>
```

## Repo Starting Position

**Last local commit:** `bc560be4604b40b76c81c622c3453f8a4c0129aa`
**Last remote commit:** N/A
**Branch:** `main`
**Dirty files:**

```
?? .ai/plans/2025-11-windows-terminal-detection.md
```

## Existing Code Exploration

**Files found:**

- `src/constants.ts` - Contains terminal app constants and environment variable arrays
- `src/types/TerminalApp.ts` - Derives TerminalApp type from TERMINAL_APPS constant using `Values` utility
- `src/utils/detectTerminalApp.ts` - Detection function implementation
- `tests/unit/detectTerminalApp.test.ts` - Comprehensive test suite (45 tests)

**Architecture notes:**

- Uses `inferred-types` package with `narrow()` helper for type-safe constants
- TerminalApp type auto-derives from TERMINAL_APPS constant array via `Values<typeof TERMINAL_APPS>`
- Pattern: Environment variable arrays (e.g., `GHOSTTY_ENV`, `WEZTERM_ENV`)
- Detection priority: TERM_PROGRAM → TERM (substring matching) → Env var checks → "other"
- Tests use `beforeEach`/`afterEach` to manage environment variable mocking
- Tests are organized by sections with clear comments: Happy Path, Priority, Edge Cases, Error Conditions, Type Tests

**Decision:** Extend existing files following the established patterns. Do not create new files.

## Work Log

### Tests to Write

From the plan, Phase 1 requires:

**Type Tests:**

1. should include all Windows terminal types in TerminalApp union type
2. should accept "windows-terminal" as valid TerminalApp value
3. should accept "powershell" as valid TerminalApp value
4. should accept "cmd" as valid TerminalApp value
5. should accept "conemu" as valid TerminalApp value
6. should accept "mintty" as valid TerminalApp value

**Happy Path:**

1. should export WINDOWS_TERMINAL_ENV constant with expected variables
2. should export POWERSHELL_ENV constant with expected variables
3. should export CMD_ENV constant with expected variables
4. should export CONEMU_ENV constant with expected variables
5. should export MINTTY_ENV constant with expected variables

**Edge Cases:**

1. should maintain backward compatibility with existing TERMINAL_APPS values

### Tests Created

**File:** `tests/unit/WIP/phase1-windows-constants.test.ts`

**Tests written:**

- Type Tests (1 test):
  - should accept Windows terminal values as valid TerminalApp types (tests all 5 Windows terminals)

- Happy Path (5 tests):
  - should export WINDOWS_TERMINAL_ENV constant with expected variables
  - should export POWERSHELL_ENV constant with expected variables
  - should export CMD_ENV constant with expected variables
  - should export CONEMU_ENV constant with expected variables
  - should export MINTTY_ENV constant with expected variables

- Edge Cases (1 test):
  - should maintain backward compatibility with existing TERMINAL_APPS values

**Initial test run:**

- Runtime: 11 of 12 tests failed as expected ✅
- Types: 6 of 12 tests had type errors as expected ✅
- This proves tests are checking for real functionality, not trivially passing

**Test refinement (based on user feedback):**

- **First refinement:** Removed redundant "should include all Windows terminal types" test
- **Second refinement:** Consolidated 5 individual type tests into 1 comprehensive test
  - Each individual test was just checking one terminal type with identical logic
  - Combined into single test that verifies all 5 Windows terminal types at once
- **Final count:** 7 tests (1 type test covering 5 types, 5 happy path, 1 edge case)
- **Improvement:** Reduced from 12 tests to 7 tests with no loss of coverage, much cleaner

### Implementation Progress

**2025-11-03 13:35** - Modified `src/constants.ts`

- Added Windows terminal values to `TERMINAL_APPS` constant: "windows-terminal", "powershell", "cmd", "conemu", "mintty"
- Created `WINDOWS_TERMINAL_ENV` constant with WT_SESSION, WT_PROFILE_ID
- Created `POWERSHELL_ENV` constant with PSModulePath, POWERSHELL_DISTRIBUTION_CHANNEL
- Created `CMD_ENV` constant with PROMPT, COMSPEC
- Created `CONEMU_ENV` constant with ConEmuDir, ConEmuBaseDir, CMDER_ROOT
- Created `MINTTY_ENV` constant with MSYSTEM, CHERE_INVOKING
- All constants follow existing `narrow()` pattern
- Tests passing: 12/12 ✅

**2025-11-03 13:37** - Modified `src/types/TerminalApp.ts`

- Changed from `Values<typeof TERMINAL_APPS>` to `typeof TERMINAL_APPS[number]`
- This correctly creates a union type from the array values
- Matches the pattern used in TERM_PROGRAM_LOOKUP definition
- All type tests now passing ✅

**2025-11-03 13:37** - Refactored for better types

- Initial type test approach didn't work with `Values` utility
- Discovered `typeof TERMINAL_APPS[number]` pattern from existing code
- All tests passing: Runtime 12/12, Types 6/6 with 10 assertions ✅

---

## Phase Completion

**Completed:** 2025-11-03
**Duration:** ~20 minutes

### Final Test Results

- All runtime tests: 249/249 passing ✅
- All type tests: 29 tests with 54 assertions passing ✅
- No regressions ✅
- WIP tests removed per user request (will be validated in Phase 2 integration tests)

### Files Changed

**Modified:**

- `src/constants.ts` - Added 5 Windows terminal types and 5 env var constant arrays
- `src/types/TerminalApp.ts` - Changed from `Values` to `[number]` accessor pattern

**Created:**

- `tests/unit/WIP/phase1-windows-constants.test.ts` - 7 tests (1 type test, 5 happy path, 1 edge case)

### Tests Location

**User decision:** All WIP tests were removed per user request.

**Rationale:** Phase 1 only adds type definitions and constants. The real behavioral testing will happen in Phase 2 when the detection logic is implemented. The constants and types will be validated through those integration tests rather than isolated unit tests.

### Success Criteria

All success criteria from the plan have been met:

- [x] All Windows terminal types can be accepted as TerminalApp values
- [x] All Windows environment constant arrays are exported
- [x] Tests follow existing patterns in the codebase
- [x] No regressions in existing macOS/Linux detection
- [x] Code follows existing patterns (using `narrow()` helper)
- [x] Type system correctly infers Windows terminal values
- [x] Constants follow existing naming and documentation patterns
- [x] Backward compatibility maintained with all original terminal types

---
