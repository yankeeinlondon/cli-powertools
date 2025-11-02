/**
 * Parses an OSC response to extract RGB values.
 * Handles formats like: rgb:RRRR/GGGG/BBBB or rgb:RR/GG/BB
 * Terminators can be BEL (\x07) or ST (\x1b\\)
 */
export function parseOSCResponse(response: string): {r: number, g: number, b: number} | null {
  // Match OSC response format: rgb:HHHH/HHHH/HHHH
  const match = response.match(/rgb:([0-9a-fA-F]+)\/([0-9a-fA-F]+)\/([0-9a-fA-F]+)/);

  if (!match) {
    return null;
  }

  const [, rHex, gHex, bHex] = match;

  // Normalize to 16-bit values (0-65535)
  // If 2 digits: multiply by 0x101 (e.g., FF -> FFFF)
  // If 4 digits: use as-is
  const normalize = (hex: string): number => {
    if (hex.length === 2) {
      return parseInt(hex, 16) * 0x101;
    } else if (hex.length === 4) {
      return parseInt(hex, 16);
    } else {
      // Handle 3 or other digit counts by scaling
      const value = parseInt(hex, 16);
      const maxValue = Math.pow(16, hex.length) - 1;
      return Math.round((value / maxValue) * 0xFFFF);
    }
  };

  return {
    r: normalize(rHex),
    g: normalize(gHex),
    b: normalize(bHex)
  };
}
