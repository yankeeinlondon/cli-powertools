# Phase 1: Core Detection (Environment Variables & TERM Parsing)

**Plan:** detect-color-depth
**Phase:** 1
**Started:** 2025-11-02 18:35:53

## Phase Overview

Implement the foundation of color depth detection using environment variables and TERM parsing. This phase establishes the core detection logic that will:

- Check COLORTERM environment variable for 'truecolor' and '24bit' values
- Parse TERM environment variable for color depth hints (256color, 16color, etc.)
- Handle edge cases like empty values, malformed TERM strings, and missing variables
- Provide a sensible default of 256 colors when detection is uncertain
- Follow priority order: COLORTERM > TERM > default

## Starting Test Position

```xml
<test-snapshot date="2025-11-02">
  <suite name="runtime-tests" total="83" passed="78" skipped="5" failed="0" />
  <suite name="type-tests" total="69" passed="69" failed="0" type-assertions="21" />
  <existing-failures>
    <!-- No existing failures -->
  </existing-failures>
</test-snapshot>
```

## Repo Starting Position

- **Last local commit:** `874455cfe0ea75a342a98e812cbc8f20d26685d8`
- **Last remote commit:** N/A
- **Branch:** `main`
- **Dirty files:**
  - `?? .ai/plans/2025-11-detect-color-depth.md` (new plan file)

## Existing Code Exploration

**Files found:**
- `src/utils/detectColorDepth.ts` - EXISTS as stub with TODO (needs implementation)
- `src/types/color.ts` - Defines ColorDepth type: `8 | 16 | 256 | 16700000`
- `tests/unit/detectColorScheme.test.ts` - Similar async detection utility (reference for patterns)

**Architecture notes:**
- Async function already defined: `export async function detectColorDepth(): ColorDepth`
- Uses Node.js `process.env` for environment variable access
- Pattern from detectColorScheme: use beforeEach/afterEach for env cleanup
- Test pattern: inline type tests using `type cases = [Expect<...>]` and `type Expect<T extends true> = T`
- ColorDepth is a union of 4 literal numbers, not a broader type

**Decision:** Complete existing stub in `src/utils/detectColorDepth.ts`, follow detectColorScheme testing patterns

## Work Log

### [2025-11-02 18:36] - Exploration Complete
- Reviewed existing stub in `src/utils/detectColorDepth.ts`
- Examined ColorDepth type definition
- Studied detectColorScheme.test.ts for testing patterns
- Confirmed async function signature matches requirements

### [2025-11-02 18:36] - Tests Created
- Created `tests/unit/WIP/detectColorDepth-core.test.ts` with 20 comprehensive tests
  - 10 happy path tests (COLORTERM=truecolor/24bit, TERM parsing for 256/16/8 colors)
  - 6 edge case tests (mixed case, whitespace, extra suffixes, priority order)
  - 3 error condition tests (missing vars, malformed values, defaults)
  - 1 type test suite (5 type assertions)
- Initial test run: All 20 tests failed as expected (function returns undefined)

### [2025-11-02 18:37] - Implementation Complete
- Implemented core detection logic in `src/utils/detectColorDepth.ts`
- Detection priority: COLORTERM > TERM parsing > default (256)
- COLORTERM: checks for 'truecolor' or '24bit' (case-insensitive, trimmed)
- TERM parsing: 256color → 256, 16color → 16, xterm-color → 8, linux → 8, xterm → 16
- Handles edge cases: empty values, whitespace, mixed case, unknown terms
- Fixed ordering issue with xterm-color detection (needed special handling before xterm- prefix check)

### [2025-11-02 18:38] - Type Test Fix
- Fixed type test assertion error (removed overly-narrow type check)
- TypeScript doesn't narrow `ColorDepth` union to literal based on runtime values

### [2025-11-02 18:38] - All Tests Passing
- All 20 WIP runtime tests passing ✅
- All 4 WIP type tests passing (8 type assertions) ✅

## Phase Completion

**Completed:** 2025-11-02 18:38:34
**Duration:** ~3 minutes

### Final Test Results

- WIP tests: 20/20 passing ✅
- All runtime tests: 103 total (98 passed, 5 skipped) ✅
- All type tests: 89 total (89 passed, 29 type assertions) ✅
- No regressions ✅

### Files Changed

**Modified:**
- `src/utils/detectColorDepth.ts` - Implemented complete core detection logic

**Created:**
- `tests/unit/WIP/detectColorDepth-core.test.ts` - 20 comprehensive tests

### Tests Location

**IMPORTANT:** Tests remain in `tests/unit/WIP/` awaiting user review.

The user must review and approve tests before they are migrated to their permanent location.

### Test Migration

**Completed:** 2025-11-02 18:42

- Migrated `tests/unit/WIP/detectColorDepth-core.test.ts` → `tests/unit/detectColorDepth.test.ts`
- Removed empty `tests/unit/WIP/` directory
- Verified all tests pass in new location:
  - Runtime: 20/20 tests passing ✅
  - Type tests: 8/8 assertions passing ✅
- Full test suite: 103 tests (98 passed, 5 skipped) ✅

### Implementation Summary

Successfully implemented Phase 1 core detection logic with:
- COLORTERM environment variable detection (truecolor/24bit → 16.7M colors)
- TERM environment variable parsing (256color, 16color, xterm variants, linux)
- Robust edge case handling (case-insensitive, whitespace trimming, unknown values)
- Sensible default of 256 colors for modern terminals
- Comprehensive test coverage (20 tests covering all scenarios)
