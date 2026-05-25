/**
 * i18n Key Parity Checker
 * 
 * Validates that all 4 locale files (en, ro, fr, de) have the same
 * set of translation keys. Reports missing and extra keys per locale.
 * 
 * Usage: npx tsx scripts/check-i18n.ts
 */

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MESSAGES_DIR = path.resolve(__dirname, "../src/messages");
const LOCALES = ["en", "ro", "fr", "de"] as const;

function flattenKeys(obj: unknown, prefix = ""): string[] {
  if (obj === null || obj === undefined) return [];
  if (typeof obj !== "object") return [prefix];
  if (Array.isArray(obj)) return [prefix]; // arrays are leaf values

  const keys: string[] = [];
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    const fullKey = prefix ? `${prefix}.${k}` : k;
    if (v !== null && typeof v === "object" && !Array.isArray(v)) {
      keys.push(...flattenKeys(v, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

function loadKeys(locale: string): Set<string> {
  const filePath = path.join(MESSAGES_DIR, `${locale}.json`);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Missing file: ${filePath}`);
    return new Set();
  }
  const content = fs.readFileSync(filePath, "utf-8");
  const parsed = JSON.parse(content);
  return new Set(flattenKeys(parsed));
}

function main() {
  console.log("🔍 Checking i18n key parity across locales...\n");

  const localeKeys = new Map<string, Set<string>>();
  for (const loc of LOCALES) {
    localeKeys.set(loc, loadKeys(loc));
  }

  // Use English as the reference
  const refKeys = localeKeys.get("en")!;
  let hasErrors = false;

  for (const loc of LOCALES) {
    if (loc === "en") continue;

    const keys = localeKeys.get(loc)!;
    const missing = [...refKeys].filter((k) => !keys.has(k));
    const extra = [...keys].filter((k) => !refKeys.has(k));

    if (missing.length > 0) {
      hasErrors = true;
      console.log(`⚠️  ${loc}.json is MISSING ${missing.length} keys:`);
      for (const k of missing.sort()) {
        console.log(`   - ${k}`);
      }
      console.log();
    }

    if (extra.length > 0) {
      hasErrors = true;
      console.log(`⚠️  ${loc}.json has ${extra.length} EXTRA keys (not in en.json):`);
      for (const k of extra.sort()) {
        console.log(`   + ${k}`);
      }
      console.log();
    }
  }

  if (!hasErrors) {
    console.log("✅ All 4 locale files have identical keys.");
  } else {
    console.log("❌ Key parity check failed. Fix the above discrepancies.");
    process.exit(1);
  }
}

main();
