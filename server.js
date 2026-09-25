const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Database contoh data santri berdasarkan NIS
const databaseSantri = {
    "12345": {
        nama: "Ahmad Fauzi",
        kelas: "VII A",
        bulan: "Januari 2026",
        nominal: "Rp 350.000",
        rawNominal: 350000
    },
    "67890": {
        nama: "Siti Aminah",
        kelas: "VIII B",
        bulan: "Januari 2026",
        nominal: "Rp 350.000",
        rawNominal: 350000
    }
};

// Endpoint untuk cek NIS
app.get('/cek-nis/:nis', (req, res) => {
    const nis = req.params.nis;
    const santri = databaseSantri[nis];

    if (santri) {
        res.json({
            success: true,
            nama: santri.nama,
            kelas: santri.kelas,
            bulan: santri.bulan,
            nominal: santri.nominal
        });
    } else {
        res.status(404).json({
            success: false,
            message: "NIS tidak ditemukan di database pesantren."
        });
    }
});

// Endpoint untuk memproses pembayaran
app.post('/bayar', (req, res) => {
    const { nis } = req.body;
    const santri = databaseSantri[nis];

    if (!santri) {
        return res.status(404).json({ success: false, message: "Data santri tidak valid." });
    }

    // Simulasi link pembayaran (bisa diintegrasikan dengan API asli Mayar.id nantinya)
    const paymentUrl = `https://mayar.id/pay/spp-${nis}-${Date.now()}`;

    res.json({
        success: true,
        paymentUrl: paymentUrl
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server berjalan di port ${PORT}`);
});

module.exports = app;
