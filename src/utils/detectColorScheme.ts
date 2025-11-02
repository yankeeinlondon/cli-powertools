import { execSync } from "node:child_process";
import { discoverOs } from "./os";
import { queryTerminalColor, isLightColor } from "./background-color";



/**
 * Tries to detect the color scheme based on several environmental values and
 * OS hints.
 *
 * Detection order:
 * 1. **OSC4/OSC11** - Query terminal directly for background color
 * 2. **ENV Variables** - Check THEME, VITE_THEME, GTK_THEME, XDG_CURRENT_DESKTOP
 * 3. **OS Specific** - macOS (defaults), Windows (registry), Linux (gsettings)
 *
 * Additional behavior:
 * - if the ENV variable `VITE_THEME` or `THEME` is set to "light" or "dark"
 *   then this will be used OVER what is detected
 * - if the ENV variable `VITE_PREFERS` or `PREFERS` is set to "light" or "dark"
 *   then this will be used when detection is unable to predict the theme
 */
export async function detectColorScheme(): Promise<'dark' | 'light' | 'unknown'> {
    // Priority 0: Check for explicit theme override
    const themeOverride = process.env.VITE_THEME || process.env.THEME;
    if (themeOverride && ["light", "dark"].includes(themeOverride.toLowerCase())) {
        return themeOverride.toLowerCase() as "light" | "dark";
    }

    // Priority 1: Try OSC4/OSC11 terminal query
    try {
        const bgColor = await queryTerminalColor();
        if (bgColor) {
            return isLightColor(bgColor.r, bgColor.g, bgColor.b);
        }
    } catch {
        // Fall through to next detection method
    }

    // Priority 2: Check environment variables
    const gtkTheme = process.env.GTK_THEME || '';
    const xdgDesktop = process.env.XDG_CURRENT_DESKTOP || '';

    if (gtkTheme.toLowerCase().includes('dark') || xdgDesktop.toLowerCase().includes('dark')) {
        return 'dark';
    }
    if (gtkTheme.toLowerCase().includes('light') || xdgDesktop.toLowerCase().includes('light')) {
        return 'light';
    }

    // Priority 3: OS-specific detection
    const os = discoverOs();

    if (os === "darwin") {
        // macOS: Use AppleInterfaceStyle to determine theme
        try {
            const result = execSync(
                'defaults read -g AppleInterfaceStyle 2>/dev/null || echo light'
            ).toString().trim();
            return result === 'Dark' ? 'dark' : 'light';
        } catch {
            return checkPrefersEnv();
        }
    } else if (os === 'win32') {
        // Windows: Check the registry for theme preference
        try {
            const result = execSync(
                'reg query "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize" /v AppsUseLightTheme'
            ).toString().trim();
            // If the value is 0, it's dark mode; 1 means light mode
            const isLightTheme = /AppsUseLightTheme\s+REG_DWORD\s+0x1/.test(result);
            return isLightTheme ? 'light' : 'dark';
        } catch {
            return checkPrefersEnv();
        }
    } else if (os === 'linux') {
        // Linux: Check GTK/Gnome settings or other desktop environment settings
        try {
            // Use gsettings for GNOME-based desktops
            const result = execSync(
                'gsettings get org.gnome.desktop.interface color-scheme 2>/dev/null || echo "unknown"'
            ).toString().trim();

            if (result.includes('dark')) return 'dark';
            if (result.includes('light')) return 'light';
        } catch {
            return checkPrefersEnv();
        }
    }

    // Final fallback
    return checkPrefersEnv();
}

/**
 * Checks the PREFERS or VITE_PREFERS environment variable as a final fallback.
 */
function checkPrefersEnv(): 'dark' | 'light' | 'unknown' {
    const prefers = process.env.VITE_PREFERS || process.env.PREFERS;
    if (prefers && ["light", "dark"].includes(prefers.toLowerCase())) {
        return prefers.toLowerCase() as "light" | "dark";
    }
    return 'unknown';
}


