# Test Helpers

Utility functions to assist with testing.

## createTestExecutable

Creates temporary executable programs for testing functions that check for program existence (like `hasProgram()`).

### Basic Usage

```ts
import { createTestExecutable } from "../helpers/createTestExecutable";
import { hasProgram } from "~/utils/hasProgram";

it("should find programs with hyphens", () => {
    const exe = createTestExecutable({ name: "test-with-hyphens" });

    expect(hasProgram("test-with-hyphens")).toBe(true);

    exe.cleanup(); // Remove the executable when done
});
```

### Using afterEach for Cleanup

```ts
import { describe, it, expect, afterEach } from "vitest";
import { createTestExecutable } from "../helpers/createTestExecutable";

describe("my tests", () => {
    const cleanups: Array<() => void> = [];

    afterEach(() => {
        cleanups.forEach(cleanup => cleanup());
        cleanups.length = 0;
    });

    it("should find program", () => {
        const exe = createTestExecutable({ name: "myprog" });
        cleanups.push(exe.cleanup);

        // ... your tests
    });
});
```

### Creating Multiple Executables

```ts
import { createTestExecutables } from "../helpers/createTestExecutables";

it("should handle multiple programs", () => {
    const { executables, cleanup } = createTestExecutables([
        { name: "prog1" },
        { name: "prog2" },
        { name: "prog3" }
    ]);

    // All executables are in the same directory
    expect(hasProgram("prog1")).toBe(true);
    expect(hasProgram("prog2")).toBe(true);
    expect(hasProgram("prog3")).toBe(true);

    cleanup(); // Removes all executables at once
});
```

### Platform Behavior

- **Unix-like systems (macOS, Linux)**: Creates executable shell scripts with proper permissions
- **Windows**: Creates `.bat` batch files

### Options

```ts
interface CreateExecutableOptions {
    /** The name of the executable to create (without path) */
    name: string;
    /** Whether to add the executable to PATH (default: true) */
    addToPath?: boolean;
    /** Custom directory to create the executable in (defaults to temp dir) */
    customDir?: string;
}
```

### Return Value

```ts
interface ExecutableInfo {
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
```

### Edge Cases Tested

This utility enables testing of:

- Programs with hyphens (`my-prog`)
- Programs with underscores (`my_prog`)
- Programs with dots (`my.prog`)
- Programs with numbers (`prog123`)
- Case sensitivity across platforms
- Multiple programs with similar names
- Reasonable vs. extreme program name lengths

### Security Note

The utility is designed for testing only. It creates simple no-op executables that exit successfully. Do not use this in production code.
