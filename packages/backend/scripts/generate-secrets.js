#!/usr/bin/env node
// Generates cryptographically secure random secrets for JWT_SECRET and SESSION_SECRET.
// Usage: npm run generate-secrets -w backend
import { randomBytes } from "crypto";

const secret = (label) => {
  const value = randomBytes(64).toString("hex");
  console.log(`${label}=${value}`);
};

console.log("# Paste these into Railway → Variables (or your .env file for local dev)");
console.log("# Each value is 64 random bytes (128 hex chars) — do NOT commit them.\n");
secret("JWT_SECRET");
secret("SESSION_SECRET");
