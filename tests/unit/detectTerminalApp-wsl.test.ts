import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { detectTerminalApp, isRunningInWSL } from "~/utils/detectTerminalApp";
import { discoverOs } from "~/utils/os";
import type { Expect, AssertExtends } from "inferred-types/types";
import type { TerminalApp } from "~/types";

describe("detectTerminalApp() - WSL Detection", () => {
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
        vi.restoreAllMocks();
    });

    // ========== HAPPY PATH TESTS ==========

    it("should detect WSL environment from WSL_DISTRO_NAME", () => {
        process.env.WSL_DISTRO_NAME = "Ubuntu";

        const isWsl = isRunningInWSL();
        expect(isWsl).toBe(true);
    });

    it("should detect Linux terminal (bash) when running in WSL", () => {
        process.env.WSL_DISTRO_NAME = "Ubuntu";
        process.env.TERM = "xterm-256color";
        process.env.WT_SESSION = "wsl-session-123";

        const result = detectTerminalApp();
        // Should detect Windows Terminal, not just return "wsl"
        expect(result).toBe("windows-terminal");
    });

    it("should detect terminal app (kitty) when running in WSL", () => {
        process.env.WSL_DISTRO_NAME = "Ubuntu";
        process.env.TERM = "xterm-kitty";

        const result = detectTerminalApp();
        // Should detect the actual terminal (kitty), not "wsl"
        expect(result).toBe("kitty");
    });

    it("should detect terminal app (alacritty) when running in WSL", () => {
        process.env.WSL_DISTRO_NAME = "Ubuntu";
        process.env.TERM_PROGRAM = "alacritty";

        const result = detectTerminalApp();
        expect(result).toBe("alacritty");
    });

    // ========== EDGE CASES ==========

    it("should return the actual terminal app when in WSL, not just 'wsl'", () => {
        process.env.WSL_DISTRO_NAME = "Debian";
        process.env.TERM_PROGRAM = "wezterm";

        const result = detectTerminalApp();
        // Should detect WezTerm, not "wsl"
        expect(result).toBe("wezterm");
        expect(result).not.toBe("wsl");
    });

    it("should detect WSL when both WSL_DISTRO_NAME and WSL_INTEROP are set", () => {
        process.env.WSL_DISTRO_NAME = "Ubuntu-20.04";
        process.env.WSL_INTEROP = "/run/WSL/8_interop";

        const isWsl = isRunningInWSL();
        expect(isWsl).toBe(true);
    });

    it("should handle WSL with Windows Terminal correctly", () => {
        // Common WSL scenario: Windows Terminal running bash/zsh
        process.env.WSL_DISTRO_NAME = "Ubuntu";
        process.env.WT_SESSION = "12345-abcde";
        process.env.TERM = "xterm-256color";

        const result = detectTerminalApp();
        // Windows Terminal is the actual terminal app
        expect(result).toBe("windows-terminal");
    });

    it("should handle WSL with ConEmu correctly", () => {
        process.env.WSL_DISTRO_NAME = "Ubuntu";
        process.env.ConEmuDir = "C:\\Program Files\\ConEmu";
        process.env.TERM = "xterm-256color";

        const result = detectTerminalApp();
        expect(result).toBe("conemu");
    });

    // ========== ERROR CONDITIONS ==========

    it.skipIf(discoverOs() === "linux")("should not throw when checking for /proc/version on non-Linux systems", () => {
        // On non-Linux systems (like macOS or native Windows), /proc/version doesn't exist
        // The function should handle this gracefully
        delete process.env.WSL_DISTRO_NAME;

        expect(() => isRunningInWSL()).not.toThrow();
        // On macOS or native Windows, this should return false
        const isWsl = isRunningInWSL();
        expect(isWsl).toBe(false);
    });

    it("should not throw when all WSL indicators are missing", () => {
        delete process.env.WSL_DISTRO_NAME;
        delete process.env.WSL_INTEROP;

        expect(() => isRunningInWSL()).not.toThrow();
        expect(() => detectTerminalApp()).not.toThrow();
    });

    // ========== TYPE TESTS ==========

    it("should return appropriate TerminalApp type for WSL scenarios", () => {
        // WSL with Windows Terminal
        process.env.WSL_DISTRO_NAME = "Ubuntu";
        process.env.WT_SESSION = "session";
        const wtResult = detectTerminalApp();
        expect(wtResult).toBe("windows-terminal");

        // WSL with kitty
        delete process.env.WT_SESSION;
        process.env.TERM = "xterm-kitty";
        const kittyResult = detectTerminalApp();
        expect(kittyResult).toBe("kitty");

        // WSL with generic terminal
        delete process.env.TERM;
        process.env.TERM = "xterm-256color";
        const genericResult = detectTerminalApp();
        expect(genericResult).toBe("other");

        // Type test: Return type is always TerminalApp
        type cases = [
            Expect<AssertExtends<typeof wtResult, TerminalApp>>,
            Expect<AssertExtends<typeof kittyResult, TerminalApp>>,
            Expect<AssertExtends<typeof genericResult, TerminalApp>>
        ];
    });

    it("should never return 'wsl' as a terminal app", () => {
        process.env.WSL_DISTRO_NAME = "Ubuntu";
        process.env.TERM = "xterm-256color";

        const result = detectTerminalApp();

        // WSL is an environment, not a terminal app
        expect(result).not.toBe("wsl");
        expect(["windows-terminal", "powershell", "cmd", "conemu", "mintty", "kitty", "alacritty", "iterm2", "wezterm", "konsole", "ghostty", "apple-terminal", "other"]).toContain(result);
    });
});
