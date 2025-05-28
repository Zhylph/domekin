# 📊 Panduan Format Excel untuk Import Tasks

## ✅ **Format Excel yang BENAR**

### **Struktur File Excel:**

| A (Kolom 1) | B (Kolom 2) |
|-------------|-------------|
| kegiatan_harian | klasifikasi_tugas |
| Backup database server | **Backup dan Pemulihan Data** |
| Troubleshooting jaringan | **Deteksi dan Perbaikan Jaringan** |

### **Contoh File Excel yang BENAR:**

| kegiatan_harian | klasifikasi_tugas |
|-----------------|-------------------|
| Backup database server utama | Backup dan Pemulihan Data |
| Restore data dari backup | Backup dan Pemulihan Data |
| Troubleshooting koneksi internet | Deteksi dan Perbaikan Jaringan |
| Maintenance server aplikasi | Pemeliharaan Infrastruktur TI |
| Instalasi server baru | Pemasangan Infrastruktur TI |
| Develop aplikasi web | Pengembangan Aplikasi |
| Install Windows 11 | Instalasi dan Konfigurasi |
| Edit video tutorial | Editing Multimedia |
| Meeting dengan tim | Tugas Lainnya |
| Laporan bulanan IT | Laporan Pelaksanaan |

---

## ❌ **Format Excel yang SALAH**

### **Jangan gunakan deskripsi lengkap sebagai kategori:**

| kegiatan_harian | klasifikasi_tugas |
|-----------------|-------------------|
| Backup database server | ❌ Melakukan backup atau pemulihan data |
| Troubleshooting jaringan | ❌ Melakukan deteksi dan atau perbaikan terhadap permasalahan yang terjadi pada sistem jaringan kompleks |
| Maintenance server | ❌ Melakukan pemeliharaan infrastruktur TI |

---

## 📋 **Kategori yang Valid untuk Excel**

Gunakan **HANYA** kategori singkat berikut di kolom B:

1. **Backup dan Pemulihan Data**
2. **Prosedur Sistem Jaringan**
3. **Deteksi dan Perbaikan Jaringan**
4. **Pemeliharaan Infrastruktur TI**
5. **Pemasangan Infrastruktur TI**
6. **Pengembangan Aplikasi**
7. **Instalasi dan Konfigurasi**
8. **Editing Multimedia**
9. **Tugas Lainnya**
10. **Laporan Pelaksanaan**

---

## 🛠️ **Cara Membuat File Excel yang Benar**

### **Langkah 1: Buat Header**
1. Buka Excel/LibreOffice Calc/Google Sheets
2. Di cell A1 ketik: `kegiatan_harian`
3. Di cell B1 ketik: `klasifikasi_tugas`

### **Langkah 2: Isi Data**
1. Mulai dari baris 2
2. Kolom A: Nama kegiatan (bebas)
3. Kolom B: **HARUS** salah satu dari 10 kategori valid di atas

### **Langkah 3: Simpan File**
1. Save As → Excel Workbook (.xlsx)
2. Atau Export → Excel (.xls)

---

## 📁 **File Template yang Tersedia**

### **1. Template Benar (Recommended)**
- **File:** `sample_tasks_excel_correct.csv`
- **Cara pakai:** 
  1. Buka file ini di Excel
  2. Save As → Excel Workbook (.xlsx)
  3. Edit sesuai kebutuhan
  4. Import ke aplikasi

### **2. Template Lama (Untuk Konversi)**
- **File:** `sample_tasks_excel_template.csv`
- **Catatan:** Menggunakan format lama, perlu konversi manual

---

## 🔄 **Auto-Conversion (Fitur Baru)**

Aplikasi sekarang mendukung auto-conversion dari deskripsi lengkap ke kategori singkat:

### **Mapping Otomatis:**
- `Melakukan backup atau pemulihan data` → `Backup dan Pemulihan Data`
- `Menyusun prosedur pemanfaatan sistem jaringan` → `Prosedur Sistem Jaringan`
- `Melakukan deteksi dan atau perbaikan terhadap permasalahan yang terjadi pada sistem jaringan kompleks` → `Deteksi dan Perbaikan Jaringan`
- `Melakukan pemeliharaan infrastruktur TI` → `Pemeliharaan Infrastruktur TI`
- `Melakukan pemasangan infrastruktur TI` → `Pemasangan Infrastruktur TI`
- `Mengembangkan program aplikasi sistem informasi` → `Pengembangan Aplikasi`
- `Melakukan instalasi/upgrade dan konfigurasi sistem operasi/aplikasi` → `Instalasi dan Konfigurasi`
- `Melakukan editing objek multimedia kompleks dengan piranti lunak` → `Editing Multimedia`
- `Melaksanakan tugas lainnya yang diperintahkan oleh pimpinan` → `Tugas Lainnya`
- `Membuat laporan pelaksanaan tugas sesuai petunjuk pelaksanaan (juklak) sebagai pertanggung jawaban kerja` → `Laporan Pelaksanaan`

---

## 🚀 **Quick Start**

### **Cara Tercepat:**
1. Download file `sample_tasks_excel_correct.csv`
2. Buka di Excel
3. Save As → `my_tasks.xlsx`
4. Edit data sesuai kebutuhan
5. Import `my_tasks.xlsx` ke aplikasi

### **Hasil yang Diharapkan:**
- ✅ Semua tasks berhasil diimport
- ✅ Tidak ada error "Invalid category"
- ✅ Tasks muncul di kalender setelah generate schedule

---

## 🔍 **Troubleshooting**

### **Problem: "Invalid category" error**
**Solusi:** Pastikan kolom B menggunakan kategori singkat yang valid

### **Problem: Tasks tidak muncul di kalender**
**Solusi:** 
1. Cek apakah import berhasil di "Manage Tasks"
2. Klik "Generate Schedule" untuk membuat jadwal

### **Problem: File Excel tidak terbaca**
**Solusi:**
1. Pastikan file format .xlsx atau .xls
2. Pastikan ada data di kolom A dan B
3. Pastikan tidak ada baris kosong di tengah data

---

## 💡 **Tips**

1. **Copy-Paste Kategori:** Copy kategori dari daftar valid untuk menghindari typo
2. **Gunakan Template:** Mulai dari template yang sudah benar
3. **Test dengan Data Kecil:** Test import dengan 2-3 baris data dulu
4. **Backup Data:** Simpan backup file Excel sebelum import

---

**📞 Need Help?** Lihat `IMPORT_GUIDE.md` untuk panduan lengkap semua format import.
