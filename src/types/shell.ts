import { Suggest } from "inferred-types/types";

/**
 * common interactive shells which user's may be running
 * a program under.
 */
export type Shell = Suggest<
    | "bash"
    | "zsh"
    | "csh"
    | "ksh"
    | "sh"
    | "fish"
    | "nu"
    | "Powershell"
    | "cmd"
    | "wsl"
    | "git-bash"
>

