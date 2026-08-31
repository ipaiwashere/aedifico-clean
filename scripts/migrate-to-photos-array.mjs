// One-time migration: converts every project's old single `photo:` field
// into the new `photos:` array field (with that one photo as the only,
// and therefore main, item).
//
// Run once, locally, after pulling the code that switches to the new
// schema — before that code goes live, or Keystatic won't recognize your
// existing entries (they'll still have the old field name).
//
// Usage:  node scripts/migrate-to-photos-array.mjs

import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const PROJECTS_DIR = path.join(process.cwd(), 'src/content/projects');

const files = readdirSync(PROJECTS_DIR).filter((f) => f.endsWith('.yaml'));

let migrated = 0;
let skipped = 0;

for (const file of files) {
  const filePath = path.join(PROJECTS_DIR, file);
  const content = readFileSync(filePath, 'utf-8');

  const match = content.match(/^photo:\s*(.+)$/m);
  if (!match) {
    console.log(`skip (already migrated or no photo field): ${file}`);
    skipped++;
    continue;
  }

  const photoValue = match[1].trim();
  const newContent = content.replace(/^photo:\s*.+$/m, `photos:\n  - ${photoValue}`);

  writeFileSync(filePath, newContent, 'utf-8');
  console.log(`migrated: ${file}`);
  migrated++;
}

console.log(`\nDone. Migrated ${migrated} file(s), skipped ${skipped} (already up to date).`);
