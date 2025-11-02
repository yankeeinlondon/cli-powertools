import { calculateLuminance } from "./calculateLuminance";

/**
 * Determines if a color is light or dark based on its luminance.
 *
 * @param r - Red value (0-65535)
 * @param g - Green value (0-65535)
 * @param b - Blue value (0-65535)
 * @returns 'light' if luminance > 0.5, 'dark' otherwise
 */
export function isLightColor(r: number, g: number, b: number): 'light' | 'dark' {
  const luminance = calculateLuminance(r, g, b);
  return luminance > 0.5 ? 'light' : 'dark';
}
