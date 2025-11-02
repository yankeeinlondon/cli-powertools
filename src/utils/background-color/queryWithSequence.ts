import { parseOSCResponse } from "./parseOSCResponse";

/**
 * Queries terminal with a specific OSC sequence.
 */
export function queryWithSequence(sequence: string, timeout: number): Promise<{r: number, g: number, b: number} | null> {
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
        const parsed = parseOSCResponse(response);
        resolve(parsed);
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

      // Send the query
      process.stdout.write(sequence);
    } catch (error) {
      cleanup();
      resolve(null);
    }
  });
}
