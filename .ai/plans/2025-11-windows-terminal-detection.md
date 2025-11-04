# Windows Terminal Detection Support

**Created:** 2025-11-03
**Status:** Phase 5 Complete - ALL PHASES COMPLETE ✅

## Overview

Add comprehensive Windows support to the `detectTerminalApp()` function. Currently, the function works well on macOS and Linux but lacks detection for Windows terminals like Windows Terminal, PowerShell, cmd.exe, WSL, ConEmu, and others. The implementation will detect whichever terminal is actually running when the function is called.

## Goals

- Detect Windows Terminal (modern Microsoft terminal app)
- Detect PowerShell console
- Detect cmd.exe
- Detect WSL environments (running Linux terminals on Windows)
- Detect ConEmu/cmder
- Detect mintty (Cygwin, MSYS2, Git Bash)
- Ensure existing macOS/Linux detection continues working
- Support cross-platform testing with environment variable mocking
- Maintain backward compatibility

## Success Criteria

- [x] All Windows terminal types can be detected via environment variables
- [x] Tests pass conditionally on Windows (using `skipIf` for platform-specific tests)
- [x] Tests can validate Windows detection on non-Windows platforms via mocking
- [x] No regressions in existing macOS/Linux detection
- [x] Code follows existing patterns in the codebase
- [x] TerminalApp type is extended with new Windows terminal values

---

## Phases

### Phase 1: Extend Type System and Constants

**Goal:** Add Windows terminal types to the type system and define the environment variables used for detection.

**Dependencies:** None

**Estimated Complexity:** Low

#### Tests to Write

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

#### Implementation

**Files to Create:**

- None (only modifying existing files)

**Files to Modify:**

- `src/constants.ts` - Add new Windows terminal constants:
  - `WINDOWS_TERMINAL_ENV` (WT_SESSION, WT_PROFILE_ID)
  - `POWERSHELL_ENV` (PSModulePath, POWERSHELL_DISTRIBUTION_CHANNEL)
  - `CMD_ENV` (PROMPT, COMSPEC)
  - `CONEMU_ENV` (ConEmuDir, ConEmuBaseDir, CMDER_ROOT)
  - `MINTTY_ENV` (TERM=~mintty, MSYSTEM, CHERE_INVOKING)
  - Update `TERM_PROGRAM_LOOKUP` to include any Windows-specific TERM_PROGRAM values
  - Add Windows terminals to `TERMINAL_APPS` array

- `src/types/TerminalApp.ts` - Type automatically updates from TERMINAL_APPS constant

**Key Additions:**

- New constant arrays for Windows terminal environment variables
- Extend TERMINAL_APPS with: "windows-terminal", "powershell", "cmd", "conemu", "mintty"

#### Success Criteria

- [x] All WIP tests pass
- [x] No regressions in existing tests
- [x] Constants follow existing patterns (using `narrow()` helper)
- [x] Type system correctly infers Windows terminal values

**Phase 1 completed 2025-11-03** - See `.ai/logs/2025-11-windows-terminal-detection-phase1-log.md`

---

### Phase 2: Implement Windows Detection Logic

**Goal:** Add Windows-specific detection logic to `detectTerminalApp()` function.

**Dependencies:** Phase 1 must be complete

**Estimated Complexity:** Medium

#### Tests to Write

**Happy Path:**

1. should detect Windows Terminal from WT_SESSION environment variable
2. should detect Windows Terminal from WT_PROFILE_ID environment variable
3. should detect PowerShell from PSModulePath environment variable
4. should detect PowerShell from POWERSHELL_DISTRIBUTION_CHANNEL environment variable
5. should detect cmd.exe from PROMPT and COMSPEC combination
6. should detect ConEmu from ConEmuDir environment variable
7. should detect ConEmu from CMDER_ROOT environment variable
8. should detect mintty from TERM containing "mintty"
9. should detect mintty from MSYSTEM environment variable (MSYS2)

**Edge Cases:**

1. should return 'other' when on Windows but no specific terminal detected
2. should handle case insensitivity for Windows environment variables
3. should handle empty string values for Windows env vars
4. should prioritize Windows Terminal detection over other Windows terminals
5. should handle multiple Windows terminal env vars being set simultaneously

**Error Conditions:**

1. should not throw when all Windows env vars are undefined
2. should not throw when Windows env vars contain invalid/malformed values

**Type Tests:**

1. should return TerminalApp type that includes Windows terminal values
2. should narrow return type correctly for Windows detections

#### Implementation

**Files to Modify:**

- `src/utils/detectTerminalApp.ts` - Add Windows detection logic:
  - Check for WT_SESSION (Windows Terminal) first
  - Check for PowerShell indicators
  - Check for ConEmu indicators
  - Check for mintty indicators
  - Check for cmd.exe as fallback on Windows
  - Integrate into existing detection chain
  - Maintain priority order: TERM_PROGRAM → TERM → Windows-specific → environment vars → other

**Key Functions:**

- Update `detectTerminalApp()` to include Windows detection branches
- Consider platform-aware logic (only check Windows vars when `process.platform === 'win32'` for optimization)

#### Success Criteria

- [x] All WIP tests pass
- [x] No regressions in existing tests
- [x] Detection works correctly when env vars are mocked (for cross-platform testing)
- [x] Code follows existing conditional structure and style

**Phase 2 completed 2025-11-03** - See `.ai/logs/2025-11-windows-terminal-detection-phase2-log.md`

---

### Phase 3: WSL Detection

**Goal:** Add special handling for WSL environments where Linux terminals run on Windows.

**Dependencies:** Phase 2 must be complete

**Estimated Complexity:** Medium

#### Tests to Write

**Happy Path:**

1. should detect WSL environment from WSL_DISTRO_NAME
2. should detect WSL from /proc/version containing "Microsoft"
3. should detect Linux terminal (bash, zsh) when running in WSL
4. should detect if a macOS/Linux terminal (like kitty, alacritty) is running in WSL

**Edge Cases:**

1. should distinguish between native Linux and WSL
2. should handle WSL1 vs WSL2 differences
3. should return the actual terminal app when in WSL, not just "wsl"
4. should handle WSL_DISTRO_NAME being undefined in some WSL scenarios

**Error Conditions:**

1. should not throw when checking for /proc/version on non-Linux systems
2. should gracefully handle read errors for /proc/version

**Type Tests:**

1. should return appropriate TerminalApp type for WSL scenarios

#### Implementation

**Files to Modify:**

- `src/utils/detectTerminalApp.ts` - Add WSL-aware logic:
  - Check if running in WSL (WSL_DISTRO_NAME or /proc/version)
  - If in WSL, continue with normal Linux/macOS terminal detection
  - WSL is the **environment**, not the terminal - detect the actual terminal app

**Key Considerations:**

- WSL runs Linux terminals (bash, zsh, etc.) within Windows
- The terminal **emulator** might be Windows Terminal, but the shell is Linux
- Need to detect the actual terminal app being used, not just that it's WSL
- May need helper function to check if running in WSL

#### Success Criteria

- [x] All WIP tests pass
- [x] No regressions in existing tests
- [x] WSL detection correctly identifies the terminal app, not just the environment
- [x] Works when /proc/version is not accessible (graceful fallback)

**Phase 3 completed 2025-11-03** - See `.ai/logs/2025-11-windows-terminal-detection-phase3-log.md`

---

### Phase 4: Cross-Platform Testing Infrastructure

**Goal:** Enable testing of Windows detection on macOS/Linux using environment variable mocking.

**Dependencies:** Phases 1-3 must be complete ✅

**Estimated Complexity:** Low

**Status:** ✅ Complete

#### Tests to Write

**Happy Path:**

1. should detect Windows Terminal via mocked WT_SESSION on macOS
2. should detect PowerShell via mocked PSModulePath on macOS
3. should detect ConEmu via mocked ConEmuDir on macOS
4. should detect mintty via mocked MSYSTEM on macOS

**Edge Cases:**

1. should handle mixed Windows/macOS env vars gracefully
2. should prioritize Windows detection when Windows env vars are set on non-Windows platform

**Integration Tests:**

1. should run all Windows detection tests via mocking on non-Windows platforms
2. should maintain existing macOS/Linux detection when Windows env vars are absent

#### Implementation

**Files to Create:**

- `tests/unit/detectTerminalApp/windows-mocked.test.ts` - Windows detection tests using mocked env vars

**Files to Modify:**

- `tests/unit/detectTerminalApp.test.ts` - Add platform-conditional tests:
  - Use `skipIf(discoverOs() !== 'win32')` for Windows-only tests
  - Use `skipIf(discoverOs() === 'win32')` for mock-based tests on non-Windows

**Test Patterns:**

- Mock environment variables to simulate Windows terminals
- Use `beforeEach/afterEach` to clean up environment
- Follow existing test structure from current detectTerminalApp tests

#### Success Criteria

- [x] All WIP tests pass on all platforms
- [x] Windows detection can be validated on macOS/Linux via mocking
- [x] Platform-specific tests properly skip on incorrect platforms
- [x] No test pollution (env vars properly cleaned up)

**Phase 4 completed 2025-11-03** - See `.ai/logs/2025-11-windows-terminal-detection-phase4-log.md`

---

### Phase 5: Documentation and Integration

**Goal:** Document Windows support and ensure integration with the rest of the codebase.

**Dependencies:** Phases 1-4 must be complete

**Estimated Complexity:** Low

#### Tests to Write

**Integration Tests:**

1. should export detectTerminalApp with correct type signature
2. should work correctly when imported from main package index

**Documentation Tests:**

1. JSDoc comments should describe Windows terminal support
2. Type exports should be available from main entry point

#### Implementation

**Files to Modify:**

- `src/utils/detectTerminalApp.ts` - Update JSDoc:
  - Document Windows terminal support
  - List supported Windows terminals
  - Note platform-specific behavior

- `README.md` (if it exists) - Update documentation:
  - List all supported terminals including Windows
  - Show example usage on Windows

**Key Documentation:**

- Function JSDoc explaining cross-platform support
- List of all detectable terminals (macOS, Linux, Windows)
- Examples of environment variables checked

#### Success Criteria

- [x] All WIP tests pass
- [x] No regressions
- [x] JSDoc is comprehensive and accurate
- [x] Windows terminals are documented in project README (N/A - no README exists)

**Phase 5 completed 2025-11-03** - See `.ai/logs/2025-11-windows-terminal-detection-phase5-log.md`

---

## Execution Notes

Each phase follows the **5-Step TDD Workflow**:

1. **SNAPSHOT** - Capture current test state
2. **CREATE LOG** - Document starting position in `.ai/logs/`
3. **WRITE TESTS** - Create tests FIRST in `tests/unit/WIP/`
4. **IMPLEMENTATION** - Write code to pass tests
5. **CLOSE OUT** - Verify completion, document (tests stay in WIP for review)

Use the `/execute-phase` command to execute each phase.

## Notes

### Windows Terminal Environment Variables Research

Based on research, the following environment variables are used by Windows terminals:

**Windows Terminal:**

- `WT_SESSION` - Unique session ID (primary detection method)
- `WT_PROFILE_ID` - Profile identifier

**PowerShell:**

- `PSModulePath` - PowerShell module path (always set in PowerShell)
- `POWERSHELL_DISTRIBUTION_CHANNEL` - Distribution info

**cmd.exe:**

- `PROMPT` - Command prompt format (typically set)
- `COMSPEC` - Path to command interpreter (always set to cmd.exe path)

**ConEmu/cmder:**

- `ConEmuDir` - ConEmu installation directory
- `ConEmuBaseDir` - ConEmu base directory
- `CMDER_ROOT` - cmder installation directory (when using cmder)

**mintty (Cygwin/MSYS2/Git Bash):**

- `TERM` containing "mintty"
- `MSYSTEM` - MSYS2 environment indicator
- `CHERE_INVOKING` - Cygwin invoking indicator

**WSL:**

- `WSL_DISTRO_NAME` - WSL distribution name
- `/proc/version` containing "Microsoft" or "microsoft"

### Priority Order

Detection should follow this priority (highest to lowest):

1. `TERM_PROGRAM` (cross-platform standard)
2. `WT_SESSION` (Windows Terminal - most modern/common on Windows 11)
3. `TERM` variable (terminal capability string)
4. PowerShell environment
5. ConEmu environment
6. mintty environment
7. Windows-specific terminal environment variables
8. cmd.exe fallback (on Windows platform)
9. macOS/Linux specific environment variables
10. "other" fallback

### Testing Strategy

- Platform-specific tests use `skipIf(discoverOs() !== 'win32')`
- Mock-based tests use `skipIf(discoverOs() === 'win32')` to test Windows detection on other platforms
- All tests clean up environment variables in `afterEach`
- Follow existing test patterns from `tests/unit/detectTerminalApp.test.ts`

### Type System

- New terminal types added to `TERMINAL_APPS` constant
- `TerminalApp` type automatically derives from `TERMINAL_APPS`
- Maintain narrow type inference using `inferred-types` package patterns
