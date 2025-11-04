
import { detectTerminalApp, detectAppVersion } from "./detectTerminalApp";
import type { TerminalApp } from "~/types";

// Module-level cache: undefined = not yet cached, boolean | null = cached result
let cachedLinkSupport: boolean | null | undefined = undefined;

/**
 * **detectLinkSupport**()
 *
 * Detects whether the current terminal/console supports OSC8 hyperlinks.
 *
 * OSC8 is a terminal escape sequence standard that allows terminals to display
 * clickable hyperlinks. This function determines if the current terminal supports
 * this feature by identifying the terminal application and checking against a
 * known support map.
 *
 * **Supported Terminals (return `true`):**
 *
 * - iTerm2 (macOS) - Full support since v3.1 (2017)
 * - WezTerm (cross-platform) - Full support
 * - Kitty (cross-platform) - Full support
 * - Alacritty (cross-platform) - Support added in v0.13+ (Nov 2023)
 * - Ghostty (macOS/Linux) - Full support
 * - Konsole (Linux/KDE) - Full support in recent versions
 * - Windows Terminal (Windows) - Full support since v1.8+ (2022)
 *
 * **Unsupported Terminals (return `false`):**
 *
 * - Apple Terminal.app (macOS) - No support
 * - cmd.exe (Windows) - No support
 * - PowerShell (standalone, non-Windows Terminal) - No support
 * - ConEmu (Windows) - No support
 * - mintty (Git Bash, Cygwin) - No support
 *
 * **Detection Method:**
 *
 * The function uses `detectTerminalApp()` to identify the terminal application,
 * then looks up the support status in a predefined map.
 *
 * **Caching:**
 *
 * Results are cached after the first call to avoid redundant detection. The cache
 * persists for the lifetime of the process.
 *
 * @returns `Promise<boolean | null>` - Returns:
 *   - `true` if the terminal supports OSC8 hyperlinks
 *   - `false` if the terminal does not support OSC8 hyperlinks
 *   - `null` if the terminal is unknown (unable to determine support)
 *
 * @example
 * ```typescript
 * const supportsLinks = await detectLinkSupport();
 *
 * if (supportsLinks === true) {
 *   console.log("Terminal supports clickable links!");
 * } else if (supportsLinks === false) {
 *   console.log("Terminal does not support links");
 * } else {
 *   console.log("Unknown terminal - link support uncertain");
 * }
 * ```
 */
export async function detectLinkSupport(): Promise<boolean | null> {
    // Check cache first
    if (cachedLinkSupport !== undefined) {
        return cachedLinkSupport;
    }

    // Detect terminal application
    const terminal = detectTerminalApp();

    // Special handling for Alacritty: check version
    // OSC8 support added in Alacritty 0.13.0
    if (terminal === "alacritty") {
        const version = await detectAppVersion();

        if (version !== null) {
            // OSC8 added in Alacritty 0.13.0
            // version >= 0.13.0 means: major > 0 OR (major === 0 AND minor >= 13)
            const supportsOSC8 =
                version.major > 0 ||
                (version.major === 0 && version.minor >= 13);

            cachedLinkSupport = supportsOSC8;
            return supportsOSC8;
        }

        // Version unknown - fall through to optimistic map lookup
    }

    // Define support map for all other terminals
    const supportMap: Record<TerminalApp, boolean | null> = {
        "iterm2": true,
        "wezterm": true,
        "kitty": true,
        "alacritty": true,  // Optimistic default when version unavailable
        "konsole": true,
        "ghostty": true,
        "windows-terminal": true,
        "apple-terminal": false,
        "cmd": false,
        "powershell": false,
        "conemu": false,
        "mintty": false,
        "other": null  // Uncertain
    };

    // Look up terminal in support map
    const result = supportMap[terminal];

    // Cache and return result
    cachedLinkSupport = result;
    return result;
}

/**
 * **detectLinkSupport__Bust**()
 *
 * Clears the cached link support detection result. This is primarily useful
 * for testing purposes to force re-detection.
 *
 * @internal
 */
export function detectLinkSupport__Bust(): void {
    cachedLinkSupport = undefined;
}
