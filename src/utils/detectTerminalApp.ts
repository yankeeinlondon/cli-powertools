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
