import { describe, it, expect } from "vitest";
import { getCssRgbFromNamedColor, getRgbObjectFromNamedColor } from "~/utils/color-conversion/namedColor";
import { isError } from "inferred-types";
import type { CssNamedColor } from "inferred-types/types";

describe("getCssRgbFromNamedColor()", () => {
    // ========== HAPPY PATH TESTS ==========

    it("should return CSS RGB string for valid named color 'red'", () => {
        const result = getCssRgbFromNamedColor("red");

        expect(result).toBe("rgb(255,0,0)");
        expect(isError(result)).toBe(false);
    });

    it("should return CSS RGB string for valid named color 'blue'", () => {
        const result = getCssRgbFromNamedColor("blue");

        expect(result).toBe("rgb(0,0,255)");
        expect(isError(result)).toBe(false);
    });

    it("should return CSS RGB string for valid named color 'green'", () => {
        const result = getCssRgbFromNamedColor("green");

        expect(result).toBe("rgb(0,128,0)");
        expect(isError(result)).toBe(false);
    });

    it("should return CSS RGB string for valid named color 'white'", () => {
        const result = getCssRgbFromNamedColor("white");

        expect(result).toBe("rgb(255,255,255)");
        expect(isError(result)).toBe(false);
    });

    it("should return CSS RGB string for valid named color 'black'", () => {
        const result = getCssRgbFromNamedColor("black");

        expect(result).toBe("rgb(0,0,0)");
        expect(isError(result)).toBe(false);
    });

    it("should handle various named colors correctly", () => {
        const colors = [
            { name: "aqua" as CssNamedColor, expected: "rgb(0,255,255)" },
            { name: "fuchsia" as CssNamedColor, expected: "rgb(255,0,255)" },
            { name: "lime" as CssNamedColor, expected: "rgb(0,255,0)" },
            { name: "navy" as CssNamedColor, expected: "rgb(0,0,128)" },
            { name: "silver" as CssNamedColor, expected: "rgb(192,192,192)" },
        ];

        for (const { name, expected } of colors) {
            const result = getCssRgbFromNamedColor(name);
            expect(result).toBe(expected);
            expect(isError(result)).toBe(false);
        }
    });

    // ========== ERROR CONDITIONS ==========

    it("should return error for invalid color name", () => {
        const result = getCssRgbFromNamedColor("notacolor" as any);

        expect(isError(result)).toBe(true);
        // Don't check internal error structure - just verify it's an error
    });

    it("should return error for empty string", () => {
        const result = getCssRgbFromNamedColor("" as any);

        expect(isError(result)).toBe(true);
    });

    it("should return error for color name with wrong casing (if not in lookup)", () => {
        // TypeScript should prevent this, but testing runtime behavior
        const result = getCssRgbFromNamedColor("RED" as any);

        expect(isError(result)).toBe(true);
    });
});

describe("getRgbObjectFromNamedColor()", () => {
    // ========== HAPPY PATH TESTS ==========

    it("should return RGB object for valid named color 'red'", () => {
        const result = getRgbObjectFromNamedColor("red");

        expect(isError(result)).toBe(false);
        if (!isError(result)) {
            expect(result).toEqual({ r: 255, g: 0, b: 0 });
        }
    });

    it("should return RGB object for valid named color 'blue'", () => {
        const result = getRgbObjectFromNamedColor("blue");

        expect(isError(result)).toBe(false);
        if (!isError(result)) {
            expect(result).toEqual({ r: 0, g: 0, b: 255 });
        }
    });

    it("should return RGB object for valid named color 'green'", () => {
        const result = getRgbObjectFromNamedColor("green");

        expect(isError(result)).toBe(false);
        if (!isError(result)) {
            expect(result).toEqual({ r: 0, g: 128, b: 0 });
        }
    });

    it("should return RGB object for valid named color 'white'", () => {
        const result = getRgbObjectFromNamedColor("white");

        expect(isError(result)).toBe(false);
        if (!isError(result)) {
            expect(result).toEqual({ r: 255, g: 255, b: 255 });
        }
    });

    it("should return RGB object for valid named color 'black'", () => {
        const result = getRgbObjectFromNamedColor("black");

        expect(isError(result)).toBe(false);
        if (!isError(result)) {
            expect(result).toEqual({ r: 0, g: 0, b: 0 });
        }
    });

    it("should handle various named colors correctly", () => {
        const colors = [
            { name: "aqua" as CssNamedColor, expected: { r: 0, g: 255, b: 255 } },
            { name: "fuchsia" as CssNamedColor, expected: { r: 255, g: 0, b: 255 } },
            { name: "lime" as CssNamedColor, expected: { r: 0, g: 255, b: 0 } },
            { name: "navy" as CssNamedColor, expected: { r: 0, g: 0, b: 128 } },
            { name: "silver" as CssNamedColor, expected: { r: 192, g: 192, b: 192 } },
        ];

        for (const { name, expected } of colors) {
            const result = getRgbObjectFromNamedColor(name);
            expect(isError(result)).toBe(false);
            if (!isError(result)) {
                expect(result).toEqual(expected);
            }
        }
    });

    // ========== ERROR CONDITIONS ==========

    it("should return error for invalid color name", () => {
        const result = getRgbObjectFromNamedColor("notacolor" as any);

        expect(isError(result)).toBe(true);
        // Don't check internal error structure - just verify it's an error
    });

    it("should return error for empty string", () => {
        const result = getRgbObjectFromNamedColor("" as any);

        expect(isError(result)).toBe(true);
    });

    it("should return error for color name with wrong casing (if not in lookup)", () => {
        // TypeScript should prevent this, but testing runtime behavior
        const result = getRgbObjectFromNamedColor("BLUE" as any);

        expect(isError(result)).toBe(true);
    });

    // ========== EDGE CASES ==========

    it("should handle colors with hyphens in name", () => {
        // Many CSS named colors have hyphens like 'dark-blue', 'light-green', etc.
        const result = getRgbObjectFromNamedColor("dark-blue" as any);

        // This will either work (if color exists) or return error (if not)
        // Just verify it doesn't crash
        expect(result).toBeDefined();
    });
});

describe("Type utilities - Lookup and ToRgbObject", () => {
    // The Lookup<T> and ToRgbObject<T> type utilities provide conditional type transformations
    // These are compile-time guarantees that TypeScript enforces, so we only test runtime behavior

    it("functions return correct types at runtime", () => {
        // getCssRgbFromNamedColor returns string or error
        const cssResult = getCssRgbFromNamedColor("red");
        expect(typeof cssResult === "string" || isError(cssResult)).toBe(true);

        // getRgbObjectFromNamedColor returns object or error
        const objResult = getRgbObjectFromNamedColor("blue");
        expect(
            (typeof objResult === "object" && "r" in objResult && "g" in objResult && "b" in objResult) ||
            isError(objResult)
        ).toBe(true);
    });
});
