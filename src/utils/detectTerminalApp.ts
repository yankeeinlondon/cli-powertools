import { hasIndexOf, indexOf, isString } from "inferred-types";
import { 
    ALACRITTY_ENV, 
    GHOSTTY_ENV, 
    ITERM_ENV, 
    KITTY_ENV, 
    KONSOLE_ENV, 
    TERM_PROGRAM_LOOKUP, 
    WEZTERM_ENV 
} from "~/constants";
import { TerminalApp } from "~/types";

/**
 * **detectTerminalApp**()
 * 
 * Attempts to detect which terminal application is being used.
 */
export function detectTerminalApp() {
    const termProgram = process.env.TERM_PROGRAM?.toLowerCase();
    const term = process.env.TERM?.toLowerCase();


    return (
        isString(termProgram) && hasIndexOf(TERM_PROGRAM_LOOKUP, termProgram)
            ? indexOf(TERM_PROGRAM_LOOKUP, termProgram)
            : isString(term)
                ? term.includes("kitty")
                    ? "kitty"
                : term.includes("alacritty")
                    ? "alacritty"
                : term.includes("iterm2")
                    ? "iterm2"
                    : WEZTERM_ENV.some(i => isString(process.env[i]))
                    ? "wezterm"
                    : ITERM_ENV.some(i => isString(process.env[i]))
                    ? "iterm2"
                    : ALACRITTY_ENV.some(i => isString(process.env[i]))
                    ? "alacritty"
                    : KITTY_ENV.some(i => isString(process.env[i]))
                    ? "kitty"
                    : KONSOLE_ENV.some(i => isString(process.env[i]))
                    ? "konsole"
                    : GHOSTTY_ENV.some(i => isString(process.env[i]))
                        ? "ghostty"
                    : KONSOLE_ENV.some(i => isString(process.env[i]))
                        ? "konsole"
                : "other"
            : "other"
    ) as unknown as TerminalApp

}
