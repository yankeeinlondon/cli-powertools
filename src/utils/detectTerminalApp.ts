import { hasIndexOf, indexOf, isString } from "inferred-types";
import {
    ALACRITTY_ENV,
    CMD_ENV,
    CONEMU_ENV,
    GHOSTTY_ENV,
    ITERM_ENV,
    KITTY_ENV,
    KONSOLE_ENV,
    MINTTY_ENV,
    POWERSHELL_ENV,
    TERM_PROGRAM_LOOKUP,
    WEZTERM_ENV,
    WINDOWS_TERMINAL_ENV
} from "~/constants";
import { TerminalApp } from "~/types";
import { readFileSync } from "node:fs";
import { runScript } from "./shellCommand";

/**
 * **isRunningInWSL**()
 *
 * Detects if the current process is running inside Windows Subsystem for Linux (WSL).
 *
 * WSL is an environment, not a terminal application. When running in WSL, the actual
 * terminal app (Windows Terminal, ConEmu, etc.) can still be detected normally.
 *
 * Detection methods:
 * 1. Check for `WSL_DISTRO_NAME` environment variable (most reliable)
 * 2. Check `/proc/version` for "Microsoft" or "microsoft" string (fallback for WSL1/WSL2)
 *
 * @returns `true` if running in WSL, `false` otherwise
 */
export function isRunningInWSL(): boolean {
    // Method 1: Check for WSL_DISTRO_NAME environment variable
    if (isString(process.env.WSL_DISTRO_NAME)) {
        return true;
    }

    // Method 2: Check /proc/version for Microsoft/microsoft
    try {
        const procVersion = readFileSync("/proc/version", "utf8");
        return procVersion.toLowerCase().includes("microsoft");
    } catch {
        // If we can't read /proc/version (e.g., not on Linux or permission denied),
        // we're not in WSL
        return false;
    }
}

/**
 * **detectTerminalApp**()
 *
 * Attempts to detect which terminal application is being used.
 *
 * This function works across multiple platforms including macOS, Linux, Windows,
 * and WSL (Windows Subsystem for Linux). When running in WSL, it detects the
 * actual terminal application (e.g., Windows Terminal, ConEmu) rather than
 * reporting "wsl" as the terminal.
 *
 * **Supported Terminals:**
 *
 * - **macOS/Linux:** iTerm2, Kitty, Alacritty, WezTerm, Konsole, Ghostty
 * - **Windows:** Windows Terminal, PowerShell, cmd.exe, ConEmu, mintty (Git Bash/Cygwin/MSYS2)
 * - **Cross-platform:** Terminals that set TERM_PROGRAM environment variable
 *
 * **Detection Methods:**
 *
 * The function checks environment variables in the following priority order:
 *
 * 1. **TERM_PROGRAM** - Cross-platform standard (iTerm.app, WezTerm, vscode, etc.)
 * 2. **TERM variable patterns:**
 *    - `xterm-kitty` or `kitty` → Kitty
 *    - `alacritty` → Alacritty
 *    - `iterm2` → iTerm2
 *    - `mintty` → mintty (Git Bash, Cygwin, MSYS2)
 * 3. **Terminal-specific environment variables:**
 *    - **Windows Terminal:** WT_SESSION, WT_PROFILE_ID
 *    - **PowerShell:** PSModulePath, POWERSHELL_DISTRIBUTION_CHANNEL
 *    - **ConEmu/cmder:** ConEmuDir, ConEmuBaseDir, CMDER_ROOT
 *    - **cmd.exe:** PROMPT + COMSPEC combination
 *    - **macOS/Linux terminals:** Terminal-specific env vars
 * 4. **Fallback:** Returns "other" if no terminal can be identified
 *
 * @returns {TerminalApp} The detected terminal application name, or "other" if unknown
 *
 * @example
 * ```typescript
 * const terminal = detectTerminalApp();
 * // Returns: "windows-terminal" | "powershell" | "cmd" | "iterm2" | "kitty" | ...
 * ```
 */
export function detectTerminalApp() {
    const termProgram = process.env.TERM_PROGRAM?.toLowerCase();
    const term = process.env.TERM?.toLowerCase();


    return (
        // Priority 1: TERM_PROGRAM (cross-platform standard)
        isString(termProgram) && hasIndexOf(TERM_PROGRAM_LOOKUP, termProgram)
            ? indexOf(TERM_PROGRAM_LOOKUP, termProgram)
            // Priority 2: TERM variable patterns
            : isString(term)
                ? term.includes("kitty")
                    ? "kitty"
                : term.includes("alacritty")
                    ? "alacritty"
                : term.includes("iterm2")
                    ? "iterm2"
                : term.includes("mintty")
                    ? "mintty"
                    // After TERM patterns don't match, check Windows Terminal first
                    : WINDOWS_TERMINAL_ENV.some(i => isString(process.env[i]))
                    ? "windows-terminal"
                    // Then macOS/Linux environment variables
                    : WEZTERM_ENV.some(i => isString(process.env[i]))
                    ? "wezterm"
                    : ITERM_ENV.some(i => isString(process.env[i]))
                    ? "iterm2"
                    : ALACRITTY_ENV.some(i => isString(process.env[i]))
                    ? "alacritty"
                    : KITTY_ENV.some(i => isString(process.env[i]))
                    ? "kitty"
                    : KONSOLE_ENV.some(i => isString(process.env[i]))
                    ? "konsole"
                    : GHOSTTY_ENV.some(i => isString(process.env[i]))
                    ? "ghostty"
                    // Windows-specific environment variables
                    : POWERSHELL_ENV.some(i => isString(process.env[i]))
                    ? "powershell"
                    : CONEMU_ENV.some(i => isString(process.env[i]))
                    ? "conemu"
                    : MINTTY_ENV.some(i => isString(process.env[i]))
                    ? "mintty"
                    : CMD_ENV.some(i => isString(process.env[i]))
                    ? "cmd"
                    : "other"
            // No TERM variable - check Windows Terminal first, then other Windows env vars
            : WINDOWS_TERMINAL_ENV.some(i => isString(process.env[i]))
            ? "windows-terminal"
            : POWERSHELL_ENV.some(i => isString(process.env[i]))
            ? "powershell"
            : CONEMU_ENV.some(i => isString(process.env[i]))
            ? "conemu"
            : MINTTY_ENV.some(i => isString(process.env[i]))
            ? "mintty"
            : CMD_ENV.some(i => isString(process.env[i]))
            ? "cmd"
            : "other"
    ) as unknown as TerminalApp

}

/**
 * **AppVersion** type
 *
 * Represents a parsed semantic version number.
 */
export type AppVersion = {
    major: number;
    minor: number;
    patch: number;
    toString(): string;
};

// Module-level cache: undefined = not yet cached, null = no version available
let cachedAppVersion: AppVersion | null | undefined = undefined;

/**
 * **detectAppVersion**()
 *
 * Detects the version of the current terminal application.
 *
 * **Detection Strategy:**
 *
 * 1. **Environment Variables** (checked with priority order):
 *    - Alacritty: ALACRITTY_VERSION → TERM_PROGRAM_VERSION
 *    - WezTerm: WEZTERM_VERSION → TERM_PROGRAM_VERSION
 *    - Kitty: KITTY_VERSION → TERM_PROGRAM_VERSION
 *    - iTerm2: TERM_PROGRAM_VERSION
 *    - Ghostty: TERM_PROGRAM_VERSION
 *    - Apple Terminal: TERM_PROGRAM_VERSION
 *    - Konsole: KONSOLE_VERSION → TERM_PROGRAM_VERSION
 *    - Other terminals: TERM_PROGRAM_VERSION
 *
 * 2. **Command Query Fallback** (if env vars unavailable):
 *    - Executes `<terminal> --version` or `<terminal> -v`
 *    - Supported: Alacritty, Kitty, WezTerm, Ghostty, Konsole
 *    - 1 second timeout to prevent blocking
 *
 * **Version string formats supported:**
 * - Standard: "0.13.2", "1.0.0"
 * - Prefixed: "v0.13.2"
 * - Short: "0.13" (patch defaults to 0)
 * - Pre-release: "0.13.0-dev" (metadata ignored)
 * - Build metadata: "0.13.2+git123abc" (metadata ignored)
 * - WezTerm date format: "20230712-072601-..." (parsed as major-minor)
 *
 * **Caching:**
 *
 * Results are cached after the first call to avoid redundant parsing. The cache
 * persists for the lifetime of the process. Use `detectAppVersion__Bust()` to
 * clear the cache (primarily for testing).
 *
 * @returns Version object with major, minor, patch or null if unknown
 *
 * @example
 * ```typescript
 * const version = await detectAppVersion();
 * if (version && version.major === 0 && version.minor >= 13) {
 *   console.log("Alacritty 0.13+ detected!");
 * }
 * ```
 */
export async function detectAppVersion(): Promise<AppVersion | null> {
    // Check cache
    if (cachedAppVersion !== undefined) {
        return cachedAppVersion;
    }

    const terminal = detectTerminalApp();
    let versionString: string | undefined;

    // Map terminals to their version env vars
    // Priority: Terminal-specific env var → TERM_PROGRAM_VERSION (standard fallback)
    switch (terminal) {
        case "alacritty":
            versionString = process.env.ALACRITTY_VERSION || process.env.TERM_PROGRAM_VERSION;
            break;
        case "wezterm":
            versionString = process.env.WEZTERM_VERSION || process.env.TERM_PROGRAM_VERSION;
            break;
        case "kitty":
            versionString = process.env.KITTY_VERSION || process.env.TERM_PROGRAM_VERSION;
            break;
        case "iterm2":
            versionString = process.env.TERM_PROGRAM_VERSION;
            break;
        case "ghostty":
            versionString = process.env.TERM_PROGRAM_VERSION;
            break;
        case "apple-terminal":
            versionString = process.env.TERM_PROGRAM_VERSION;
            break;
        case "konsole":
            versionString = process.env.KONSOLE_VERSION || process.env.TERM_PROGRAM_VERSION;
            break;
        default:
            // For any other terminal, try TERM_PROGRAM_VERSION as a fallback
            versionString = process.env.TERM_PROGRAM_VERSION;
    }

    // If no version string from env vars, try querying the command directly
    // (but not for "other" terminal type, since we don't know what it is)
    if (!versionString && terminal !== "other") {
        versionString = queryVersionFromCommand(terminal);
    }

    if (!versionString) {
        cachedAppVersion = null;
        return null;
    }

    // Parse version string
    const parsed = parseVersionString(versionString);
    cachedAppVersion = parsed;
    return parsed;
}

/**
 * **queryVersionFromCommand**()
 *
 * Attempts to get version information by executing the terminal command with --version flag.
 *
 * **Strategy:**
 * 1. First tries the command in PATH (e.g., `alacritty`)
 * 2. Falls back to macOS app bundle paths (e.g., `/Applications/Alacritty.app/Contents/MacOS/alacritty`)
 * 3. Checks both stdout and stderr for output (some programs like Alacritty output to stderr)
 *
 * @param terminal - The terminal application to query
 * @returns Version string from command output, or undefined if unavailable
 */
function queryVersionFromCommand(terminal: TerminalApp): string | undefined {
    // Map terminal names to their command names and version flags
    // For macOS apps, include both the command name and the app bundle path
    const commandMap: Partial<Record<TerminalApp, {
        cmd: string;
        flags: readonly string[];
        macosAppPath?: string; // Path to binary inside .app bundle
    }>> = {
        "alacritty": {
            cmd: "alacritty",
            flags: ["--version"],
            macosAppPath: "/Applications/Alacritty.app/Contents/MacOS/alacritty"
        },
        "kitty": {
            cmd: "kitty",
            flags: ["--version"],
            macosAppPath: "/Applications/kitty.app/Contents/MacOS/kitty"
        },
        "wezterm": {
            cmd: "wezterm",
            flags: ["--version"],
            macosAppPath: "/Applications/WezTerm.app/Contents/MacOS/wezterm"
        },
        "ghostty": {
            cmd: "ghostty",
            flags: ["--version"],
            macosAppPath: "/Applications/Ghostty.app/Contents/MacOS/ghostty"
        },
        "konsole": {
            cmd: "konsole",
            flags: ["--version"]
        },
    };

    const terminalInfo = commandMap[terminal];
    if (!terminalInfo) {
        return undefined;
    }

    // Build list of commands to try: PATH command first, then macOS app bundle path
    const commandsToTry: string[] = [terminalInfo.cmd];
    if (terminalInfo.macosAppPath) {
        commandsToTry.push(terminalInfo.macosAppPath);
    }

    // Try each command location with each version flag
    for (const cmd of commandsToTry) {
        for (const flag of terminalInfo.flags) {
            const result = runScript(cmd, [flag], {
                encoding: "utf8",
                timeout: 1000, // 1 second timeout
            });

            // Check if command succeeded
            // Note: Some programs (like Alacritty) output version to stderr instead of stdout
            if (result.code === 0) {
                const output = result.stdout || result.stderr;
                if (output) {
                    return output;
                }
            }
        }
    }

    return undefined;
}

/**
 * **parseVersionString**()
 *
 * Internal helper to parse semantic version strings.
 *
 * Handles various formats:
 * - "0.13.2" → {major: 0, minor: 13, patch: 2}
 * - "v0.13.2" → {major: 0, minor: 13, patch: 2}
 * - "0.13" → {major: 0, minor: 13, patch: 0}
 * - "0.13.0-dev" → {major: 0, minor: 13, patch: 0}
 * - "0.13.2+git123" → {major: 0, minor: 13, patch: 2}
 * - "250402" → {major: 25, minor: 4, patch: 2} → "25.04.2" (Konsole YYMMPP format)
 * - "25.04.2" → {major: 25, minor: 4, patch: 2} → "25.04.2" (Konsole YY.MM.PP from command)
 * - "20230712-072601-..." → {major: 20230712, minor: 72601, patch: 0} (WezTerm format)
 * - "kitty 0.43.1 created by..." → {major: 0, minor: 43, patch: 1} (extracts version from text)
 * - "465" → {major: 465, minor: 0, patch: 0} (Apple Terminal build number format)
 *
 * @param version - Version string to parse
 * @returns Parsed version object or null if malformed
 */
function parseVersionString(version: string): AppVersion | null {
    // Try to match standard semantic version anywhere in the string
    // This handles cases like "kitty 0.43.1 created by Kovid Goyal"
    // Pattern: optional 'v', then digits.digits.digits (optional)
    // Everything after - or + is metadata (ignored)
    let match = version.match(/v?(\d+)\.(\d+)(?:\.(\d+))?(?:[-+]|\s|$)/);

    if (match) {
        const major = parseInt(match[1], 10);
        const minor = parseInt(match[2], 10);
        const patch = parseInt(match[3] || "0", 10);

        // Preserve leading zeros for date-based versions (like Konsole's YY.MM.patch format)
        // Check if minor or patch had leading zeros in the original string
        const minorStr = match[2];
        const patchStr = match[3] || "0";
        const hasLeadingZeros = minorStr.startsWith('0') || patchStr.startsWith('0');

        return {
            major,
            minor,
            patch,
            toString() {
                // For date-based formats, preserve leading zeros
                if (hasLeadingZeros && major < 100) {
                    // Likely a YY.MM.patch format (like Konsole 25.04.2)
                    return `${major}.${minorStr}.${patch}`;
                }
                return `${major}.${minor}.${patch}`;
            }
        };
    }

    // Try to match Konsole's YYMMPP format (e.g., "250402" → 25.04.2)
    // This is a 6-digit format: YY (year), MM (month), PP (patch)
    match = version.match(/^(\d{2})(\d{2})(\d{2})$/);

    if (match) {
        const major = parseInt(match[1], 10);
        const minorStr = match[2];  // Keep as string to preserve leading zero
        const minor = parseInt(match[2], 10);
        const patch = parseInt(match[3], 10);

        return {
            major,
            minor,
            patch,
            toString() {
                // Preserve the MM format with leading zero
                return `${major}.${minorStr}.${patch}`;
            }
        };
    }

    // Try to match WezTerm's date-based format: YYYYMMDD-HHMMSS-...
    match = version.match(/(\d{8})-(\d{6})/);

    if (match) {
        const major = parseInt(match[1], 10);
        const minor = parseInt(match[2], 10);

        return {
            major,
            minor,
            patch: 0,
            toString() {
                return `${major}.${minor}.0`
            }
        };
    }

    // Try to match single build number (e.g., Apple Terminal's "465")
    match = version.match(/^(\d+)$/);

    if (match) {
        const major = parseInt(match[1], 10);

        return {
            major,
            minor: 0,
            patch: 0,
            toString() {
                return `${major}.0.0`
            }
        };
    }

    return null;
}


/**
 * **detectAppVersion__Bust**()
 *
 * Clears the cached app version detection result. This is primarily useful
 * for testing purposes to force re-detection.
 *
 * @internal
 */
export function detectAppVersion__Bust(): void {
    cachedAppVersion = undefined;
}
