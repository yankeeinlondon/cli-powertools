import { describe, it, expect, beforeEach, afterEach } from "vitest";
import type { Expect, Equals as AssertEqual } from "inferred-types/types";
import { detectLinkSupport, detectLinkSupport__Bust } from "~/utils/detectLinkSupport";
import { detectAppVersion__Bust } from "~/utils/detectTerminalApp";

describe("detectLinkSupport()", () => {
    let originalEnv: NodeJS.ProcessEnv;

    beforeEach(() => {
        // Save original environment
        originalEnv = { ...process.env };

        // Bust the cache to ensure fresh detection for each test
        detectLinkSupport__Bust();

        // Clear all terminal-related environment variables
        delete process.env.TERM_PROGRAM;
        delete process.env.TERM;
        delete process.env.WEZTERM_PANE;
        delete process.env.WEZTERM_CONFIG_DIR;
        delete process.env.WEZTERM_CONFIG_FILE;
        delete process.env.WEZTERM_EXECUTABLE;
        delete process.env.WEZTERM_UNIX_SOCKET;
        delete process.env.ITERM_PROFILE;
        delete process.env.ITERM_SESSION_ID;
        delete process.env.ALACRITTY_LOG;
        delete process.env.ALACRITTY_SOCKET;
        delete process.env.ALACRITTY_WINDOW_ID;
        delete process.env.KITTY_WINDOW_ID;
        delete process.env.KITTY_PUBLIC_KEY;
        delete process.env.KITTY_INSTALLATION_DIR;
        delete process.env.KITTY_PID;
        delete process.env.KONSOLE_VERSION;
        delete process.env.KONSOLE_DBUS_WINDOW;
        delete process.env.GHOSTTY_RESOURCES_DIR;
        delete process.env.GHOSTTY_SHELL_FEATURES;
        delete process.env.GHOSTTY_BIN_DIR;
        delete process.env.WT_SESSION;
        delete process.env.WT_PROFILE_ID;
        delete process.env.PSModulePath;
        delete process.env.POWERSHELL_DISTRIBUTION_CHANNEL;
        delete process.env.PROMPT;
        delete process.env.COMSPEC;
        delete process.env.ConEmuDir;
        delete process.env.ConEmuBaseDir;
        delete process.env.CMDER_ROOT;
        delete process.env.MSYSTEM;
        delete process.env.CHERE_INVOKING;
    });

    afterEach(() => {
        // Restore original environment
        process.env = originalEnv;
    });

    // ========== HAPPY PATH - Terminals with OSC8 support ==========

    it("should return true for iTerm2 when TERM_PROGRAM='iTerm.app'", async () => {
        process.env.TERM_PROGRAM = "iTerm.app";

        const result = await detectLinkSupport();

        expect(result).toBe(true);

        type cases = [
            Expect<AssertEqual<typeof result, boolean | null>>
        ];
    });

    it("should return true for WezTerm when TERM_PROGRAM='WezTerm'", async () => {
        process.env.TERM_PROGRAM = "WezTerm";

        const result = await detectLinkSupport();

        expect(result).toBe(true);

        type cases = [
            Expect<AssertEqual<typeof result, boolean | null>>
        ];
    });

    it("should return true for Kitty when KITTY_WINDOW_ID env var present", async () => {
        process.env.TERM = "xterm-256color";
        process.env.KITTY_WINDOW_ID = "1";

        const result = await detectLinkSupport();

        expect(result).toBe(true);

        type cases = [
            Expect<AssertEqual<typeof result, boolean | null>>
        ];
    });

    it("should return true for Kitty when TERM='xterm-kitty'", async () => {
        process.env.TERM = "xterm-kitty";

        const result = await detectLinkSupport();

        expect(result).toBe(true);

        type cases = [
            Expect<AssertEqual<typeof result, boolean | null>>
        ];
    });

    it("should return true for Alacritty when TERM='alacritty'", async () => {
        process.env.TERM = "alacritty";

        const result = await detectLinkSupport();

        expect(result).toBe(true);

        type cases = [
            Expect<AssertEqual<typeof result, boolean | null>>
        ];
    });

    it("should return false for Konsole (OSC8 sequences not rendered as clickable)", async () => {
        process.env.TERM = "xterm-256color";
        process.env.KONSOLE_VERSION = "21.12.0";

        const result = await detectLinkSupport();

        expect(result).toBe(false);

        type cases = [
            Expect<AssertEqual<typeof result, boolean | null>>
        ];
    });

    it("should return true for Ghostty when Ghostty env vars present", async () => {
        process.env.TERM = "xterm-256color";
        process.env.GHOSTTY_RESOURCES_DIR = "/usr/share/ghostty";

        const result = await detectLinkSupport();

        expect(result).toBe(true);

        type cases = [
            Expect<AssertEqual<typeof result, boolean | null>>
        ];
    });

    it("should return true for Windows Terminal when WT_SESSION present", async () => {
        process.env.TERM = "xterm-256color";
        process.env.WT_SESSION = "12345";

        const result = await detectLinkSupport();

        expect(result).toBe(true);

        type cases = [
            Expect<AssertEqual<typeof result, boolean | null>>
        ];
    });

    it("should return true for Windows Terminal when WT_PROFILE_ID present", async () => {
        process.env.TERM = "xterm-256color";
        process.env.WT_PROFILE_ID = "{abc-123}";

        const result = await detectLinkSupport();

        expect(result).toBe(true);

        type cases = [
            Expect<AssertEqual<typeof result, boolean | null>>
        ];
    });

    // ========== NEGATIVE CASES - Terminals without OSC8 support ==========

    it("should return false for Apple Terminal when TERM_PROGRAM='Apple_Terminal'", async () => {
        process.env.TERM_PROGRAM = "Apple_Terminal";

        const result = await detectLinkSupport();

        expect(result).toBe(false);

        type cases = [
            Expect<AssertEqual<typeof result, boolean | null>>
        ];
    });

    it("should return false for cmd.exe when detected as 'cmd'", async () => {
        process.env.TERM = "xterm-256color";
        process.env.PROMPT = "$P$G";
        process.env.COMSPEC = "C:\\Windows\\System32\\cmd.exe";

        const result = await detectLinkSupport();

        expect(result).toBe(false);

        type cases = [
            Expect<AssertEqual<typeof result, boolean | null>>
        ];
    });

    it("should return false for PowerShell when detected as 'powershell'", async () => {
        process.env.TERM = "xterm-256color";
        process.env.PSModulePath = "C:\\Program Files\\PowerShell\\Modules";

        const result = await detectLinkSupport();

        expect(result).toBe(false);

        type cases = [
            Expect<AssertEqual<typeof result, boolean | null>>
        ];
    });

    it("should return false for ConEmu when detected as 'conemu'", async () => {
        process.env.TERM = "xterm-256color";
        process.env.ConEmuDir = "C:\\Program Files\\ConEmu";

        const result = await detectLinkSupport();

        expect(result).toBe(false);

        type cases = [
            Expect<AssertEqual<typeof result, boolean | null>>
        ];
    });

    it("should return false for mintty when detected as 'mintty'", async () => {
        process.env.TERM = "mintty";

        const result = await detectLinkSupport();

        expect(result).toBe(false);

        type cases = [
            Expect<AssertEqual<typeof result, boolean | null>>
        ];
    });

    // ========== UNCERTAINTY CASES ==========

    it("should return null for unknown terminals (terminal app = 'other')", async () => {
        process.env.TERM = "xterm-256color";

        const result = await detectLinkSupport();

        expect(result).toBe(null);

        type cases = [
            Expect<AssertEqual<typeof result, boolean | null>>
        ];
    });

    it("should return null when no terminal identification is available", async () => {
        // All env vars cleared by beforeEach

        const result = await detectLinkSupport();

        expect(result).toBe(null);

        type cases = [
            Expect<AssertEqual<typeof result, boolean | null>>
        ];
    });

    // ========== CACHING TESTS ==========

    it("should cache the result and return cached value on subsequent calls", async () => {
        process.env.TERM_PROGRAM = "iTerm.app";

        // First call - should detect and cache
        const result1 = await detectLinkSupport();
        expect(result1).toBe(true);

        // Change env to something that would return false
        process.env.TERM_PROGRAM = "Apple_Terminal";

        // Second call - should return cached value (still true)
        const result2 = await detectLinkSupport();
        expect(result2).toBe(true);

        type cases = [
            Expect<AssertEqual<typeof result1, boolean | null>>,
            Expect<AssertEqual<typeof result2, boolean | null>>
        ];
    });

    it("should use cached value even if environment changes after first call", async () => {
        // Set up for null result
        process.env.TERM = "xterm-256color";

        // First call - should return null and cache it
        const result1 = await detectLinkSupport();
        expect(result1).toBe(null);

        // Change env to something that would return true
        process.env.TERM_PROGRAM = "WezTerm";

        // Second call - should still return null (cached)
        const result2 = await detectLinkSupport();
        expect(result2).toBe(null);

        type cases = [
            Expect<AssertEqual<typeof result1, boolean | null>>,
            Expect<AssertEqual<typeof result2, boolean | null>>
        ];
    });

    // ========== TYPE TESTS ==========

    it("return type should be Promise<boolean | null>", async () => {
        process.env.TERM_PROGRAM = "iTerm.app";

        const resultPromise = detectLinkSupport();
        const result = await resultPromise;

        // Runtime checks
        expect(resultPromise).toBeInstanceOf(Promise);
        expect([true, false, null]).toContain(result);

        // Type checks
        type cases = [
            Expect<AssertEqual<typeof resultPromise, Promise<boolean | null>>>,
            Expect<AssertEqual<typeof result, boolean | null>>
        ];
    });

    it("awaited return type should be boolean | null", async () => {
        process.env.TERM_PROGRAM = "WezTerm";

        const result = await detectLinkSupport();

        // Runtime check - result is one of the valid values
        expect([true, false, null]).toContain(result);

        // Type check - result has the correct type
        type cases = [
            Expect<AssertEqual<typeof result, boolean | null>>
        ];
    });
});

describe("detectLinkSupport() - Enhanced with Version Detection", () => {
    let originalEnv: NodeJS.ProcessEnv;

    beforeEach(() => {
        // Save original environment
        originalEnv = { ...process.env };

        // Bust both caches to ensure fresh detection for each test
        detectLinkSupport__Bust();
        detectAppVersion__Bust();

        // Clear all terminal-related environment variables
        delete process.env.TERM_PROGRAM;
        delete process.env.TERM;
        delete process.env.ALACRITTY_VERSION;
        delete process.env.WEZTERM_VERSION;
        delete process.env.KITTY_VERSION;
        delete process.env.WEZTERM_PANE;
        delete process.env.WEZTERM_CONFIG_DIR;
        delete process.env.WEZTERM_CONFIG_FILE;
        delete process.env.WEZTERM_EXECUTABLE;
        delete process.env.WEZTERM_UNIX_SOCKET;
        delete process.env.ITERM_PROFILE;
        delete process.env.ITERM_SESSION_ID;
        delete process.env.ALACRITTY_LOG;
        delete process.env.ALACRITTY_SOCKET;
        delete process.env.ALACRITTY_WINDOW_ID;
        delete process.env.KITTY_WINDOW_ID;
        delete process.env.KITTY_PUBLIC_KEY;
        delete process.env.KITTY_INSTALLATION_DIR;
        delete process.env.KITTY_PID;
        delete process.env.KONSOLE_VERSION;
        delete process.env.KONSOLE_DBUS_WINDOW;
        delete process.env.GHOSTTY_RESOURCES_DIR;
        delete process.env.GHOSTTY_SHELL_FEATURES;
        delete process.env.GHOSTTY_BIN_DIR;
        delete process.env.WT_SESSION;
        delete process.env.WT_PROFILE_ID;
        delete process.env.PSModulePath;
        delete process.env.POWERSHELL_DISTRIBUTION_CHANNEL;
        delete process.env.PROMPT;
        delete process.env.COMSPEC;
        delete process.env.ConEmuDir;
        delete process.env.ConEmuBaseDir;
        delete process.env.CMDER_ROOT;
        delete process.env.MSYSTEM;
        delete process.env.CHERE_INVOKING;
    });

    afterEach(() => {
        // Restore original environment
        process.env = originalEnv;
    });

    // ========== VERSION-BASED DETECTION ==========

    it("should return false for Alacritty v0.12.0 (< 0.13)", async () => {
        process.env.TERM = "alacritty";
        process.env.ALACRITTY_VERSION = "0.12.0";

        const result = await detectLinkSupport();

        expect(result).toBe(false);

        type cases = [
            Expect<AssertEqual<typeof result, boolean | null>>
        ];
    });

    it("should return false for Alacritty v0.12.3 (< 0.13)", async () => {
        process.env.TERM = "alacritty";
        process.env.ALACRITTY_VERSION = "0.12.3";

        const result = await detectLinkSupport();

        expect(result).toBe(false);

        type cases = [
            Expect<AssertEqual<typeof result, boolean | null>>
        ];
    });

    it("should return true for Alacritty v0.13.0 (>= 0.13)", async () => {
        process.env.TERM = "alacritty";
        process.env.ALACRITTY_VERSION = "0.13.0";

        const result = await detectLinkSupport();

        expect(result).toBe(true);

        type cases = [
            Expect<AssertEqual<typeof result, boolean | null>>
        ];
    });

    it("should return true for Alacritty v0.13.2 (>= 0.13)", async () => {
        process.env.TERM = "alacritty";
        process.env.ALACRITTY_VERSION = "0.13.2";

        const result = await detectLinkSupport();

        expect(result).toBe(true);

        type cases = [
            Expect<AssertEqual<typeof result, boolean | null>>
        ];
    });

    it("should return true for Alacritty v0.14.0 (>= 0.13)", async () => {
        process.env.TERM = "alacritty";
        process.env.ALACRITTY_VERSION = "0.14.0";

        const result = await detectLinkSupport();

        expect(result).toBe(true);

        type cases = [
            Expect<AssertEqual<typeof result, boolean | null>>
        ];
    });

    it("should return true for Alacritty v1.0.0 (>= 0.13)", async () => {
        process.env.TERM = "alacritty";
        process.env.ALACRITTY_VERSION = "1.0.0";

        const result = await detectLinkSupport();

        expect(result).toBe(true);

        type cases = [
            Expect<AssertEqual<typeof result, boolean | null>>
        ];
    });

    it("should return true for Alacritty when version cannot be detected (optimistic fallback)", async () => {
        process.env.TERM = "alacritty";
        // ALACRITTY_VERSION not set

        const result = await detectLinkSupport();

        expect(result).toBe(true);

        type cases = [
            Expect<AssertEqual<typeof result, boolean | null>>
        ];
    });

    it("should fall back to map lookup when version detection returns null", async () => {
        process.env.TERM = "alacritty";
        process.env.ALACRITTY_VERSION = "invalid-version";

        const result = await detectLinkSupport();

        // Invalid version -> null -> fall back to map -> true (optimistic)
        expect(result).toBe(true);

        type cases = [
            Expect<AssertEqual<typeof result, boolean | null>>
        ];
    });

    it("should cache the combined result (version + map lookup)", async () => {
        process.env.TERM = "alacritty";
        process.env.ALACRITTY_VERSION = "0.12.0";

        // First call - should detect version and return false
        const result1 = await detectLinkSupport();
        expect(result1).toBe(false);

        // Change version to 0.13.0
        process.env.ALACRITTY_VERSION = "0.13.0";

        // Second call - should return cached value (still false)
        const result2 = await detectLinkSupport();
        expect(result2).toBe(false);

        type cases = [
            Expect<AssertEqual<typeof result1, boolean | null>>,
            Expect<AssertEqual<typeof result2, boolean | null>>
        ];
    });

    // ========== REGRESSION TESTS - Ensure Phase 1 behavior still works ==========

    it("should still return true for iTerm2 without version checks", async () => {
        process.env.TERM_PROGRAM = "iTerm.app";

        const result = await detectLinkSupport();

        expect(result).toBe(true);

        type cases = [
            Expect<AssertEqual<typeof result, boolean | null>>
        ];
    });

    it("should still return true for WezTerm without version checks", async () => {
        process.env.TERM_PROGRAM = "WezTerm";

        const result = await detectLinkSupport();

        expect(result).toBe(true);

        type cases = [
            Expect<AssertEqual<typeof result, boolean | null>>
        ];
    });

    it("should still return true for Kitty without version checks", async () => {
        process.env.TERM = "xterm-kitty";

        const result = await detectLinkSupport();

        expect(result).toBe(true);

        type cases = [
            Expect<AssertEqual<typeof result, boolean | null>>
        ];
    });

    it("should still return true for Windows Terminal without version checks", async () => {
        process.env.TERM = "xterm-256color";
        process.env.WT_SESSION = "12345";

        const result = await detectLinkSupport();

        expect(result).toBe(true);

        type cases = [
            Expect<AssertEqual<typeof result, boolean | null>>
        ];
    });

    it("should still return false for Apple Terminal without version checks", async () => {
        process.env.TERM_PROGRAM = "Apple_Terminal";

        const result = await detectLinkSupport();

        expect(result).toBe(false);

        type cases = [
            Expect<AssertEqual<typeof result, boolean | null>>
        ];
    });

    it("should still return false for cmd.exe without version checks", async () => {
        process.env.TERM = "xterm-256color";
        process.env.PROMPT = "$P$G";
        process.env.COMSPEC = "C:\\Windows\\System32\\cmd.exe";

        const result = await detectLinkSupport();

        expect(result).toBe(false);

        type cases = [
            Expect<AssertEqual<typeof result, boolean | null>>
        ];
    });

    it("should still return null for unknown terminals", async () => {
        process.env.TERM = "xterm-256color";
        // No terminal-specific env vars

        const result = await detectLinkSupport();

        expect(result).toBe(null);

        type cases = [
            Expect<AssertEqual<typeof result, boolean | null>>
        ];
    });
});
