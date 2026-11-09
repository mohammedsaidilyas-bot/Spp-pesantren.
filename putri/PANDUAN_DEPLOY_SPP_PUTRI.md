# Panduan SPP PUTRI (belum production)
1. Buka Apps Script baru khusus SPP PUTRI.
2. Salin isi `Code_SPP_PUTRI.gs`; simpan sebagai `Code.gs`.
3. Jalankan `sppPutriSetupDatabase()` satu kali. Fungsi ini membuat tab yang belum ada dan tidak menghapus tab/data yang sudah ada.
4. Di Project Settings > Script Properties, isi `SPP_PUTRI_NOMINAL` (angka tarif per bulan) dan `SPP_PUTRI_BUKTI_FOLDER_ID` (folder Drive khusus bukti PUTRI). PIN awal uji: `SPP_PUTRI_PIN_TUNAI=123456`, `SPP_PUTRI_BENDAHARA_PIN=999999`; ganti sebelum produksi.
5. Backend SPP membaca master santri dari tab `Uang Jajan Santri PPFHA` (NIS, Nama, Kelas, Asrama, Wali, NoWaWali, ...). Status bulanan disimpan terpisah di tab `StatusSPP`, agar tidak mengubah struktur master Uang Jajan. Jangan mengimpor data PUTRA.
6. Deploy sebagai Web App, akses sesuai kebutuhan, lalu ganti konstanta `urlWebApps` di `SPP_PUTRI.html` dengan URL deployment PUTRI.
7. Uji GET `?action=health`, `?action=getSantri`, `?action=getPending`; uji tulis hanya dengan NIS percobaan PUTRI.
Catatan: notifikasi WhatsApp otomatis belum dibuat di backend baru ini. Integrasi notifikasi dilakukan setelah skema nomor wali dan izin pengiriman dikonfirmasi.
