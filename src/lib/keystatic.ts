import { createReader } from '@keystatic/core/reader';
import keystaticConfig from '../../keystatic.config';
import { existsSync } from 'node:fs';
import path from 'node:path';

export const reader = createReader(process.cwd(), keystaticConfig);

// Single source of truth for value -> display label, shared by the homepage
// carousel, the full portfolio page, and its filters.
export const tipeLabels: Record<string, string> = {
  pembangunan: 'Pembangunan',
  renovasi: 'Renovasi',
};

export const sektorLabels: Record<string, string> = {
  residensial: 'Residensial',
  komersil: 'Komersil',
  industri: 'Industri',
};

export const layananLabels: Record<string, string> = {
  arsitektur: 'Arsitektur',
  interior: 'Interior',
  eksterior: 'Eksterior',
  mep: 'MEP',
  infrastruktur: 'Infrastruktur',
  'konstruksi-general': 'Konstruksi General',
};

// Must match the `publicPath` set on the `photos` field in keystatic.config.ts.
//
// Different storage modes serialize the image field's value differently:
//  - Local mode (and our own hand-seeded yaml) stores just the bare filename,
//    e.g. "photo.jpg" — the Reader API doesn't resolve a public URL for us,
//    so we have to build one ourselves.
//  - Keystatic Cloud stores the entire already-resolved public path instead.
//    For an array-of-images field specifically, it also nests each file in a
//    subfolder named after the field, numbered by position — e.g.
//    "/uploads/projects/bintaro-warehouse/photos/0.jpg", not the flat
//    "<slug>/<filename>" pattern the old single-image field used. The public
//    URL must be used exactly as given, not reconstructed from just the
//    slug + filename, or that subfolder gets silently dropped.
const PHOTO_PUBLIC_PATH = '/uploads/projects/';
const PHOTO_DIRECTORY = 'public/uploads/projects';

function resolvePhotoUrl(slug: string, rawValue: string | null): string | null {
  if (!rawValue) return null; // no photo set (only possible on malformed/old entries)

  let publicUrl: string;
  let relativePath: string; // relative to PHOTO_DIRECTORY, used to check the file actually exists

  if (rawValue.startsWith('/')) {
    // Cloud mode: already the full public path (e.g. ".../photos/0.jpg") —
    // use it as-is rather than rebuilding it, since rebuilding from just the
    // filename loses any subfolder Keystatic added.
    publicUrl = rawValue;
    relativePath = rawValue.slice(PHOTO_PUBLIC_PATH.length);
  } else {
    // Local mode / hand-seeded yaml: bare filename only, e.g. "photo.jpg".
    relativePath = `${slug}/${rawValue}`;
    publicUrl = `${PHOTO_PUBLIC_PATH}${relativePath}`;
  }

  const onDiskPath = path.join(process.cwd(), PHOTO_DIRECTORY, relativePath);
  if (!existsSync(onDiskPath)) return null; // field has a value, but the actual file is missing

  return publicUrl;
}

// Resolves every photo in the array, silently dropping any that turn out to
// be missing on disk (rather than breaking the whole gallery over one bad
// entry). The first successfully-resolved photo is the "main" one — order
// in the CMS array is what determines this, not a separate flag, so it's
// never possible for zero or multiple photos to be marked main at once.
function resolvePhotos(slug: string, rawValues: (string | null)[] | undefined): string[] {
  if (!rawValues) return [];
  return rawValues
    .map((raw) => resolvePhotoUrl(slug, raw))
    .filter((url): url is string => url !== null);
}

function mapProject(entry: Awaited<ReturnType<typeof reader.collections.projects.all>>[number]) {
  const photos = resolvePhotos(entry.slug, entry.entry.photos);
  return {
    slug: entry.slug,
    title: entry.entry.title,
    tipe: entry.entry.tipe,
    tipeLabel: tipeLabels[entry.entry.tipe] ?? entry.entry.tipe,
    sektor: entry.entry.sektor,
    sektorLabel: sektorLabels[entry.entry.sektor] ?? entry.entry.sektor,
    layanan: entry.entry.layanan,
    layananLabels: entry.entry.layanan.map((l) => layananLabels[l] ?? l),
    year: entry.entry.year,
    detail: entry.entry.detail,
    highlight: entry.entry.highlight,
    photos, // full gallery, in CMS-defined order
    photo: photos[0] ?? null, // the main/thumbnail photo — kept as a single field for the carousel and portfolio grid, which only ever show one image
  };
}

export async function getHighlightedProjects() {
  const all = await reader.collections.projects.all();
  return all.filter((entry) => entry.entry.highlight).map(mapProject);
}

export async function getAllProjects() {
  const all = await reader.collections.projects.all();
  return all
    .map(mapProject)
    .sort((a, b) => Number(b.year) - Number(a.year)); // most recent first
}
