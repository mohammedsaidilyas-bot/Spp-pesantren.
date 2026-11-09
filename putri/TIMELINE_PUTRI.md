# Timeline PUTRI PPFHA — 9 November 2026

**Aturan:** kerja di branch `putri-development`, tidak mengubah `main` atau Apps Script produksi PUTRA. Durasi di bawah adalah estimasi pekerjaan aktif, bukan proses otomatis.

| Tahap | Target relatif | Deliverable | Syarat lulus |
|---|---|---|---|
| 1 Fondasi | Hari 1–2 | Skema PUTRI, pemeriksaan header, penghubung database | Tidak ada akses tidak sengaja ke DB PUTRA |
| 2 SPP + Keuangan | Hari 3–4 | Backend pembayaran, approval, laporan, kas/SPP terpisah | Riwayat transaksi cocok dengan saldo |
| 3 Uang Jajan + Program | Hari 5–6 | Transaksi, absensi, izin, libur, pendidikan | Uji NIS PUTRI, tidak mengubah data PUTRA |
| 4 Wali terpadu | Hari 7 | Routing NIS PUTRA/PUTRI, akses wali, notifikasi | Wali hanya dapat melihat NIS yang diotorisasi |
| 5 Uji + APK | Hari 8–9 | Uji integrasi, notifikasi, APK percobaan | Lulus pengujian sebelum merge/deploy |

## Status nyata
- [x] Cabang `putri-development` dibuat di lima repository.
- [x] Clone modul awal PUTRI.
- [x] Isolasi token notifikasi, foto dan pengumuman PUTRI pada modul yang diaudit.
- [x] File fondasi skema PUTRI dibuat.
- [ ] Menjalankan preview skema di Apps Script PUTRI dan memeriksa tab aktual.
- [ ] Backend SPP dan Keuangan lengkap, termasuk persetujuan pembayaran online.
- [ ] Pengujian integrasi end-to-end.
- [ ] Routing Wali PUTRA/PUTRI dan pengujian keamanan.
- [ ] Deployment percobaan dan APK.

## Catatan implementasi
Jalankan `putriPreviewSchema()` **sebelum** `putriSetupSchema()`. Setup hanya menambah tab/header pada tab kosong; tidak menghapus atau mengganti tab yang sudah berisi. Header yang sudah ada harus diaudit manual agar sesuai dengan pembaca data setiap modul. Nama tab `Santri` dan format bulanan SPP masih harus dicocokkan dengan frontend SPP PUTRA. Skema ini fondasi, bukan bukti backend SPP/Keuangan selesai.
