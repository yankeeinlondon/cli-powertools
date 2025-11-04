import { spawnSync, SpawnSyncOptions, SpawnSyncReturns } from "child_process";
import { stripTrailing } from "inferred-types/runtime";
import { EmptyObject } from "inferred-types/types";

/**
 * **runScript**`(source, fn, params, )
 */
export function runScript<
    TCmd extends string,
    TParams extends readonly string[],
    TOpt extends SpawnSyncOptions
>(
    cmd: TCmd,
    params: TParams,
    opts: TOpt = {} as EmptyObject as TOpt
) {
    const result = spawnSync(cmd, params,opts) as SpawnSyncReturns<string>;

    return {
        code: result.status ?? -1, // unknown failure is set to -1
        stdout: stripTrailing(result.stdout as string ?? "", "\n"),
        stderr: stripTrailing(result.stderr as string ?? "", "\n"),
    }
}
