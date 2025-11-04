
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
export function stripEscapeCodes<T extends string>(content: T): string {
    return content
        // CSI sequences: ESC [ ... (ending with a letter)
        // This includes SGR (colors, bold, etc.), cursor movement, clear screen, etc.
        // Pattern: ESC [ followed by zero or more parameter bytes (0x30-0x3F)
        // and intermediate bytes (0x20-0x2F), ending with a final byte (0x40-0x7E)
        .replace(/\x1b\[[0-9;?]*[a-zA-Z]/g, '')

        // OSC sequences: ESC ] ... (ending with BEL or ST)
        // This includes hyperlinks (OSC 8), clipboard (OSC 52), window title (OSC 0/1/2), etc.
        // Pattern: ESC ] followed by any characters until BEL (\x07) or ST (ESC \)
        .replace(/\x1b\][^\x07\x1b]*(?:\x07|\x1b\\)/g, '')

        // DSC sequences (Device Control String): ESC _ ... ST
        // Used by Kitty graphics protocol and others
        .replace(/\x1b_[^\x1b]*\x1b\\/g, '')

        // Single character escape sequences (common ones)
        // ESC c (RIS - Reset to Initial State)
        .replace(/\x1bc/g, '')
        // ESC 7 (DECSC - Save Cursor)
        .replace(/\x1b7/g, '')
        // ESC 8 (DECRC - Restore Cursor)
        .replace(/\x1b8/g, '')
        // ESC M (RI - Reverse Index)
        .replace(/\x1bM/g, '')

        // Other control characters that might be present
        // Backspace (\x08), but preserve it in case it's intentional
        // Bell (\x07) - already handled by OSC terminator matching
        // We'll leave backspace and other control chars as they might be intentional
        ;
}


