const express = require('express');
const path = require('path');
const app = express();

// Database sederhana untuk data santri berdasarkan NIS
const dataSantri = {
    "20260001": { nama: "Jefry", kelas: "3 Aliyah", nominal: "150000" },
    "20260002": { nama: "Aditya", kelas: "1 Aliyah", nominal: "150000" },
    "20260003": { nama: "Fatah", kelas: "2 Tsanawiyah", nominal: "150000" },
    "20260004": { nama: "Arif", kelas: "2 Tsanawiyah", nominal: "150000" }
};

// Middleware untuk membaca file statis (HTML, CSS, Gambar) dari folder public
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint API untuk mengecek data santri berdasarkan NIS
app.get('/api/santri', (req, res) => {
    const nis = req.query.nis;
    const santri = dataSantri[nis];

    if (santri) {
        res.json({
            success: true,
            nama: santri.nama,
            kelas: santri.kelas,
            nominal: santri.nominal
        });
    } else {
        res.json({
            success: false,
            message: "Data santri dengan NIS tersebut tidak ditemukan."
        });
    }
});

// Jalankan server lokal (untuk Vercel)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server berjalan di port ${PORT}`);
});

module.exports = app;
