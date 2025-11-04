import { describe, it, expect } from "vitest";
import type { Expect, Equals } from "inferred-types";
import { detectTerminalApp } from "~/utils/detectTerminalApp";
import { TerminalApp } from "~/types";

describe("Phase 5: Integration Tests", () => {
    it("should export detectTerminalApp with correct type signature", () => {
        // Verify function is exported and callable
        expect(typeof detectTerminalApp).toBe("function");

        // Call the function to verify it works
        const result = detectTerminalApp();

        // Runtime verification
        expect(typeof result).toBe("string");

        // Type verification - should return TerminalApp type
        type cases = [
            Expect<Equals<typeof detectTerminalApp, () => TerminalApp>>,
            Expect<Equals<typeof result, TerminalApp>>
        ];
    });

    it("should work correctly when imported from main package index", async () => {
        // Dynamically import from the main index to verify export
        const mainExports = await import("~/index");

        // Verify detectTerminalApp is exported from main index
        expect(mainExports.detectTerminalApp).toBeDefined();
        expect(typeof mainExports.detectTerminalApp).toBe("function");

        // Call it to verify it works
        const result = mainExports.detectTerminalApp();

        // Runtime verification
        expect(typeof result).toBe("string");

        // Type verification
        type cases = [
            Expect<Equals<typeof mainExports.detectTerminalApp, () => TerminalApp>>
        ];
    });
});
