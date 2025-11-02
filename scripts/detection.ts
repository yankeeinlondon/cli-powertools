#!/usr/bin/env bun run 

import { discoverOsArch, format } from "~/utils"

const { bold, normal, dim, blue } = format;

console.log(bold("OS:") + discoverOsArch());
