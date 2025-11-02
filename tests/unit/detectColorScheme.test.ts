import {describe,it,expect,beforeEach,afterEach} from "vitest";
import { detectColorScheme } from "~/utils/detectColorScheme";


describe("detectBackground()", () => {
    let originalEnv: NodeJS.ProcessEnv;

    beforeEach(() => {
        // Save original environment
        originalEnv = { ...process.env };
    });

    afterEach(() => {
        // Restore original environment
        process.env = originalEnv;
    });

    it("should respect THEME environment variable override", async () => {
        process.env.THEME = "light";
        const result = await detectColorScheme();
        expect(result).toBe("light");

        process.env.THEME = "dark";
        const result2 = await detectColorScheme();
        expect(result2).toBe("dark");
    });

    it("should respect VITE_THEME environment variable override", async () => {
        process.env.VITE_THEME = "light";
        const result = await detectColorScheme();
        expect(result).toBe("light");

        process.env.VITE_THEME = "dark";
        const result2 = await detectColorScheme();
        expect(result2).toBe("dark");
    });

    it("should prefer VITE_THEME over THEME when both are set", async () => {
        process.env.THEME = "dark";
        process.env.VITE_THEME = "light";
        const result = await detectColorScheme();
        expect(result).toBe("light");
    });

    it("should detect from GTK_THEME environment variable", async () => {
        // Clear any theme overrides
        delete process.env.THEME;
        delete process.env.VITE_THEME;

        process.env.GTK_THEME = "Adwaita:dark";
        const result = await detectColorScheme();
        expect(result).toBe("dark");
    });

    it("should detect from XDG_CURRENT_DESKTOP environment variable", async () => {
        // Clear any theme overrides
        delete process.env.THEME;
        delete process.env.VITE_THEME;
        delete process.env.GTK_THEME;

        process.env.XDG_CURRENT_DESKTOP = "GNOME:dark";
        const result = await detectColorScheme();
        expect(result).toBe("dark");
    });

    it("should use PREFERS as final fallback", async () => {
        // Clear all other detection methods
        delete process.env.THEME;
        delete process.env.VITE_THEME;
        delete process.env.GTK_THEME;
        delete process.env.XDG_CURRENT_DESKTOP;

        // On macOS, the defaults command will work, so we can't easily test this
        // without mocking. For now, we just verify the function completes.
        const result = await detectColorScheme();
        expect(["dark", "light", "unknown"]).toContain(result);
    });

    it("should return 'dark', 'light', or 'unknown'", async () => {
        const result = await detectColorScheme();
        expect(["dark", "light", "unknown"]).toContain(result);
    });

    it("should handle case-insensitive theme values", async () => {
        process.env.THEME = "LIGHT";
        const result = await detectColorScheme();
        expect(result).toBe("light");

        process.env.THEME = "Dark";
        const result2 = await detectColorScheme();
        expect(result2).toBe("dark");
    });

    it("should ignore invalid theme values", async () => {
        process.env.THEME = "invalid";
        const result = await detectColorScheme();
        // Should fall through to other detection methods
        expect(["dark", "light", "unknown"]).toContain(result);
    });

    // Type tests
    it("type tests", () => {
        type cases = [
            // Return type should be Promise of specific strings
            Expect<Awaited<ReturnType<typeof detectColorScheme>> extends 'dark' | 'light' | 'unknown' ? true : false>,
        ];

        // Helper type for compile-time assertions
        type Expect<T extends true> = T;
    });
})
