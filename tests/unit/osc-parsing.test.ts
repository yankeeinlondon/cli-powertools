import {describe,it,expect} from "vitest";
import { parseOSCResponse, calculateLuminance, isLightColor } from "~/utils/background-color";

describe("OSC Response Parsing", () => {
  it("should parse 4-digit hex RGB values", () => {
    const response = "\x1b]11;rgb:0000/0000/0000\x07";
    const result = parseOSCResponse(response);
    expect(result).toEqual({ r: 0, g: 0, b: 0 });
  });

  it("should parse 4-digit hex RGB with BEL terminator", () => {
    const response = "\x1b]11;rgb:ffff/ffff/ffff\x07";
    const result = parseOSCResponse(response);
    expect(result).toEqual({ r: 0xffff, g: 0xffff, b: 0xffff });
  });

  it("should parse 4-digit hex RGB with ST terminator", () => {
    const response = "\x1b]11;rgb:8000/8000/8000\x1b\\";
    const result = parseOSCResponse(response);
    expect(result).toEqual({ r: 0x8000, g: 0x8000, b: 0x8000 });
  });

  it("should parse 2-digit hex RGB values", () => {
    const response = "\x1b]11;rgb:00/00/00\x07";
    const result = parseOSCResponse(response);
    expect(result).toEqual({ r: 0, g: 0, b: 0 });
  });

  it("should parse 2-digit hex RGB with max values", () => {
    const response = "\x1b]11;rgb:ff/ff/ff\x07";
    const result = parseOSCResponse(response);
    // FF should be normalized to FFFF (255 * 0x101 = 65535)
    expect(result).toEqual({ r: 0xffff, g: 0xffff, b: 0xffff });
  });

  it("should handle mixed case hex values", () => {
    const response = "\x1b]11;rgb:AbCd/EfF0/1234\x07";
    const result = parseOSCResponse(response);
    expect(result).toEqual({ r: 0xabcd, g: 0xeff0, b: 0x1234 });
  });

  it("should return null for invalid format", () => {
    const response = "\x1b]11;invalid\x07";
    const result = parseOSCResponse(response);
    expect(result).toBeNull();
  });

  it("should return null for missing rgb prefix", () => {
    const response = "\x1b]11;0000/0000/0000\x07";
    const result = parseOSCResponse(response);
    expect(result).toBeNull();
  });

  it("should parse real iTerm2 dark theme response", () => {
    const response = "\x1b]11;rgb:1d1d/1f1f/2121\x07";
    const result = parseOSCResponse(response);
    expect(result).not.toBeNull();
    expect(result?.r).toBe(0x1d1d);
    expect(result?.g).toBe(0x1f1f);
    expect(result?.b).toBe(0x2121);
  });

  it("should parse real xterm light theme response", () => {
    const response = "\x1b]11;rgb:ffff/ffff/ffff\x1b\\";
    const result = parseOSCResponse(response);
    expect(result).toEqual({ r: 0xffff, g: 0xffff, b: 0xffff });
  });
});

describe("Luminance Calculation", () => {
  it("should calculate luminance for pure black", () => {
    const luminance = calculateLuminance(0, 0, 0);
    expect(luminance).toBe(0);
  });

  it("should calculate luminance for pure white", () => {
    const luminance = calculateLuminance(0xffff, 0xffff, 0xffff);
    expect(luminance).toBeCloseTo(1, 5);
  });

  it("should calculate luminance for mid gray", () => {
    const luminance = calculateLuminance(0x8000, 0x8000, 0x8000);
    // Mid gray should be around 0.21 due to gamma correction
    expect(luminance).toBeGreaterThan(0.15);
    expect(luminance).toBeLessThan(0.25);
  });

  it("should give more weight to green channel", () => {
    // Pure green should have higher luminance than pure red or blue
    const greenLuminance = calculateLuminance(0, 0xffff, 0);
    const redLuminance = calculateLuminance(0xffff, 0, 0);
    const blueLuminance = calculateLuminance(0, 0, 0xffff);

    expect(greenLuminance).toBeGreaterThan(redLuminance);
    expect(greenLuminance).toBeGreaterThan(blueLuminance);
    expect(redLuminance).toBeGreaterThan(blueLuminance);
  });
});

describe("Light/Dark Determination", () => {
  it("should classify pure black as dark", () => {
    const result = isLightColor(0, 0, 0);
    expect(result).toBe("dark");
  });

  it("should classify pure white as light", () => {
    const result = isLightColor(0xffff, 0xffff, 0xffff);
    expect(result).toBe("light");
  });

  it("should classify mid gray as dark", () => {
    // Mid gray has luminance ~0.21, which is < 0.5, so it's dark
    const result = isLightColor(0x8000, 0x8000, 0x8000);
    expect(result).toBe("dark");
  });

  it("should classify common dark theme background as dark", () => {
    // Common dark theme: rgb(29, 31, 33) -> rgb:1d1d/1f1f/2121
    const result = isLightColor(0x1d1d, 0x1f1f, 0x2121);
    expect(result).toBe("dark");
  });

  it("should classify common light theme background as light", () => {
    // Common light theme: rgb(255, 255, 255)
    const result = isLightColor(0xffff, 0xffff, 0xffff);
    expect(result).toBe("light");
  });

  it("should classify light gray as light", () => {
    // Light gray: rgb(200, 200, 200) normalized to 16-bit
    const normalized = Math.round((200 / 255) * 0xffff);
    const result = isLightColor(normalized, normalized, normalized);
    expect(result).toBe("light");
  });

  // Type tests
  it("type tests", () => {
    type cases = [
      // parseOSCResponse should return object with r,g,b or null
      Expect<ReturnType<typeof parseOSCResponse> extends {r: number, g: number, b: number} | null ? true : false>,
      // calculateLuminance should return number
      Expect<ReturnType<typeof calculateLuminance> extends number ? true : false>,
      // isLightColor should return 'light' or 'dark'
      Expect<ReturnType<typeof isLightColor> extends 'light' | 'dark' ? true : false>,
    ];

    type Expect<T extends true> = T;
  });
});
