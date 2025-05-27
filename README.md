# Domekin Task Scheduler

A modern Electron.js desktop application for randomly assigning tasks from a database based on the current month and year, with support for Indonesian holidays and weekends.

## Features

- **Random Task Assignment**: Automatically distributes tasks across working days in a month
- **Indonesian Holiday Support**: Excludes Indonesian national holidays and weekends
- **Modern Dark Theme UI**: Clean, professional interface with calendar view
- **Task Management**: Add, edit, and delete tasks with categories
- **Schedule Export**: Export schedules to CSV format
- **SQLite Database**: Local database storage for tasks and schedules

## Task Fields

- **Kegiatan Harian**: Daily activities/tasks
- **Klasifikasi Tugas**: Task classification/category

## Installation

1. Clone or download this repository
2. Navigate to the project directory
3. Install dependencies:
   ```bash
   npm install
   ```

## Usage

### Starting the Application

```bash
npm start
```

### Development Mode

```bash
npm run dev
```

### Building for Distribution

```bash
npm run build
```

## How to Use

### 1. Adding Tasks

1. Click the "Manage Tasks" button or use Ctrl+M
2. Fill in the task details:
   - **Kegiatan Harian**: Enter the task name
   - **Klasifikasi Tugas**: Select or enter the task category
3. Click "Add Task"

### 2. Generating Schedule

1. Navigate to the desired month using the month selector
2. Click "Generate Schedule" or use Ctrl+N
3. The application will randomly distribute tasks across working days
4. Tasks will appear in the calendar view

### 3. Managing Schedule

- **Regenerate**: Click "Generate Schedule" again to create a new random distribution
- **Clear**: Use the "Clear Schedule" button to remove all scheduled tasks
- **Export**: Click "Export Schedule" to download as CSV

### 4. Import Tasks

1. Prepare a CSV file with the format:
   ```csv
   kegiatan_harian,klasifikasi_tugas
   "Task name","Category name"
   ```
2. Click "Import Tasks" button
3. Select your CSV file
4. Review import results

**📁 Sample File:** Use `sample_tasks.csv` as a template
**📖 Detailed Guide:** See `IMPORT_GUIDE.md` for complete instructions

### 5. Calendar Features

- **Color Coding**:
  - Blue: Working days
  - Gray: Weekends
  - Red: Indonesian holidays
  - Colored borders: Days with scheduled tasks
- **Task Categories**: Different colors for different task categories
- **Click Interaction**: Click on days to view scheduled tasks

## Task Categories

The application supports the following task categories:
- **Backup dan Pemulihan Data**: Melakukan backup atau pemulihan data
- **Prosedur Sistem Jaringan**: Menyusun prosedur pemanfaatan sistem jaringan
- **Deteksi dan Perbaikan Jaringan**: Melakukan deteksi dan atau perbaikan terhadap permasalahan yang terjadi pada sistem jaringan kompleks
- **Pemeliharaan Infrastruktur TI**: Melakukan pemeliharaan infrastruktur TI
- **Pemasangan Infrastruktur TI**: Melakukan pemasangan infrastruktur TI
- **Pengembangan Aplikasi**: Mengembangkan program aplikasi sistem informasi
- **Instalasi dan Konfigurasi**: Melakukan instalasi/upgrade dan konfigurasi sistem operasi/aplikasi
- **Editing Multimedia**: Melakukan editing objek multimedia kompleks dengan piranti lunak
- **Tugas Lainnya**: Melaksanakan tugas lainnya yang diperintahkan oleh pimpinan
- **Laporan Pelaksanaan**: Membuat laporan pelaksanaan tugas sesuai petunjuk pelaksanaan (juklak) sebagai pertanggung jawaban kerja

## Indonesian Holidays

The application includes Indonesian national holidays for 2024-2026:
- Tahun Baru Masehi
- Tahun Baru Imlek
- Hari Raya Nyepi
- Wafat Isa Almasih
- Hari Raya Idul Fitri
- Hari Buruh Internasional
- Kenaikan Isa Almasih
- Hari Raya Waisak
- Hari Lahir Pancasila
- Hari Raya Idul Adha
- Tahun Baru Islam
- Hari Kemerdekaan Indonesia
- Maulid Nabi Muhammad SAW
- Hari Raya Natal

## Technical Details

### Architecture

- **Frontend**: HTML, CSS, JavaScript with modern ES6+ features
- **Backend**: Node.js with Electron
- **Database**: SQLite for local data storage
- **Styling**: Custom CSS with CSS variables for theming

### File Structure

```
domekin/
├── main.js                 # Electron main process
├── preload.js             # Secure IPC bridge
├── package.json           # Project configuration
├── src/
│   ├── renderer/          # Frontend files
│   │   ├── index.html     # Main UI
│   │   ├── styles.css     # Styling
│   │   └── renderer.js    # Frontend logic
│   ├── database/          # Database operations
│   │   └── db.js          # SQLite database class
│   ├── utils/             # Utility modules
│   │   ├── taskScheduler.js  # Random assignment algorithm
│   │   ├── dateUtils.js      # Date utilities
│   │   └── holidays.js       # Indonesian holidays data
│   └── assets/            # Static assets
│       └── icons/         # Application icons
```

### Database Schema

#### Tasks Table
- `id`: Primary key
- `kegiatan_harian`: Task name
- `klasifikasi_tugas`: Task category
- `created_at`: Creation timestamp
- `updated_at`: Update timestamp

#### Schedules Table
- `id`: Primary key
- `task_id`: Foreign key to tasks
- `scheduled_date`: Date for the task
- `month`: Month number
- `year`: Year
- `created_at`: Creation timestamp

#### Holidays Table
- `id`: Primary key
- `date`: Holiday date
- `name`: Holiday name
- `year`: Year
- `created_at`: Creation timestamp

## Customization

### Adding More Holidays

Edit `src/utils/holidays.js` to add holidays for additional years or modify existing ones.

### Changing Schedule Algorithm

Modify `src/utils/taskScheduler.js` to adjust the random distribution algorithm:
- `maxTasksPerDay`: Maximum tasks per day
- `distributeEvenly`: Whether to distribute evenly or randomly
- `prioritizeCategories`: Categories to prioritize

### Styling

Edit `src/renderer/styles.css` to customize the appearance. The application uses CSS variables for easy theming.

## Troubleshooting

### Common Issues

1. **Database not initializing**: Check file permissions in the user data directory
2. **Tasks not appearing**: Ensure tasks are added before generating schedule
3. **Calendar not displaying**: Check console for JavaScript errors

### Development

For development, use:
```bash
npm run dev
```

This enables developer tools and additional logging.

## License

ISC License

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

For issues and questions, please create an issue in the repository.
# domekin
