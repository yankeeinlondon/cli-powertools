/**
 * Cache for OSC query results to avoid repeated terminal queries
 */
let cachedWidth: number | null = null;

/**
 * Queries terminal for width using OSC sequences.
 * Sends terminal size query and parses response.
 *
 * @param timeout Maximum time to wait for response in milliseconds
 * @returns Detected width or null if query fails/times out
 */
async function queryTerminalWidth(timeout = 100): Promise<number | null> {
    // Only works in TTY environments
    if (!process.stdin.isTTY || !process.stdout.isTTY) {
        return null;
    }

    return new Promise((resolve) => {
        let response = '';
        let timeoutId: NodeJS.Timeout;
        let originalRawMode: boolean | undefined;

        const cleanup = () => {
            clearTimeout(timeoutId);
            if (originalRawMode !== undefined && process.stdin.isTTY) {
                try {
                    process.stdin.setRawMode(originalRawMode);
                } catch {
                    // Ignore errors during cleanup
                }
            }
            process.stdin.removeListener('data', onData);
            process.stdin.pause();
        };

        const onData = (chunk: Buffer) => {
            response += chunk.toString();

            // Check for terminal size response: ESC[8;{rows};{columns}t
            const sizeMatch = response.match(/\x1b\[8;(\d+);(\d+)t/);
            if (sizeMatch) {
                cleanup();
                const columns = parseInt(sizeMatch[2], 10);
                if (!isNaN(columns) && columns > 0) {
                    resolve(columns);
                } else {
                    resolve(null);
                }
                return;
            }

            // Check for cursor position response: ESC[{row};{col}R
            // This is an alternative response if terminal doesn't support ESC[18t
            const cprMatch = response.match(/\x1b\[(\d+);(\d+)R/);
            if (cprMatch) {
                cleanup();
                const columns = parseInt(cprMatch[2], 10);
                if (!isNaN(columns) && columns > 0) {
                    resolve(columns);
                } else {
                    resolve(null);
                }
                return;
            }
        };

        try {
            // Save current mode and set to raw
            originalRawMode = (process.stdin as any).isRaw;
            process.stdin.setRawMode(true);
            process.stdin.resume();
            process.stdin.on('data', onData);

            // Set timeout
            timeoutId = setTimeout(() => {
                cleanup();
                resolve(null);
            }, timeout);

            // Query terminal size in characters
            // ESC[18t requests terminal size
            process.stdout.write('\x1b[18t');
        } catch (error) {
            cleanup();
            resolve(null);
        }
    });
}

/**
 * **detectAvailableWidth**`([fallback = 80])`
 *
 * Attempts to detect the available character width that the terminal/console currently has.
 *
 * This function provides reliable terminal width detection across platforms by trying multiple
 * detection methods in priority order, falling back gracefully when detection is not possible.
 *
 * **Detection Priority Order:**
 *
 * 1. **COLUMNS environment variable** - Standard Unix convention, validated as positive integer
 * 2. **process.stdout.columns** - Node.js property, typically available in TTY environments
 * 3. **OSC query** - Actively probes terminal using escape sequences (cached, TTY only)
 * 4. **Fallback parameter** - User-provided or default value (80)
 *
 * **TTY vs Non-TTY Behavior:**
 *
 * - **TTY environments** (interactive terminals): All detection methods available, including OSC queries
 * - **Non-TTY environments** (pipes, redirects, CI/CD): Skips OSC queries, relies on environment variables and fallback
 * - OSC queries are cached after first successful detection to avoid repeated terminal probing
 *
 * **Cross-Platform Compatibility:**
 *
 * - **macOS/Linux**: Full support for all detection methods
 * - **Windows**: Works with Command Prompt, PowerShell, Windows Terminal, Git Bash
 * - **CI/CD**: Gracefully falls back to environment variables or default in automated environments
 * - **Terminal multiplexers** (tmux/screen): OSC queries provide accurate detection after terminal resize
 *
 * @param fallback - The fallback width to use if all detection methods fail (default: 80).
 *   Can be a literal number, number variable, or const-asserted value.
 * @returns A Promise that resolves to the detected terminal width as a positive integer.
 *   The width is always Math.floor'd to ensure integer values.
 *
 * @example
 * Basic usage with default fallback:
 * ```ts
 * const width = await detectAvailableWidth();
 * console.log(`Terminal width: ${width} columns`); // e.g., "Terminal width: 120 columns"
 * ```
 *
 * @example
 * Custom fallback for narrow terminal preference:
 * ```ts
 * const width = await detectAvailableWidth(60);
 * // Returns detected width, or 60 if detection fails
 * ```
 *
 * @example
 * Responsive CLI formatting:
 * ```ts
 * const width = await detectAvailableWidth(80);
 * const isNarrow = width < 100;
 * const isWide = width >= 120;
 *
 * if (isNarrow) {
 *   // Use compact formatting
 * } else if (isWide) {
 *   // Use expanded formatting with more columns
 * }
 * ```
 *
 * @example
 * Integration with formatting utilities:
 * ```ts
 * async function formatTable(data: any[]) {
 *   const terminalWidth = await detectAvailableWidth(80);
 *   const columnWidth = Math.floor(terminalWidth / 4);
 *   // Format table based on available width
 * }
 * ```
 */
export async function detectAvailableWidth<T extends number>(fallback: T = 80 as T): Promise<number> {
    // Priority 1: Check COLUMNS environment variable
    const columnsEnv = process.env.COLUMNS;
    if (columnsEnv !== undefined) {
        // Trim whitespace
        const trimmed = columnsEnv.trim();

        // Parse as number
        const parsed = Number(trimmed);

        // Validate: must be a valid number, positive, and finite
        if (!isNaN(parsed) && isFinite(parsed) && parsed > 0) {
            // Truncate to integer (handle floating point)
            return Math.floor(parsed);
        }
    }

    // Priority 2: Check process.stdout.columns
    // Note: typically only available in TTY, but check value directly
    if (process.stdout.columns !== undefined) {
        const columns = process.stdout.columns;

        // Validate: must be a valid number and positive
        if (typeof columns === "number" && !isNaN(columns) && columns > 0) {
            return Math.floor(columns);
        }
    }

    // Priority 3: Try OSC query (cached)
    if (cachedWidth !== null) {
        return cachedWidth;
    }

    const oscResult = await queryTerminalWidth();
    if (oscResult !== null) {
        cachedWidth = oscResult;
        return oscResult;
    }

    // Priority 4: Return fallback
    return fallback;
}
