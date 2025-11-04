import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { detectTerminalApp } from "~/utils/detectTerminalApp";


describe("detectTerminalApp()", () => {
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
        // Windows-specific environment variables
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

    // ========== HAPPY PATH TESTS - TERM_PROGRAM Detection ==========

    it("should detect Ghostty from TERM_PROGRAM='ghostty'", () => {
        process.env.TERM_PROGRAM = "ghostty";

        const result = detectTerminalApp();
        expect(result).toBe("ghostty");

    });

    it("should detect Ghostty from TERM_PROGRAM='GHOSTTY' (case insensitive)", () => {
        process.env.TERM_PROGRAM = "GHOSTTY";

        const result = detectTerminalApp();
        expect(result).toBe("ghostty");
    });

    it("should detect WezTerm from TERM_PROGRAM='wezterm'", () => {
        process.env.TERM_PROGRAM = "wezterm";

        const result = detectTerminalApp();
        expect(result).toBe("wezterm");

    });

    it("should detect WezTerm from TERM_PROGRAM='WEZTERM' (case insensitive)", () => {
        process.env.TERM_PROGRAM = "WEZTERM";

        const result = detectTerminalApp();
        expect(result).toBe("wezterm");
    });

    it("should detect Apple Terminal from TERM_PROGRAM='Apple_Terminal'", () => {
        process.env.TERM_PROGRAM = "Apple_Terminal";

        const result = detectTerminalApp();
        expect(result).toBe("apple-terminal");

    });

    it("should detect Alacritty from TERM_PROGRAM='alacritty'", () => {
        process.env.TERM_PROGRAM = "alacritty";

        const result = detectTerminalApp();
        expect(result).toBe("alacritty");

    });

    it("should detect iTerm2 from TERM_PROGRAM='iTerm.app'", () => {
        process.env.TERM_PROGRAM = "iTerm.app";

        const result = detectTerminalApp();
        expect(result).toBe("iterm2");

    });

    it("should detect iTerm2 from TERM_PROGRAM='ITERM.APP' (case insensitive)", () => {
        process.env.TERM_PROGRAM = "ITERM.APP";

        const result = detectTerminalApp();
        expect(result).toBe("iterm2");
    });

    it("should detect Hyper from TERM_PROGRAM='Hyper'", () => {
        process.env.TERM_PROGRAM = "Hyper";

        const result = detectTerminalApp();
        expect(result).toBe("hyper");
    });

    it("should detect Hyper from TERM_PROGRAM='HYPER' (case insensitive)", () => {
        process.env.TERM_PROGRAM = "HYPER";

        const result = detectTerminalApp();
        expect(result).toBe("hyper");
    });

    it("should detect Warp from TERM_PROGRAM='WarpTerminal'", () => {
        process.env.TERM_PROGRAM = "WarpTerminal";

        const result = detectTerminalApp();
        expect(result).toBe("warp");
    });

    it("should detect Warp from TERM_PROGRAM='WARPTERMINAL' (case insensitive)", () => {
        process.env.TERM_PROGRAM = "WARPTERMINAL";

        const result = detectTerminalApp();
        expect(result).toBe("warp");
    });

    // ========== HAPPY PATH TESTS - TERM Detection ==========

    it("should detect Kitty from TERM='xterm-kitty'", () => {
        process.env.TERM = "xterm-kitty";

        const result = detectTerminalApp();
        expect(result).toBe("kitty");

    });

    it("should detect Kitty from TERM='KITTY' (case insensitive)", () => {
        process.env.TERM = "KITTY";

        const result = detectTerminalApp();
        expect(result).toBe("kitty");
    });

    it("should detect Alacritty from TERM='alacritty'", () => {
        process.env.TERM = "alacritty";

        const result = detectTerminalApp();
        expect(result).toBe("alacritty");

    });

    it("should detect Alacritty from TERM='ALACRITTY' (case insensitive)", () => {
        process.env.TERM = "ALACRITTY";

        const result = detectTerminalApp();
        expect(result).toBe("alacritty");
    });

    it("should detect iTerm2 from TERM='iterm2'", () => {
        process.env.TERM = "iterm2";

        const result = detectTerminalApp();
        expect(result).toBe("iterm2");

    });

    it("should detect iTerm2 from TERM='ITERM2' (case insensitive)", () => {
        process.env.TERM = "ITERM2";

        const result = detectTerminalApp();
        expect(result).toBe("iterm2");
    });

    // ========== HAPPY PATH TESTS - Environment Variable Detection ==========

    it("should detect WezTerm from WEZTERM_PANE environment variable", () => {
        process.env.TERM = "xterm-256color";
        process.env.WEZTERM_PANE = "1";

        const result = detectTerminalApp();
        expect(result).toBe("wezterm");

    });

    it("should detect WezTerm from WEZTERM_CONFIG_DIR environment variable", () => {
        process.env.TERM = "xterm-256color";
        process.env.WEZTERM_CONFIG_DIR = "/home/user/.config/wezterm";

        const result = detectTerminalApp();
        expect(result).toBe("wezterm");
    });

    it("should detect iTerm2 from ITERM_SESSION_ID environment variable", () => {
        process.env.TERM = "xterm-256color";
        process.env.ITERM_SESSION_ID = "w0t0p0:12345";

        const result = detectTerminalApp();
        expect(result).toBe("iterm2");

    });

    it("should detect iTerm2 from ITERM_PROFILE environment variable", () => {
        process.env.TERM = "xterm-256color";
        process.env.ITERM_PROFILE = "Default";

        const result = detectTerminalApp();
        expect(result).toBe("iterm2");
    });

    it("should detect Alacritty from ALACRITTY_SOCKET environment variable", () => {
        process.env.TERM = "xterm-256color";
        process.env.ALACRITTY_SOCKET = "/tmp/alacritty.sock";

        const result = detectTerminalApp();
        expect(result).toBe("alacritty");

    });

    it("should detect Alacritty from ALACRITTY_WINDOW_ID environment variable", () => {
        process.env.TERM = "xterm-256color";
        process.env.ALACRITTY_WINDOW_ID = "12345";

        const result = detectTerminalApp();
        expect(result).toBe("alacritty");
    });

    it("should detect Kitty from KITTY_WINDOW_ID environment variable", () => {
        process.env.TERM = "xterm-256color";
        process.env.KITTY_WINDOW_ID = "1";

        const result = detectTerminalApp();
        expect(result).toBe("kitty");

    });

    it("should detect Kitty from KITTY_PID environment variable", () => {
        process.env.TERM = "xterm-256color";
        process.env.KITTY_PID = "12345";

        const result = detectTerminalApp();
        expect(result).toBe("kitty");
    });

    it("should detect Konsole from KONSOLE_VERSION environment variable", () => {
        process.env.TERM = "xterm-256color";
        process.env.KONSOLE_VERSION = "21.12.0";

        const result = detectTerminalApp();
        expect(result).toBe("konsole");

    });

    it("should detect Konsole from KONSOLE_DBUS_WINDOW environment variable", () => {
        process.env.TERM = "xterm-256color";
        process.env.KONSOLE_DBUS_WINDOW = "/Windows/1";

        const result = detectTerminalApp();
        expect(result).toBe("konsole");
    });

    it("should detect Ghostty from GHOSTTY_RESOURCES_DIR environment variable", () => {
        process.env.TERM = "xterm-256color";
        process.env.GHOSTTY_RESOURCES_DIR = "/usr/share/ghostty";

        const result = detectTerminalApp();
        expect(result).toBe("ghostty");

    });

    it("should detect Ghostty from GHOSTTY_BIN_DIR environment variable", () => {
        process.env.TERM = "xterm-256color";
        process.env.GHOSTTY_BIN_DIR = "/usr/local/bin";

        const result = detectTerminalApp();
        expect(result).toBe("ghostty");
    });

    // ========== PRIORITY TESTS ==========

    it("should prioritize TERM_PROGRAM over TERM when both are set", () => {
        process.env.TERM_PROGRAM = "wezterm";
        process.env.TERM = "xterm-kitty";

        const result = detectTerminalApp();
        expect(result).toBe("wezterm");
    });

    it("should prioritize TERM over environment variables", () => {
        process.env.TERM = "alacritty";
        process.env.KITTY_WINDOW_ID = "1";

        const result = detectTerminalApp();
        expect(result).toBe("alacritty");
    });

    it("should prioritize WezTerm env vars over iTerm2 env vars when both are set", () => {
        process.env.TERM = "xterm-256color";
        process.env.WEZTERM_PANE = "1";
        process.env.ITERM_SESSION_ID = "w0t0p0:12345";

        const result = detectTerminalApp();
        expect(result).toBe("wezterm");
    });

    it("should prioritize iTerm2 env vars over Alacritty env vars when both are set", () => {
        process.env.TERM = "xterm-256color";
        process.env.ITERM_SESSION_ID = "w0t0p0:12345";
        process.env.ALACRITTY_SOCKET = "/tmp/alacritty.sock";

        const result = detectTerminalApp();
        expect(result).toBe("iterm2");
    });

    it("should prioritize Alacritty env vars over Kitty env vars when both are set", () => {
        process.env.TERM = "xterm-256color";
        process.env.ALACRITTY_SOCKET = "/tmp/alacritty.sock";
        process.env.KITTY_WINDOW_ID = "1";

        const result = detectTerminalApp();
        expect(result).toBe("alacritty");
    });

    it("should prioritize Kitty env vars over Konsole env vars when both are set", () => {
        process.env.TERM = "xterm-256color";
        process.env.KITTY_WINDOW_ID = "1";
        process.env.KONSOLE_VERSION = "21.12.0";

        const result = detectTerminalApp();
        expect(result).toBe("kitty");
    });

    it("should prioritize Ghostty env vars last among specific terminal env vars", () => {
        process.env.TERM = "xterm-256color";
        process.env.KONSOLE_VERSION = "21.12.0";
        process.env.GHOSTTY_RESOURCES_DIR = "/usr/share/ghostty";

        const result = detectTerminalApp();
        expect(result).toBe("konsole");
    });

    // ========== EDGE CASES ==========

    it("should return 'other' when no terminal can be detected", () => {
        const result = detectTerminalApp();
        expect(result).toBe("other");

    });

    it("should return 'other' for unrecognized TERM_PROGRAM", () => {
        process.env.TERM_PROGRAM = "unknown-terminal";

        const result = detectTerminalApp();
        expect(result).toBe("other");
    });

    it("should return 'other' for unrecognized TERM", () => {
        process.env.TERM = "xterm-256color";

        const result = detectTerminalApp();
        expect(result).toBe("other");
    });

    it("should handle empty TERM_PROGRAM value", () => {
        process.env.TERM_PROGRAM = "";
        process.env.TERM = "xterm-kitty";

        const result = detectTerminalApp();
        expect(result).toBe("kitty");
    });

    it("should handle empty TERM value", () => {
        process.env.TERM = "";
        process.env.KITTY_WINDOW_ID = "1";

        const result = detectTerminalApp();
        expect(result).toBe("kitty");
    });

    it("should handle TERM with partial matches", () => {
        // "kitty" should be found within "xterm-kitty-256color"
        process.env.TERM = "xterm-kitty-256color";
        const result1 = detectTerminalApp();
        expect(result1).toBe("kitty");

        // "alacritty" should be found within "alacritty-direct"
        process.env.TERM = "alacritty-direct";
        const result2 = detectTerminalApp();
        expect(result2).toBe("alacritty");
    });

    it("should handle environment variables with empty string values", () => {
        process.env.TERM = "xterm-256color";
        process.env.KITTY_WINDOW_ID = "";

        // Empty string should still be considered as "present" by isString
        const result = detectTerminalApp();
        expect(result).toBe("kitty");
    });

    it("should handle multiple environment variables for the same terminal", () => {
        process.env.TERM = "xterm-256color";
        process.env.WEZTERM_PANE = "1";
        process.env.WEZTERM_CONFIG_DIR = "/home/user/.config/wezterm";
        process.env.WEZTERM_EXECUTABLE = "/usr/bin/wezterm";

        const result = detectTerminalApp();
        expect(result).toBe("wezterm");
    });

    // ========== ERROR CONDITIONS ==========

    it("should not throw when all environment variables are undefined", () => {
        expect(() => detectTerminalApp()).not.toThrow();
        expect(detectTerminalApp()).toBe("other");
    });

    it("should not throw when TERM contains invalid/malformed values", () => {
        process.env.TERM = "!!!invalid!!!";
        expect(() => detectTerminalApp()).not.toThrow();
        expect(detectTerminalApp()).toBe("other");

        process.env.TERM = "123";
        expect(() => detectTerminalApp()).not.toThrow();
        expect(detectTerminalApp()).toBe("other");
    });

    it("should not throw when TERM_PROGRAM contains special characters", () => {
        process.env.TERM_PROGRAM = "terminal@#$%";

        expect(() => detectTerminalApp()).not.toThrow();
        expect(detectTerminalApp()).toBe("other");
    });

    // ========== TYPE TESTS ==========

    it("type tests", () => {
        const result = detectTerminalApp();

        // Runtime check that result is one of the TerminalApp values
        expect([
            "ghostty",
            "wezterm",
            "iterm2",
            "kitty",
            "alacritty",
            "hyper",
            "warp",
            "apple-terminal",
            "konsole",
            "other"
        ]).toContain(result);


    });
});
