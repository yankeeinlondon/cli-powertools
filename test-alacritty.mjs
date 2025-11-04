#!/usr/bin/env node

/**
 * Test script to verify Alacritty version detection works
 */

// Clear all version-related environment variables to force command query
delete process.env.ALACRITTY_VERSION;
delete process.env.TERM_PROGRAM_VERSION;
delete process.env.WEZTERM_VERSION;
delete process.env.KITTY_VERSION;
delete process.env.ALACRITTY_SOCKET;
delete process.env.WEZTERM_CONFIG_DIR;
delete process.env.KITTY_WINDOW_ID;

// Set TERM to simulate Alacritty
process.env.TERM = "alacritty";

const { detectAppVersion, detectAppVersion__Bust, detectTerminalApp } = await import("./src/utils/detectTerminalApp.ts");

console.log("Testing Alacritty version detection via command query...\n");

detectAppVersion__Bust();
const terminal = detectTerminalApp();
console.log("Detected terminal:", terminal);

const version = await detectAppVersion();

if (version) {
    console.log("✅ SUCCESS: Detected Alacritty version:", version.toString());
    console.log("   Version details:", {
        major: version.major,
        minor: version.minor,
        patch: version.patch
    });
} else {
    console.log("❌ FAILED: Could not detect Alacritty version");
    console.log("   This might mean:");
    console.log("   1. Alacritty is not in your PATH");
    console.log("   2. Alacritty command failed");
    console.log("   3. Version output format is unexpected");
}
