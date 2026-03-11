#!/usr/bin/env node
/**
 * Post-build script: add .js extensions to bare relative imports inside
 * dist/generated/ so Node.js native ESM can resolve them at runtime.
 *
 * Prisma generates TypeScript with un-extended imports (e.g. from "./enums").
 * tsc copies those verbatim into dist/; this script patches them after the
 * fact so we never have to touch the generated source directly.
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const targetDir = join(__dirname, "..", "dist", "generated");

let patched = 0;
let total = 0;

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      walk(full);
    } else if (extname(entry) === ".js") {
      patchFile(full);
    }
  }
}

function patchFile(filePath) {
  const original = readFileSync(filePath, "utf8");
  // Match relative imports/exports that lack a .js extension
  const fixed = original.replace(
    /((?:import|export)\s[^'"]*from\s+['"])(\.\.?\/[^'"]+?)(?<!\.js)(['"'])/g,
    "$1$2.js$3"
  );
  total++;
  if (fixed !== original) {
    writeFileSync(filePath, fixed, "utf8");
    patched++;
  }
}

walk(targetDir);
console.log(`fix-esm-generated: patched ${patched}/${total} files in dist/generated/`);
