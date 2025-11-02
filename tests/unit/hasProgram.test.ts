import { describe, it, expect } from "vitest";
import { hasProgram } from "~/utils/hasProgram";
import { discoverOs } from "~/utils/os";
import type { Expect } from "inferred-types/types";

describe("hasProgram()", () => {
    // Helper to get a program guaranteed to exist on current platform
    const getKnownProgram = (): "sh" | "cmd" => {
        const os = discoverOs();
        if (os === "win32") {
            return "cmd"; // Windows command processor, always present
        } else {
            return "sh"; // POSIX shell, always present on Unix-like systems
        }
    };

    // Happy Path Tests
    it("should return true when checking for a program that exists", () => {
        const program = getKnownProgram();
        const result = hasProgram(program);
        expect(result).toBe(true);
    });

    it("should return false when checking for a program that does not exist", () => {
        const result = hasProgram("nonexistent-program-xyz-12345");
        expect(result).toBe(false);
    });

    it("should narrow return type to literal false for empty strings", () => {
        const emptyResult = hasProgram("");
        const whitespaceResult = hasProgram("   ");
        const validResult = hasProgram("sh");

        // Runtime tests
        expect(emptyResult).toBe(false);
        expect(whitespaceResult).toBe(false);

        // Type tests - empty strings return literal false, others return boolean
        type cases = [
            Expect<typeof emptyResult extends false ? true : false>,
            Expect<typeof whitespaceResult extends false ? true : false>,
            Expect<typeof validResult extends boolean ? true : false>,
        ];
    });

    // Platform-specific tests
    it.skipIf(discoverOs() !== "darwin")("should work correctly on darwin platform", () => {
        // Test with programs that definitely exist on macOS
        expect(hasProgram("sh")).toBe(true);
        expect(hasProgram("ls")).toBe(true);
        expect(hasProgram("cat")).toBe(true);
    });

    it.skipIf(discoverOs() !== "win32")("should work correctly on win32 platform", () => {
        // Test with programs that definitely exist on Windows
        expect(hasProgram("cmd")).toBe(true);
        expect(hasProgram("where")).toBe(true);
        expect(hasProgram("findstr")).toBe(true);
    });

    it.skipIf(discoverOs() !== "linux")("should work correctly on linux platform", () => {
        // Test with programs that definitely exist on Linux
        expect(hasProgram("sh")).toBe(true);
        expect(hasProgram("ls")).toBe(true);
        expect(hasProgram("cat")).toBe(true);
    });

    it("should not throw errors for any input", () => {
        // Should handle any string input without throwing
        expect(() => hasProgram("")).not.toThrow();
        expect(() => hasProgram("valid-name")).not.toThrow();
        expect(() => hasProgram("valid name with spaces")).not.toThrow(); // Spaces are now valid!
        expect(() => (hasProgram as any)("special!@#$%characters")).not.toThrow(); // Bypassing type check
    });

    // Security edge case
    it("should handle special characters safely without command injection", () => {
        // Test potential command injection characters
        // These return Error objects, not execute commands
        const dangerousInputs = [
            "program; rm -rf /",
            "program && echo hacked",
            "program`whoami`",
            "program$(whoami)"
        ];

        dangerousInputs.forEach(input => {
            expect(() => (hasProgram as any)(input)).not.toThrow();
            const result = (hasProgram as any)(input);
            // Should return Error, not boolean
            expect(result).toBeInstanceOf(Error);
            expect(result.type).toBe("invalid-char");
        });
    });
});
