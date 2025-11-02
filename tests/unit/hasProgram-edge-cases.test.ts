/* cSpell:ignore testprog myprog myprogram */
import { describe, it, expect, afterEach } from "vitest";
import { hasProgram } from "~/utils/hasProgram";
import { discoverOs } from "~/utils/os";
import { createTestExecutable, createTestExecutables } from "../helpers/createTestExecutable";
import type { Expect, AssertEqual } from "inferred-types/types";
import { AssertError } from "inferred-types";

describe("hasProgram() - Edge Cases with Real Executables", () => {
    // Track cleanup functions
    const cleanups: Array<() => void> = [];

    afterEach(() => {
        // Clean up all test executables after each test
        cleanups.forEach(cleanup => cleanup());
        cleanups.length = 0;
    });

    // Spaces are now supported with proper quoting!
    it("should find programs with spaces in their names", () => {
        const exe = createTestExecutable({ name: "program with spaces" });
        cleanups.push(exe.cleanup);

        const result = hasProgram("program with spaces");
        expect(result).toBe(true);
    });

    // Invalid Characters - These return Error objects

    it("should return InvalidChar error for null bytes (type system prevents but runtime catches)", () => {
        // @ts-expect-error - type system should prevent this
        const withNull = hasProgram("program\0");
        // @ts-expect-error - type system should prevent this
        const withHexNull = hasProgram("program\x00");

        expect(withNull).toBeInstanceOf(Error);
        expect(withHexNull).toBeInstanceOf(Error);

        expect(withNull.type).toBe("invalid-char");
        expect(withHexNull.type).toBe("invalid-char");

        type cases = [
            Expect<AssertError<typeof withNull, "InvalidChar">>,
            Expect<AssertError<typeof withHexNull, "InvalidChar">>,
        ]
    });

    it("should return InvalidChar error for shell metacharacters when bypassing type system", () => {
        // Type system prevents these, but we test runtime handling when types are bypassed
        const dangerousInputs = [
            "prog;rm",      // semicolon
            "prog&bg",      // ampersand
            "prog`cmd`",    // backticks
            "prog$(cmd)",   // dollar sign (command substitution)
            "prog<file",    // less than (redirection)
            "prog>file",    // greater than (redirection)
            "prog\\path",   // backslash
            "prog'test",    // single quote
            "prog\"test",   // double quote
        ];

        dangerousInputs.forEach(input => {
            const result = (hasProgram as any)(input);
            expect(result).toBeInstanceOf(Error);
            expect(result.type).toBe("invalid-char");
        });
    });

    it("should return InvalidChar error for control characters when bypassing type system", () => {
        const controlChars = [
            "prog\t",       // tab
            "prog\r",       // carriage return
            "prog\n",       // newline
            "prog\x01",     // SOH
            "prog\x1f",     // Unit separator
        ];

        controlChars.forEach(input => {
            const result = (hasProgram as any)(input);
            expect(result).toBeInstanceOf(Error);
            expect(result.type).toBe("invalid-char");
        });
    });

    // Valid Character Tests with Real Executables
    // These test that valid program names actually work

    it("should find programs with hyphens", () => {
        const exe = createTestExecutable({ name: "test-with-hyphens" });
        cleanups.push(exe.cleanup);

        const result = hasProgram("test-with-hyphens");
        expect(result).toBe(true);
    });

    it("should find programs with underscores", () => {
        const exe = createTestExecutable({ name: "test_with_underscores" });
        cleanups.push(exe.cleanup);

        const result = hasProgram("test_with_underscores");
        expect(result).toBe(true);
    });

    it("should find programs with numbers", () => {
        const exe = createTestExecutable({ name: "test123" });
        cleanups.push(exe.cleanup);

        const result = hasProgram("test123");
        expect(result).toBe(true);
    });

    it("should find programs with mixed alphanumeric, hyphens, and underscores", () => {
        const exe = createTestExecutable({ name: "my-test_prog2" });
        cleanups.push(exe.cleanup);

        const result = hasProgram("my-test_prog2");
        expect(result).toBe(true);
    });

    // Dot handling tests

    it.skipIf(discoverOs() === "win32")("should find programs with dots in the name on Unix", () => {
        // On Unix, dots in filenames are normal
        const exe = createTestExecutable({ name: "my.test.prog" });
        cleanups.push(exe.cleanup);

        const result = hasProgram("my.test.prog");
        expect(result).toBe(true);
    });

    it.skipIf(discoverOs() === "win32")("should find programs with leading dots on Unix", () => {
        const exe = createTestExecutable({ name: ".hidden-prog" });
        cleanups.push(exe.cleanup);

        const result = hasProgram(".hidden-prog");
        expect(result).toBe(true);
    });

    it.skipIf(discoverOs() !== "win32")("should find .bat files on Windows", () => {
        const exe = createTestExecutable({ name: "testprog.bat" });
        cleanups.push(exe.cleanup);

        // Windows should find it with or without .bat extension
        const withExt = hasProgram("testprog.bat");
        const withoutExt = hasProgram("testprog");

        expect(withExt).toBe(true);
        // Note: withoutExt behavior depends on Windows PATH extension handling
        expect(typeof withoutExt).toBe("boolean");
    });

    // Case sensitivity tests

    it.skipIf(discoverOs() !== "win32")("should be case-insensitive on Windows", () => {
        const exe = createTestExecutable({ name: "TestProg" });
        cleanups.push(exe.cleanup);

        const lower = hasProgram("testprog");
        const upper = hasProgram("TESTPROG");
        const mixed = hasProgram("TeStPrOg");

        // All should find the same program on Windows
        expect(lower).toBe(true);
        expect(upper).toBe(true);
        expect(mixed).toBe(true);
    });

    it.skipIf(discoverOs() === "win32")("should handle case sensitivity on Unix", () => {
        const exe = createTestExecutable({ name: "TestProg" });
        cleanups.push(exe.cleanup);

        const exact = hasProgram("TestProg");
        const lower = hasProgram("testprog");
        const upper = hasProgram("TESTPROG");

        expect(exact).toBe(true);
        // On case-sensitive filesystems, these should fail
        // On case-insensitive filesystems (like macOS default), they might succeed
        // So we just verify they return boolean
        expect(typeof lower).toBe("boolean");
        expect(typeof upper).toBe("boolean");
    });

    // Length tests

    it("should handle reasonably long program names", () => {
        // 50 characters - reasonable length
        const longName = "a".repeat(50);
        const exe = createTestExecutable({ name: longName });
        cleanups.push(exe.cleanup);

        const result = hasProgram(longName);
        expect(result).toBe(true);
    });

    it("should return false for extremely long program names", () => {
        // 1000 characters - likely to exceed system limits or not exist
        const veryLongName = "a".repeat(1000);
        const result = hasProgram(veryLongName);

        // This should return false (program doesn't exist and may hit system limits)
        expect(result).toBe(false);
    });

    // Multiple executable tests

    it("should correctly distinguish between multiple similar program names", () => {
        const { cleanup } = createTestExecutables([
            { name: "myprog" },
            { name: "myprog2" },
            { name: "my-prog" },
            { name: "my_prog" }
        ]);
        cleanups.push(cleanup);

        expect(hasProgram("myprog")).toBe(true);
        expect(hasProgram("myprog2")).toBe(true);
        expect(hasProgram("my-prog")).toBe(true);
        expect(hasProgram("my_prog")).toBe(true);
        expect(hasProgram("myprog3")).toBe(false);
        expect(hasProgram("myprogram")).toBe(false);
    });

    // Type narrowing tests

    it("should maintain proper type narrowing for empty strings", () => {
        const emptyResult = hasProgram("");
        const whitespaceResult = hasProgram("   ");

        expect(emptyResult).toBe(false);
        expect(whitespaceResult).toBe(false);

        type cases = [
            Expect<AssertEqual<typeof emptyResult, false>>,
            Expect<AssertEqual<typeof whitespaceResult, false>>
        ];
    });

    it("should return boolean for valid program names", () => {
        const result = hasProgram("valid-program-name");

        type cases = [
            Expect<AssertEqual<typeof result, boolean>>
        ];
    });
});
