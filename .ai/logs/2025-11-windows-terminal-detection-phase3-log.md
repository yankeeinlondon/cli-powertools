# Phase 3: WSL Detection

**Plan:** Windows Terminal Detection Support
**Phase:** 3
**Started:** 2025-11-03 14:59

## Phase Overview

Add special handling for WSL (Windows Subsystem for Linux) environments where Linux terminals run on Windows. The key insight is that WSL is the **environment**, not the terminal - we need to detect the actual terminal app being used within WSL.

**Goals:**

- Detect when running in WSL environment (WSL_DISTRO_NAME or /proc/version)
- Continue with normal terminal detection when in WSL
- Return the actual terminal app, not just "wsl"
- Handle WSL1 vs WSL2 differences gracefully

## Starting Test Position

```xml
<test-snapshot date="2025-11-03">
  <suite name="runtime-tests" total="274" passed="274" failed="0" skipped="5" />
  <suite name="type-tests" total="139" passed="139" failed="0" />
  <existing-failures>
    <!-- No existing failures -->
  </existing-failures>
</test-snapshot>
```

## Repo Starting Position

**Last local commit:** `bc560be4604b40b76c81c622c3453f8a4c0129aa`
**Last remote commit:** `bc560be4604b40b76c81c622c3453f8a4c0129aa`
**Branch:** `main`
**Dirty files:**

```text
M .tsbuildinfo
M .vscode/settings.json
M src/constants.ts
M src/types/TerminalApp.ts
M src/utils/detectTerminalApp.ts
?? .ai/logs/2025-11-windows-terminal-detection-phase1-log.md
?? .ai/logs/2025-11-windows-terminal-detection-phase2-log.md
?? .ai/plans/2025-11-windows-terminal-detection.md
?? tests/unit/detectTerminalApp-windows.test.ts
```

## Existing Code Exploration

**Files found:**

- `src/utils/detectTerminalApp.ts` - Main detection function (Phases 1-2 complete)
- `src/constants.ts` - Terminal environment variable constants (Phases 1-2 complete)
- `tests/unit/detectTerminalApp.test.ts` - macOS/Linux tests
- `tests/unit/detectTerminalApp-windows.test.ts` - Windows tests (Phase 2)
- `src/utils/os.ts` - OS detection utilities (`discoverOs()`, `discoverOsArch()`)
- `src/types/shell.ts` - Shell type includes "wsl"

**Architecture notes:**

- Detection follows priority: TERM_PROGRAM → TERM patterns → environment variables
- Uses `inferred-types` package for narrow type checking
- Tests use Vitest with `beforeEach/afterEach` for env cleanup
- Both runtime and type tests are integrated in same `it()` blocks
- Current implementation detects macOS, Linux, and Windows terminals

**Key insight for Phase 3:**

- WSL is listed as a Shell type but NOT a TerminalApp type
- This aligns perfectly with the plan: "WSL is the environment, not the terminal"
- In WSL, we should detect the **actual terminal app** running
- Need helper function to detect if running in WSL
- WSL detection methods:
  - `WSL_DISTRO_NAME` environment variable (most reliable)
  - `/proc/version` containing "Microsoft" or "microsoft"
- After detecting WSL, continue with normal terminal detection logic

**Decision:** Add WSL detection helper but do NOT add "wsl" to TERMINAL_APPS. The function should transparently detect the actual terminal app when in WSL, just as it does on native Linux.

## Work Log

### 2025-11-03 14:59 - Phase 3 Started

**SNAPSHOT captured:**

- Runtime tests: 274 passed, 5 skipped, 0 failed ✅
- Type tests: 139 passed, 0 failed ✅
- No existing failures - clean baseline

**LOG created:** `.ai/logs/2025-11-windows-terminal-detection-phase3-log.md`

### 2025-11-03 15:00 - Tests Written

**Tests Created:**

- `tests/unit/WIP/phase3-wsl-detection.test.ts` (12 tests)
  - Happy path: WSL_DISTRO_NAME detection, terminal detection in WSL
  - Edge cases: Multiple WSL scenarios, Windows Terminal in WSL, ConEmu in WSL
  - Error conditions: Missing /proc/version, graceful fallback
  - Type tests: TerminalApp return type validation

**Initial test run:** All tests failed as expected (isRunningInWSL not implemented)

### 2025-11-03 15:01 - Implementation Complete

**Files Modified:**

- `src/utils/detectTerminalApp.ts`:
  - Added `isRunningInWSL()` helper function
  - Detects WSL via `WSL_DISTRO_NAME` env var (primary method)
  - Falls back to checking `/proc/version` for "microsoft" string
  - Graceful error handling for non-Linux systems
  - Updated JSDoc to document cross-platform and WSL support
  - No changes needed to `detectTerminalApp()` - already works correctly in WSL!

**Key Insight:**

The existing `detectTerminalApp()` implementation already handles WSL correctly because it detects terminals based on environment variables. In WSL, Windows Terminal sets `WT_SESSION`, ConEmu sets `ConEmuDir`, etc., so the function naturally detects the correct terminal app. WSL is transparent to the detection logic, which is exactly what we wanted.

**Test Results:**

- WIP tests: 12/12 passing ✅
- All runtime tests: 286/286 passing (5 skipped) ✅
- All type tests: 151/151 passing ✅

### 2025-11-03 15:03 - Phase Completion

**Completed:** 2025-11-03 15:03
**Duration:** ~4 minutes

**Final Test Results:**

- WIP tests: 12/12 passing ✅
- All runtime tests: 286 passed, 5 skipped, 0 failed ✅
- All type tests: 151 passed, 0 failed ✅
- No regressions ✅

**Files Changed:**

**Created:**

- `tests/unit/WIP/phase3-wsl-detection.test.ts`

**Modified:**

- `src/utils/detectTerminalApp.ts` - Added `isRunningInWSL()` and improved JSDoc

**Tests Location:**

**IMPORTANT:** Tests remain in `tests/unit/WIP/` awaiting user review.

The user must review and approve tests before they are migrated to their permanent location.

## Phase 3 Summary

Phase 3 successfully added WSL detection support to the terminal-formatter project. The key accomplishment is the `isRunningInWSL()` helper function, which allows the codebase to detect when running in a WSL environment.

**Critical Design Decision:**

WSL is an environment, NOT a terminal application. The `detectTerminalApp()` function correctly returns the actual terminal app (Windows Terminal, ConEmu, kitty, etc.) when running in WSL, not "wsl". This design ensures that terminal capabilities are properly detected regardless of whether the process runs in native Windows, native Linux, or WSL.

**What Works:**

- ✅ WSL detection via `WSL_DISTRO_NAME` environment variable
- ✅ Fallback WSL detection via `/proc/version` containing "microsoft"
- ✅ Terminal detection works transparently in WSL
- ✅ Windows Terminal + WSL correctly detected as "windows-terminal"
- ✅ ConEmu + WSL correctly detected as "conemu"
- ✅ Linux terminals (kitty, alacritty) in WSL work correctly
- ✅ Graceful handling when /proc/version is not accessible
- ✅ No regressions in existing macOS/Linux/Windows detection

**Tests Cover:**

- Happy path: WSL detection via environment variables
- Edge cases: Multiple WSL scenarios, various terminal combinations
- Error conditions: Missing files, graceful fallbacks
- Type safety: Return types validated

---

## Tests Migrated

**Date:** 2025-11-03 15:16

**Migration:**

- `tests/unit/WIP/phase3-wsl-detection.test.ts` → `tests/unit/detectTerminalApp-wsl.test.ts`
- `tests/unit/WIP/` directory removed ✅

**Verification:**

- All tests passing in new location ✅
- Full test suite: 286 passed, 5 skipped, 0 failed ✅
- Type tests: 151 passed, 0 failed ✅

**Final test locations:**

- `tests/unit/detectTerminalApp.test.ts` - macOS/Linux tests
- `tests/unit/detectTerminalApp-windows.test.ts` - Windows tests
- `tests/unit/detectTerminalApp-wsl.test.ts` - WSL tests ✨ (new)
