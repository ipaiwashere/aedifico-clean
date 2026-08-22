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

// Must match the `publicPath` set on the `photo` field in keystatic.config.ts.
// The Reader API only returns the raw filename (e.g. "photo.jpg") — Keystatic
// stores the actual file at `<directory>/<slug>/<filename>`, so the real
// public URL has to be built by combining this prefix + slug + filename.
const PHOTO_PUBLIC_PATH = '/uploads/projects/';
const PHOTO_DIRECTORY = 'public/uploads/projects';

function resolvePhotoUrl(slug: string, filename: string | null): string | null {
  if (!filename) return null; // no photo field set at all (only possible on old entries)

  const onDiskPath = path.join(process.cwd(), PHOTO_DIRECTORY, slug, filename);
  if (!existsSync(onDiskPath)) return null; // field has a value, but the actual file is missing

  return `${PHOTO_PUBLIC_PATH}${slug}/${filename}`;
}

function mapProject(entry: Awaited<ReturnType<typeof reader.collections.projects.all>>[number]) {
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
    photo: resolvePhotoUrl(entry.slug, entry.entry.photo),
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
