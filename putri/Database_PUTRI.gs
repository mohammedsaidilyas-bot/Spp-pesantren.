/**
 * PPFHA PUTRI — database foundation, isolated Apps Script project.
 * Run putriPreviewSchema() before putriSetupSchema().
 * Existing sheets and rows are NEVER overwritten.
 */
const PUTRI_DB_ID = '1ZFOtVEoB48NytlEqtq9RrFHomHMTF7einzGIAHOp9LM';
const PUTRI_SCHEMA = Object.freeze({
  'Uang Jajan Santri PPFHA': ['nis','nama','kelas','asrama','wali','noWaWali','saldoAwal','status','nik','tempatLahir','tanggalLahir','alamat'],
  'Transaksi': ['id','tanggal','nis','nama','jenis','nominal','keterangan','petugas','saldo'],
  'Pengurus': ['id','nama','username','peran','status','passwordHash','salt'],
  'Santri': ['NIS','Nama','Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'],
  'RiwayatPembayaran': ['id','tanggal','nis','nama','periode','nominal','metode','status','petugas','catatan'],
  'PembayaranPending': ['id','tanggal','nis','nama','periode','nominal','buktiUrl','status','catatan'],
  'KasPondok': ['id','tanggal','jenis','keterangan','nominal','sumber','periode','petugas'],
  'PengeluaranSPP': ['id','tanggal','keterangan','nominal','periode','petugas'],
  'AntrianNotifikasiWali': ['kunci','dibuatPada','jenis','nis','judul','pesan','status','terkirimPada'],
  'AksesWali': ['id','kodeAkses','nisList','status'],
  'PerangkatNotifikasiWali': ['id','token','nisList','status'],
  'Izin': ['id','dibuatPada','nis','nama','jenis','status','keluar','rencanaKembali','kembali','wali','catatan','terbit'],
  'Pengumuman': ['id','dibuatPada','judul','kategori','tanggal','target','nisTarget','isi','status','tanggalMulaiLibur','tanggalAkhirLibur','tanggalKembali','jamKembali'],
  'Kegiatan': ['id','dibuatPada','judul','lokasi','tanggal','waktu','isi','status'],
  'JadwalAbsensi': ['activity','session','startTime','onTimeUntil','endTime','days','updatedAt'],
  'Absensi': ['tanggal','activity','session','nis','nama','status','waktuScan','dicatatPada','sumber'],
  'LiburAbsensi': ['tanggal','activity','session','status','catatan','updatedAt'],
  'AntrianNotifTidakHadir': ['kunci','tanggal','kegiatan','sesi','nis','nama','statusKirim','dibuatPada','terkirimPada','catatan']
});
function putriPreviewSchema() {
  const ss = SpreadsheetApp.openById(PUTRI_DB_ID);
  return Object.keys(PUTRI_SCHEMA).map(name => {
    const sh = ss.getSheetByName(name);
    if (!sh) return {name,action:'CREATE'};
    const actual = sh.getLastRow() ? sh.getRange(1,1,1,sh.getLastColumn()).getDisplayValues()[0] : [];
    const expected = PUTRI_SCHEMA[name];
    const missing = expected.filter(x => !actual.includes(x));
    return {name,action:actual.length?'KEEP_AND_REVIEW':'ADD_HEADER',rows:sh.getLastRow(),missingHeaders:missing};
  });
}
function putriSetupSchema() {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const ss = SpreadsheetApp.openById(PUTRI_DB_ID);
    const created = [], headerAdded = [], preserved = [];
    Object.keys(PUTRI_SCHEMA).forEach(name => {
      let sh = ss.getSheetByName(name);
      if (!sh) {sh=ss.insertSheet(name);created.push(name);}
      if (sh.getLastRow()===0) {
        sh.getRange(1,1,1,PUTRI_SCHEMA[name].length).setValues([PUTRI_SCHEMA[name]]);
        sh.setFrozenRows(1);headerAdded.push(name);
      } else preserved.push(name);
    });
    return {ok:true,created,headerAdded,preserved,warning:'Existing tab schemas are not migrated. Review putriPreviewSchema() results before connecting modules.'};
  } finally {lock.releaseLock();}
}
function putriCheckConnections() {
  const ss=SpreadsheetApp.openById(PUTRI_DB_ID);
  const result=putriPreviewSchema();
  return {ok:true,database:ss.getName(),spreadsheetId:ss.getId(),tabs:result,ready:result.every(x=>x.action==='KEEP_AND_REVIEW' && !x.missingHeaders.length)};
}
