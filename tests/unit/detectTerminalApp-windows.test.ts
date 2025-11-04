import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { detectTerminalApp } from "~/utils/detectTerminalApp";
import type { Expect, AssertExtends } from "inferred-types/types";
import type { TerminalApp } from "~/types";

describe("detectTerminalApp() - Windows Terminal Detection", () => {
    let originalEnv: NodeJS.ProcessEnv;

    beforeEach(() => {
        // Save original environment
        originalEnv = { ...process.env };

        // Clear all terminal-related environment variables
        delete process.env.TERM_PROGRAM;
        delete process.env.TERM;
        // Clear macOS/Linux terminal env vars
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
    });

    afterEach(() => {
        // Restore original environment
        process.env = originalEnv;
    });

    // ========== HAPPY PATH TESTS ==========

    it("should detect Windows Terminal from WT_SESSION environment variable", () => {
        process.env.TERM = "xterm-256color";
        process.env.WT_SESSION = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";

        const result = detectTerminalApp();
        expect(result).toBe("windows-terminal");
    });

    it("should detect Windows Terminal from WT_PROFILE_ID environment variable", () => {
        process.env.TERM = "xterm-256color";
        process.env.WT_PROFILE_ID = "{12345678-1234-1234-1234-123456789012}";

        const result = detectTerminalApp();
        expect(result).toBe("windows-terminal");
    });

    it("should detect PowerShell from PSModulePath environment variable", () => {
        process.env.TERM = "xterm-256color";
        process.env.PSModulePath = "C:\\Program Files\\PowerShell\\Modules";

        const result = detectTerminalApp();
        expect(result).toBe("powershell");
    });

    it("should detect PowerShell from POWERSHELL_DISTRIBUTION_CHANNEL environment variable", () => {
        process.env.TERM = "xterm-256color";
        process.env.POWERSHELL_DISTRIBUTION_CHANNEL = "MSI:Windows 10 Pro";

        const result = detectTerminalApp();
        expect(result).toBe("powershell");
    });

    it("should detect cmd.exe from PROMPT and COMSPEC combination", () => {
        process.env.PROMPT = "$P$G";
        process.env.COMSPEC = "C:\\Windows\\system32\\cmd.exe";

        const result = detectTerminalApp();
        expect(result).toBe("cmd");
    });

    it("should detect ConEmu from ConEmuDir environment variable", () => {
        process.env.TERM = "xterm-256color";
        process.env.ConEmuDir = "C:\\Program Files\\ConEmu";

        const result = detectTerminalApp();
        expect(result).toBe("conemu");
    });

    it("should detect ConEmu from CMDER_ROOT environment variable", () => {
        process.env.TERM = "xterm-256color";
        process.env.CMDER_ROOT = "C:\\Program Files\\cmder";

        const result = detectTerminalApp();
        expect(result).toBe("conemu");
    });

    it("should detect mintty from TERM containing 'mintty'", () => {
        process.env.TERM = "xterm-mintty";

        const result = detectTerminalApp();
        expect(result).toBe("mintty");
    });

    it("should detect mintty from MSYSTEM environment variable (MSYS2)", () => {
        process.env.TERM = "xterm-256color";
        process.env.MSYSTEM = "MINGW64";

        const result = detectTerminalApp();
        expect(result).toBe("mintty");
    });

    // ========== EDGE CASES ==========

    it("should return 'other' when on Windows but no specific terminal detected", () => {
        // Simulate Windows environment but no recognizable terminal
        process.env.TERM = "xterm-256color";

        const result = detectTerminalApp();
        expect(result).toBe("other");
    });

    it("should handle case insensitivity for Windows environment variables", () => {
        // Windows env vars are typically case-insensitive, but let's test various cases
        process.env.TERM = "XTERM-MINTTY";

        const result = detectTerminalApp();
        expect(result).toBe("mintty");
    });

    it("should handle empty string values for Windows env vars", () => {
        process.env.TERM = "xterm-256color";
        process.env.WT_SESSION = "";

        const result = detectTerminalApp();
        // Empty string is still considered present by isString
        expect(result).toBe("windows-terminal");
    });

    it("should prioritize Windows Terminal detection over other Windows terminals", () => {
        process.env.TERM = "xterm-256color";
        process.env.WT_SESSION = "session-123";
        process.env.PSModulePath = "C:\\Program Files\\PowerShell\\Modules";
        process.env.ConEmuDir = "C:\\Program Files\\ConEmu";

        const result = detectTerminalApp();
        // Windows Terminal should win
        expect(result).toBe("windows-terminal");
    });

    it("should handle multiple Windows terminal env vars being set simultaneously", () => {
        process.env.TERM = "xterm-256color";
        process.env.PSModulePath = "C:\\Program Files\\PowerShell\\Modules";
        process.env.ConEmuDir = "C:\\Program Files\\ConEmu";
        process.env.MSYSTEM = "MINGW64";

        const result = detectTerminalApp();
        // Should detect one of them based on priority
        expect(["powershell", "conemu", "mintty"]).toContain(result);
    });

    it("should prioritize TERM_PROGRAM over Windows-specific env vars", () => {
        process.env.TERM_PROGRAM = "wezterm";
        process.env.WT_SESSION = "session-123";

        const result = detectTerminalApp();
        // TERM_PROGRAM should take priority
        expect(result).toBe("wezterm");
    });

    it("should prioritize TERM over Windows-specific env vars when TERM matches known pattern", () => {
        process.env.TERM = "xterm-kitty";
        process.env.WT_SESSION = "session-123";

        const result = detectTerminalApp();
        // TERM should take priority
        expect(result).toBe("kitty");
    });

    it("should detect Windows terminal when TERM is generic", () => {
        process.env.TERM = "xterm-256color";
        process.env.WT_SESSION = "session-123";

        const result = detectTerminalApp();
        expect(result).toBe("windows-terminal");
    });

    it("should handle ConEmuBaseDir as alternative to ConEmuDir", () => {
        process.env.TERM = "xterm-256color";
        process.env.ConEmuBaseDir = "C:\\Program Files\\ConEmu\\ConEmu";

        const result = detectTerminalApp();
        expect(result).toBe("conemu");
    });

    it("should handle CHERE_INVOKING as mintty indicator", () => {
        process.env.TERM = "xterm-256color";
        process.env.CHERE_INVOKING = "1";

        const result = detectTerminalApp();
        expect(result).toBe("mintty");
    });

    it("should detect cmd.exe even without PROMPT when COMSPEC is set", () => {
        process.env.COMSPEC = "C:\\Windows\\system32\\cmd.exe";

        const result = detectTerminalApp();
        expect(result).toBe("cmd");
    });

    it("should handle both WT_SESSION and WT_PROFILE_ID being set", () => {
        process.env.WT_SESSION = "session-123";
        process.env.WT_PROFILE_ID = "{12345678-1234-1234-1234-123456789012}";

        const result = detectTerminalApp();
        expect(result).toBe("windows-terminal");
    });

    it("should handle both PSModulePath and POWERSHELL_DISTRIBUTION_CHANNEL being set", () => {
        process.env.PSModulePath = "C:\\Program Files\\PowerShell\\Modules";
        process.env.POWERSHELL_DISTRIBUTION_CHANNEL = "MSI:Windows 10 Pro";

        const result = detectTerminalApp();
        expect(result).toBe("powershell");
    });

    // ========== ERROR CONDITIONS ==========

    it("should not throw when all Windows env vars are undefined", () => {
        expect(() => detectTerminalApp()).not.toThrow();
        expect(detectTerminalApp()).toBe("other");
    });

    it("should not throw when Windows env vars contain invalid/malformed values", () => {
        process.env.WT_SESSION = "!!!invalid!!!";
        process.env.PSModulePath = "not-a-valid-path";
        process.env.COMSPEC = "";

        expect(() => detectTerminalApp()).not.toThrow();
    });

    // ========== TYPE TESTS ==========

    it("should return TerminalApp type", () => {
        // Test various Windows terminal detections return correct runtime values
        process.env.TERM = "xterm-256color";
        process.env.WT_SESSION = "session";
        const wtResult = detectTerminalApp();
        expect(wtResult).toBe("windows-terminal");

        // Clear and test PowerShell
        delete process.env.WT_SESSION;
        process.env.PSModulePath = "path";
        const psResult = detectTerminalApp();
        expect(psResult).toBe("powershell");

        // Clear and test cmd
        delete process.env.PSModulePath;
        delete process.env.TERM;
        process.env.COMSPEC = "cmd.exe";
        const cmdResult = detectTerminalApp();
        expect(cmdResult).toBe("cmd");

        // Type test: Return type is TerminalApp
        type cases = [
            Expect<AssertExtends<ReturnType<typeof detectTerminalApp>, TerminalApp>>
        ];
    });
});
