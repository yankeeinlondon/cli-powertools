# Background Color Detection

We try to detect the background color of a terminal through a number of means. Once a reasonable detection is found we will return `light` or `dark` and return `unknown` if we're still not sure.

The order we test in is:

- OSC4
- ENV Variables
- OS Specific Tests

In the following sections you'll understand more of the details regarding this.

## OSC4

- Detecting background color using OSC (Operating System Command) is primarily relevant in the context of terminal emulators.
- Specifically, the OSC 4 control sequence, extended by some terminals like iTerm2, allows for querying the default background color.
- Here's how it generally works:
      - OSC 4 Control Sequence: This sequence is typically used to set colors in a terminal.
      - Extended Reporting Mode: iTerm2, and potentially other terminals, extend the OSC 4 sequence with specific indices to query foreground and background colors.
      - To query the background color, the sequence OSC 4 ; -2 ; ? ST is used.
      - To query the foreground color, the sequence OSC 4 ; -1 ; ? ST is used.
      - ST represents the String Terminator, which is usually `ESC \`.
      - Interpretation: In this sequence, -2 represents the background color, -1 represents the foreground color, and ? indicates a query rather than a setting operation.
- Terminal Specificity:
      - This functionality is not a standard part of all terminal emulators and is often proprietary to specific implementations like iTerm2. Therefore, its availability cannot be assumed across all terminals.

**ANSWER:** Yes, we can "know if we know" through timeout-based detection. If the terminal responds within our timeout window (100ms), we know it supports OSC queries. If the timeout expires with no response, we can confidently conclude the terminal does not support OSC queries and fall back to other detection methods. This is implemented in `src/utils/detect-background.ts` using Promise-based timeout handling.

### Implementation Details

Our OSC detection implementation (`src/utils/detect-background.ts`) includes:

1. **Dual Sequence Support**: We try both OSC 11 (standard xterm) and OSC 4;-2 (iTerm2 extension)
2. **Raw Mode Handling**: Properly sets stdin to raw mode to capture terminal responses
3. **Timeout Protection**: 100ms timeout prevents blocking on non-responsive terminals
4. **Proper Cleanup**: Always restores stdin state, even on errors
5. **Response Parsing**: Handles both 2-digit and 4-digit hex formats (e.g., `rgb:ff/ff/ff` or `rgb:ffff/ffff/ffff`)
6. **Multiple Terminators**: Supports both BEL (`\x07`) and ST (`\x1b\\`) terminators
7. **Luminance Calculation**: Uses WCAG standard with proper gamma correction to determine light vs dark:
   - Linearizes sRGB values using proper gamma correction
   - Applies WCAG formula: `L = 0.2126 * R + 0.7152 * G + 0.0722 * B`
   - Threshold of 0.5 determines light (>0.5) vs dark (<=0.5)

The implementation gracefully falls back through the detection chain if OSC queries fail.

## OS Specific Features

- macOS
    - Uses the default preferences of the system by calling the `defaults` CLI.
- Windows
    - Uses the default preferences by querying the registry.
- Linux
    - Uses the `gsettings` program if present


## ENV Variables

- we will look at both `THEME`, `GTK_THEME`, and `XDG_CURRENT_DESKTOP`
- if any of these have the word "light" or "dark" in them then they will be used
