import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { detectColorDepth } from "~/utils/detectColorDepth";
import type { ColorDepth } from "~/types";


describe("detectColorDepth()", () => {
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

    it("should return 16700000 when COLORTERM='truecolor'", async () => {
        process.env.COLORTERM = "truecolor";
        delete process.env.TERM;

        const result = await detectColorDepth();
        expect(result).toBe(16700000);
    });

    it("should return 16700000 when COLORTERM='24bit'", async () => {
        process.env.COLORTERM = "24bit";
        delete process.env.TERM;

        const result = await detectColorDepth();
        expect(result).toBe(16700000);
    });

    it("should return 256 when TERM='xterm-256color'", async () => {
        delete process.env.COLORTERM;
        process.env.TERM = "xterm-256color";

        const result = await detectColorDepth();
        expect(result).toBe(256);
    });

    it("should return 256 when TERM='screen-256color'", async () => {
        delete process.env.COLORTERM;
        process.env.TERM = "screen-256color";

        const result = await detectColorDepth();
        expect(result).toBe(256);
    });

    it("should return 256 when TERM='tmux-256color'", async () => {
        delete process.env.COLORTERM;
        process.env.TERM = "tmux-256color";

        const result = await detectColorDepth();
        expect(result).toBe(256);
    });

    it("should return 16 when TERM='xterm-16color'", async () => {
        delete process.env.COLORTERM;
        process.env.TERM = "xterm-16color";

        const result = await detectColorDepth();
        expect(result).toBe(16);
    });

    it("should return 16 when TERM='xterm'", async () => {
        delete process.env.COLORTERM;
        process.env.TERM = "xterm";

        const result = await detectColorDepth();
        expect(result).toBe(16);
    });

    it("should return 8 when TERM='xterm-color'", async () => {
        delete process.env.COLORTERM;
        process.env.TERM = "xterm-color";

        const result = await detectColorDepth();
        expect(result).toBe(8);
    });

    it("should return 8 when TERM='linux'", async () => {
        delete process.env.COLORTERM;
        process.env.TERM = "linux";

        const result = await detectColorDepth();
        expect(result).toBe(8);
    });

    it("should return default (256) when TERM is unset or unknown", async () => {
        delete process.env.COLORTERM;
        delete process.env.TERM;

        const result = await detectColorDepth();
        expect(result).toBe(256);

        // Test with unknown TERM value
        process.env.TERM = "unknown-terminal";
        const result2 = await detectColorDepth();
        expect(result2).toBe(256);
    });

    // ========== EDGE CASES ==========

    it("should handle TERM with extra suffixes", async () => {
        delete process.env.COLORTERM;

        // Should still recognize 256color despite suffix
        process.env.TERM = "xterm-256color-italic";
        const result1 = await detectColorDepth();
        expect(result1).toBe(256);

        // Should still recognize base xterm
        process.env.TERM = "xterm-italic";
        const result2 = await detectColorDepth();
        expect(result2).toBe(16);
    });

    it("should handle empty COLORTERM value", async () => {
        process.env.COLORTERM = "";
        process.env.TERM = "xterm-256color";

        // Empty COLORTERM should be ignored, fall back to TERM
        const result = await detectColorDepth();
        expect(result).toBe(256);
    });

    it("should handle TERM with mixed case", async () => {
        delete process.env.COLORTERM;

        // Case-insensitive matching
        process.env.TERM = "XTERM-256COLOR";
        const result1 = await detectColorDepth();
        expect(result1).toBe(256);

        process.env.TERM = "Xterm";
        const result2 = await detectColorDepth();
        expect(result2).toBe(16);
    });

    it("should prioritize COLORTERM over TERM when both are set", async () => {
        process.env.COLORTERM = "truecolor";
        process.env.TERM = "xterm-256color";

        // Should return 16700000 from COLORTERM, not 256 from TERM
        const result = await detectColorDepth();
        expect(result).toBe(16700000);
    });

    it("should handle COLORTERM with mixed case", async () => {
        delete process.env.TERM;

        process.env.COLORTERM = "TRUECOLOR";
        const result1 = await detectColorDepth();
        expect(result1).toBe(16700000);

        process.env.COLORTERM = "TrueColor";
        const result2 = await detectColorDepth();
        expect(result2).toBe(16700000);

        process.env.COLORTERM = "24BIT";
        const result3 = await detectColorDepth();
        expect(result3).toBe(16700000);
    });

    it("should handle whitespace in environment variables", async () => {
        delete process.env.TERM;

        // Leading/trailing whitespace should be trimmed
        process.env.COLORTERM = " truecolor ";
        const result1 = await detectColorDepth();
        expect(result1).toBe(16700000);

        delete process.env.COLORTERM;
        process.env.TERM = " xterm-256color ";
        const result2 = await detectColorDepth();
        expect(result2).toBe(256);
    });

    // ========== ERROR CONDITIONS ==========

    it("should not throw when all environment variables are undefined", async () => {
        delete process.env.COLORTERM;
        delete process.env.TERM;

        // Should not throw, should return default
        await expect(detectColorDepth()).resolves.toBe(256);
    });

    it("should not throw when TERM contains invalid/malformed values", async () => {
        delete process.env.COLORTERM;

        process.env.TERM = "!!!invalid!!!";
        await expect(detectColorDepth()).resolves.toBe(256);

        process.env.TERM = "123";
        await expect(detectColorDepth()).resolves.toBe(256);

        process.env.TERM = "";
        await expect(detectColorDepth()).resolves.toBe(256);
    });

    it("should return default (256) when detection is impossible", async () => {
        delete process.env.COLORTERM;
        delete process.env.TERM;
        delete process.env.FORCE_COLOR;
        delete process.env.NO_COLOR;

        const result = await detectColorDepth();
        expect(result).toBe(256);
    });

    it("color depth constrained by ColorDepth union type", async () => {
        const result = await detectColorDepth();
        expect([8, 16, 256, 16700000]).toContain(result);
    });
});
