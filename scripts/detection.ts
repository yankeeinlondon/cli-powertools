#!/usr/bin/env bun run 

import { detectColorScheme, detectTerminalApp, discoverOsArch, format } from "~/utils"
import { box } from "~/utils/box";
import { detectAvailableWidth } from "~/utils/detectAvailableWidth";
import { detectColorDepth } from "~/utils/detectColorDepth";

const { bold, normal, dim, blue } = format;

console.log();
box("Host Detection")

console.log();
console.log(bold("OS:    ") + blue(discoverOsArch()));
console.log(bold("Theme: ") + await detectColorScheme());
console.log(bold("Depth: ") + await detectColorDepth());
console.log(bold("Char Width: ") + await detectAvailableWidth());
console.log(bold("Terminal App: ") + detectTerminalApp());
