import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { detectColorDepth } from "~/utils/detectColorDepth";
import { discoverOs } from "~/utils/os";
import type { ColorDepth } from "~/types";

/**
 * Phase 3: Platform-Specific Enhancements Tests
 *
 * These tests verify that detectColorDepth() correctly identifies terminal
 * emulators and applies platform-specific detection logic.
 */
describe("detectColorDepth() - Platform-Specific Enhancements", () => {
    let originalEnv: NodeJS.ProcessEnv;

    beforeEach(() => {
        // Save original environment
        originalEnv = { ...process.env };
    });

    afterEach(() => {
        // Restore original environment
        process.env = originalEnv;
    });

    // ========== HAPPY PATH TESTS ==========

    it("should detect iTerm2 24-bit support on macOS", async () => {
        // iTerm2 sets TERM_PROGRAM='iTerm.app' and typically COLORTERM='truecolor'
        process.env.TERM_PROGRAM = "iTerm.app";
        process.env.COLORTERM = "truecolor";
        delete process.env.TERM;

        const result = await detectColorDepth();

        // Should detect truecolor from COLORTERM (env vars have priority)
        expect(result).toBe(16700000);
    });

    it("should detect Windows Terminal color support on Windows", async () => {
        // Windows Terminal sets WT_SESSION and COLORTERM='truecolor'
        process.env.WT_SESSION = "some-session-id";
        process.env.COLORTERM = "truecolor";
        delete process.env.TERM;

        const result = await detectColorDepth();

        // Should detect truecolor
        expect(result).toBe(16700000);
    });

    it("should detect GNOME Terminal capabilities on Linux", async () => {
        // GNOME Terminal and VTE-based terminals set VTE_VERSION
        process.env.VTE_VERSION = "6800";
        process.env.COLORTERM = "truecolor";
        delete process.env.TERM;

        const result = await detectColorDepth();

        // Should detect truecolor
        expect(result).toBe(16700000);
    });

    it("should detect Kitty terminal capabilities", async () => {
        // Kitty sets TERM='xterm-kitty' and COLORTERM='truecolor'
        process.env.TERM = "xterm-kitty";
        process.env.COLORTERM = "truecolor";

        const result = await detectColorDepth();

        // Should detect truecolor from COLORTERM
        expect(result).toBe(16700000);

        type cases = [
            Expect<typeof result extends ColorDepth ? true : false>,
        ];
        type Expect<T extends true> = T;
    });

    it("should detect Alacritty terminal capabilities", async () => {
        // Alacritty sets TERM='alacritty' and COLORTERM='truecolor'
        process.env.TERM = "alacritty";
        process.env.COLORTERM = "truecolor";

        const result = await detectColorDepth();

        // Should detect truecolor from COLORTERM
        expect(result).toBe(16700000);

        type cases = [
            Expect<typeof result extends ColorDepth ? true : false>,
        ];
        type Expect<T extends true> = T;
    });

    it("should detect WezTerm capabilities", async () => {
        // WezTerm sets TERM_PROGRAM='WezTerm' and COLORTERM='truecolor'
        process.env.TERM_PROGRAM = "WezTerm";
        process.env.COLORTERM = "truecolor";
        delete process.env.TERM;

        const result = await detectColorDepth();

        // Should detect truecolor from COLORTERM
        expect(result).toBe(16700000);

        type cases = [
            Expect<typeof result extends ColorDepth ? true : false>,
        ];
        type Expect<T extends true> = T;
    });

    // ========== EDGE CASES ==========

    it("should handle unknown terminal emulators gracefully (use defaults)", async () => {
        // Unknown terminal emulator with no hints
        process.env.TERM_PROGRAM = "UnknownTerminal";
        delete process.env.COLORTERM;
        delete process.env.TERM;

        const result = await detectColorDepth();

        // Should fall back to default (256)
        expect(result).toBe(256);
    });

    it("should correctly identify terminal emulator via TERM_PROGRAM env var", async () => {
        // Test various TERM_PROGRAM values
        const terminalTests = [
            { program: "iTerm.app", expected: 16700000, colorterm: "truecolor" },
            { program: "Apple_Terminal", expected: 256, colorterm: undefined },
            { program: "WezTerm", expected: 16700000, colorterm: "truecolor" },
        ];

        for (const test of terminalTests) {
            process.env.TERM_PROGRAM = test.program;
            if (test.colorterm) {
                process.env.COLORTERM = test.colorterm;
            } else {
                delete process.env.COLORTERM;
            }
            delete process.env.TERM;

            const result = await detectColorDepth();
            expect(result).toBe(test.expected);
        }
    });

    it("should detect color support in CI/CD environments", async () => {
        // CI environments often set CI=true and may have limited color support
        process.env.CI = "true";
        process.env.GITHUB_ACTIONS = "true";
        delete process.env.COLORTERM;
        delete process.env.TERM;

        const result = await detectColorDepth();

        // Should return a valid color depth (CI usually supports at least 256)
        expect([8, 16, 256, 16700000]).toContain(result);
    });

    it("should handle headless/non-interactive environments", async () => {
        // Headless environment with no TTY indicators
        delete process.env.COLORTERM;
        delete process.env.TERM;
        delete process.env.TERM_PROGRAM;

        const result = await detectColorDepth();

        // Should fall back to default (256)
        expect(result).toBe(256);
    });

    it("should handle TERMINAL_EMULATOR env var as alternative identifier", async () => {
        // Some terminals use TERMINAL_EMULATOR instead of TERM_PROGRAM
        process.env.TERMINAL_EMULATOR = "Konsole";
        process.env.COLORTERM = "truecolor";
        delete process.env.TERM_PROGRAM;
        delete process.env.TERM;

        const result = await detectColorDepth();

        // Should detect truecolor from COLORTERM
        expect(result).toBe(16700000);

        type cases = [
            Expect<typeof result extends ColorDepth ? true : false>,
        ];
        type Expect<T extends true> = T;
    });

    // ========== ERROR CONDITIONS ==========

    it("should not throw when platform detection fails", async () => {
        // Simulate platform detection failure by providing contradictory info
        process.env.TERM_PROGRAM = null as any;
        delete process.env.COLORTERM;
        delete process.env.TERM;

        // Should not throw
        await expect(detectColorDepth()).resolves.toBeDefined();

        const result = await detectColorDepth();
        expect([8, 16, 256, 16700000]).toContain(result);
    });

    it("should fall back to previous detection methods when platform-specific detection is unavailable", async () => {
        // No platform-specific env vars, but TERM is set
        delete process.env.TERM_PROGRAM;
        delete process.env.TERMINAL_EMULATOR;
        delete process.env.VTE_VERSION;
        delete process.env.WT_SESSION;
        delete process.env.COLORTERM;
        process.env.TERM = "xterm-256color";

        const result = await detectColorDepth();

        // Should fall back to TERM parsing
        expect(result).toBe(256);
    });

});
