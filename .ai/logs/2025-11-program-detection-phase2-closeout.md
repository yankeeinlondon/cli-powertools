# Phase 2 Closeout: Edge Cases and Error Handling

**Date:** 2025-11-01
**Phase:** 2 of 4
**Status:** ✅ COMPLETE

## Summary

Phase 2 successfully enhanced the `hasProgram()` utility with robust error handling, type-safe input validation, support for spaces in program names, and comprehensive edge case testing. All tests have been consolidated, deduplicated, and are passing.

## Objectives Completed

- ✅ Input validation for empty/whitespace strings
- ✅ Type-level prevention of invalid characters
- ✅ Runtime Error objects for invalid character detection
- ✅ Support for spaces in program names via proper quoting
- ✅ Command injection prevention
- ✅ Comprehensive edge case testing with real executables
- ✅ Test consolidation and deduplication
- ✅ STDERR handling verification across platforms

## Key Enhancements

### 1. Type-Safe Invalid Character Detection

**Implementation:**
```typescript
// Type-level constraint
export const INVALID_COMMAND_CHARS = narrow(
    "&", ";", "\\", "$", ">", "<", "'", "\"",
    "\t", "\r", "\n", "\0", "`",
    // ... control chars \x00-\x1f
);

type WithoutChars<T extends string> = IsEqual<
    StripChars<T, InvalidCommandChar>,
    T
> extends true ? T : never;

// Function signature prevents invalid chars at compile time
export function hasProgram<T extends string>(cmd: T & WithoutChars<T>): Rtn<T>
```

**Behavior:**
- Type system prevents invalid characters at compile time
- Runtime returns Error object with `type: "invalid-char"` if types bypassed
- Empty/whitespace strings return literal `false`

### 2. Spaces Support with Proper Quoting

**Before:**
```typescript
command = `which ${cmd}`;   // Breaks with spaces
command = `where ${cmd}`;
```

**After:**
```typescript
command = `which "${cmd}" 2>/dev/null`;   // Supports spaces!
command = `where "${cmd}"`;
```

**Impact:** Program names with spaces (e.g., "program with spaces") now work correctly.

### 3. Test Utility for Real Executables

**Created:** `tests/helpers/createTestExecutable.ts`

Enables testing edge cases with actual executables:
```typescript
const exe = createTestExecutable({ name: "program with spaces" });
expect(hasProgram("program with spaces")).toBe(true);
exe.cleanup();
```

Platform-aware:
- Unix: Creates executable shell scripts with chmod +x
- Windows: Creates .bat files

### 4. Test Consolidation

**Before:** 3 test files with significant duplication
- `tests/unit/hasProgram.test.ts`
- `tests/unit/hasProgram-edge-cases.test.ts`
- `tests/unit/WIP/phase2-edge-cases.test.ts`

**After:** 2 focused test files, zero duplication
- `tests/unit/hasProgram.test.ts` - Core functionality (8 tests)
- `tests/unit/hasProgram-edge-cases.test.ts` - Real executable edge cases (18 tests)

**Deleted:** `tests/unit/WIP/phase2-edge-cases.test.ts`

## Test Results

```
Test Files  2 passed (2)
Tests       22 passed | 4 skipped (26)
Duration    214ms

Type Tests  4 of 18 tests (8 assertions)
Duration    493ms
```

### Test Coverage Breakdown

**hasProgram.test.ts (Core Functionality):**
- ✅ Happy path: program exists/doesn't exist
- ✅ Platform-specific: darwin, win32, linux
- ✅ Type narrowing: empty strings return literal `false`
- ✅ Invalid char handling: returns Error objects
- ✅ No throwing on any input

**hasProgram-edge-cases.test.ts (Edge Cases):**
- ✅ Spaces in program names (with real executable)
- ✅ Invalid chars return Error: null bytes, shell metacharacters, control chars
- ✅ Valid chars work: hyphens, underscores, numbers, dots
- ✅ Case sensitivity: platform-specific behavior
- ✅ Length handling: reasonable vs extreme lengths
- ✅ Multiple similar programs distinguished correctly

## Technical Decisions

### 1. STDERR Handling Strategy

**Question:** Should Windows `where` command redirect STDERR like Unix `which`?

**Answer:** No - different behavior requires different handling:

| Platform | Error Output | Handling |
|----------|--------------|----------|
| Unix `which` | STDERR | Shell redirection: `2>/dev/null` |
| Windows `where` | STDOUT | execSync suppression: `stdio[1]: 'pipe'` |

**Implementation:**
```typescript
execSync(command, { stdio: ['pipe', 'pipe', 'ignore'] });
//                          stdin   stdout   stderr
```

- Unix: STDERR suppressed by both `2>/dev/null` and `stdio[2]: 'ignore'` (defense in depth)
- Windows: STDOUT captured by `stdio[1]: 'pipe'` and discarded

### 2. Error Return Strategy

**Chosen:** Return Error objects (not throw, not return false)

**Rationale:**
- Type system can distinguish `false` (not found) from `Error` (invalid input)
- Caller can handle differently: `result instanceof Error`
- More informative than silent `false`
- No exceptions to catch (cleaner API)

### 3. Character Validation

**Invalid Characters:**
- Shell metacharacters: `; & | \` $ ( ) < > ' "`
- Control characters: `\0` and `\x00-\x1f` (including `\t`, `\r`, `\n`)
- Backtick: `` ` ``

**Valid Characters (NOT in invalid list):**
- Spaces: ` ` (now supported with quoting!)
- Hyphens: `-`
- Underscores: `_`
- Dots: `.`
- Numbers: `0-9`
- Letters: `a-zA-Z`

## Files Modified

### Source Files
- `src/utils/hasProgram.ts` - Added quoting, type constraints, error handling

### Test Files
- `tests/unit/hasProgram.test.ts` - Updated for spaces support, invalid char errors
- `tests/unit/hasProgram-edge-cases.test.ts` - Complete rewrite with real executables

### New Files
- `tests/helpers/createTestExecutable.ts` - Test utility for creating real executables
- `tests/helpers/README.md` - Documentation for test utilities

### Deleted Files
- `tests/unit/WIP/phase2-edge-cases.test.ts` - Merged into other files

## Validation Questions Answered

### Q1: Should spaces be supported?
**A:** YES - Spaces are valid in filenames on all OSes. Proper quoting makes this work.

### Q2: Should tabs/control chars return false or Error?
**A:** ERROR - They're in INVALID_COMMAND_CHARS, type system prevents them, runtime returns Error.

### Q3: What about STDERR on Windows?
**A:** Not needed - Windows `where` outputs errors to STDOUT, already suppressed by execSync.

## Known Limitations

1. **Shell builtins not detected** - Phase 3 will add this
2. **No caching** - Phase 4 will add performance caching
3. **Pipe character (`|`) rejected** - Listed as invalid char but may be valid in some OSes (rare edge case)

## Next Steps

**Phase 3:** Shell Builtin Detection
- Add detection for shell builtins (cd, echo, pwd, etc.)
- Use `type -t` command on Unix
- Windows `where` already handles builtins
- Maintain backward compatibility

**Phase 4:** Performance Caching
- Add Map-based caching for repeated checks
- Cache both positive and negative results
- No invalidation needed (PATH rarely changes at runtime)

## Lessons Learned

1. **Type tests need meaningful assertions** - Simply checking `typeof result === "boolean"` doesn't verify specific behavior
2. **Real executables reveal true behavior** - createTestExecutable utility exposed issues that mock tests missed
3. **Platform differences matter** - STDERR handling differs between Unix and Windows
4. **Deduplication is critical** - Having 3 test files with overlapping tests created confusion
5. **Type system is powerful** - Preventing invalid chars at compile time is better than runtime validation alone

---

**Phase 2 Status:** ✅ COMPLETE
**All Tests Passing:** ✅ 22/26 (4 platform-skipped)
**Ready for Phase 3:** ✅ YES
