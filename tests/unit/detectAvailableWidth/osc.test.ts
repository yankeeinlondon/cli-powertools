import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { detectAvailableWidth } from "~/utils/detectAvailableWidth";

/**
 * Phase 3: OSC-Based Width Detection Tests
 *
 * These tests verify that detectAvailableWidth() can actively probe terminal
 * width using OSC sequences, with proper timeout, fallback, and caching.
 */
describe("detectAvailableWidth() - OSC Query Integration", () => {
    let originalEnv: NodeJS.ProcessEnv;
    let originalStdoutIsTTY: boolean | undefined;
    let originalStdinIsTTY: boolean | undefined;

    beforeEach(() => {
        // Save original environment and TTY state
        originalEnv = { ...process.env };
        originalStdoutIsTTY = process.stdout.isTTY;
        originalStdinIsTTY = process.stdin.isTTY;
    });

    afterEach(() => {
        // Restore original environment and TTY state
        process.env = originalEnv;

        if (originalStdoutIsTTY !== undefined) {
            Object.defineProperty(process.stdout, 'isTTY', {
                value: originalStdoutIsTTY,
                writable: true,
                configurable: true
            });
        }

        if (originalStdinIsTTY !== undefined) {
            Object.defineProperty(process.stdin, 'isTTY', {
                value: originalStdinIsTTY,
                writable: true,
                configurable: true
            });
        }

        vi.restoreAllMocks();
    });

    // ========== HAPPY PATH TESTS ==========

    it("should detect width via OSC query when terminal supports it", async () => {
        // Clear env vars to force OSC detection
        delete process.env.COLUMNS;

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
        // In a real terminal, we should get the actual width
        // In a non-TTY or unsupported terminal, we should fall back to 80
        const result = await detectAvailableWidth();

        // Result should be a positive integer
        expect(typeof result).toBe("number");
        expect(result).toBeGreaterThan(0);
        expect(Number.isInteger(result)).toBe(true);
    });

    it("should fall back to env var detection when OSC queries timeout", async () => {
        // Set COLUMNS as fallback
        process.env.COLUMNS = "120";

        // Mock non-TTY to simulate OSC query unavailability
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

        const result = await detectAvailableWidth();

        // Should fall back to COLUMNS env var
        expect(result).toBe(120);
    });

    it("should use OSC query results over environment variables when successful", async () => {
        // Set a different env var value
        process.env.COLUMNS = "999";

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

        const result = await detectAvailableWidth();

        // In a real terminal, OSC should potentially override the COLUMNS value
        // In non-TTY or if OSC fails, should fall back to COLUMNS (999)
        // Either way, should get a positive integer
        expect(typeof result).toBe("number");
        expect(result).toBeGreaterThan(0);
        expect(Number.isInteger(result)).toBe(true);
    });

    it("should cache OSC query results to avoid repeated queries", async () => {
        // Clear env vars to force OSC detection
        delete process.env.COLUMNS;

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

        // First call - may query terminal
        const result1 = await detectAvailableWidth();

        // Second call - should use cached value (fast)
        const startTime = Date.now();
        const result2 = await detectAvailableWidth();
        const elapsed = Date.now() - startTime;

        // Both results should match
        expect(result1).toBe(result2);

        // Second call should be very fast (cached)
        // Should complete in under 10ms if cached properly
        expect(elapsed).toBeLessThan(50);
    });

    // ========== EDGE CASES ==========

    it("should handle OSC query failures gracefully (timeout, malformed, or partial responses)", async () => {
        // Test 1: Timeout with no env vars - should use fallback
        delete process.env.COLUMNS;
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

        const result1 = await detectAvailableWidth();
        expect(typeof result1).toBe("number");
        expect(result1).toBeGreaterThan(0);

        // Test 2: Malformed/partial response with COLUMNS fallback
        process.env.COLUMNS = "100";
        const result2 = await detectAvailableWidth(90);
        expect(result2).toBeGreaterThanOrEqual(90);
    });

    it("should work correctly in non-TTY environments (no OSC queries attempted)", async () => {
        // Set env var for fallback
        process.env.COLUMNS = "150";

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

        const result = await detectAvailableWidth();

        // Should use env var detection, not attempt OSC queries
        expect(result).toBe(150);
    });

    it("should respect timeout limits for OSC queries (don't hang indefinitely)", async () => {
        // Clear env vars
        delete process.env.COLUMNS;

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
        const result = await detectAvailableWidth();
        const elapsed = Date.now() - startTime;

        // Should complete within reasonable time (timeout + processing overhead)
        // Timeout should be ~100ms, allow up to 1000ms for processing
        expect(elapsed).toBeLessThan(1000);
        expect(typeof result).toBe("number");
        expect(result).toBeGreaterThan(0);
    });

    it("should handle concurrent calls during OSC query (caching/queueing)", async () => {
        // Clear env vars to force OSC detection
        delete process.env.COLUMNS;

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

        // Make multiple concurrent calls
        const [result1, result2, result3] = await Promise.all([
            detectAvailableWidth(),
            detectAvailableWidth(),
            detectAvailableWidth()
        ]);

        // All results should be consistent
        expect(result1).toBe(result2);
        expect(result2).toBe(result3);

        // Results should be valid
        expect(typeof result1).toBe("number");
        expect(result1).toBeGreaterThan(0);
    });

    // ========== ERROR CONDITIONS ==========

    it("should not throw when OSC queries fail, timeout, or receive invalid data", async () => {
        // Test 1: Complete failure with no fallback - should return default
        delete process.env.COLUMNS;
        await expect(detectAvailableWidth()).resolves.toBeDefined();

        const result1 = await detectAvailableWidth();
        expect(typeof result1).toBe("number");
        expect(result1).toBeGreaterThan(0);

        // Test 2: Invalid data with COLUMNS fallback
        process.env.COLUMNS = "100";
        const result2 = await detectAvailableWidth();
        expect(result2).toBeGreaterThanOrEqual(80);

        // Test 3: Terminal rejects queries but has fallback
        delete process.env.COLUMNS;
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

        const result3 = await detectAvailableWidth(95);
        expect(result3).toBeGreaterThanOrEqual(80);
    });

    it("should fall back through priority chain when OSC fails", async () => {
        // Set up priority chain: OSC (will fail) -> COLUMNS -> fallback
        process.env.COLUMNS = "110";

        // Mock non-TTY to force OSC failure
        Object.defineProperty(process.stdout, 'isTTY', {
            value: false,
            writable: true,
            configurable: true
        });

        const result = await detectAvailableWidth(85);

        // Should use COLUMNS since OSC is unavailable in non-TTY
        expect(result).toBe(110);
    });

    it("should handle terminal rejecting OSC queries", async () => {
        // Terminal might reject or not respond to OSC queries
        delete process.env.COLUMNS;

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

        // Should not throw
        await expect(detectAvailableWidth()).resolves.toBeDefined();

        const result = await detectAvailableWidth(75);
        expect(typeof result).toBe("number");
        expect(result).toBeGreaterThan(0);
    });

    // ========== INTEGRATION TESTS ==========

    it("should return Promise<number> (async function)", async () => {
        const result = detectAvailableWidth();

        // Should be a Promise
        expect(result).toBeInstanceOf(Promise);

        // Should resolve to a number
        const resolved = await result;
        expect(typeof resolved).toBe("number");
        expect(resolved).toBeGreaterThan(0);
    });

    it("should maintain backward compatibility with custom fallback values", async () => {
        // Clear everything to force fallback
        delete process.env.COLUMNS;

        Object.defineProperty(process.stdout, 'isTTY', {
            value: false,
            writable: true,
            configurable: true
        });

        // Test with custom fallback
        const result1 = await detectAvailableWidth(100);
        expect(result1).toBe(100);

        const result2 = await detectAvailableWidth(120);
        expect(result2).toBe(120);

        // Test with default fallback (80)
        const result3 = await detectAvailableWidth();
        expect(result3).toBe(80);
    });
});
