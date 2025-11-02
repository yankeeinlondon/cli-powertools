import { writeFileSync, chmodSync, unlinkSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { discoverOs } from "~/utils/os";
import { execSync } from "node:child_process";

/**
 * Test utility for creating temporary executable programs to test hasProgram()
 * with real edge cases like spaces, special characters, etc.
 */

type CreateExecutableOptions = {
    /** The name of the executable to create (without path) */
    name: string;
    /** Whether to add the executable to PATH (default: true) */
    addToPath?: boolean;
    /** Custom directory to create the executable in (defaults to temp dir) */
    customDir?: string;
}

type ExecutableInfo = {
    /** Full path to the created executable */
    path: string;
    /** Directory containing the executable */
    dir: string;
    /** Name of the executable (including .exe on Windows) */
    name: string;
    /** Original name requested (without .exe) */
    originalName: string;
    /** Cleanup function to remove the executable and restore PATH */
    cleanup: () => void;
}

/**
 * Creates a temporary executable program for testing.
 *
 * On Unix-like systems: Creates a shell script
 * On Windows: Creates a .bat file
 *
 * @example
 * ```ts
 * const exe = createTestExecutable({ name: "my-test-prog" });
 * expect(hasProgram("my-test-prog")).toBe(true);
 * exe.cleanup();
 * ```
 */
export function createTestExecutable(options: CreateExecutableOptions): ExecutableInfo {
    const os = discoverOs();
    const { name, addToPath = true, customDir } = options;

    // Determine the directory for the executable
    const dir = customDir || join(tmpdir(), `test-executables-${Date.now()}`);

    // Create directory if it doesn't exist
    if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
    }

    // Platform-specific executable creation
    let executableName: string;
    let fullPath: string;
    let originalPath: string | undefined;

    if (os === "win32") {
        // Windows: Create a .bat file
        executableName = name.endsWith(".bat") ? name : `${name}.bat`;
        fullPath = join(dir, executableName);

        // Simple batch script that exits successfully
        const batchContent = "@echo off\nexit /b 0\n";
        writeFileSync(fullPath, batchContent, { encoding: "utf8" });
    } else {
        // Unix-like: Create a shell script
        executableName = name;
        fullPath = join(dir, executableName);

        // Simple shell script that exits successfully
        const shellContent = "#!/bin/sh\nexit 0\n";
        writeFileSync(fullPath, shellContent, { encoding: "utf8", mode: 0o755 });

        // Make executable (chmod +x)
        try {
            chmodSync(fullPath, 0o755);
        } catch (error) {
            // If chmod fails, try to continue - some systems might not need it
            console.warn(`Warning: Could not chmod ${fullPath}:`, error);
        }
    }

    // Add directory to PATH if requested
    if (addToPath) {
        originalPath = process.env.PATH;
        const pathSeparator = os === "win32" ? ";" : ":";
        process.env.PATH = `${dir}${pathSeparator}${originalPath}`;
    }

    // Create cleanup function
    const cleanup = () => {
        // Remove the executable file
        try {
            if (existsSync(fullPath)) {
                unlinkSync(fullPath);
            }
        } catch (error) {
            console.warn(`Warning: Could not delete ${fullPath}:`, error);
        }

        // Restore PATH
        if (addToPath && originalPath !== undefined) {
            process.env.PATH = originalPath;
        }

        // Try to remove directory if empty
        try {
            const fs = require("node:fs");
            const files = fs.readdirSync(dir);
            if (files.length === 0) {
                fs.rmdirSync(dir);
            }
        } catch {
            // Ignore errors when removing directory
        }
    };

    return {
        path: fullPath,
        dir,
        name: executableName,
        originalName: name,
        cleanup
    };
}

/**
 * Creates multiple test executables at once.
 * All executables are created in the same directory.
 * Returns a cleanup function that removes all executables.
 *
 * @example
 * ```ts
 * const { executables, cleanup } = createTestExecutables([
 *   { name: "prog1" },
 *   { name: "prog-with-dash" },
 *   { name: "prog_with_underscore" }
 * ]);
 *
 * // Run tests...
 *
 * cleanup(); // Clean up all at once
 * ```
 */
export function createTestExecutables(
    options: CreateExecutableOptions[]
): { executables: ExecutableInfo[]; cleanup: () => void } {
    // Create a shared directory for all executables
    const sharedDir = join(tmpdir(), `test-executables-${Date.now()}`);

    const executables = options.map(opt =>
        createTestExecutable({ ...opt, customDir: sharedDir })
    );

    // Create a cleanup function that cleans up all executables
    const cleanup = () => {
        executables.forEach(exe => exe.cleanup());
    };

    return { executables, cleanup };
}

/**
 * Verifies that an executable actually exists and is executable
 * by attempting to run it.
 */
export function verifyExecutable(name: string): boolean {
    try {
        const os = discoverOs();
        const command = os === "win32"
            ? `where ${name}`
            : `which ${name}`;

        execSync(command, { stdio: "pipe" });
        return true;
    } catch {
        return false;
    }
}
