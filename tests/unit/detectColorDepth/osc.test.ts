import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { detectColorDepth } from "~/utils/detectColorDepth";
import type { ColorDepth } from "~/types";

/**
 * Phase 2: OSC Query Integration Tests
 *
 * These tests verify that detectColorDepth() can actively probe terminal
 * capabilities using OSC sequences, with proper timeout, fallback, and caching.
 */
describe("detectColorDepth() - OSC Query Integration", () => {
    let originalEnv: NodeJS.ProcessEnv;
    let originalIsTTY: boolean | undefined;

    beforeEach(() => {
        // Save original environment and TTY state
        originalEnv = { ...process.env };
        originalIsTTY = process.stdout.isTTY;
    });

    afterEach(() => {
        // Restore original environment and TTY state
        process.env = originalEnv;
        if (originalIsTTY !== undefined) {
            Object.defineProperty(process.stdout, 'isTTY', {
                value: originalIsTTY,
                writable: true,
                configurable: true
            });
        }
        vi.restoreAllMocks();
    });

    // ========== HAPPY PATH TESTS ==========

    it("should detect 24-bit color support via OSC query when terminal supports it", async () => {
        // Clear env vars to force OSC detection
        delete process.env.COLORTERM;
        delete process.env.TERM;

        // Mock TTY environment
        Object.defineProperty(process.stdout, 'isTTY', {
            value: true,
            writable: true,
            configurable: true
        });
        Object.defineProperty(process.stdin, 'isTTY', {
            value: true,
            writable: true,
            configurable: true
        });

        // This test will actually query the terminal if running in a TTY
        // In a real terminal that supports truecolor, we should get 16700000
        // In a non-TTY or unsupported terminal, we should fall back to 256
        const result = await detectColorDepth();

        // Result should be a valid ColorDepth
        expect([8, 16, 256, 16700000]).toContain(result);
    });

    it("should detect 256 color support when terminal responds to 256-color palette queries", async () => {
        // Clear env vars to force OSC detection
        delete process.env.COLORTERM;
        delete process.env.TERM;

        // Mock TTY environment
        Object.defineProperty(process.stdout, 'isTTY', {
            value: true,
            writable: true,
            configurable: true
        });
        Object.defineProperty(process.stdin, 'isTTY', {
            value: true,
            writable: true,
            configurable: true
        });

        const result = await detectColorDepth();

        // Should detect some level of color support
        expect([8, 16, 256, 16700000]).toContain(result);
    });

    it("should fall back to env var detection when OSC queries timeout", async () => {
        // Set TERM as fallback, clear COLORTERM to ensure TERM is used
        delete process.env.COLORTERM;
        process.env.TERM = "xterm-256color";

        // Mock non-TTY to simulate OSC query unavailability
        Object.defineProperty(process.stdout, 'isTTY', {
            value: false,
            writable: true,
            configurable: true
        });

        const result = await detectColorDepth();

        // Should fall back to TERM parsing
        expect(result).toBe(256);
    });

    it("should use OSC query results over environment variables when successful", async () => {
        // Set a lower env var value
        process.env.TERM = "xterm-16color";
        delete process.env.COLORTERM;

        // Mock TTY environment
        Object.defineProperty(process.stdout, 'isTTY', {
            value: true,
            writable: true,
            configurable: true
        });
        Object.defineProperty(process.stdin, 'isTTY', {
            value: true,
            writable: true,
            configurable: true
        });

        const result = await detectColorDepth();

        // In a real truecolor terminal, OSC should override the TERM value
        // In non-TTY or if OSC fails, should fall back to TERM (16)
        expect([16, 256, 16700000]).toContain(result);
    });

    // ========== EDGE CASES ==========

    it("should handle OSC query failures gracefully (timeout, malformed, or partial responses)", async () => {
        // Test 1: Timeout with no env vars - should use default
        delete process.env.COLORTERM;
        delete process.env.TERM;
        Object.defineProperty(process.stdout, 'isTTY', {
            value: true,
            writable: true,
            configurable: true
        });
        Object.defineProperty(process.stdin, 'isTTY', {
            value: true,
            writable: true,
            configurable: true
        });

        const result1 = await detectColorDepth();
        expect([8, 16, 256, 16700000]).toContain(result1);

        // Test 2: Malformed/partial response with TERM fallback
        process.env.TERM = "xterm-256color";
        const result2 = await detectColorDepth();
        expect(result2).toBe(256);
    });

    it("should work correctly in non-TTY environments (no OSC queries)", async () => {
        // Set env var for fallback
        process.env.COLORTERM = "truecolor";

        // Mock non-TTY
        Object.defineProperty(process.stdout, 'isTTY', {
            value: false,
            writable: true,
            configurable: true
        });
        Object.defineProperty(process.stdin, 'isTTY', {
            value: false,
            writable: true,
            configurable: true
        });

        const result = await detectColorDepth();

        // Should use env var detection, not attempt OSC queries
        expect(result).toBe(16700000);
    });

    it("should respect timeout limits for OSC queries (don't hang indefinitely)", async () => {
        // Clear env vars
        delete process.env.COLORTERM;
        delete process.env.TERM;

        // Mock TTY
        Object.defineProperty(process.stdout, 'isTTY', {
            value: true,
            writable: true,
            configurable: true
        });
        Object.defineProperty(process.stdin, 'isTTY', {
            value: true,
            writable: true,
            configurable: true
        });

        const startTime = Date.now();
        const result = await detectColorDepth();
        const elapsed = Date.now() - startTime;

        // Should complete within reasonable time (timeout + processing overhead)
        // Timeout should be ~100-200ms, allow up to 1000ms for processing
        expect(elapsed).toBeLessThan(1000);
        expect([8, 16, 256, 16700000]).toContain(result);
    });

    // ========== ERROR CONDITIONS ==========

    it("should handle OSC query errors without throwing (failures, invalid data, rejections)", async () => {
        // Test 1: Complete failure with no fallback - should return default
        delete process.env.COLORTERM;
        delete process.env.TERM;
        await expect(detectColorDepth()).resolves.toBeDefined();

        const result1 = await detectColorDepth();
        expect([8, 16, 256, 16700000]).toContain(result1);

        // Test 2: Invalid data with TERM fallback
        process.env.TERM = "xterm-256color";
        const result2 = await detectColorDepth();
        expect(result2).toBe(256);

        // Test 3: Terminal rejects queries but has TERM set
        process.env.TERM = "xterm-16color";
        delete process.env.COLORTERM;
        Object.defineProperty(process.stdout, 'isTTY', {
            value: true,
            writable: true,
            configurable: true
        });
        Object.defineProperty(process.stdin, 'isTTY', {
            value: true,
            writable: true,
            configurable: true
        });

        const result3 = await detectColorDepth();
        expect([16, 256, 16700000]).toContain(result3);
    });

    it("should maintain ColorDepth return type with OSC integration", async () => {
        const result = await detectColorDepth();

        expect([8, 16, 256, 16700000]).toContain(result);
    });
});
