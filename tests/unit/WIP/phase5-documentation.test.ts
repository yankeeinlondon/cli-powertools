import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { Expect, Equals } from "inferred-types";
import type { TerminalApp } from "~/types";

describe("Phase 5: Documentation Tests", () => {
    it("JSDoc comments should describe Windows terminal support", () => {
        // Read the source file to verify JSDoc exists
        const filePath = resolve(process.cwd(), "src/utils/detectTerminalApp.ts");
        const sourceCode = readFileSync(filePath, "utf-8");

        // Verify JSDoc mentions Windows terminals
        expect(sourceCode).toContain("Windows Terminal");
        expect(sourceCode).toContain("PowerShell");
        expect(sourceCode).toContain("cmd.exe");
        expect(sourceCode).toContain("ConEmu");
        expect(sourceCode).toContain("mintty");

        // Verify JSDoc mentions cross-platform support
        expect(sourceCode).toContain("macOS");
        expect(sourceCode).toContain("Linux");
        expect(sourceCode).toContain("Windows");

        // Verify detection priority is documented
        const hasPriority = sourceCode.includes("priority") || sourceCode.includes("Priority");
        expect(hasPriority).toBe(true);

        // Verify environment variables are mentioned
        const hasWTEnv = sourceCode.includes("WT_SESSION") || sourceCode.includes("Windows Terminal");
        expect(hasWTEnv).toBe(true);
    });

    it("Type exports should be available from main entry point", async () => {
        // Import types from main index
        const mainExports = await import("~/index");

        // Verify TerminalApp type is accessible (indirectly through detectTerminalApp)
        expect(mainExports.detectTerminalApp).toBeDefined();

        // Type verification - verify the return type is TerminalApp
        const result = mainExports.detectTerminalApp();

        type cases = [
            // Verify the function returns the TerminalApp type
            Expect<Equals<typeof result, TerminalApp>>,

            // Verify all Windows terminal values are valid TerminalApp types
            Expect<Equals<"windows-terminal" extends TerminalApp ? true : false, true>>,
            Expect<Equals<"powershell" extends TerminalApp ? true : false, true>>,
            Expect<Equals<"cmd" extends TerminalApp ? true : false, true>>,
            Expect<Equals<"conemu" extends TerminalApp ? true : false, true>>,
            Expect<Equals<"mintty" extends TerminalApp ? true : false, true>>
        ];
    });
});
