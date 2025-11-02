import { queryWithSequence } from "./queryWithSequence";

/**
 * Queries the terminal for its background color using OSC sequences.
 * Tries OSC 11 first (standard), then OSC 4;-2 (iTerm2 extension).
 *
 * @param timeout - Maximum time to wait for response in milliseconds (default: 100ms)
 * @returns RGB values if successful, null otherwise
 */
export async function queryTerminalColor(timeout = 100): Promise<{r: number, g: number, b: number} | null> {
  // Only works in TTY environments
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    return null;
  }

  // Try both OSC sequences
  const sequences = [
    '\x1b]11;?\x1b\\',  // OSC 11 (standard xterm)
    '\x1b]4;-2;?\x1b\\' // OSC 4;-2 (iTerm2 extension)
  ];

  for (const sequence of sequences) {
    try {
      const result = await queryWithSequence(sequence, timeout);
      if (result) {
        return result;
      }
    } catch {
      // Continue to next sequence
    }
  }

  return null;
}
