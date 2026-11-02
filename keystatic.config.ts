import { config, fields, collection } from '@keystatic/core';

export default config({
  storage: {
    kind: 'cloud',
  },

  cloud: {
    project: 'aedifico/aedifico-clean',
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
            description: 'Dibuat otomatis dari nama proyek. Dipakai untuk pencarian di CMS dan alamat halaman proyek (contoh: kemang-residence). Tidak perlu diubah.',
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

        photos: fields.array(
          fields.image({
            label: 'Foto',
            directory: 'public/uploads/projects',
            publicPath: '/uploads/projects/',
            validation: { isRequired: true },
          }),
          {
            label: 'Foto-foto Proyek',
            description: 'Tambahkan satu atau lebih foto. Foto PERTAMA dalam daftar akan menjadi foto utama (ditampilkan di carousel dan halaman portfolio) — geser (drag) untuk mengubah urutan. Format JPEG atau WebP (hindari PNG dan foto HEIC langsung dari iPhone — konversi dulu). Rasio 16:9, lebar sekitar 2200–2400px. Ukuran file idealnya di bawah 300KB — kompres dulu di squoosh.app atau tinypng.com sebelum upload.',
            validation: { length: { min: 1 } },
          }
        ),

        highlight: fields.checkbox({
          label: 'Tampilkan di Halaman Utama',
          description: 'Centang untuk menampilkan proyek ini di carousel Portfolio pada halaman utama.',
          defaultValue: false,
        }),
      },
    }),
  },
});
