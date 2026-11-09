/**
 * SPP PUTRI PPFHA — backend mandiri pada spreadsheet PUTRI.
 * Jalankan sppPutriSetupDatabase() sekali dari editor Apps Script.
 * Sebelum deployment: atur Script Properties SPP_PUTRI_NOMINAL,
 * SPP_PUTRI_BENDAHARA_PIN, dan SPP_PUTRI_BUKTI_FOLDER_ID.
 */
const SPP_PUTRI_DB_ID = '1ZFOtVEoB48NytlEqtq9RrFHomHMTF7einzGIAHOp9LM';
const SPP_PUTRI_MONTHS = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
const SPP_PUTRI_HEADERS = {
  Santri: ['NIS','Nama','Kelas','Asrama','Wali','NoWaWali','Status',...SPP_PUTRI_MONTHS],
  RiwayatPembayaranSPP: ['ID','Tanggal','NIS','Nama','Bulan','Nominal','Metode','Status','BuktiURL','Petugas'],
  PendingSPP: ['ID','Tanggal','NIS','Nama','Kelas','Bulan','Nominal','BuktiURL','Status'],
  KasSPP: ['ID','Tanggal','Jenis','Keterangan','Nominal','Sumber','Referensi']
};
function sppPutriDb_(){ return SpreadsheetApp.openById(SPP_PUTRI_DB_ID); }
function sppPutriSheet_(name){
  const sh=sppPutriDb_().getSheetByName(name);
  if(!sh) throw new Error('Tab '+name+' belum tersedia. Jalankan sppPutriSetupDatabase().');
  return sh;
}
function sppPutriSetupDatabase(){
  const db=sppPutriDb_(), report=[];
  Object.keys(SPP_PUTRI_HEADERS).forEach(name=>{
    let sh=db.getSheetByName(name);
    if(!sh){ sh=db.insertSheet(name); sh.getRange(1,1,1,SPP_PUTRI_HEADERS[name].length).setValues([SPP_PUTRI_HEADERS[name]]); sh.setFrozenRows(1); report.push('Dibuat: '+name); }
    else report.push('Dipertahankan: '+name+' ('+sh.getLastRow()+' baris)');
  });
  const p=PropertiesService.getScriptProperties();
  if(!p.getProperty('SPP_PUTRI_BENDAHARA_PIN')) p.setProperty('SPP_PUTRI_BENDAHARA_PIN','999999');
  if(!p.getProperty('SPP_PUTRI_PIN_TUNAI')) p.setProperty('SPP_PUTRI_PIN_TUNAI','123456');
  return report;
}
function sppPutriJson_(data){ return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON); }
function sppPutriDataRows_(tab){
  const values=sppPutriSheet_(tab).getDataRange().getDisplayValues();
  return values.length>1?values.slice(1):[];
}
function sppPutriSantri_(){
  return sppPutriDataRows_('Santri').filter(r=>String(r[0]||'').trim()).map(r=>{
    const pembayaran={}; SPP_PUTRI_MONTHS.forEach((m,i)=>pembayaran[m]=r[7+i]||'BELUM');
    return {nis:String(r[0]).trim(),nama:r[1]||'',kelas:r[2]||'',asrama:r[3]||'',wali:r[4]||'',noWaWali:r[5]||'',status:r[6]||'Aktif',pembayaran};
  });
}
function sppPutriGet_(action){
  if(action==='getSantri') return sppPutriSantri_();
  if(action==='getFotoSantri') return {};
  if(action==='getPending') return sppPutriDataRows_('PendingSPP').filter(r=>String(r[8]).toUpperCase()==='PENDING').map(r=>({id:r[0],tanggal:r[1],nis:r[2],nama:r[3],kelas:r[4],bulan:String(r[5]).split(',').map(x=>x.trim()),nominal:r[6],urlBukti:r[7]}));
  if(action==='health') return {status:'success',module:'SPP PUTRI',database:'PUTRI'};
  throw new Error('Aksi GET tidak dikenal: '+action);
}
function doGet(e){
  try { return sppPutriJson_(sppPutriGet_(String(e&&e.parameter&&e.parameter.action||'health'))); }
  catch(err){ return sppPutriJson_({status:'error',message:err.message}); }
}
function sppPutriBulan_(value){
  const arr=Array.isArray(value)?value:[value], clean=[...new Set(arr.map(x=>String(x||'').trim()))];
  if(!clean.length||clean.some(x=>!SPP_PUTRI_MONTHS.includes(x))) throw new Error('Bulan pembayaran tidak valid.');
  return clean;
}
function sppPutriFindStudent_(nis){
  const sh=sppPutriSheet_('Santri'), values=sh.getDataRange().getDisplayValues();
  const i=values.findIndex((r,n)=>n>0&&String(r[0]).trim()===nis);
  if(i<1) throw new Error('NIS tidak ditemukan pada database PUTRI.');
  return {sheet:sh,row:values[i],rowNumber:i+1};
}
function sppPutriNominal_(){
  const n=Number(PropertiesService.getScriptProperties().getProperty('SPP_PUTRI_NOMINAL'));
  if(!Number.isSafeInteger(n)||n<=0) throw new Error('Atur Script Property SPP_PUTRI_NOMINAL terlebih dahulu.');
  return n;
}
function sppPutriPost_(body){
  const action=String(body.action||'');
  if(!['uploadBukti','bayarTunai','approve'].includes(action)) throw new Error('Aksi POST tidak dikenal.');
  const nis=String(body.nis||'').trim();
  if(!/^\d{4,20}$/.test(nis)) throw new Error('NIS tidak valid.');
  const months=sppPutriBulan_(body.bulan), lock=LockService.getScriptLock();
  lock.waitLock(20000);
  try{
    const student=sppPutriFindStudent_(nis), nominal=sppPutriNominal_();
    const pending=sppPutriSheet_('PendingSPP'), history=sppPutriSheet_('RiwayatPembayaranSPP'), kas=sppPutriSheet_('KasSPP');
    const pendingRows=pending.getDataRange().getDisplayValues();
    if(action==='uploadBukti'){
      const folderId=PropertiesService.getScriptProperties().getProperty('SPP_PUTRI_BUKTI_FOLDER_ID');
      if(!folderId) throw new Error('Atur SPP_PUTRI_BUKTI_FOLDER_ID untuk penyimpanan bukti PUTRI.');
      const data=String(body.fileData||'');
      if(data.length<100||data.length>7500000) throw new Error('Ukuran file bukti tidak valid.');
      if(String(body.mimeType)!=='image/jpeg') throw new Error('Bukti pembayaran harus berupa JPEG.');
      const blob=Utilities.newBlob(Utilities.base64Decode(data),'image/jpeg','BUKTI-SPP-PUTRI-'+nis+'-'+Utilities.getUuid()+'.jpg');
      const file=DriveApp.getFolderById(folderId).createFile(blob);
      pending.appendRow([Utilities.getUuid(),new Date(),nis,student.row[1],student.row[2],months.join(','),nominal*months.length,file.getUrl(),'PENDING']);
      return {status:'success',message:'Bukti transfer PUTRI diterima dan menunggu verifikasi.'};
    }
    const props=PropertiesService.getScriptProperties();
    const expectedPin=props.getProperty(action==='bayarTunai'?'SPP_PUTRI_PIN_TUNAI':'SPP_PUTRI_BENDAHARA_PIN');
    if(!expectedPin||String(body.pin||'')!==expectedPin) throw new Error('PIN pembayaran/bendahara PUTRI salah.');
    months.forEach(m=>{
      const cell=student.row[7+SPP_PUTRI_MONTHS.indexOf(m)];
      if(String(cell||'').toUpperCase().includes('LUNAS')) throw new Error(m+' sudah lunas. Transaksi dibatalkan.');
    });
    if(action==='approve'){
      const matches=pendingRows.map((r,i)=>({r,i})).filter(x=>x.i>0&&String(x.r[2]).trim()===nis&&String(x.r[8]).toUpperCase()==='PENDING'&&String(x.r[5]).split(',').map(v=>v.trim()).sort().join('|')===months.slice().sort().join('|'));
      if(matches.length!==1) throw new Error('Bukti pending yang cocok tidak ditemukan atau lebih dari satu.');
      if(Number(matches[0].r[6])!==nominal*months.length) throw new Error('Nominal bukti tidak cocok dengan tarif SPP.');
      pending.getRange(matches[0].i+1,9).setValue('DISETUJUI');
    }
    const method=action==='approve'?'Transfer':'Tunai', id=Utilities.getUuid(), now=new Date();
    months.forEach(m=>{
      student.sheet.getRange(student.rowNumber,8+SPP_PUTRI_MONTHS.indexOf(m)).setValue('LUNAS');
      history.appendRow([id+'-'+m,now,nis,student.row[1],m,nominal,method,'LUNAS','',String(body.petugas||'Bendahara PUTRI')]);
    });
    kas.appendRow([id,now,'PEMASUKAN','SPP PUTRI '+months.join(', ')+' / NIS '+nis,nominal*months.length,method,id]);
    return {status:'success',nis,bulan:months,nominal:nominal*months.length,referensi:id};
  } finally { lock.releaseLock(); }
}
function doPost(e){
  try { const body=JSON.parse(String(e&&e.postData&&e.postData.contents||'{}')); return sppPutriJson_(sppPutriPost_(body)); }
  catch(err){ return sppPutriJson_({status:'error',message:err.message}); }
}
