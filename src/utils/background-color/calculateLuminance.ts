
/**
 * Calculates relative luminance using WCAG standard with proper gamma correction.
 *
 * @param r - Red value (0-65535)
 * @param g - Green value (0-65535)
 * @param b - Blue value (0-65535)
 * @returns Relative luminance (0-1)
 */
export function calculateLuminance(r: number, g: number, b: number): number {
  // Convert to 0-1 range
  const rs = r / 65535;
  const gs = g / 65535;
  const bs = b / 65535;

  // Apply gamma correction (linearize sRGB values)
  const linearize = (channel: number): number => {
    return channel <= 0.03928
      ? channel / 12.92
      : Math.pow((channel + 0.055) / 1.055, 2.4);
  };

  const rLin = linearize(rs);
  const gLin = linearize(gs);
  const bLin = linearize(bs);

  // Calculate relative luminance using WCAG formula
  return 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin;
}
