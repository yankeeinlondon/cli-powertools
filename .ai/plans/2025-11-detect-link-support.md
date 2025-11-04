# Implement detectLinkSupport() for OSC8 Link Detection

**Created:** 2025-11-03
**Status:** Phase 1 Complete
**Last Updated:** 2025-11-03

## Overview

Implement the `detectLinkSupport()` function to detect whether the current terminal/console supports OSC8 hyperlinks. This function will enable the library's link utilities (`urlLink()`, `fileLink()`) to conditionally render clickable links based on terminal capabilities.

## Goals

- Implement reliable OSC8 link support detection across platforms
- Follow existing codebase patterns (async, caching, fallback chains)
- Provide comprehensive test coverage (runtime + type tests)
- Write clear documentation following project JSDoc standards
- Export the function from the utils module

## Success Criteria

- [x] `detectLinkSupport()` correctly identifies support for all known terminals - Phase 1
- [x] Returns `true` for terminals with OSC8 support (iTerm2, WezTerm, Kitty, etc.) - Phase 1
- [x] Returns `false` for terminals without support (Apple Terminal, cmd.exe, etc.) - Phase 1
- [x] Returns `null` for unknown terminals (uncertainty) - Phase 1
- [x] Results are cached to avoid redundant detection - Phase 1
- [x] All tests pass (runtime and type tests) - Phase 1
- [x] No regressions in existing tests - Phase 1
- [x] Comprehensive JSDoc documentation - Phase 1
- [x] `detectAppVersion()` implemented with version parsing - Phase 2
- [x] Enhanced link support with Alacritty version checking - Phase 2
- [x] Functions exported from `src/utils/index.ts` - Phase 2

## Phases

### Phase 1: Core Implementation

**Goal:** Implement the core `detectLinkSupport()` function with terminal lookup and caching.

**Dependencies:** None

**Estimated Complexity:** Low

#### Tests to Write

**Happy Path:**

1. should return `true` for iTerm2 when `TERM_PROGRAM="iTerm.app"`
2. should return `true` for WezTerm when `TERM_PROGRAM="WezTerm"`
3. should return `true` for Kitty when `TERM_PROGRAM="kitty"` or `TERM="xterm-kitty"`
4. should return `true` for Alacritty when `TERM="alacritty"`
5. should return `true` for Konsole when terminal detected as "konsole"
6. should return `true` for Ghostty when Ghostty env vars present
7. should return `true` for Windows Terminal when `WT_SESSION` or `WT_PROFILE_ID` present

**Negative Cases:**

8. should return `false` for Apple Terminal when `TERM_PROGRAM="Apple_Terminal"`
9. should return `false` for cmd.exe when detected as "cmd"
10. should return `false` for PowerShell when detected as "powershell"
11. should return `false` for ConEmu when detected as "conemu"
12. should return `false` for mintty when detected as "mintty"

**Uncertainty Cases:**

13. should return `null` for unknown terminals (terminal app = "other")
14. should return `null` when no terminal identification is available

**Caching:**

15. should cache the result and return cached value on subsequent calls
16. should use cached value even if environment changes after first call

**Type Tests:**

17. return type should be `Promise<boolean | null>`
18. awaited return type should be `boolean | null`

#### Implementation

**Files to Create:**

None (file already exists at `src/utils/detectLinkSupport.ts`)

**Files to Modify:**

- `src/utils/detectLinkSupport.ts` - Implement the function
- `src/utils/index.ts` - Export the function

**Key Functions:**

- `detectLinkSupport()` - Main detection function (async, returns `Promise<boolean | null>`)
- Module-level cache variable `cachedLinkSupport`

**Implementation Details:**

1. Define module-level cache: `let cachedLinkSupport: boolean | null | undefined = undefined`
   - Use `undefined` to represent "not yet cached"
   - Allow caching of `null` result (uncertainty)

2. Check cache first, return if cached

3. Call `detectTerminalApp()` to identify terminal

4. Define support map:

   ```typescript
   const supportMap: Record<TerminalApp, boolean | null> = {
       "iterm2": true,
       "wezterm": true,
       "kitty": true,
       "alacritty": true,
       "konsole": true,
       "ghostty": true,
       "windows-terminal": true,
       "apple-terminal": false,
       "cmd": false,
       "powershell": false,
       "conemu": false,
       "mintty": false,
       "other": null  // Uncertain
   };
   ```

5. Look up terminal in support map

6. Cache and return result

7. Add comprehensive JSDoc following project patterns:
   - Function signature with params
   - One-line summary
   - Detailed explanation of OSC8
   - Detection priority (just terminal lookup in this phase)
   - List of supported/unsupported terminals
   - `@returns` documentation explaining `true`/`false`/`null`
   - `@example` block showing usage

#### Success Criteria

- [x] All WIP tests pass
- [x] No regressions in existing tests
- [x] Function correctly identifies all known terminals
- [x] Caching works correctly
- [x] Type tests validate return type
- [x] JSDoc is comprehensive and clear

**Status:** ✅ **COMPLETE** - 2025-11-03

---

### Phase 2: Version Detection and Enhanced Link Support

**Goal:** Implement `detectAppVersion()` and enhance `detectLinkSupport()` with version-based detection for more accurate OSC8 support determination.

**Dependencies:** Phase 1

**Estimated Complexity:** Medium

**Status:** ✅ **COMPLETE** - 2025-11-03

#### Overview

Currently, `detectLinkSupport()` uses a static map to determine OSC8 support based on terminal type. However, some terminals added OSC8 support in specific versions (notably Alacritty v0.13+). This phase implements version detection and integrates it into the link support detection logic.

Additionally, we'll export both utilities from the main module.

#### Tests to Write

**For detectAppVersion():**

**Happy Path:**

1. should detect Alacritty version from `ALACRITTY_VERSION` env var (e.g., "0.13.2")
2. should detect WezTerm version from `WEZTERM_VERSION` env var if available
3. should detect Kitty version from `KITTY_VERSION` env var if available
4. should parse version strings in various formats (X.Y.Z, vX.Y.Z, X.Y)
5. should return structured version object with major, minor, patch

**Edge Cases:**

6. should return `null` when terminal is "other"
7. should return `null` when version env var is not present
8. should return `null` when version string is malformed
9. should handle version strings with pre-release tags (e.g., "0.13.0-dev")
10. should cache version result on subsequent calls

**Type Tests:**

11. return type should be `Promise<{major: number, minor: number, patch: number} | null>`
12. awaited return type should be `{major: number, minor: number, patch: number} | null`

**For enhanced detectLinkSupport():**

**Version-Based Detection:**

13. should return `false` for Alacritty < 0.13.0 when version is detected
14. should return `true` for Alacritty >= 0.13.0 when version is detected
15. should return `true` for Alacritty when version cannot be detected (optimistic fallback)
16. should fall back to map lookup when version detection returns `null`
17. should cache the combined result (version + map lookup)

**Regression Tests:**

18. should still return `true` for iTerm2, WezTerm, Kitty without version checks
19. should still return `false` for Apple Terminal, cmd.exe without version checks
20. should still return `null` for unknown terminals

#### Implementation

**Files to Create:**

- `tests/unit/detectAppVersion.test.ts` - Comprehensive tests for version detection

**Files to Modify:**

- `src/utils/detectTerminalApp.ts` - Implement `detectAppVersion()` function
- `src/utils/detectLinkSupport.ts` - Enhance with version-based detection
- `src/utils/index.ts` - Export both `detectAppVersion` and `detectLinkSupport`
- `tests/unit/detectLinkSupport.test.ts` - Add version-based tests

#### Implementation Details

**1. Implement detectAppVersion():**

```typescript
export type AppVersion = {
  major: number;
  minor: number;
  patch: number;
};

let cachedAppVersion: AppVersion | null | undefined = undefined;

/**
 * Detects the version of the current terminal application.
 *
 * Checks environment variables for version information:
 * - Alacritty: ALACRITTY_VERSION
 * - WezTerm: WEZTERM_VERSION (if exists)
 * - Kitty: KITTY_VERSION (if exists)
 *
 * @returns Version object with major, minor, patch or null if unknown
 */
export async function detectAppVersion(): Promise<AppVersion | null> {
  // Check cache
  if (cachedAppVersion !== undefined) {
    return cachedAppVersion;
  }

  const terminal = detectTerminalApp();
  let versionString: string | undefined;

  // Map terminals to their version env vars
  switch (terminal) {
    case "alacritty":
      versionString = process.env.ALACRITTY_VERSION;
      break;
    case "wezterm":
      versionString = process.env.WEZTERM_VERSION;
      break;
    case "kitty":
      versionString = process.env.KITTY_VERSION;
      break;
    default:
      versionString = undefined;
  }

  if (!versionString) {
    cachedAppVersion = null;
    return null;
  }

  // Parse version string (handle "v0.13.2", "0.13.2", "0.13.2-dev", etc.)
  const parsed = parseVersionString(versionString);
  cachedAppVersion = parsed;
  return parsed;
}

function parseVersionString(version: string): AppVersion | null {
  // Remove 'v' prefix if present
  const cleaned = version.startsWith('v') ? version.slice(1) : version;

  // Match major.minor.patch (ignore pre-release/build metadata)
  const match = cleaned.match(/^(\d+)\.(\d+)(?:\.(\d+))?/);

  if (!match) {
    return null;
  }

  return {
    major: parseInt(match[1], 10),
    minor: parseInt(match[2], 10),
    patch: parseInt(match[3] || "0", 10)
  };
}

// Cache busting for tests
export function detectAppVersion__Bust(): void {
  cachedAppVersion = undefined;
}
```

**2. Enhance detectLinkSupport():**

```typescript
export async function detectLinkSupport(): Promise<boolean | null> {
  // Check cache first
  if (cachedLinkSupport !== undefined) {
    return cachedLinkSupport;
  }

  // Detect terminal application
  const terminal = detectTerminalApp();

  // Special handling for Alacritty: check version
  if (terminal === "alacritty") {
    const version = await detectAppVersion();

    if (version !== null) {
      // OSC8 added in Alacritty 0.13.0
      const supportsOSC8 =
        version.major > 0 ||
        (version.major === 0 && version.minor >= 13);

      cachedLinkSupport = supportsOSC8;
      return supportsOSC8;
    }

    // Version unknown - fall through to optimistic map lookup
  }

  // Use map lookup for all other cases
  const supportMap: Record<TerminalApp, boolean | null> = {
    // ... existing map
  };

  const result = supportMap[terminal];
  cachedLinkSupport = result;
  return result;
}
```

**3. Export utilities:**

Add to `src/utils/index.ts` (in alphabetical order):

```typescript
export * from "./detectAppVersion";
export * from "./detectLinkSupport";
```

**4. Add tests for version-based detection:**

Update `tests/unit/detectLinkSupport.test.ts` with Alacritty version tests:

```typescript
it("should return false for Alacritty v0.12.0", async () => {
  process.env.TERM = "alacritty";
  process.env.ALACRITTY_VERSION = "0.12.0";

  const result = await detectLinkSupport();

  expect(result).toBe(false);
});

it("should return true for Alacritty v0.13.0", async () => {
  process.env.TERM = "alacritty";
  process.env.ALACRITTY_VERSION = "0.13.0";

  const result = await detectLinkSupport();

  expect(result).toBe(true);
});
```

#### Success Criteria

- [x] `detectAppVersion()` implemented with version parsing
- [x] Supports Alacritty, WezTerm, Kitty version detection
- [x] Parses various version string formats correctly
- [x] `detectLinkSupport()` enhanced with Alacritty version checking
- [x] Returns `false` for Alacritty < 0.13, `true` for >= 0.13
- [x] Falls back to map lookup when version unavailable
- [x] Both functions exported from `src/utils/index.ts`
- [x] All new tests pass (detectAppVersion + enhanced detectLinkSupport)
- [x] No regressions in existing detectLinkSupport tests
- [x] Full test suite passes
- [x] Comprehensive JSDoc for `detectAppVersion()`

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

### Terminal Support Reference

Based on OSC8 specification and terminal testing:

**Terminals with OSC8 Support:**

- **iTerm2** (macOS) - Full support since v3.1 (2017)
- **WezTerm** (cross-platform) - Full support
- **Kitty** (cross-platform) - Full support
- **Alacritty** (cross-platform) - Support added in v0.13+ (Nov 2023)
- **Ghostty** (macOS/Linux) - Full support
- **Konsole** (Linux/KDE) - Full support in recent versions
- **Windows Terminal** (Windows) - Full support since v1.8+ (2022)

**Terminals WITHOUT OSC8 Support:**

- **Apple Terminal.app** (macOS) - No support
- **cmd.exe** (Windows) - No support
- **PowerShell** (standalone, non-Windows Terminal) - No support
- **ConEmu** (Windows) - No support
- **mintty** (Git Bash, Cygwin) - No support

### Design Decisions

1. **No environment variable override:**
   - This is a detection function, not a configuration option
   - Users who need to force link behavior should check `detectLinkSupport()` and use their own logic

2. **Return `null` for uncertainty:**
   - Unknown terminals return `null` rather than guessing
   - Allows callers to implement their own fallback logic
   - More honest than defaulting to `true` or `false`

3. **Caching with `undefined` vs `null`:**
   - Cache variable uses `undefined` to mean "not yet detected"
   - Allows caching of `null` result (uncertainty is a valid cached result)
   - Pattern: `let cached: T | undefined` where `T` includes `null`

4. **No OSC query attempt:**
   - OSC8 doesn't have a reliable query/response mechanism
   - Terminal lookup is fast, accurate, and sufficient
   - Avoids complexity and timeout handling

5. **Async signature for consistency:**
   - Returns `Promise<boolean | null>` even though currently synchronous
   - Matches all other detection utilities in the codebase
   - Allows future enhancement (e.g., version checking) without breaking API

### Related Files

- **Link utilities:** `src/utils/link.ts` (already implemented)
  - `urlLink()` - Creates HTTPS links
  - `fileLink()` - Creates file:// links
  - These can now check `detectLinkSupport()` before rendering

- **Terminal detection:** `src/utils/detectTerminalApp.ts`
  - Returns `TerminalApp` type
  - Used internally by `detectLinkSupport()`

- **Constants:** `src/constants.ts`
  - `TERMINAL_APPS` - List of known terminal types
  - OSC8 constants already defined

### Future Enhancements (Out of Scope)

- ~~**Version detection for Alacritty:** Check if version < 0.13 and return `false`~~ → **Moved to Phase 2**
- **Shell-based version detection:** Use `alacritty --version`, `kitty --version` as fallback when env vars unavailable
- **TERM-based fallback:** Parse `$TERM` for hints when terminal is "other"
- **Integration with link utilities:** Modify `urlLink()`/`fileLink()` to auto-detect and fallback to plain text
- **Additional version checks:** Detect minimum versions for other terminals as they add OSC8 support
