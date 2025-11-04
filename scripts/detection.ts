#!/usr/bin/env bun run 

import { isTrue } from "inferred-types";
import { BOLD, DIM, ITALIC, RESET } from "~/constants";
import { detectAppVersion, detectColorScheme, detectLinkSupport, detectTerminalApp, discoverOsArch, format } from "~/utils"
import { box } from "~/utils/box";
import { detectAvailableWidth } from "~/utils/detectAvailableWidth";
import { detectColorDepth } from "~/utils/detectColorDepth";
import { fileLink, urlLink } from "~/utils/link";

const { bold, normal, dim, blue } = format;

const support = isTrue(await detectLinkSupport());
const version = await detectAppVersion();

console.log();
box("Host Detection")

console.log();
console.log(bold("OS:    ") + blue(discoverOsArch()));
console.log(bold("Theme: ") + await detectColorScheme());
console.log(bold("Color Depth: ") + await detectColorDepth());
console.log(bold("Char Width: ") + await detectAvailableWidth());
console.log(bold("Terminal App: ") + detectTerminalApp() + ` ( ${dim(String(version))} )`);
console.log(`${bold("Supports Links: ")} ${isTrue(support) ? "✅" : "❌" }`)
const url = urlLink("URL link", "https://google.com")
console.log(url)
const file = fileLink("package.json", "./package.json", support)
console.log(file)

