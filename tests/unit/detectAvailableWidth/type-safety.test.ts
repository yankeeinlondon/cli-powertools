import type { Expect, AssertEqual, AssertTrue, AssertExtends } from "inferred-types/types";
import { describe, it, expect } from "vitest";
import { detectAvailableWidth } from "~/utils/detectAvailableWidth";

/**
 * Type Safety and Documentation Tests
 *
 * Comprehensive tests for type safety, generic parameters, return types,
 * and function signature verification.
 */
describe("detectAvailableWidth() - Type Safety", () => {

    // ========== TYPE TESTS: FUNCTION SIGNATURE ==========

    it("should have correct function signature with generic parameter", async () => {
        // Test that function accepts number parameter
        const result1 = await detectAvailableWidth(100);
        expect(typeof result1).toBe("number");

        // Test that function works with default parameter
        const result2 = await detectAvailableWidth();
        expect(typeof result2).toBe("number");

        // Type test: Verify Parameters utility type shows correct signature
        type cases = [
            // Should accept number or undefined (optional parameter)
            Expect<AssertEqual<
                Parameters<typeof detectAvailableWidth>[0],
                number | undefined
            >>,
            // Parameter length can be 0 or 1 (optional parameter)
            Expect<AssertEqual<
                Parameters<typeof detectAvailableWidth>["length"], 0 | 1
            >>
        ];
    });

    it("should return Promise<number>", async () => {
        const result1 = detectAvailableWidth();

        // Runtime: Both should be Promises
        expect(result1).toBeInstanceOf(Promise);

        // Runtime: Both should resolve to numbers
        expect(await result1).toEqual(expect.any(Number));

        // Type test: Return type is always Promise<number>
        type cases = [
            Expect<AssertExtends<ReturnType<typeof detectAvailableWidth>, Promise<number>>>,
            Expect<AssertExtends<Awaited<ReturnType<typeof detectAvailableWidth>>, number>>,
        ];
    });

    // ========== TYPE TESTS: GENERIC PARAMETER T ==========

    it("should work with literal number types for fallback parameter", async () => {
        // Literal types
        const result1 = await detectAvailableWidth(80);
        const result2 = await detectAvailableWidth(100);
        const result3 = await detectAvailableWidth(120);

        // Runtime: All should be numbers
        expect(typeof result1).toBe("number");
        expect(typeof result2).toBe("number");
        expect(typeof result3).toBe("number");

        // Type test: Generic parameter T preserves literal types through inference
        type cases = [
            // Result type is always number (not narrowed to literal)
            Expect<AssertExtends<typeof result1, number>>,
            Expect<AssertExtends<typeof result2, number>>,
            Expect<AssertExtends<typeof result3, number>>,
        ];
    });

    it("should accept union types for fallback parameter", async () => {
        // Union type
        const fallbackValue: 80 | 100 | 120 = 100;
        const result = await detectAvailableWidth(fallbackValue);

        // Runtime: Should be a number
        expect(typeof result).toBe("number");

        // Type test: Return type is number
        type cases = [
            Expect<AssertExtends<typeof result, number>>,
        ];
    });

    it("should accept const-asserted literals", async () => {
        const fallback = 150 as const;
        const result = await detectAvailableWidth(fallback);

        // Runtime: Should be a number
        expect(typeof result).toBe("number");

        // Type test: Return type is number
        type cases = [
            Expect<AssertExtends<typeof result, number>>,
        ];
    });

    it("should accept number variables", async () => {
        let customFallback: number = 200;
        const result = await detectAvailableWidth(customFallback);

        // Runtime: Should be a number
        expect(typeof result).toBe("number");

        // Type test: Return type is number
        type cases = [
            Expect<AssertExtends<typeof result, number>>,
        ];
    });

    // ========== TYPE TESTS: RETURN TYPE ==========

    it("should always return number type (not narrowed to literal)", async () => {
        // Even with literal fallbacks, return type should be number (not literal)
        const result1 = await detectAvailableWidth(80);
        const result2 = await detectAvailableWidth(100 as const);

        // Runtime: Both should be numbers
        expect(typeof result1).toBe("number");
        expect(typeof result2).toBe("number");

        // Type test: Return type is broad number, not narrowed to literals
        type cases = [
            // Should extend number
            Expect<AssertExtends<typeof result1, number>>,
            Expect<AssertExtends<typeof result2, number>>,
            // But number should also extend the result type (bidirectional check = they're equal)
            Expect<AssertEqual<typeof result1, number>>,
            Expect<AssertEqual<typeof result2, number>>,
        ];
    });

    it("should return integer values (Math.floor applied)", async () => {
        // When COLUMNS has floating point, result should be integer
        process.env.COLUMNS = "120.7";

        const result = await detectAvailableWidth();

        // Runtime: Should be floored integer
        expect(result).toBe(120);
        expect(Number.isInteger(result)).toBe(true);

        // Cleanup
        delete process.env.COLUMNS;
    });

    // ========== INTEGRATION TESTS ==========

    it("should integrate with realistic usage scenarios", async () => {
        // Scenario 1: CLI tool using default width
        const cliDefaultWidth = await detectAvailableWidth();
        expect(cliDefaultWidth).toBeGreaterThan(0);

        // Scenario 2: CLI tool with custom fallback for narrow terminals
        const narrowWidth = await detectAvailableWidth(60);
        expect(narrowWidth).toBeGreaterThanOrEqual(60);

        // Scenario 3: Wide terminal preference
        const wideWidth = await detectAvailableWidth(120);
        expect(wideWidth).toBeGreaterThanOrEqual(80);

        // Type test: All results are numbers
        type cases = [
            Expect<AssertExtends<typeof cliDefaultWidth, number>>,
            Expect<AssertExtends<typeof narrowWidth, number>>,
            Expect<AssertExtends<typeof wideWidth, number>>,
        ];
    });

    it("should work alongside detectColorDepth pattern (async utilities)", async () => {
        // Both are async utilities that can be called together
        const width1 = await detectAvailableWidth();
        const width2 = await detectAvailableWidth(100);

        // Runtime: Both should be positive numbers
        expect(width1).toBeGreaterThan(0);
        expect(width2).toBeGreaterThan(0);

        // Type test: Consistent return types
        type cases = [
            Expect<AssertExtends<typeof width1, number>>,
            Expect<AssertExtends<typeof width2, number>>,
        ];
    });

    // ========== DOCUMENTATION VALIDATION ==========

    it("should match JSDoc example 1: default fallback", async () => {
        // From JSDoc: const width = await detectAvailableWidth();
        const width = await detectAvailableWidth();

        // Should return a number
        expect(typeof width).toBe("number");
        expect(width).toBeGreaterThan(0);

        // Type test
        type cases = [
            Expect<AssertExtends<typeof width, number>>,
        ];
    });

    it("should match JSDoc example 2: custom fallback", async () => {
        // From JSDoc: const width = await detectAvailableWidth(100);
        const width = await detectAvailableWidth(100);

        // Should return a number (will be 100 if detection fails)
        expect(typeof width).toBe("number");
        expect(width).toBeGreaterThanOrEqual(100);

        // Type test
        type cases = [
            Expect<AssertExtends<typeof width, number>>,
        ];
    });
});
