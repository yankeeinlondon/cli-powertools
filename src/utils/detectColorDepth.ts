import { ColorDepth } from "~/types";

/**
 * Cache for OSC query results to avoid repeated terminal queries
 */
let cachedColorDepth: ColorDepth | null = null;

/**
 * Queries terminal for color depth capability using OSC sequences.
 * Tests palette color support by querying high indexes.
 *
 * @param timeout Maximum time to wait for response in milliseconds
 * @returns Detected ColorDepth or null if query fails/times out
 */
async function queryColorDepthCapability(timeout = 100): Promise<ColorDepth | null> {
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

            // Check if we have a complete response (ends with BEL or ST)
            if (response.includes('\x07') || response.includes('\x1b\\')) {
                cleanup();

                // If terminal responded with RGB values, it supports at least 256 colors
                // A more sophisticated check would parse the response, but for color depth
                // detection, the ability to respond indicates modern terminal capabilities
                if (response.match(/rgb:[0-9a-fA-F]+\/[0-9a-fA-F]+\/[0-9a-fA-F]+/)) {
                    // If terminal can query high palette indexes (255), it supports 256+ colors
                    // Most terminals that support OSC queries support truecolor
                    resolve(16700000);
                } else {
                    resolve(null);
                }
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

            // Query palette color 255 (highest in 256-color palette)
            // Format: OSC 4 ; <index> ; ? BEL
            process.stdout.write('\x1b]4;255;?\x07');
        } catch (error) {
            cleanup();
            resolve(null);
        }
    });
}

/**
 * **detectColorDepth**`()`
 *
 * Attempts to detect how many colors the console/terminal supports.
 *
 * Detection priority order:
 * 1. COLORTERM environment variable ('truecolor' or '24bit')
 * 2. TERM environment variable (parsing for color depth hints)
 * 3. OSC query to actively probe terminal capabilities (cached)
 * 4. Default fallback (256 colors)
 *
 * @returns A Promise that resolves to the detected ColorDepth (8, 16, 256, or 16700000)
 */
export async function detectColorDepth(): Promise<ColorDepth> {
    // Priority 1: Check COLORTERM environment variable
    const colorterm = process.env.COLORTERM?.trim().toLowerCase();
    if (colorterm === "truecolor" || colorterm === "24bit") {
        return 16700000;
    }

    // Priority 2: Parse TERM environment variable
    const term = process.env.TERM?.trim().toLowerCase();
    if (term) {
        // Check for 256 color support
        if (term.includes("256color")) {
            return 256;
        }

        // Check for 16 color support
        if (term.includes("16color")) {
            return 16;
        }

        // Check for basic 8 color support (xterm-color is 8, not 16)
        if (term === "linux" || term === "xterm-color") {
            return 8;
        }

        // Check for generic "color" terminals (8 colors)
        if (term.endsWith("color") && !term.includes("xterm")) {
            return 8;
        }

        // Check for xterm variants (base xterm is 16 colors)
        if (term === "xterm" || term.startsWith("xterm-")) {
            return 16;
        }
    }

    // Priority 3: Try OSC query (cached)
    if (cachedColorDepth !== null) {
        return cachedColorDepth;
    }

    const oscResult = await queryColorDepthCapability();
    if (oscResult !== null) {
        cachedColorDepth = oscResult;
        return oscResult;
    }

    // Priority 4: Default fallback (optimistic modern default)
    return 256;
}
