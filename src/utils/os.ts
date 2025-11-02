import {arch, platform, release} from "node:os";

export type OsPlatform = "aix" | "darwin" | "freebsd" | "linux" | "openbsd" | "win32" | "sunos" | "android" | "ios";
export type OsArch = "arm" | "arm64" | "ia32" | "long64" | "mips" | "mipsel" | "ppc" | "ppc64" | "riscv64" | "s390" | "s390x" |  "x64"

/**
 * Detects the OS and Architecture
 */
export function discoverOsArch(): `${OsPlatform}/${OsArch}` {
  return `${platform()}/${arch()}` as `${OsPlatform}/${OsArch}`
}

/**
 * Detects and reports back the Operating System
 */
export function discoverOs(): OsPlatform {
    return platform() as OsPlatform;
}


