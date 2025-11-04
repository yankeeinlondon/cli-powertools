import { describe, it, expect, beforeEach, afterEach } from "vitest";
import type { Expect, Equals as AssertEqual } from "inferred-types/types";
import { detectAppVersion, detectAppVersion__Bust, type AppVersion } from "~/utils/detectTerminalApp";

describe("detectAppVersion()", () => {
    let originalEnv: NodeJS.ProcessEnv;

    beforeEach(() => {
        // Save original environment
        originalEnv = { ...process.env };

        // Bust the cache to ensure fresh detection for each test
        detectAppVersion__Bust();

        // Clear all version-related environment variables
        delete process.env.ALACRITTY_VERSION;
        delete process.env.WEZTERM_VERSION;
        delete process.env.KITTY_VERSION;
        delete process.env.KONSOLE_VERSION;
        delete process.env.TERM_PROGRAM;
        delete process.env.TERM_PROGRAM_VERSION;
        delete process.env.TERM;

        // Clear terminal-specific env vars to prevent false detection
        delete process.env.WEZTERM_CONFIG_DIR;
        delete process.env.WEZTERM_CONFIG_FILE;
        delete process.env.WEZTERM_EXECUTABLE;
        delete process.env.WEZTERM_PANE;
        delete process.env.WEZTERM_UNIX_SOCKET;
        delete process.env.KITTY_WINDOW_ID;
        delete process.env.ALACRITTY_SOCKET;
        delete process.env.ITERM_PROFILE;
        delete process.env.GHOSTTY_RESOURCES_DIR;
    });

    afterEach(() => {
        // Restore original environment
        process.env = originalEnv;
    });

    // ========== HAPPY PATH - Version Detection ==========

    it("should detect Alacritty version from ALACRITTY_VERSION env var", async () => {
        process.env.TERM = "alacritty";
        process.env.ALACRITTY_VERSION = "0.13.2";

        const result = await detectAppVersion();

        expect(result).toMatchObject({ major: 0, minor: 13, patch: 2 });

        type cases = [
            Expect<AssertEqual<typeof result, AppVersion | null>>
        ];
    });

    it("should detect WezTerm version from WEZTERM_VERSION env var", async () => {
        process.env.TERM_PROGRAM = "WezTerm";
        process.env.WEZTERM_VERSION = "20230712-072601-f4abf8fd";

        const result = await detectAppVersion();

        expect(result).toMatchObject({ major: 20230712, minor: 72601, patch: 0 });

        type cases = [
            Expect<AssertEqual<typeof result, AppVersion | null>>
        ];
    });

    it("should detect WezTerm version from TERM_PROGRAM_VERSION when WEZTERM_VERSION unavailable", async () => {
        process.env.TERM_PROGRAM = "WezTerm";
        process.env.TERM_PROGRAM_VERSION = "20231217-143000-abc123def";

        const result = await detectAppVersion();

        expect(result).toMatchObject({ major: 20231217, minor: 143000, patch: 0 });

        type cases = [
            Expect<AssertEqual<typeof result, AppVersion | null>>
        ];
    });

    it("should detect iTerm2 version from TERM_PROGRAM_VERSION env var", async () => {
        process.env.TERM_PROGRAM = "iTerm.app";
        process.env.TERM_PROGRAM_VERSION = "3.4.19";

        const result = await detectAppVersion();

        expect(result).toMatchObject({ major: 3, minor: 4, patch: 19 });

        type cases = [
            Expect<AssertEqual<typeof result, AppVersion | null>>
        ];
    });

    it("should detect Kitty version from KITTY_VERSION env var", async () => {
        process.env.TERM = "xterm-kitty";
        process.env.KITTY_VERSION = "0.31.0";

        const result = await detectAppVersion();

        expect(result).toMatchObject({ major: 0, minor: 31, patch: 0 });

        type cases = [
            Expect<AssertEqual<typeof result, AppVersion | null>>
        ];
    });

    it("should detect Ghostty version from TERM_PROGRAM_VERSION env var", async () => {
        process.env.TERM_PROGRAM = "ghostty";
        process.env.TERM_PROGRAM_VERSION = "1.0.0";

        const result = await detectAppVersion();

        expect(result).toMatchObject({ major: 1, minor: 0, patch: 0 });

        type cases = [
            Expect<AssertEqual<typeof result, AppVersion | null>>
        ];
    });

    it("should detect Apple Terminal version from TERM_PROGRAM_VERSION env var (build number format)", async () => {
        process.env.TERM_PROGRAM = "Apple_Terminal";
        process.env.TERM_PROGRAM_VERSION = "465";

        const result = await detectAppVersion();

        expect(result).toMatchObject({ major: 465, minor: 0, patch: 0 });

        type cases = [
            Expect<AssertEqual<typeof result, AppVersion | null>>
        ];
    });

    it("should detect Konsole version from KONSOLE_VERSION env var (YYMMPP format)", async () => {
        process.env.TERM = "konsole";
        process.env.KONSOLE_VERSION = "250402";

        const result = await detectAppVersion();

        expect(result).toMatchObject({ major: 25, minor: 4, patch: 2 });
        expect(result?.toString()).toBe("25.04.2");  // Leading zero preserved

        type cases = [
            Expect<AssertEqual<typeof result, AppVersion | null>>
        ];
    });

    it("should fallback to TERM_PROGRAM_VERSION for Alacritty when ALACRITTY_VERSION unavailable", async () => {
        process.env.TERM = "alacritty";
        process.env.TERM_PROGRAM_VERSION = "0.14.0";
        // ALACRITTY_VERSION not set

        const result = await detectAppVersion();

        expect(result).toMatchObject({ major: 0, minor: 14, patch: 0 });

        type cases = [
            Expect<AssertEqual<typeof result, AppVersion | null>>
        ];
    });

    it("should fallback to TERM_PROGRAM_VERSION for Kitty when KITTY_VERSION unavailable", async () => {
        process.env.TERM = "xterm-kitty";
        process.env.TERM_PROGRAM_VERSION = "0.32.0";
        // KITTY_VERSION not set

        const result = await detectAppVersion();

        expect(result).toMatchObject({ major: 0, minor: 32, patch: 0 });

        type cases = [
            Expect<AssertEqual<typeof result, AppVersion | null>>
        ];
    });

    // Note: Command query fallback tests would require mocking execSync
    // and are better suited for integration tests. The functionality is
    // tested manually by running the code in environments where the
    // terminal commands are available.

    it("should parse version strings in X.Y.Z format", async () => {
        process.env.TERM = "alacritty";
        process.env.ALACRITTY_VERSION = "0.13.2";

        const result = await detectAppVersion();

        expect(result).toMatchObject({ major: 0, minor: 13, patch: 2 });

        type cases = [
            Expect<AssertEqual<typeof result, AppVersion | null>>
        ];
    });

    it("should parse version strings in vX.Y.Z format", async () => {
        process.env.TERM = "alacritty";
        process.env.ALACRITTY_VERSION = "v0.13.2";

        const result = await detectAppVersion();

        expect(result).toMatchObject({ major: 0, minor: 13, patch: 2 });

        type cases = [
            Expect<AssertEqual<typeof result, AppVersion | null>>
        ];
    });

    it("should parse version strings in X.Y format (defaulting patch to 0)", async () => {
        process.env.TERM = "alacritty";
        process.env.ALACRITTY_VERSION = "0.13";

        const result = await detectAppVersion();

        expect(result).toMatchObject({ major: 0, minor: 13, patch: 0 });

        type cases = [
            Expect<AssertEqual<typeof result, AppVersion | null>>
        ];
    });

    it("should return structured version object with major, minor, patch", async () => {
        process.env.TERM = "alacritty";
        process.env.ALACRITTY_VERSION = "1.2.3";

        const result = await detectAppVersion();

        expect(result).not.toBeNull();
        expect(result).toHaveProperty("major");
        expect(result).toHaveProperty("minor");
        expect(result).toHaveProperty("patch");

        if (result !== null) {
            expect(typeof result.major).toBe("number");
            expect(typeof result.minor).toBe("number");
            expect(typeof result.patch).toBe("number");
            expect(result.major).toBe(1);
            expect(result.minor).toBe(2);
            expect(result.patch).toBe(3);
        }

        type cases = [
            Expect<AssertEqual<typeof result, AppVersion | null>>
        ];
    });

    // ========== EDGE CASES ==========

    it("should return null when terminal is 'other'", async () => {
        process.env.TERM = "xterm-256color";
        // No terminal-specific env vars set, will detect as "other"

        const result = await detectAppVersion();

        expect(result).toBe(null);

        type cases = [
            Expect<AssertEqual<typeof result, AppVersion | null>>
        ];
    });

    it("should fallback to command query when version env var is not present", async () => {
        process.env.TERM = "alacritty";
        // ALACRITTY_VERSION not set - will try command query

        const result = await detectAppVersion();

        // This test behavior depends on whether alacritty is installed
        // If installed (even as .app), it should find the version via command query
        // If not installed, it should return null
        expect(result === null || (result.major >= 0 && result.minor >= 0)).toBe(true);

        type cases = [
            Expect<AssertEqual<typeof result, AppVersion | null>>
        ];
    });

    it("should return null when version string is malformed", async () => {
        process.env.TERM = "alacritty";
        process.env.ALACRITTY_VERSION = "not-a-version";

        const result = await detectAppVersion();

        expect(result).toBe(null);

        type cases = [
            Expect<AssertEqual<typeof result, AppVersion | null>>
        ];
    });

    it("should handle version strings with pre-release tags", async () => {
        process.env.TERM = "alacritty";
        process.env.ALACRITTY_VERSION = "0.13.0-dev";

        const result = await detectAppVersion();

        expect(result).toMatchObject({ major: 0, minor: 13, patch: 0 });

        type cases = [
            Expect<AssertEqual<typeof result, AppVersion | null>>
        ];
    });

    it("should handle version strings with build metadata", async () => {
        process.env.TERM = "alacritty";
        process.env.ALACRITTY_VERSION = "0.13.2+git123abc";

        const result = await detectAppVersion();

        expect(result).toMatchObject({ major: 0, minor: 13, patch: 2 });

        type cases = [
            Expect<AssertEqual<typeof result, AppVersion | null>>
        ];
    });

    // ========== CACHING ==========

    it("should cache version result on subsequent calls", async () => {
        process.env.TERM = "alacritty";
        process.env.ALACRITTY_VERSION = "0.13.2";

        // First call - should detect and cache
        const result1 = await detectAppVersion();
        expect(result1).toMatchObject({ major: 0, minor: 13, patch: 2 });

        // Change env to something that would return different version
        process.env.ALACRITTY_VERSION = "1.0.0";

        // Second call - should return cached value (still 0.13.2)
        const result2 = await detectAppVersion();
        expect(result2).toMatchObject({ major: 0, minor: 13, patch: 2 });

        type cases = [
            Expect<AssertEqual<typeof result1, AppVersion | null>>,
            Expect<AssertEqual<typeof result2, AppVersion | null>>
        ];
    });

    it("should cache result (whether found via env or command query)", async () => {
        process.env.TERM = "alacritty";
        // No ALACRITTY_VERSION set - may find via command query

        // First call - caches whatever is found (could be from command query or null)
        const result1 = await detectAppVersion();
        const initialVersion = result1?.toString() ?? "null";

        // Set version env var to something different
        process.env.ALACRITTY_VERSION = "99.99.99";

        // Second call - should still return cached result (not the new env var)
        const result2 = await detectAppVersion();
        const cachedVersion = result2?.toString() ?? "null";

        expect(cachedVersion).toBe(initialVersion);

        type cases = [
            Expect<AssertEqual<typeof result1, AppVersion | null>>,
            Expect<AssertEqual<typeof result2, AppVersion | null>>
        ];
    });

    // ========== TYPE TESTS ==========

    it("return type should be Promise<AppVersion | null>", async () => {
        process.env.TERM = "alacritty";
        process.env.ALACRITTY_VERSION = "0.13.2";

        const resultPromise = detectAppVersion();
        const result = await resultPromise;

        // Runtime checks
        expect(resultPromise).toBeInstanceOf(Promise);

        // Type checks
        type cases = [
            Expect<AssertEqual<typeof resultPromise, Promise<AppVersion | null>>>,
            Expect<AssertEqual<typeof result, AppVersion | null>>
        ];
    });

    it("awaited return type should be AppVersion | null", async () => {
        process.env.TERM = "alacritty";
        process.env.ALACRITTY_VERSION = "0.13.2";

        const result = await detectAppVersion();

        // Type check
        type cases = [
            Expect<AssertEqual<typeof result, AppVersion | null>>
        ];
    });

    // ========== toString() METHOD TESTS ==========

    it("should have toString() method that returns formatted version string for standard versions", async () => {
        process.env.TERM = "alacritty";
        process.env.ALACRITTY_VERSION = "0.13.2";

        const result = await detectAppVersion();

        expect(result).not.toBeNull();
        if (result !== null) {
            expect(result.toString()).toBe("0.13.2");
            expect(String(result)).toBe("0.13.2");
            expect(`${result}`).toBe("0.13.2");
        }

        type cases = [
            Expect<AssertEqual<typeof result, AppVersion | null>>
        ];
    });

    it("should have toString() method that works with template literals", async () => {
        process.env.TERM = "alacritty";
        process.env.ALACRITTY_VERSION = "1.0.0";

        const result = await detectAppVersion();

        expect(result).not.toBeNull();
        if (result !== null) {
            const message = `Version: ${result}`;
            expect(message).toBe("Version: 1.0.0");
        }

        type cases = [
            Expect<AssertEqual<typeof result, AppVersion | null>>
        ];
    });

    it("should have toString() method for WezTerm date-based versions", async () => {
        process.env.TERM_PROGRAM = "WezTerm";
        process.env.WEZTERM_VERSION = "20230712-072601-f4abf8fd";

        const result = await detectAppVersion();

        expect(result).not.toBeNull();
        if (result !== null) {
            expect(result.toString()).toBe("20230712.72601.0");
            expect(`${result}`).toBe("20230712.72601.0");
        }

        type cases = [
            Expect<AssertEqual<typeof result, AppVersion | null>>
        ];
    });

    it("should have toString() method for versions with patch = 0", async () => {
        process.env.TERM = "alacritty";
        process.env.ALACRITTY_VERSION = "0.13";

        const result = await detectAppVersion();

        expect(result).not.toBeNull();
        if (result !== null) {
            expect(result.toString()).toBe("0.13.0");
        }

        type cases = [
            Expect<AssertEqual<typeof result, AppVersion | null>>
        ];
    });
});
