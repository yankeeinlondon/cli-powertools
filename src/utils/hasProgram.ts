import { execSync } from "node:child_process";
import { discoverOs } from "./os";
import { Contains, Err, IsEqual, Trim } from "inferred-types/types";
import { asChars, endsWith, err, IsNever, narrow, StripChars } from "inferred-types";

/**
 * Module-level cache for program existence checks.
 * Maps program names to their existence status (boolean).
 */
let programCache = new Map<string, boolean>();

/**
 * invalid characters for a command's filename
 */
export const INVALID_COMMAND_CHARS = narrow(
    "&",
    ";",
    "\\",
    "$",
    ">",
    "<",
    "'",
    "\"",
    "\t",
    "\r",
    "\n",
    "\0",
    "`",
    "\x00",
    "\x01",
    "\x02",
    "\x03",
    "\x04",
    "\x05",
    "\x06",
    "\x07",
    "\x08",
    "\x09",
    "\x0a",
    "\x0b",
    "\x0c",
    "\x0d",
    "\x0e",
    "\x0f",
    "\x10",
    "\x11",
    "\x12",
    "\x13",
    "\x14",
    "\x15",
    "\x16",
    "\x17",
    "\x18",
    "\x19",
    "\x1a",
    "\x1b",
    "\x1c",
    "\x1d",
    "\x1e",
    "\x1f",
);

export type InvalidCommandChar = typeof INVALID_COMMAND_CHARS[number];

type WithoutChars<T extends string> = IsEqual<
    StripChars<T,InvalidCommandChar>,
    T
> extends true 
    ? T
    : never;


type InvalidChar<T extends string> = Err<
    `InvalidChar`,
    `hasProgram(${T}) received a command with invalid characters in it! The type system was designed to prevent this but if a caller puts in an illegal value we will reject it when called.`,
    { cmd: T }
>

type Rtn<T extends string> = IsNever<T> extends true
    ? InvalidChar<T>
: Contains<T, InvalidCommandChar> extends true
    ? InvalidChar<T>
: Trim<T> extends ""
    ? false
: boolean;

/**
 * Busts the `hasProgram` cache.
 */
export function hasProgram__Bust() {
    programCache = new Map<string, boolean>()
}

/**
 * **hasProgram**`(cmd)`
 *
 * Tests whether the program named `cmd` exists in the executable path
 * of the host system.
 *
 * - will return `false` (in type system and runtime) when the command name only contains
 *   whitespace or is an empty string
 * - will return a `InvalidChar` error when an invalid character is
 *   included in the name (defined by `InvalidCommandChar` type)
 * - in all other cases this function will return a `boolean` result
 *   based on whether the `cmd` was found in the executable path
 *
 * **Performance Caching:**
 *
 * Results are cached in a module-level Map to avoid repeated shell executions.
 * Both positive (program exists) and negative (program not found) results are cached.
 * The cache persists for the lifetime of the module and has no size limit or expiration.
 *
 * To bust the cache, call `hasProgram__Bust()`. This will typically NOT be
 * needed.
 */
export function hasProgram<T extends string>(cmd: T & WithoutChars<T>): Rtn<T> {
    if(asChars(cmd).some(i => INVALID_COMMAND_CHARS.includes(i as any))) {
        return err(
            "InvalidChar",
            `hasProgram(${cmd}) received a command with invalid characters in it! The type system was designed to prevent this but if a caller puts in an illegal value we will reject it when called.`,
            { cmd }
        ) as unknown as Rtn<T>
    }

    // Validate input - empty or whitespace-only strings should return false
    if (!cmd || cmd.trim() === "") {
        return false as Rtn<T> ;
    }

    // Check cache first
    if (programCache.has(cmd)) {
        return programCache.get(cmd)! as Rtn<T>;
    }

    try {
        const os = discoverOs();

        // Platform-specific command selection
        let command: string;
        if (os === "win32") {
                command = `where "${cmd}"`;
        } else {
            // Unix-like systems (darwin, linux, etc.): use 'which' command
            // Redirect stderr to suppress error output
            command = `which "${cmd}" 2>/dev/null`;
        }

        // Execute command and suppress output
        // If the command succeeds (exit code 0), the program exists
        execSync(command, { stdio: ['pipe', 'pipe', 'ignore'] });

        // Cache the positive result
        programCache.set(cmd, true);
        return true as Rtn<T>;
    } catch {
        // If execSync throws (non-zero exit code), the program doesn't exist
        // or there was an error executing the command
        // Cache the negative result
        programCache.set(cmd, false);
        return false as Rtn<T>;
    }
}
