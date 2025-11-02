
/**
 * **availableWidth**`([fallback])`
 * 
 * Attempts to detect the available character width that the
 * terminal/console currently has.
 * 
 * - you may optionally set a `fallback` number of columns in
 * case detection is not possible
 * - by default the fallback is set to 80 characters
 */
export function availableWidth<T extends number>(fallback: T = 80 as T) {
    // TODO
}
