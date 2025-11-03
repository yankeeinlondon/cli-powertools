#!/usr/bin/env bun run 

import { detectColorScheme, discoverOsArch, format } from "~/utils"
import { box } from "~/utils/box";
import { detectColorDepth } from "~/utils/detectColorDepth";

const { bold, normal, dim, blue } = format;

console.log();
box("Host Detection")

console.log();
console.log(bold("OS:    ") + blue(discoverOsArch()));
console.log(bold("Theme: ") + await detectColorScheme());
console.log(bold("Depth: ") + await detectColorDepth());
