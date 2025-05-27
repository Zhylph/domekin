# 📥 Panduan Import Tasks - Domekin Task Scheduler

## 📋 Format File CSV

### **1. Struktur File CSV**

File CSV harus memiliki 2 kolom dengan header berikut:

```csv
kegiatan_harian,klasifikasi_tugas
```

### **2. Contoh File CSV**

```csv
kegiatan_harian,klasifikasi_tugas
"Backup database server utama","Backup dan Pemulihan Data"
"Restore data dari backup mingguan","Backup dan Pemulihan Data"
"Membuat prosedur konfigurasi router","Prosedur Sistem Jaringan"
"Troubleshooting koneksi internet","Deteksi dan Perbaikan Jaringan"
"Maintenance server aplikasi","Pemeliharaan Infrastruktur TI"
"Instalasi server baru","Pemasangan Infrastruktur TI"
"Develop modul login sistem","Pengembangan Aplikasi"
"Install Windows 11 di laptop","Instalasi dan Konfigurasi"
"Edit video tutorial sistem","Editing Multimedia"
"Koordinasi dengan vendor","Tugas Lainnya"
"Laporan bulanan aktivitas IT","Laporan Pelaksanaan"
```

## ✅ **Kategori Tugas yang Valid**

File CSV harus menggunakan salah satu dari kategori berikut:

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

## 🚀 **Cara Import Tasks**

### **Langkah 1: Persiapkan File CSV**
1. Buat file CSV dengan format yang benar
2. Pastikan menggunakan kategori yang valid
3. Simpan file dengan ekstensi `.csv`

### **Langkah 2: Import ke Aplikasi**
1. Buka aplikasi Domekin Task Scheduler
2. Klik tombol **"Import Tasks"** di sidebar
3. Pilih file CSV yang sudah disiapkan
4. Tunggu proses import selesai
5. Aplikasi akan menampilkan hasil import

### **Langkah 3: Verifikasi Import**
1. Klik **"Manage Tasks"** untuk melihat tasks yang diimport
2. Periksa apakah semua tasks berhasil diimport
3. Generate schedule untuk melihat tasks di kalender

## 📝 **Aturan Format CSV**

### **✅ Format yang Benar:**
```csv
"Backup database server","Backup dan Pemulihan Data"
"Install software baru","Instalasi dan Konfigurasi"
```

### **❌ Format yang Salah:**
```csv
Backup database server,Invalid Category  # Kategori tidak valid
"","Backup dan Pemulihan Data"           # Kegiatan kosong
"Install software"                       # Hanya 1 kolom
```

## 🔧 **Tips dan Troubleshooting**

### **Tips:**
- Gunakan tanda kutip (`"`) untuk text yang mengandung koma
- Pastikan tidak ada baris kosong di tengah file
- Header bisa menggunakan `kegiatan_harian,klasifikasi_tugas` atau tanpa header
- File bisa berisi campuran tasks dengan kategori berbeda

### **Troubleshooting:**

**❓ "Import failed: File not found"**
- Pastikan file CSV ada dan path benar
- Coba pilih file lagi

**❓ "Import failed: File is empty"**
- File CSV kosong atau hanya berisi whitespace
- Tambahkan data tasks ke file

**❓ "X tasks were skipped"**
- Tasks dengan kategori tidak valid akan diskip
- Periksa nama kategori sesuai daftar yang valid
- Pastikan format CSV benar (2 kolom)

**❓ Tasks tidak muncul di kalender**
- Import hanya menambah tasks ke database
- Klik "Generate Schedule" untuk membuat jadwal
- Tasks akan muncul di kalender setelah generate schedule

## 📁 **File Contoh**

File `sample_tasks.csv` disediakan sebagai contoh format yang benar. File ini berisi 20 contoh tasks dengan berbagai kategori.

### **Cara Menggunakan File Contoh:**
1. Buka file `sample_tasks.csv` di folder aplikasi
2. Edit sesuai kebutuhan atau gunakan sebagai template
3. Import file tersebut ke aplikasi

## 🎯 **Best Practices**

1. **Penamaan Tasks:**
   - Gunakan nama yang jelas dan deskriptif
   - Hindari singkatan yang tidak jelas
   - Contoh: "Backup database server utama" ✅ vs "Backup DB" ❌

2. **Kategorisasi:**
   - Pilih kategori yang paling sesuai dengan jenis pekerjaan
   - Gunakan "Tugas Lainnya" untuk tasks yang tidak masuk kategori lain

3. **Organisasi File:**
   - Kelompokkan tasks serupa dalam satu file
   - Buat file terpisah untuk periode atau proyek berbeda
   - Backup file CSV sebelum import

4. **Testing:**
   - Test dengan file kecil terlebih dahulu
   - Verifikasi hasil import sebelum import file besar
   - Hapus tasks yang salah jika diperlukan

## 📊 **Contoh Skenario Import**

### **Skenario 1: Import Tasks Bulanan**
```csv
kegiatan_harian,klasifikasi_tugas
"Backup mingguan server","Backup dan Pemulihan Data"
"Laporan kinerja IT bulan ini","Laporan Pelaksanaan"
"Maintenance rutin server","Pemeliharaan Infrastruktur TI"
```

### **Skenario 2: Import Tasks Proyek**
```csv
kegiatan_harian,klasifikasi_tugas
"Setup server untuk proyek X","Pemasangan Infrastruktur TI"
"Develop API untuk proyek X","Pengembangan Aplikasi"
"Testing sistem proyek X","Pengembangan Aplikasi"
"Dokumentasi proyek X","Laporan Pelaksanaan"
```

---

**💡 Tip:** Gunakan Excel atau Google Sheets untuk membuat file CSV dengan mudah, lalu save as CSV format.

**⚠️ Perhatian:** Import akan menambahkan tasks baru ke database. Tasks yang sudah ada tidak akan terhapus.
