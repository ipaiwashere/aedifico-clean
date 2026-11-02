// One-time fix: gives projects that still have a random internal ID
// (e.g. "mv0nvx2vd9vt") a readable one made from the project name
// (e.g. "brooklyn-alam-sutera"), so Keystatic's search box can find them.
//
// For each such project it:
//   1. renames  src/content/projects/<old>.yaml  ->  <new>.yaml
//   2. renames  public/uploads/projects/<old>/   ->  <new>/
//   3. updates the photo paths inside the yaml to point at the new folder
//
// Only touches projects whose ID looks random (12 letters/digits). Projects
// that already have a readable ID are left alone, so it is safe to run twice.
// If a readable ID is already taken, it adds -1, -2, ... to the end.
//
// Run from the project root, after `git pull`, before you push:
//   node scripts/rename-random-slugs.mjs

import { existsSync, readdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const PROJECTS_DIR = path.join(process.cwd(), 'src/content/projects');
const UPLOADS_DIR = path.join(process.cwd(), 'public/uploads/projects');
const RANDOM_ID = /^[a-z0-9]{12}$/;

const slugify = (name) =>
  name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '') // strip accents
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

let renamed = 0;
let skipped = 0;

for (const file of readdirSync(PROJECTS_DIR).filter((f) => f.endsWith('.yaml'))) {
  const oldSlug = file.replace(/\.yaml$/, '');
  if (!RANDOM_ID.test(oldSlug)) {
    skipped++;
    continue;
  }

  const oldYaml = path.join(PROJECTS_DIR, file);
  const content = readFileSync(oldYaml, 'utf-8');
  const titleMatch = content.match(/^title:\s*(.+)$/m);
  const title = titleMatch?.[1].trim().replace(/^['"]|['"]$/g, '');
  const base = title ? slugify(title) : '';
  if (!base) {
    console.log(`skip (could not make a name from the title): ${file}`);
    skipped++;
    continue;
  }

  let newSlug = base;
  for (let i = 1; existsSync(path.join(PROJECTS_DIR, `${newSlug}.yaml`)); i++) {
    newSlug = `${base}-${i}`;
  }

  const updated = content.split(`/uploads/projects/${oldSlug}/`).join(`/uploads/projects/${newSlug}/`);
  writeFileSync(oldYaml, updated, 'utf-8');
  renameSync(oldYaml, path.join(PROJECTS_DIR, `${newSlug}.yaml`));

  const oldDir = path.join(UPLOADS_DIR, oldSlug);
  if (existsSync(oldDir)) renameSync(oldDir, path.join(UPLOADS_DIR, newSlug));

  console.log(`renamed: ${oldSlug}  ->  ${newSlug}`);
  renamed++;
}

console.log(`\nDone. Renamed ${renamed} project(s), left ${skipped} unchanged.`);
