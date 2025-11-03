
/**
 * **stripEscapeCodes**`(content)`
 * 
 * Strips all terminal escape codes from `content`, including:
 * 
 * - ANSI escape codes for colors
 * - OSC8 codes for links
 * - OSC52 codes for copying to the clipboard, etc.
 * - any other known OSC or other escape code for the detected
 * console
 */
export function stripEscapeCodes<T extends string>(content: T) {
    // TODO
}


