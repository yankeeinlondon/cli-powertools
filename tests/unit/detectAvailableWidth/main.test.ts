import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { detectAvailableWidth } from "~/utils/detectAvailableWidth";
import type { Expect } from "inferred-types/types";

describe("detectAvailableWidth()", () => {
    let originalEnv: NodeJS.ProcessEnv;
    let originalStdout: typeof process.stdout;
    let originalStdinIsTTY: boolean | undefined;
    let originalStdoutIsTTY: boolean | undefined;

    beforeEach(() => {
        // Save original environment and TTY state
        originalEnv = { ...process.env };
        originalStdout = process.stdout;
        originalStdinIsTTY = process.stdin.isTTY;
        originalStdoutIsTTY = process.stdout.isTTY;

        // Mock non-TTY by default to prevent OSC queries in Phase 1 tests
        Object.defineProperty(process.stdin, 'isTTY', {
            value: false,
            writable: true,
            configurable: true
        });
        Object.defineProperty(process.stdout, 'isTTY', {
            value: false,
            writable: true,
            configurable: true
        });
    });

    afterEach(() => {
        // Restore original environment and TTY state
        process.env = originalEnv;
        Object.defineProperty(process, "stdout", {
            value: originalStdout,
            writable: true,
            configurable: true,
        });

        if (originalStdinIsTTY !== undefined) {
            Object.defineProperty(process.stdin, 'isTTY', {
                value: originalStdinIsTTY,
                writable: true,
                configurable: true
            });
        }

        if (originalStdoutIsTTY !== undefined) {
            Object.defineProperty(process.stdout, 'isTTY', {
                value: originalStdoutIsTTY,
                writable: true,
                configurable: true
            });
        }
    });

    // ========== HAPPY PATH TESTS ==========

    it("should return value from COLUMNS env var when set to valid number", async () => {
        process.env.COLUMNS = "120";
        delete (process.stdout as any).columns;

        const result = await detectAvailableWidth();
        expect(result).toBe(120);
    });

    it("should return value from process.stdout.columns when set and COLUMNS not present", async () => {
        delete process.env.COLUMNS;
        Object.defineProperty(process.stdout, "columns", {
            value: 100,
            writable: true,
            configurable: true,
        });

        const result = await detectAvailableWidth();
        expect(result).toBe(100);
    });

    it("should return fallback (80) when neither COLUMNS nor stdout.columns available", async () => {
        delete process.env.COLUMNS;
        delete (process.stdout as any).columns;

        const result = await detectAvailableWidth();
        expect(result).toBe(80);
    });

    it("should return custom fallback when provided and detection fails", async () => {
        delete process.env.COLUMNS;
        delete (process.stdout as any).columns;

        const result = await detectAvailableWidth(100);
        expect(result).toBe(100);

        const result2 = await detectAvailableWidth(120);
        expect(result2).toBe(120);
    });

    it("should prioritize COLUMNS over process.stdout.columns when both exist", async () => {
        process.env.COLUMNS = "150";
        Object.defineProperty(process.stdout, "columns", {
            value: 100,
            writable: true,
            configurable: true,
        });

        const result = await detectAvailableWidth();
        expect(result).toBe(150); // From COLUMNS, not stdout.columns
    });

    // ========== EDGE CASES ==========

    it("should handle COLUMNS with leading/trailing whitespace", async () => {
        delete (process.stdout as any).columns;

        process.env.COLUMNS = "  120  ";
        const result1 = await detectAvailableWidth();
        expect(result1).toBe(120);

        process.env.COLUMNS = "\t100\n";
        const result2 = await detectAvailableWidth();
        expect(result2).toBe(100);
    });

    it("should handle COLUMNS set to '0' (treat as invalid, use fallback)", async () => {
        process.env.COLUMNS = "0";
        delete (process.stdout as any).columns;

        const result = await detectAvailableWidth();
        expect(result).toBe(80); // Should use fallback
    });

    it("should handle COLUMNS set to negative number (treat as invalid, use fallback)", async () => {
        delete (process.stdout as any).columns;

        process.env.COLUMNS = "-50";
        const result = await detectAvailableWidth();
        expect(result).toBe(80);

        process.env.COLUMNS = "-1";
        const result2 = await detectAvailableWidth(100);
        expect(result2).toBe(100);
    });

    it("should handle COLUMNS set to very large number", async () => {
        process.env.COLUMNS = "999999";
        delete (process.stdout as any).columns;

        const result = await detectAvailableWidth();
        expect(result).toBe(999999);
    });

    it("should handle COLUMNS set to floating point number (truncate to integer)", async () => {
        delete (process.stdout as any).columns;

        process.env.COLUMNS = "80.5";
        const result = await detectAvailableWidth();
        expect(result).toBe(80);

        process.env.COLUMNS = "120.9";
        const result2 = await detectAvailableWidth();
        expect(result2).toBe(120);
    });

    it("should handle empty string COLUMNS (treat as invalid)", async () => {
        process.env.COLUMNS = "";
        delete (process.stdout as any).columns;

        const result = await detectAvailableWidth();
        expect(result).toBe(80);
    });

    it("should handle process.stdout.columns being undefined", async () => {
        delete process.env.COLUMNS;
        delete (process.stdout as any).columns;

        const result = await detectAvailableWidth();
        expect(result).toBe(80);
    });

    it("should handle when stdout is not a TTY", async () => {
        delete process.env.COLUMNS;
        Object.defineProperty(process.stdout, "isTTY", {
            value: false,
            writable: true,
            configurable: true,
        });
        delete (process.stdout as any).columns;

        const result = await detectAvailableWidth();
        expect(result).toBe(80);
    });

    it("should handle COLUMNS with mixed case (env vars are case-sensitive)", async () => {
        delete (process.stdout as any).columns;

        // COLUMNS is case-sensitive - only uppercase should work
        process.env.CoLuMnS = "100";
        const result1 = await detectAvailableWidth();
        expect(result1).toBe(80); // Should use fallback, not 100

        process.env.COLUMNS = "120";
        const result2 = await detectAvailableWidth();
        expect(result2).toBe(120); // Now it should work
    });

    it("should handle COLUMNS with units like '80px' (treat as invalid)", async () => {
        delete (process.stdout as any).columns;

        process.env.COLUMNS = "80px";
        const result = await detectAvailableWidth();
        expect(result).toBe(80); // Should use fallback
    });

    // ========== ERROR CONDITIONS ==========

    it("should not throw when COLUMNS contains invalid non-numeric values", async () => {
        delete (process.stdout as any).columns;

        process.env.COLUMNS = "abc";
        await expect(detectAvailableWidth()).resolves.toBeDefined();
        expect(await detectAvailableWidth()).toBe(80);

        process.env.COLUMNS = "foo bar";
        await expect(detectAvailableWidth()).resolves.toBeDefined();
        expect(await detectAvailableWidth()).toBe(80);
    });

    it("should not throw when process.stdout.columns is accessed in non-TTY environment", async () => {
        delete process.env.COLUMNS;
        Object.defineProperty(process.stdout, "isTTY", {
            value: false,
            writable: true,
            configurable: true,
        });
        delete (process.stdout as any).columns;

        await expect(detectAvailableWidth()).resolves.toBeDefined();
        expect(await detectAvailableWidth()).toBe(80);
    });

    it("should not throw when both environment and stdout detection fail", async () => {
        delete process.env.COLUMNS;
        delete (process.stdout as any).columns;

        await expect(detectAvailableWidth()).resolves.toBeDefined();
        expect(await detectAvailableWidth()).toBe(80);
    });

    it("should not throw when COLUMNS contains special characters or malformed input", async () => {
        delete (process.stdout as any).columns;

        const invalidValues = ["!!!", "###", "$$$", "a".repeat(1000), "😀", "\0\0\0"];
        for (const val of invalidValues) {
            process.env.COLUMNS = val;
            await expect(detectAvailableWidth()).resolves.toBeDefined();
        }
    });

});
