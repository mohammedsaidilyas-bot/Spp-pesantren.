require('dotenv').config();
const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Kunci API Mayar (Akan otomatis terbaca dari sistem atau dapat diisi di Render)
const MAYAR_API_KEY = process.env.MAYAR_API_KEY || 'ISI_API_KEY_MAYAR_DI_SINI';
const MAYAR_WEBHOOK_TOKEN = process.env.MAYAR_WEBHOOK_TOKEN || '36a29daff1b2fdfc39x...';

// Data Santri & Tagihan Contoh
const dbSantri = {
  '12345': { nis: '12345', nama: 'Ahmad Fauzi', kelas: '7A', wali: 'Bpk. Hendra' },
  '12346': { nis: '12346', nama: 'Siti Aminah', kelas: '8B', wali: 'Bpk. Rahmat' }
};

const dbTagihan = [
  { id: 101, nis: '12345', bulan: 'SPP Bulan Oktober 2026', jumlah: 500000, status: 'BELUM_BAYAR' },
  { id: 102, nis: '12346', bulan: 'SPP Bulan Oktober 2026', jumlah: 500000, status: 'BELUM_BAYAR' }
];

app.get('/api/tagihan/:nis', (req, res) => {
  const santri = dbSantri[req.params.nis];
  if (!santri) return res.status(404).json({ success: false, message: 'NIS tidak ditemukan' });
  const tagihan = dbTagihan.filter(t => t.nis === req.params.nis);
  res.json({ success: true, santri, tagihan });
});

app.post('/api/bayar', async (req, res) => {
  const { tagihanId, nis } = req.body;
  const santri = dbSantri[nis];
  const tagihan = dbTagihan.find(t => t.id === Number(tagihanId));

  try {
    const response = await axios.post('https://api.mayar.id/hl/v1/invoice/create', {
      name: santri.wali,
      email: `${santri.nis}@pesantren.id`,
      amount: Number(tagihan.jumlah),
      description: `${tagihan.bulan} - ${santri.nama} (NIS: ${santri.nis})`
    }, {
      headers: { 'Authorization': `Bearer ${MAYAR_API_KEY}` }
    });

    res.json({ success: true, paymentUrl: response.data.data.link });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal menghubungkan ke Mayar.id' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Aplikasi SPP Aktif`));
