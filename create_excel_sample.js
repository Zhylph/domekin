const XLSX = require('xlsx');

// Data untuk file Excel
const data = [
  // Header
  ['kegiatan_harian', 'klasifikasi_tugas'],
  
  // Data tasks dengan kategori yang benar
  ['Backup database server utama', 'Backup dan Pemulihan Data'],
  ['Restore data dari backup mingguan', 'Backup dan Pemulihan Data'],
  ['Backup file konfigurasi sistem', 'Backup dan Pemulihan Data'],
  
  ['Membuat prosedur konfigurasi router', 'Prosedur Sistem Jaringan'],
  ['Dokumentasi topologi jaringan', 'Prosedur Sistem Jaringan'],
  ['Update dokumentasi SOP jaringan', 'Prosedur Sistem Jaringan'],
  
  ['Troubleshooting koneksi internet', 'Deteksi dan Perbaikan Jaringan'],
  ['Perbaikan switch yang rusak', 'Deteksi dan Perbaikan Jaringan'],
  ['Diagnosa masalah bandwidth', 'Deteksi dan Perbaikan Jaringan'],
  ['Perbaikan kabel jaringan', 'Deteksi dan Perbaikan Jaringan'],
  
  ['Maintenance server aplikasi', 'Pemeliharaan Infrastruktur TI'],
  ['Update firmware router', 'Pemeliharaan Infrastruktur TI'],
  ['Cleaning hardware server', 'Pemeliharaan Infrastruktur TI'],
  ['Monitoring performa sistem', 'Pemeliharaan Infrastruktur TI'],
  
  ['Instalasi server baru', 'Pemasangan Infrastruktur TI'],
  ['Setup workstation karyawan baru', 'Pemasangan Infrastruktur TI'],
  ['Pemasangan access point WiFi', 'Pemasangan Infrastruktur TI'],
  ['Instalasi CCTV kantor', 'Pemasangan Infrastruktur TI'],
  
  ['Develop modul login sistem', 'Pengembangan Aplikasi'],
  ['Testing aplikasi web', 'Pengembangan Aplikasi'],
  ['Debugging aplikasi mobile', 'Pengembangan Aplikasi'],
  ['Code review aplikasi', 'Pengembangan Aplikasi'],
  ['Deploy aplikasi ke production', 'Pengembangan Aplikasi'],
  
  ['Install Windows 11 di laptop', 'Instalasi dan Konfigurasi'],
  ['Konfigurasi email server', 'Instalasi dan Konfigurasi'],
  ['Setup antivirus workstation', 'Instalasi dan Konfigurasi'],
  ['Konfigurasi printer jaringan', 'Instalasi dan Konfigurasi'],
  ['Update driver hardware', 'Instalasi dan Konfigurasi'],
  
  ['Edit video tutorial sistem', 'Editing Multimedia'],
  ['Design banner untuk website', 'Editing Multimedia'],
  ['Editing foto untuk presentasi', 'Editing Multimedia'],
  ['Membuat infografis IT', 'Editing Multimedia'],
  
  ['Koordinasi dengan vendor', 'Tugas Lainnya'],
  ['Meeting dengan tim IT', 'Tugas Lainnya'],
  ['Training karyawan baru', 'Tugas Lainnya'],
  ['Presentasi ke management', 'Tugas Lainnya'],
  ['Evaluasi kinerja tim', 'Tugas Lainnya'],
  
  ['Laporan bulanan aktivitas IT', 'Laporan Pelaksanaan'],
  ['Dokumentasi SOP baru', 'Laporan Pelaksanaan'],
  ['Laporan inventory hardware', 'Laporan Pelaksanaan'],
  ['Dokumentasi troubleshooting', 'Laporan Pelaksanaan'],
  ['Laporan keamanan sistem', 'Laporan Pelaksanaan']
];

// Buat workbook baru
const workbook = XLSX.utils.book_new();

// Buat worksheet dari data
const worksheet = XLSX.utils.aoa_to_sheet(data);

// Set lebar kolom
const colWidths = [
  { wch: 40 }, // Kolom A (kegiatan_harian)
  { wch: 30 }  // Kolom B (klasifikasi_tugas)
];
worksheet['!cols'] = colWidths;

// Style untuk header
const headerStyle = {
  font: { bold: true, color: { rgb: "FFFFFF" } },
  fill: { fgColor: { rgb: "366092" } },
  alignment: { horizontal: "center", vertical: "center" }
};

// Apply style ke header (A1 dan B1)
if (!worksheet['A1'].s) worksheet['A1'].s = {};
if (!worksheet['B1'].s) worksheet['B1'].s = {};
Object.assign(worksheet['A1'].s, headerStyle);
Object.assign(worksheet['B1'].s, headerStyle);

// Tambahkan worksheet ke workbook
XLSX.utils.book_append_sheet(workbook, worksheet, 'Tasks');

// Simpan file Excel
const fileName = 'sample_tasks.xlsx';
XLSX.writeFile(workbook, fileName);

console.log(`✅ File Excel berhasil dibuat: ${fileName}`);
console.log(`📊 Total tasks: ${data.length - 1} (tidak termasuk header)`);
console.log(`📁 Lokasi file: ${__dirname}/${fileName}`);
console.log(`\n🎯 Cara menggunakan:`);
console.log(`1. Buka file ${fileName} di Excel`);
console.log(`2. Edit data sesuai kebutuhan`);
console.log(`3. Save file (tetap format .xlsx)`);
console.log(`4. Import file ke aplikasi Domekin`);
console.log(`\n📋 Kategori yang tersedia:`);
console.log(`- Backup dan Pemulihan Data`);
console.log(`- Prosedur Sistem Jaringan`);
console.log(`- Deteksi dan Perbaikan Jaringan`);
console.log(`- Pemeliharaan Infrastruktur TI`);
console.log(`- Pemasangan Infrastruktur TI`);
console.log(`- Pengembangan Aplikasi`);
console.log(`- Instalasi dan Konfigurasi`);
console.log(`- Editing Multimedia`);
console.log(`- Tugas Lainnya`);
console.log(`- Laporan Pelaksanaan`);
