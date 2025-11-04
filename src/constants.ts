import { narrow } from "inferred-types";
import { TerminalApp } from "./types/TerminalApp";


export const OSC8_START = narrow()

/**
 * A list of recognized terminal applications
 */
export const TERMINAL_APPS = narrow(
    "ghostty",
    "wezterm",
    "iterm2",
    "kitty",
    "alacritty",
    "apple-terminal",
    "konsole",
    "windows-terminal",
    "powershell",
    "cmd",
    "conemu",
    "mintty",

    "other"
)

/**
 * Maps the lowercase of `TERM_PROGRAM` environment
 * variable to the application it is referencing.
 */
export const TERM_PROGRAM_LOOKUP = narrow({
    ghostty: "ghostty",
    wezterm: "wezterm",
    apple_terminal: "apple-terminal",
    alacritty: "alacritty",
    "iterm.app": "iterm2"

}) satisfies Record<string, typeof TERMINAL_APPS[number]>


export const TERM_LOOKUP = narrow({

})


/**
 * Environment variables often set by the **Ghostty**
 * terminal/console app.
 */
export const GHOSTTY_ENV = narrow(
    "GHOSTTY_RESOURCES_DIR",
    "GHOSTTY_SHELL_FEATURES",
    "GHOSTTY_BIN_DIR"
)

/**
 * Environment variables often set by the **Wezterm**
 * terminal/console app.
 */
export const WEZTERM_ENV = narrow(
    "WEZTERM_CONFIG_DIR",
    "WEZTERM_CONFIG_FILE",
    "WEZTERM_EXECUTABLE",
    "WEZTERM_PANE",
    "WEZTERM_UNIX_SOCKET",
)

/**
 * Environment variables often set by the **ITerm2**
 * terminal/console app.
 */
export const ITERM_ENV = narrow(
    "ITERM_PROFILE",
    "ITERM_SESSION_ID"
)

export const KONSOLE_ENV = narrow(
    "KONSOLE_VERSION",
    "KONSOLE_DBUS_WINDOW"
)

export const ALACRITTY_ENV = narrow(
    "ALACRITTY_LOG",
    "ALACRITTY_SOCKET",
    "ALACRITTY_WINDOW_ID"
)

export const KITTY_ENV = narrow(
    "KITTY_WINDOW_ID",
    "KITTY_PUBLIC_KEY",
    "KITTY_INSTALLATION_DIR",
    "KITTY_PID"
)

/**
 * Environment variables often set by **Windows Terminal**
 * (modern Microsoft terminal app on Windows 11).
 */
export const WINDOWS_TERMINAL_ENV = narrow(
    "WT_SESSION",
    "WT_PROFILE_ID"
)

/**
 * Environment variables often set by **PowerShell**
 * console.
 */
export const POWERSHELL_ENV = narrow(
    "PSModulePath",
    "POWERSHELL_DISTRIBUTION_CHANNEL"
)

/**
 * Environment variables often set by **cmd.exe**
 * (Windows Command Prompt).
 */
export const CMD_ENV = narrow(
    "PROMPT",
    "COMSPEC"
)

/**
 * Environment variables often set by **ConEmu** or **cmder**
 * terminal emulators.
 */
export const CONEMU_ENV = narrow(
    "ConEmuDir",
    "ConEmuBaseDir",
    "CMDER_ROOT"
)

/**
 * Environment variables often set by **mintty**
 * (Cygwin, MSYS2, Git Bash).
 */
export const MINTTY_ENV = narrow(
    "MSYSTEM",
    "CHERE_INVOKING"
)

