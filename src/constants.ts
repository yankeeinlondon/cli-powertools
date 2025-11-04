import { narrow } from "inferred-types";

/**
 * The hexadecimal escape sequence used in Typescript
 * 
 * - represents decimal `27`
 * - can also be represented as the `u001B` unicode character
 */
export const ESC = narrow(`\x1b`);

/**
 * A control sequence typically meant to _terminate_/_close_ the
 * current control sequence.
 */
export const TERMINATOR = narrow(`${ESC}\\`);

/**
 * The **BEL** code can often be substituted as a terminal character.
 * 
 * - often an alternative to `${TERMINATOR}`
 */
export const BEL = narrow(`\x07`);

/** the control codes following the start sequence which identifies it as a link */
export const OSC8_LINK = narrow(`${ESC}8;;`);
/** 
 * a delimiter sequence for OSC8 links; used between text and URI as well as at
 * end of the sequence.
 */
export const OSC8_DELIMITER = narrow(`${TERMINATOR}`);

/**
 * ANSI SGR Color and Formatting control sequences start with this
 * control sequence.
 * 
 * - these color sequences are terminated when they find the `m` character
 * - these are not **block** elements but instead change formatting from 
 *   that point forward.
 */
export const ANSI_SGR_START = narrow(`${ESC}[33`);

/** SGR BLACK color */
export const BLACK= narrow(`${ANSI_SGR_START}[30m`);
/** SGR RED color */
export const RED= narrow(`${ANSI_SGR_START}[31m`);
/** SGR GREEN color */
export const GREEN= narrow(`${ANSI_SGR_START}[32m`);
/** SGR YELLOW color */
export const YELLOW= narrow(`${ANSI_SGR_START}[33m`);
/** SGR BLUE color */
export const BLUE= narrow(`${ANSI_SGR_START}[34m`);
/** SGR MAGENTA color */
export const MAGENTA= narrow(`${ANSI_SGR_START}[35m`);
/** SGR CYAN color */
export const CYAN= narrow(`${ANSI_SGR_START}[36m`);
/** SGR WHITE color */
export const WHITE= narrow(`${ANSI_SGR_START}[37m`);

/** SGR BLACK color */
export const BRIGHT_BLACK= narrow(`${ANSI_SGR_START}[90m`);
/** SGR RED color */
export const BRIGHT_RED= narrow(`${ANSI_SGR_START}[91m`);
/** SGR GREEN color */
export const BRIGHT_GREEN= narrow(`${ANSI_SGR_START}[92m`);
/** SGR YELLOW color */
export const BRIGHT_YELLOW= narrow(`${ANSI_SGR_START}[93m`);
/** SGR BLUE color */
export const BRIGHT_BLUE= narrow(`${ANSI_SGR_START}[94m`);
/** SGR MAGENTA color */
export const BRIGHT_MAGENTA= narrow(`${ANSI_SGR_START}[95m`);
/** SGR CYAN color */
export const BRIGHT_CYAN= narrow(`${ANSI_SGR_START}[96m`);
/** SGR WHITE color */
export const BRIGHT_WHITE= narrow(`${ANSI_SGR_START}[97m`);

/** SGR Background BLACK color */
export const BG_BLACK= narrow(`${ANSI_SGR_START}[40m`);
/** SGR Background RED color */
export const BG_RED= narrow(`${ANSI_SGR_START}[41m`);
/** SGR Background GREEN color */
export const BG_GREEN= narrow(`${ANSI_SGR_START}[42m`);
/** SGR Background YELLOW color */
export const BG_YELLOW= narrow(`${ANSI_SGR_START}[43m`);
/** SGR Background BLUE color */
export const BG_BLUE= narrow(`${ANSI_SGR_START}[44m`);
/** SGR Background MAGENTA color */
export const BG_MAGENTA= narrow(`${ANSI_SGR_START}[45m`);
/** SGR Background CYAN color */
export const BG_CYAN= narrow(`${ANSI_SGR_START}[46m`);
/** SGR Background WHITE color */
export const BG_WHITE= narrow(`${ANSI_SGR_START}[47m`);

/** SGR Background BLACK color */
export const BG_BRIGHT_BLACK= narrow(`${ANSI_SGR_START}[100m`);
/** SGR Background RED color */
export const BG_BRIGHT_RED= narrow(`${ANSI_SGR_START}[101m`);
/** SGR Background GREEN color */
export const BG_BRIGHT_GREEN= narrow(`${ANSI_SGR_START}[102m`);
/** SGR Background YELLOW color */
export const BG_BRIGHT_YELLOW= narrow(`${ANSI_SGR_START}[103m`);
/** SGR Background BLUE color */
export const BG_BRIGHT_BLUE= narrow(`${ANSI_SGR_START}[104m`);
/** SGR Background MAGENTA color */
export const BG_BRIGHT_MAGENTA= narrow(`${ANSI_SGR_START}[105m`);
/** SGR Background CYAN color */
export const BG_BRIGHT_CYAN= narrow(`${ANSI_SGR_START}[106m`);
/** SGR Background WHITE color */
export const BG_BRIGHT_WHITE= narrow(`${ANSI_SGR_START}[107m`);

/**
 * resets all SGR formatting to defaults for the console
 */
export const SGR_RESET = narrow(`${ANSI_SGR_START}0m`);
/**
 * Switches to using the _default_ foreground color
 */
export const SGR_DEF_FG = narrow(`${ANSI_SGR_START}39m`);
/**
 * Switches to using the _default_ background color
 */
export const SGR_DEF_BG = narrow(`${ANSI_SGR_START}49m`);


const FG_COLOR = narrow(`${ESC}[38;2;`);
const BG_COLOR = narrow(`${ESC}[48;2;`);

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

