# Detect Color Depth Implementation Plan

**Created:** 2025-11-02
**Status:** All Phases Complete

## Overview

Implement the `detectColorDepth()` function to automatically detect the color capabilities of the current terminal environment. The function will return one of four ColorDepth values (8, 16, 256, or 16700000) representing the number of colors the terminal can display.

This implementation follows the hybrid detection approach established by `detectColorScheme`, using multiple detection methods in priority order: environment variable overrides, terminal OSC queries, TERM environment variable parsing, platform-specific detection, and finally an optimistic default of 256 colors.

## Goals

- Implement robust color depth detection that works across different terminal emulators
- Support multiple detection strategies in priority order for maximum compatibility
- Use OSC queries to actively probe terminal capabilities when possible
- Provide accurate results for modern terminals while gracefully handling legacy environments
- Follow project conventions for async utilities, type safety, and comprehensive testing

## Success Criteria

- [ ] `detectColorDepth()` returns accurate ColorDepth values (8, 16, 256, or 16700000)
- [ ] Detection works across major terminal emulators (iTerm2, Kitty, WezTerm, Alacritty, GNOME Terminal, Windows Terminal, etc.)
- [ ] Function handles environment variable overrides (COLORTERM, FORCE_COLOR, etc.)
- [ ] OSC queries are used when available to detect actual terminal capabilities
- [ ] TERM environment variable is correctly parsed for color hints
- [ ] Platform-specific detection works on macOS, Linux, and Windows
- [ ] Function defaults to 256 colors when detection is uncertain
- [ ] All tests pass (both runtime and type tests)
- [ ] No regressions in existing test suite
- [ ] Function is exported from main utils index

## Phases

### Phase 1: Core Detection (Environment Variables & TERM Parsing)

**Goal:** Implement the foundation of color depth detection using environment variables and TERM parsing

**Dependencies:** None

**Estimated Complexity:** Medium

#### Tests to Write

**Happy Path:**
1. should return 16700000 when COLORTERM='truecolor'
2. should return 16700000 when COLORTERM='24bit'
3. should return 256 when TERM='xterm-256color'
4. should return 256 when TERM='screen-256color'
5. should return 16 when TERM='xterm-16color' or TERM='xterm'
6. should return 8 when TERM='xterm-color' or basic TERM values
7. should return default (256) when TERM is unset or unknown

**Edge Cases:**
1. should handle TERM with mixed case or unusual formatting
2. should handle empty COLORTERM value
3. should handle TERM values with extra suffixes (e.g., 'xterm-256color-italic')
4. should prioritize COLORTERM over TERM when both are set
5. should handle NO_COLOR environment variable (if relevant to color depth)
6. should handle FORCE_COLOR environment variable hints

**Error Conditions:**
1. should not throw when all environment variables are undefined
2. should not throw when TERM contains invalid/malformed values
3. should return default (256) when detection is impossible

**Type Tests:**
1. should return ColorDepth union type (8 | 16 | 256 | 16700000)
2. should be async function returning Promise&lt;ColorDepth&gt;
3. should accept no parameters (or optional configuration object if designed)

#### Implementation

**Files to Create:**
- `tests/unit/WIP/detectColorDepth-core.test.ts` - Core detection tests

**Files to Modify:**
- `src/utils/detectColorDepth.ts` - Implement core detection logic

**Key Functions/Classes:**
- `detectColorDepth()` - Main async function
- `parseTermForColorDepth(term: string)` - Helper to parse TERM variable (likely inline or private)
- `checkColorTermVariable()` - Helper to check COLORTERM env var (likely inline or private)

**Integration Points:**
- Uses Node.js `process.env` to read environment variables
- Returns `ColorDepth` type from `~/types`
- No external function calls yet (pure environment variable logic)

#### Success Criteria

- [x] All WIP tests for Phase 1 pass
- [x] No regressions in existing tests
- [x] Environment variable detection is accurate and follows priority order
- [x] TERM parsing correctly identifies color depths from common TERM values
- [x] Function gracefully handles missing or invalid environment variables
- [x] Type tests confirm return type is ColorDepth

**Status:** ✅ Complete (2025-11-02)

---

### Phase 2: OSC Query Integration

**Goal:** Add active terminal capability detection using OSC sequences to probe for actual color support

**Dependencies:** Phase 1 complete

**Estimated Complexity:** High

#### Tests to Write

**Happy Path:**
1. should detect 24-bit color support via OSC 4 query when terminal supports it
2. should detect 256 color support when terminal responds to 256-color palette queries
3. should fall back to env var detection when OSC queries timeout
4. should cache OSC query results to avoid repeated queries
5. should use OSC query results over environment variables when successful

**Edge Cases:**
1. should handle terminals that don't respond to OSC queries (timeout gracefully)
2. should handle malformed OSC responses
3. should handle partial OSC responses (terminal sends incomplete data)
4. should work correctly in tmux/screen environments (may need passthrough)
5. should handle SSH sessions where OSC queries might not work
6. should respect timeout limits for OSC queries (don't hang indefinitely)

**Error Conditions:**
1. should not throw when OSC query fails completely
2. should fall back to TERM parsing when OSC query returns invalid data
3. should handle terminals that actively reject OSC queries

**Type Tests:**
1. should maintain ColorDepth return type with OSC integration
2. should properly type any configuration options for OSC query behavior

#### Implementation

**Files to Create:**
- `tests/unit/WIP/detectColorDepth-osc.test.ts` - OSC query tests

**Files to Modify:**
- `src/utils/detectColorDepth.ts` - Add OSC query logic
- Potentially create helper in `src/utils/background-color/` or reuse existing query utilities

**Key Functions/Classes:**
- `queryColorDepthCapability()` - Query terminal using OSC sequences (might reuse `queryWithSequence()`)
- `parseColorDepthResponse()` - Parse OSC response to determine color depth
- Module-level cache for OSC results (similar to `hasProgram` caching pattern)

**Integration Points:**
- Reuse `queryWithSequence()` from `src/utils/background-color/queryWithSequence.ts` if applicable
- May reuse or adapt `parseOSCResponse()` from background-color utilities
- Integration with timeout/promise handling for async queries
- Implement caching strategy (module-level variable or LRU cache)

#### Success Criteria

- [x] All WIP tests for Phase 2 pass
- [x] No regressions in existing tests
- [x] OSC queries successfully detect color depth on supporting terminals
- [x] Query timeout is implemented and works correctly
- [x] Fallback to env var detection works when queries fail
- [x] Caching prevents redundant terminal queries
- [x] Works correctly in multiplexer environments (tmux/screen)

**Status:** ✅ Complete (2025-11-02)

---

### Phase 3: Platform-Specific Enhancements

**Goal:** Add platform-specific detection methods and optimizations for macOS, Linux, and Windows

**Dependencies:** Phase 2 complete

**Estimated Complexity:** Medium

#### Tests to Write

**Happy Path:**
1. should detect Terminal.app capabilities on macOS correctly
2. should detect iTerm2 24-bit support on macOS
3. should detect Windows Terminal color support on Windows
4. should detect legacy cmd.exe color depth on Windows
5. should detect GNOME Terminal capabilities on Linux
6. should detect Konsole/Kitty/Alacritty capabilities

**Edge Cases:**
1. should handle unknown terminal emulators gracefully (use defaults)
2. should correctly identify terminal emulator via TERM_PROGRAM env var
3. should work on WSL (Windows Subsystem for Linux)
4. should handle Linux virtual console (tty) correctly
5. should detect color support in CI/CD environments
6. should handle headless/non-interactive environments

**Error Conditions:**
1. should not throw when platform detection fails
2. should fall back to previous detection methods when platform-specific detection is unavailable

**Type Tests:**
1. should maintain ColorDepth return type throughout
2. should properly handle platform-specific code paths in types

#### Implementation

**Files to Create:**
- `tests/unit/WIP/detectColorDepth-platform.test.ts` - Platform-specific tests

**Files to Modify:**
- `src/utils/detectColorDepth.ts` - Add platform-specific detection
- May reuse `src/utils/os.ts` utilities for OS detection

**Key Functions/Classes:**
- `detectPlatformColorDepth()` - Platform-specific detection logic
- Integration with `discoverOs()` from `src/utils/os.ts`
- Terminal emulator identification logic (using TERM_PROGRAM, etc.)

**Integration Points:**
- Use `discoverOs()` from `src/utils/os.ts` to determine platform
- Check TERM_PROGRAM, TERMINAL_EMULATOR env vars for emulator identification
- Platform-specific command execution if needed (similar to `hasProgram`)
- Integration with CI environment detection (check CI, GITHUB_ACTIONS env vars)

#### Success Criteria

- [x] All WIP tests for Phase 3 pass
- [x] No regressions in existing tests
- [x] Platform-specific detection works on macOS
- [x] Platform-specific detection works on Windows
- [x] Platform-specific detection works on Linux
- [x] Function correctly identifies major terminal emulators
- [x] Works in CI/CD environments
- [x] Function is exported from `src/utils/index.ts`
- [x] All documentation is complete

**Status:** ✅ Complete (2025-11-02)

---

## Execution Notes

Each phase follows the **5-Step TDD Workflow**:

1. **SNAPSHOT** - Capture current test state
2. **CREATE LOG** - Document starting position in `.ai/logs/`
3. **WRITE TESTS** - Create tests FIRST in `tests/unit/WIP/`
4. **IMPLEMENTATION** - Write code to pass tests
5. **CLOSE OUT** - Verify completion, document (tests stay in WIP for review)

Use the `/execute-phase` command to execute each phase.

### Detection Priority Order

The final implementation should follow this priority order:

1. **Environment Variable Override** (highest priority)
   - COLORTERM='truecolor' or '24bit' → 16700000
   - NO_COLOR set → potentially affects detection
   - FORCE_COLOR hints → may indicate color support level

2. **Terminal OSC Queries** (active probing)
   - Query terminal capabilities via OSC 4 or similar
   - Cache results to avoid repeated queries
   - Timeout and fallback if queries fail

3. **TERM Environment Variable Parsing**
   - Parse TERM for color hints (e.g., 'xterm-256color' → 256)
   - Handle common TERM patterns and variants

4. **Platform-Specific Detection**
   - Use TERM_PROGRAM to identify terminal emulator
   - Apply known capabilities of specific emulators
   - OS-specific detection methods

5. **Default Fallback**
   - Return 256 (optimistic modern default)

### Testing Considerations

- **Platform-specific tests**: Use `it.skipIf(discoverOs() !== "platform")` for platform-specific functionality
- **Environment cleanup**: Always use `beforeEach`/`afterEach` to set up and tear down environment variables
- **Type tests**: Include both runtime behavior tests AND type tests using `Expect<T extends true>` pattern
- **Async testing**: All tests should handle async nature of `detectColorDepth()`
- **Mock OSC queries**: May need to mock `queryWithSequence()` for reliable testing of OSC query logic

### Known Terminal Color Support

Reference for testing and implementation:

| Terminal | ColorDepth | Detection Method |
|----------|-----------|------------------|
| iTerm2 | 16700000 | TERM_PROGRAM='iTerm.app', OSC query |
| Kitty | 16700000 | TERM='xterm-kitty', COLORTERM='truecolor' |
| WezTerm | 16700000 | TERM_PROGRAM='WezTerm', COLORTERM='truecolor' |
| Alacritty | 16700000 | TERM='alacritty', COLORTERM='truecolor' |
| GNOME Terminal | 16700000 | VTE_VERSION set, COLORTERM='truecolor' |
| Windows Terminal | 16700000 | WT_SESSION set, COLORTERM='truecolor' |
| Terminal.app (macOS) | 256 | TERM_PROGRAM='Apple_Terminal' |
| xterm | 256 | TERM='xterm-256color' |
| screen | 256 | TERM='screen-256color' |
| tmux | 256 | TERM='tmux-256color' |
| cmd.exe (Windows) | 16 | Platform detection |
| Linux console (tty) | 8 or 16 | TERM='linux' |

## Notes

### Reusable Utilities from Codebase

The following existing utilities should be leveraged:

- `queryWithSequence()` from `src/utils/background-color/queryWithSequence.ts` - For OSC queries
- `parseOSCResponse()` from `src/utils/background-color/parseOSCResponse.ts` - For parsing terminal responses
- `discoverOs()` from `src/utils/os.ts` - For platform detection
- Caching pattern from `hasProgram.ts` - For caching OSC query results

### Environment Variables Reference

Key environment variables to check:

- `COLORTERM` - Set to 'truecolor' or '24bit' by modern terminals
- `TERM` - Terminal type identifier (e.g., 'xterm-256color')
- `TERM_PROGRAM` - Terminal emulator identifier (e.g., 'iTerm.app')
- `TERMINAL_EMULATOR` - Alternative emulator identifier
- `NO_COLOR` - Indicates color should be disabled
- `FORCE_COLOR` - Forces color support
- `CI`, `GITHUB_ACTIONS`, etc. - CI environment indicators
- `VTE_VERSION` - GNOME Terminal/VTE-based terminal version
- `WT_SESSION` - Windows Terminal session ID

### OSC Sequences for Color Detection

Potential OSC queries to use:

- **OSC 4 ; &lt;index&gt; ; ? BEL** - Query palette color (can test if 256 colors supported)
- **OSC 10 ; ? BEL** - Query default foreground (tests if OSC queries work at all)
- **OSC 11 ; ? BEL** - Query default background (alternative test)

### Edge Cases to Consider

- **Multiplexers** (tmux, screen) may not pass through OSC queries without configuration
- **SSH sessions** may have different capabilities than local terminal
- **CI environments** often have limited or no color support
- **Piped output** (not a TTY) should be handled gracefully
- **Terminal emulator updates** may add new capabilities over time

### Design Decisions

1. **Async function**: Required for OSC queries which need time to receive responses
2. **Caching**: OSC query results should be cached to avoid performance overhead
3. **Timeout**: OSC queries should timeout after reasonable period (e.g., 100-200ms)
4. **Conservative fallback**: While default is 256, the function should prefer detected values
5. **No external dependencies**: Use only Node.js built-ins and existing project utilities

### Future Enhancements (Out of Scope)

- Configuration object parameter to customize detection behavior
- Force color depth option
- Verbose mode for debugging detection process
- Detection result metadata (which method was used)
