// One-time fix: Keystatic's image field expects each photo in `photos:` to be
// stored as a full public path, e.g. /uploads/projects/<slug>/photo.jpg.
//
// Entries that were hand-seeded (or migrated by migrate-to-photos-array.mjs)
// still hold just the bare filename, "photo.jpg". Keystatic can't find the
// image from that, treats the required Foto field as empty, and silently
// refuses to save the entry from the CMS.
//
// This rewrites every bare filename in the `photos:` list to the full path.
// Entries that already use full paths (anything saved by Keystatic Cloud) are
// left alone, so it is safe to run more than once.
//
// Run from the project root, after `git pull`, before you push:
//   node scripts/fix-photo-paths.mjs

import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const PROJECTS_DIR = path.join(process.cwd(), 'src/content/projects');
const PUBLIC_PATH = '/uploads/projects/';

let fixed = 0;
let skipped = 0;

for (const file of readdirSync(PROJECTS_DIR).filter((f) => f.endsWith('.yaml'))) {
  const slug = file.replace(/\.yaml$/, '');
  const filePath = path.join(PROJECTS_DIR, file);
  const lines = readFileSync(filePath, 'utf-8').split('\n');

  let inPhotos = false;
  let changed = false;

  const out = lines.map((line) => {
    if (/^photos:\s*$/.test(line)) {
      inPhotos = true;
      return line;
    }
    if (inPhotos) {
      const item = line.match(/^(\s+-\s+)(['"]?)(.+?)\2\s*$/);
      if (!item) {
        inPhotos = false; // left the photos list
        return line;
      }
      const [, prefix, , value] = item;
      if (value.startsWith('/')) return line; // already a full path
      changed = true;
      return `${prefix}${PUBLIC_PATH}${slug}/${value}`;
    }
    return line;
  });

  if (changed) {
    writeFileSync(filePath, out.join('\n'), 'utf-8');
    console.log(`fixed:   ${file}`);
    fixed++;
  } else {
    skipped++;
  }
}

console.log(`\nDone. Fixed ${fixed} file(s), left ${skipped} unchanged.`);
