import { config, fields, collection } from '@keystatic/core';

export default config({
  storage: {
    // Local mode for development — edits files directly on disk, no login needed.
    // For the live site, switch this to `{ kind: 'cloud' }` and connect it to
    // Keystatic Cloud (see README) so admins can log in and edit remotely.
    kind: 'local',
  },

  collections: {
    projects: collection({
      label: 'Proyek',
      slugField: 'title',
      path: 'src/content/projects/*',
      format: { data: 'yaml' },
      entryLayout: 'form',
      columns: ['title', 'sektor', 'tipe', 'highlight'],
      schema: {
        title: fields.slug({
          name: {
            label: 'Nama Proyek',
            validation: { isRequired: true },
          },
          slug: {
            label: 'ID Internal',
            description: 'Dibuat otomatis oleh sistem sebagai ID unik untuk proyek ini. Tidak akan ditampilkan di website — Anda tidak perlu mengubah atau memperhatikan kolom ini.',
            // Random ID instead of deriving from the name — admins can
            // ignore this entirely, it's just an internal file reference.
            generate: () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
          },
        }),

        tipe: fields.select({
          label: 'Tipe',
          description: 'Pembangunan atau renovasi?',
          options: [
            { label: 'Pembangunan', value: 'pembangunan' },
            { label: 'Renovasi', value: 'renovasi' },
          ],
          defaultValue: 'pembangunan',
        }),

        sektor: fields.select({
          label: 'Sektor',
          options: [
            { label: 'Residensial', value: 'residensial' },
            { label: 'Komersil', value: 'komersil' },
            { label: 'Industri', value: 'industri' },
          ],
          defaultValue: 'residensial',
        }),

        layanan: fields.multiselect({
          label: 'Layanan',
          description: 'Pilih semua layanan yang digunakan pada proyek ini.',
          options: [
            { label: 'Arsitektur', value: 'arsitektur' },
            { label: 'Interior', value: 'interior' },
            { label: 'Eksterior', value: 'eksterior' },
            { label: 'MEP', value: 'mep' },
            { label: 'Infrastruktur', value: 'infrastruktur' },
            { label: 'Konstruksi General', value: 'konstruksi-general' },
          ],
        }),

        year: fields.text({
          label: 'Tahun',
          defaultValue: new Date().getFullYear().toString(),
        }),

        detail: fields.text({
          label: 'Detail Proyek',
          multiline: true,
          description: 'Deskripsi singkat tentang proyek ini.',
        }),

        photo: fields.image({
          label: 'Foto',
          directory: 'public/uploads/projects',
          publicPath: '/uploads/projects/',
          description: 'Format JPEG atau WebP (hindari PNG dan foto HEIC langsung dari iPhone — konversi dulu). Rasio 16:9, lebar sekitar 2200–2400px. Ukuran file idealnya di bawah 300KB — kompres dulu di squoosh.app atau tinypng.com sebelum upload.',
          validation: { isRequired: true },
        }),

        highlight: fields.checkbox({
          label: 'Tampilkan di Halaman Utama',
          description: 'Centang untuk menampilkan proyek ini di carousel Portfolio pada halaman utama.',
          defaultValue: false,
        }),
      },
    }),
  },
});
