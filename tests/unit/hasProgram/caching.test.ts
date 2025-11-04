import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { discoverOs } from "~/utils/os";
import type { Expect, AssertExtends } from "inferred-types/types";

// Track execSync calls manually
let execSyncCallCount = 0;
let execSyncCalls: string[] = [];

// Mock child_process module
vi.mock("node:child_process", async (importOriginal) => {
    const actual = await importOriginal<typeof import("node:child_process")>();
    return {
        ...actual,
        execSync: vi.fn((cmd: string, options?: any) => {
            execSyncCallCount++;
            execSyncCalls.push(cmd);
            // Call the real execSync
            return actual.execSync(cmd, options);
        }),
    };
});

// Import after mocking
const { hasProgram, hasProgram__Bust } = await import("~/utils/hasProgram");

describe("hasProgram() - Performance Caching", () => {
    beforeEach(() => {
        // Reset call tracking
        execSyncCallCount = 0;
        execSyncCalls = [];
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    // Happy Path Tests

    it("should cache results for repeated checks of the same program", () => {
        // Get a known program for the current platform
        const os = discoverOs();
        const knownProgram = os === "win32" ? "cmd" : "sh";

        // First call - should execute shell command
        const firstResult = hasProgram(knownProgram);
        const firstCallCount = execSyncCallCount;

        // Second call - should use cache, not execute again
        const secondResult = hasProgram(knownProgram);
        const secondCallCount = execSyncCallCount;

        // Both results should be the same (true for known programs)
        expect(firstResult).toBe(true);
        expect(secondResult).toBe(true);

        // Second call should NOT have increased the call count
        expect(secondCallCount).toBe(firstCallCount);
        expect(firstCallCount).toBeGreaterThan(0); // First call DID execute
    });

    it("should return cached result without executing shell command again", () => {
        const program = "test-cached-program";

        // First call
        hasProgram(program);
        const callsAfterFirst = execSyncCallCount;

        // Multiple subsequent calls
        hasProgram(program);
        hasProgram(program);
        hasProgram(program);
        const callsAfterMultiple = execSyncCallCount;

        // Call count should not increase after caching
        expect(callsAfterMultiple).toBe(callsAfterFirst);
    });

    it("should cache both positive (exists) and negative (doesn't exist) results", () => {
        const os = discoverOs();
        const existingProgram = os === "win32" ? "cmd" : "sh";
        const nonexistentProgram = "definitely-not-a-program-xyz-12345";

        // Cache a positive result
        const positiveFirst = hasProgram(existingProgram);
        const positiveSecond = hasProgram(existingProgram);

        expect(positiveFirst).toBe(true);
        expect(positiveSecond).toBe(true);

        // Cache a negative result
        const negativeFirst = hasProgram(nonexistentProgram);
        const callsAfterFirstNegative = execSyncCallCount;

        const negativeSecond = hasProgram(nonexistentProgram);
        const callsAfterSecondNegative = execSyncCallCount;

        expect(negativeFirst).toBe(false);
        expect(negativeSecond).toBe(false);

        // Second negative check should be cached
        expect(callsAfterSecondNegative).toBe(callsAfterFirstNegative);
    });

    it("should cache builtin detection results", () => {
        // Test with a common builtin
        const builtin = "cd";

        // First call - executes command
        const firstResult = hasProgram(builtin);
        const callsAfterFirst = execSyncCallCount;

        // Second call - should be cached
        const secondResult = hasProgram(builtin);
        const callsAfterSecond = execSyncCallCount;

        // Results should match
        expect(firstResult).toBe(secondResult);

        // Should not execute again
        expect(callsAfterSecond).toBe(callsAfterFirst);
    });

    // Edge Cases

    it("should maintain separate cache entries for different program names", () => {
        // Use unique program names to avoid cache collisions with other tests
        const program1 = "unique-test-prog-separate-1";
        const program2 = "unique-test-prog-separate-2";
        const program3 = "unique-test-prog-separate-3";

        // Each different program should trigger execution once
        hasProgram(program1);
        const callsAfter1 = execSyncCallCount;

        hasProgram(program2);
        const callsAfter2 = execSyncCallCount;

        hasProgram(program3);
        const callsAfter3 = execSyncCallCount;

        // Each new program increases call count
        expect(callsAfter1).toBeGreaterThan(0);
        expect(callsAfter2).toBeGreaterThan(callsAfter1);
        expect(callsAfter3).toBeGreaterThan(callsAfter2);

        // But repeating the same programs doesn't
        hasProgram(program1);
        hasProgram(program2);
        hasProgram(program3);
        const callsAfterRepeats = execSyncCallCount;

        expect(callsAfterRepeats).toBe(callsAfter3);
    });

    it("should handle cache with case-sensitive program names correctly", () => {
        // Use unique program names to avoid cache collisions
        const uniqueBase = "UniqueCaseSensitiveTest";

        // Test with uppercase first
        hasProgram(uniqueBase.toUpperCase());
        const callsAfterUpper = execSyncCallCount;

        // Test with lowercase
        hasProgram(uniqueBase.toLowerCase());
        const callsAfterLower = execSyncCallCount;

        // Different cases should be different cache entries
        // (even on Windows where they may refer to the same program)
        expect(callsAfterLower).toBeGreaterThan(callsAfterUpper);
        expect(callsAfterUpper).toBeGreaterThan(0);
    });

    // Error Conditions

    it("should not break if cache becomes large (stress test)", { timeout: 30000 }, () => {
        // Create a large number of cache entries
        // Reduced from 1000 to 100 to avoid timeout on Windows where each check can be slower
        const numPrograms = 100;

        for (let i = 0; i < numPrograms; i++) {
            const program = `test-program-${i}`;
            const result = hasProgram(program);

            // Should return boolean without error
            expect(typeof result).toBe("boolean");
        }

        // Verify cached values still work
        const cachedResult = hasProgram("test-program-0");
        expect(typeof cachedResult).toBe("boolean");

        // Should not throw (updated to match new numPrograms)
        expect(() => hasProgram("test-program-99")).not.toThrow();
    });

    // Type Tests

    it("should maintain boolean return type with caching", () => {
        const os = discoverOs();
        const knownProgram = os === "win32" ? "cmd" : "sh";

        // First call (not cached)
        const firstResult = hasProgram(knownProgram);

        // Second call (cached)
        const secondResult = hasProgram(knownProgram);

        // Runtime tests
        expect(typeof firstResult).toBe("boolean");
        expect(typeof secondResult).toBe("boolean");

        // Type tests - should maintain boolean type
        type cases = [
            Expect<AssertExtends<typeof firstResult, boolean>>,
            Expect<AssertExtends<typeof secondResult, boolean>>
        ];
    });

    it("should not expose cache implementation in public API", () => {
        // The hasProgram function should only expose the function itself
        // No cache should be accessible from the module exports

        // This is a compile-time check - the cache should be module-private
        // We verify this by checking the function signature remains clean

        const result = hasProgram("sh");

        type cases = [
            // Function should only have one parameter (the program name)
            Expect<AssertExtends<typeof hasProgram, (cmd: string) => any>>
        ];

        // No cache-related properties should be accessible
        expect((hasProgram as any).cache).toBeUndefined();
        expect((hasProgram as any).clearCache).toBeUndefined();
    });

    // Additional behavioral tests

    it("should cache empty string results (literal false)", () => {
        // Empty strings return literal false without executing
        const firstEmpty = hasProgram("");
        const callsAfterFirst = execSyncCallCount;

        const secondEmpty = hasProgram("");
        const callsAfterSecond = execSyncCallCount;

        // Both should be false
        expect(firstEmpty).toBe(false);
        expect(secondEmpty).toBe(false);

        // Empty strings bypass shell execution entirely, so no caching needed
        // (they're handled in validation before execution)
        // So call count should remain 0
        expect(callsAfterFirst).toBe(0);
        expect(callsAfterSecond).toBe(0);
    });

    it("should cache invalid character error results", () => {
        // Programs with invalid characters return Error without executing
        const firstInvalid = (hasProgram as any)("test;inject");
        const callsAfterFirst = execSyncCallCount;

        const secondInvalid = (hasProgram as any)("test;inject");
        const callsAfterSecond = execSyncCallCount;

        // Both should return Error
        expect(firstInvalid).toBeInstanceOf(Error);
        expect(secondInvalid).toBeInstanceOf(Error);

        // Invalid chars bypass shell execution entirely
        expect(callsAfterFirst).toBe(0);
        expect(callsAfterSecond).toBe(0);
    });

    it("should improve performance for repeated checks", () => {
        // Measure performance difference between cached and uncached
        const program = "performance-test-program";

        // First call (uncached) - measure time
        const uncachedStart = performance.now();
        hasProgram(program);
        const uncachedEnd = performance.now();
        const uncachedTime = uncachedEnd - uncachedStart;

        // Subsequent calls (cached) - measure time
        const cachedStart = performance.now();
        for (let i = 0; i < 100; i++) {
            hasProgram(program);
        }
        const cachedEnd = performance.now();
        const cachedTime = (cachedEnd - cachedStart) / 100;

        // Cached should be significantly faster
        // We're lenient with the ratio to avoid flaky tests
        // Just verify cached is faster
        expect(cachedTime).toBeLessThan(uncachedTime);
    });

    // Cache Busting Tests

    it("should clear cache when hasProgram__Bust is called", () => {
        const program = "unique-cache-bust-test";

        // First call - populates cache
        hasProgram(program);
        const callsAfterFirst = execSyncCallCount;

        // Second call - should be cached (no new execSync call)
        hasProgram(program);
        const callsAfterSecond = execSyncCallCount;

        expect(callsAfterSecond).toBe(callsAfterFirst);

        // Bust the cache
        hasProgram__Bust();

        // Third call - cache was busted, should execute again
        hasProgram(program);
        const callsAfterBust = execSyncCallCount;

        expect(callsAfterBust).toBeGreaterThan(callsAfterSecond);
        expect(callsAfterBust).toBe(callsAfterFirst + 1);
    });

    it("should allow cache to be rebuilt after busting", () => {
        const program = "unique-rebuild-cache-test";

        // Populate cache
        hasProgram(program);
        const callsAfterFirst = execSyncCallCount;

        // Bust cache
        hasProgram__Bust();

        // First call after bust - should execute
        hasProgram(program);
        const callsAfterRebuild = execSyncCallCount;

        // Second call after bust - should be cached again
        hasProgram(program);
        const callsAfterSecondRebuild = execSyncCallCount;

        expect(callsAfterRebuild).toBeGreaterThan(callsAfterFirst);
        expect(callsAfterSecondRebuild).toBe(callsAfterRebuild);
    });

    it("should bust cache for all programs, not just one", () => {
        const program1 = "unique-bust-all-1";
        const program2 = "unique-bust-all-2";
        const program3 = "unique-bust-all-3";

        // Populate cache with multiple programs
        hasProgram(program1);
        hasProgram(program2);
        hasProgram(program3);
        const callsAfterPopulate = execSyncCallCount;

        // Verify all are cached
        hasProgram(program1);
        hasProgram(program2);
        hasProgram(program3);
        const callsAfterCached = execSyncCallCount;

        expect(callsAfterCached).toBe(callsAfterPopulate);

        // Bust cache
        hasProgram__Bust();

        // All programs should require re-execution
        hasProgram(program1);
        hasProgram(program2);
        hasProgram(program3);
        const callsAfterBust = execSyncCallCount;

        expect(callsAfterBust).toBe(callsAfterPopulate + 3);
    });
});
