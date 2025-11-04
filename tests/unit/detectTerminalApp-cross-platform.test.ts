import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { detectTerminalApp } from "~/utils/detectTerminalApp";
import { discoverOs } from "~/utils/os";
import type { Expect, AssertExtends } from "inferred-types/types";
import type { TerminalApp } from "~/types";

describe("detectTerminalApp() - Cross-Platform Mocking", () => {
    let originalEnv: NodeJS.ProcessEnv;

    beforeEach(() => {
        // Save original environment
        originalEnv = { ...process.env };

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
        // Clear Windows terminal env vars
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
        delete process.env.WSL_DISTRO_NAME;
        delete process.env.WSL_INTEROP;
    });

    afterEach(() => {
        // Restore original environment
        process.env = originalEnv;
    });

    // ========== HAPPY PATH - MOCKED WINDOWS DETECTION ON NON-WINDOWS ==========

    it.skipIf(discoverOs() === "win32")("should detect Windows Terminal via mocked WT_SESSION on macOS", () => {
        // This test only runs on non-Windows platforms
        process.env.TERM = "xterm-256color";
        process.env.WT_SESSION = "mocked-session-123";

        const result = detectTerminalApp();
        expect(result).toBe("windows-terminal");

        // Type test
        type cases = [
            Expect<AssertExtends<typeof result, TerminalApp>>
        ];
    });

    it.skipIf(discoverOs() === "win32")("should detect PowerShell via mocked PSModulePath on macOS", () => {
        process.env.TERM = "xterm-256color";
        process.env.PSModulePath = "/mocked/path/to/modules";

        const result = detectTerminalApp();
        expect(result).toBe("powershell");

        type cases = [
            Expect<AssertExtends<typeof result, TerminalApp>>
        ];
    });

    it.skipIf(discoverOs() === "win32")("should detect ConEmu via mocked ConEmuDir on macOS", () => {
        process.env.TERM = "xterm-256color";
        process.env.ConEmuDir = "/mocked/conemu/dir";

        const result = detectTerminalApp();
        expect(result).toBe("conemu");

        type cases = [
            Expect<AssertExtends<typeof result, TerminalApp>>
        ];
    });

    it.skipIf(discoverOs() === "win32")("should detect mintty via mocked MSYSTEM on macOS", () => {
        process.env.TERM = "xterm-256color";
        process.env.MSYSTEM = "MINGW64";

        const result = detectTerminalApp();
        expect(result).toBe("mintty");

        type cases = [
            Expect<AssertExtends<typeof result, TerminalApp>>
        ];
    });

    // ========== EDGE CASES - MIXED ENVIRONMENT VARIABLES ==========

    it.skipIf(discoverOs() === "win32")("should handle mixed Windows/macOS env vars gracefully", () => {
        // Set both macOS and Windows terminal indicators
        process.env.TERM_PROGRAM = "iTerm.app"; // macOS
        process.env.WT_SESSION = "windows-session"; // Windows

        const result = detectTerminalApp();

        // TERM_PROGRAM should take priority (see plan priority order)
        expect(result).toBe("iterm2");

        type cases = [
            Expect<AssertExtends<typeof result, TerminalApp>>
        ];
    });

    it.skipIf(discoverOs() === "win32")("should prioritize Windows detection when Windows env vars are set on non-Windows platform", () => {
        // When Windows-specific vars are set without TERM_PROGRAM
        process.env.TERM = "xterm-256color"; // Generic TERM
        process.env.WT_SESSION = "windows-session";

        const result = detectTerminalApp();

        // Windows Terminal should be detected even on non-Windows OS
        expect(result).toBe("windows-terminal");

        type cases = [
            Expect<AssertExtends<typeof result, TerminalApp>>
        ];
    });

    it.skipIf(discoverOs() === "win32")("should handle TERM with known pattern taking priority over Windows vars", () => {
        process.env.TERM = "xterm-kitty"; // Known TERM pattern
        process.env.WT_SESSION = "windows-session";

        const result = detectTerminalApp();

        // TERM pattern should take priority
        expect(result).toBe("kitty");

        type cases = [
            Expect<AssertExtends<typeof result, TerminalApp>>
        ];
    });

    it.skipIf(discoverOs() === "win32")("should detect Windows terminal when TERM is generic on non-Windows platform", () => {
        process.env.TERM = "xterm-256color"; // Generic
        process.env.PSModulePath = "/mocked/path";

        const result = detectTerminalApp();

        // PowerShell should be detected
        expect(result).toBe("powershell");

        type cases = [
            Expect<AssertExtends<typeof result, TerminalApp>>
        ];
    });

    // ========== INTEGRATION TESTS ==========

    it.skipIf(discoverOs() === "win32")("should run all Windows detection tests via mocking on non-Windows platforms", () => {
        // Test multiple Windows terminals can be detected via mocking

        // Windows Terminal
        process.env.WT_SESSION = "session";
        let result = detectTerminalApp();
        expect(result).toBe("windows-terminal");
        delete process.env.WT_SESSION;

        // PowerShell
        process.env.PSModulePath = "path";
        result = detectTerminalApp();
        expect(result).toBe("powershell");
        delete process.env.PSModulePath;

        // ConEmu
        process.env.ConEmuDir = "dir";
        result = detectTerminalApp();
        expect(result).toBe("conemu");
        delete process.env.ConEmuDir;

        // mintty
        process.env.TERM = "xterm-mintty";
        result = detectTerminalApp();
        expect(result).toBe("mintty");
        delete process.env.TERM;

        // cmd
        process.env.COMSPEC = "cmd.exe";
        result = detectTerminalApp();
        expect(result).toBe("cmd");

        type cases = [
            Expect<AssertExtends<typeof result, TerminalApp>>
        ];
    });

    it.skipIf(discoverOs() === "win32")("should maintain existing macOS/Linux detection when Windows env vars are absent", () => {
        // Verify macOS/Linux detection still works when no Windows vars present

        // Test TERM_PROGRAM detection
        process.env.TERM_PROGRAM = "iTerm.app";
        let result = detectTerminalApp();
        expect(result).toBe("iterm2");
        delete process.env.TERM_PROGRAM;

        // Test TERM pattern detection
        process.env.TERM = "xterm-kitty";
        result = detectTerminalApp();
        expect(result).toBe("kitty");
        delete process.env.TERM;

        // Test environment variable detection (requires TERM to be set)
        process.env.TERM = "xterm-256color";
        process.env.ALACRITTY_SOCKET = "/tmp/alacritty.sock";
        result = detectTerminalApp();
        expect(result).toBe("alacritty");
        delete process.env.ALACRITTY_SOCKET;
        delete process.env.TERM;

        type cases = [
            Expect<AssertExtends<typeof result, TerminalApp>>
        ];
    });

    // ========== PLATFORM-SPECIFIC WINDOWS TESTS ==========

    it.skipIf(discoverOs() !== "win32")("should detect actual Windows Terminal on real Windows platform", () => {
        // This test only runs on actual Windows
        // It checks real Windows environment detection

        process.env.WT_SESSION = "real-windows-session";
        const result = detectTerminalApp();
        expect(result).toBe("windows-terminal");

        type cases = [
            Expect<AssertExtends<typeof result, TerminalApp>>
        ];
    });

    it.skipIf(discoverOs() !== "win32")("should detect actual PowerShell on real Windows platform", () => {
        process.env.PSModulePath = "C:\\Program Files\\PowerShell\\Modules";
        const result = detectTerminalApp();
        expect(result).toBe("powershell");

        type cases = [
            Expect<AssertExtends<typeof result, TerminalApp>>
        ];
    });

    // ========== TYPE TESTS ==========

    it("should return TerminalApp type for all detections regardless of platform", () => {
        // Test that return type is always TerminalApp

        process.env.WT_SESSION = "session";
        const wtResult = detectTerminalApp();

        process.env.TERM_PROGRAM = "iTerm.app";
        delete process.env.WT_SESSION;
        const macResult = detectTerminalApp();

        delete process.env.TERM_PROGRAM;
        const otherResult = detectTerminalApp();

        expect(wtResult).toBe("windows-terminal");
        expect(macResult).toBe("iterm2");
        expect(otherResult).toBe("other");

        type cases = [
            Expect<AssertExtends<typeof wtResult, TerminalApp>>,
            Expect<AssertExtends<typeof macResult, TerminalApp>>,
            Expect<AssertExtends<typeof otherResult, TerminalApp>>
        ];
    });

    // ========== ERROR CONDITIONS ==========

    it("should not throw when mixing valid and invalid env vars across platforms", () => {
        // Mix of valid macOS and Windows vars with some invalid values
        process.env.TERM_PROGRAM = "!!!invalid!!!";
        process.env.WT_SESSION = "";
        process.env.ITERM_PROFILE = "valid-profile";

        expect(() => detectTerminalApp()).not.toThrow();

        const result = detectTerminalApp();
        // Should detect something, even if just "other"
        expect(["windows-terminal", "iterm2", "other"]).toContain(result);
    });

    it("should not throw when all env vars are cleared on any platform", () => {
        // Already cleared in beforeEach, just verify
        expect(() => detectTerminalApp()).not.toThrow();
        expect(detectTerminalApp()).toBe("other");
    });
});
