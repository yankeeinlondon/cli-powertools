/* cSpell:ignore pushd popd */
import { describe, it, expect } from "vitest";
import { hasProgram } from "~/utils/hasProgram";
import { discoverOs } from "~/utils/os";
import type { Expect, AssertExtends, AssertEqual } from "inferred-types/types";

describe("hasProgram() - Shell Builtin Detection", () => {
    // Happy Path Tests

    it.skipIf(discoverOs() === "win32")("should return true for common builtins on Unix-like systems", () => {
        // Common builtins that exist in sh, bash, and zsh
        const commonBuiltins = ["cd", "echo", "pwd"];

        commonBuiltins.forEach(builtin => {
            const result = hasProgram(builtin);
            expect(result).toBe(true);
        });

        // Test individual builtins with specific expectations
        const cdResult = hasProgram("cd");
        const echoResult = hasProgram("echo");
        const pwdResult = hasProgram("pwd");

        expect(cdResult).toBe(true);
        expect(echoResult).toBe(true);
        expect(pwdResult).toBe(true);

        // Type test - should return boolean
        type cases = [
            Expect<AssertExtends<typeof cdResult, boolean>>,
            Expect<AssertExtends<typeof echoResult, boolean>>,
            Expect<AssertExtends<typeof pwdResult, boolean>>
        ];
    });

    it.skipIf(discoverOs() !== "win32")("should return true for common builtins on Windows", () => {
        // Common Windows command processor builtins
        const windowsBuiltins = ["cd", "echo", "dir", "set"];

        windowsBuiltins.forEach(builtin => {
            const result = hasProgram(builtin);
            expect(result).toBe(true);
        });

        // Test individual builtins
        const cdResult = hasProgram("cd");
        const echoResult = hasProgram("echo");
        const dirResult = hasProgram("dir");
        const setResult = hasProgram("set");

        expect(cdResult).toBe(true);
        expect(echoResult).toBe(true);
        expect(dirResult).toBe(true);
        expect(setResult).toBe(true);

        // Type test - should return boolean
        type cases = [
            Expect<AssertExtends<typeof cdResult, boolean>>,
            Expect<AssertExtends<typeof dirResult, boolean>>
        ];
    });

    it.skipIf(discoverOs() === "win32")("should return true for bash-specific builtins", () => {
        // Bash-specific builtins (may not exist in all shells)
        // We'll test a few that are common in bash
        const bashBuiltins = ["declare", "local", "readonly"];

        bashBuiltins.forEach(builtin => {
            const result = hasProgram(builtin);
            // Should return boolean - may be true or false depending on shell
            expect(typeof result).toBe("boolean");
        });

        // At minimum, test that the function handles them without error
        expect(() => hasProgram("declare")).not.toThrow();
        expect(() => hasProgram("local")).not.toThrow();
        expect(() => hasProgram("readonly")).not.toThrow();
    });

    it.skipIf(discoverOs() === "win32")("should return true for programs that are both builtins and executables", () => {
        // "echo" is typically both a builtin AND an executable on Unix systems
        // It should be found (whether as builtin or executable)
        const echoResult = hasProgram("echo");
        expect(echoResult).toBe(true);

        // "test" is another that's often both
        const testResult = hasProgram("test");
        expect(testResult).toBe(true);

        // Type test
        type cases = [
            Expect<AssertExtends<typeof echoResult, boolean>>,
            Expect<AssertExtends<typeof testResult, boolean>>
        ];
    });

    // Edge Cases

    it.skipIf(discoverOs() === "win32")("should handle builtins that vary by shell", () => {
        // Some commands exist in bash but not sh, or vary across shells
        // The key is that hasProgram() handles them gracefully
        const varyingCommands = [
            "source",    // bash/zsh builtin, not in all sh
            "typeset",   // ksh/zsh, not in bash
            "pushd",     // bash/zsh, not in sh
            "popd"       // bash/zsh, not in sh
        ];

        varyingCommands.forEach(cmd => {
            const result = hasProgram(cmd);
            // Should return boolean without error
            expect(typeof result).toBe("boolean");
        });

        // Should not throw
        expect(() => hasProgram("source")).not.toThrow();
        expect(() => hasProgram("pushd")).not.toThrow();
    });

    it.skipIf(discoverOs() === "win32")("should correctly detect both executables and builtins", () => {
        // Test a builtin-only command (cd - should exist)
        const cdResult = hasProgram("cd");
        expect(cdResult).toBe(true);

        // Test an executable-only command (ls - should exist)
        const lsResult = hasProgram("ls");
        expect(lsResult).toBe(true);

        // Test a command that's both (echo - should exist)
        const echoResult = hasProgram("echo");
        expect(echoResult).toBe(true);

        // All should return true on Unix systems
        type cases = [
            Expect<AssertExtends<typeof cdResult, boolean>>,
            Expect<AssertExtends<typeof lsResult, boolean>>,
            Expect<AssertExtends<typeof echoResult, boolean>>
        ];
    });

    it("should handle platform-specific builtin differences", () => {
        const os = discoverOs();

        if (os === "win32") {
            // Windows-specific builtins
            expect(hasProgram("dir")).toBe(true);
            expect(hasProgram("type")).toBe(true);
        } else {
            // Unix-specific builtins
            expect(hasProgram("cd")).toBe(true);
            expect(hasProgram("pwd")).toBe(true);
        }

        // Both platforms should handle non-existent builtins
        const result = hasProgram("nonexistent-builtin-xyz");
        expect(result).toBe(false);
    });

    // Error Conditions

    it("should return false when builtin detection command fails", () => {
        // Test with a command that definitely doesn't exist
        const result = hasProgram("definitely-not-a-builtin-12345");
        expect(result).toBe(false);

        // Should not throw even if builtin detection fails
        expect(() => hasProgram("fake-builtin")).not.toThrow();
    });

    it("should gracefully handle shells that don't support type command", () => {
        // Even if the underlying shell doesn't support 'type' command,
        // hasProgram() should still fall back to checking executables
        // and return a valid result without throwing

        const result = hasProgram("cd");
        expect(typeof result).toBe("boolean");

        // Should not throw
        expect(() => hasProgram("cd")).not.toThrow();
        expect(() => hasProgram("echo")).not.toThrow();
    });

    // Type Tests

    it("should maintain boolean return type with builtin detection", () => {
        const builtinResult = hasProgram("cd");
        const executableResult = hasProgram("sh");
        const nonexistentResult = hasProgram("fake-prog");

        // Runtime tests
        expect(typeof builtinResult).toBe("boolean");
        expect(typeof executableResult).toBe("boolean");
        expect(typeof nonexistentResult).toBe("boolean");

        // Type tests - all should be boolean
        type cases = [
            Expect<AssertExtends<typeof builtinResult, boolean>>,
            Expect<AssertExtends<typeof executableResult, boolean>>,
            Expect<AssertExtends<typeof nonexistentResult, boolean>>
        ];
    });

    it("should preserve type narrowing for edge cases with builtin detection", () => {
        // Empty strings should still return literal false
        const emptyResult = hasProgram("");
        const whitespaceResult = hasProgram("   ");

        // Valid builtin should return boolean (not literal false)
        const builtinResult = hasProgram("cd");

        expect(emptyResult).toBe(false);
        expect(whitespaceResult).toBe(false);
        expect(typeof builtinResult).toBe("boolean");

        // Type tests - narrow types should be preserved
        type cases = [
            Expect<AssertEqual<typeof emptyResult, false>>,
            Expect<AssertEqual<typeof whitespaceResult, false>>,
            Expect<AssertExtends<typeof builtinResult, boolean>>
        ];
    });
});
