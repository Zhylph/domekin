const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');
const isDev = process.argv.includes('--dev');

// Keep a global reference of the window object
let mainWindow;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'src/assets/icons/icon.png'),
    titleBarStyle: 'default',
    show: false
  });

  // Load the app
  mainWindow.loadFile('src/renderer/index.html');

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Open DevTools in development
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // Emitted when the window is closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Set up menu
  createMenu();
}

function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Schedule',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow.webContents.send('menu-new-schedule');
          }
        },
        {
          label: 'Regenerate Schedule',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            mainWindow.webContents.send('menu-regenerate-schedule');
          }
        },
        { type: 'separator' },
        {
          label: 'Exit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Tasks',
      submenu: [
        {
          label: 'Manage Tasks',
          accelerator: 'CmdOrCtrl+M',
          click: () => {
            mainWindow.webContents.send('menu-manage-tasks');
          }
        },
        {
          label: 'Import Tasks',
          accelerator: 'CmdOrCtrl+I',
          click: () => {
            mainWindow.webContents.send('menu-import-tasks');
          }
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About',
          click: () => {
            mainWindow.webContents.send('menu-about');
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Database and utility modules
const Database = require('./src/database/db');
const { generateRandomSchedule } = require('./src/utils/taskScheduler');
const { getWorkingDaysInMonth, getHolidaysForYear } = require('./src/utils/holidays');

// Initialize database
let database;

// This method will be called when Electron has finished initialization
app.whenReady().then(async () => {
  try {
    database = new Database();
    await database.init();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
  }

  createWindow();
  setupIpcHandlers();
});

// Quit when all windows are closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// Helper function to parse CSV line
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result.map(field => field.replace(/^"|"$/g, '')); // Remove surrounding quotes
}

// Parse CSV file
async function parseCSVFile(filePath) {
  const fs = require('fs');
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const lines = fileContent.split('\n').map(line => line.trim()).filter(line => line);

  if (lines.length === 0) {
    return [];
  }

  // Check if first line is header
  const hasHeader = lines[0].toLowerCase().includes('kegiatan_harian') ||
                   lines[0].toLowerCase().includes('klasifikasi_tugas');

  const dataLines = hasHeader ? lines.slice(1) : lines;
  const tasks = [];

  for (const line of dataLines) {
    try {
      const fields = parseCSVLine(line);
      if (fields.length >= 2) {
        const kegiatanHarian = fields[0].trim();
        const klasifikasiTugas = fields[1].trim();

        if (kegiatanHarian && klasifikasiTugas) {
          tasks.push({
            kegiatan_harian: kegiatanHarian,
            klasifikasi_tugas: klasifikasiTugas
          });
        }
      }
    } catch (error) {
      console.error('Error parsing CSV line:', line, error);
    }
  }

  return tasks;
}

// Parse JSON file
async function parseJSONFile(filePath) {
  const fs = require('fs');
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(fileContent);

    // Support different JSON structures
    let tasks = [];

    if (Array.isArray(data)) {
      // Array of task objects
      tasks = data;
    } else if (data.tasks && Array.isArray(data.tasks)) {
      // Object with tasks property
      tasks = data.tasks;
    } else if (data.kegiatan_harian && data.klasifikasi_tugas) {
      // Single task object
      tasks = [data];
    }

    // Validate and normalize task objects
    return tasks.filter(task =>
      task &&
      typeof task === 'object' &&
      task.kegiatan_harian &&
      task.klasifikasi_tugas
    ).map(task => ({
      kegiatan_harian: String(task.kegiatan_harian).trim(),
      klasifikasi_tugas: String(task.klasifikasi_tugas).trim()
    }));

  } catch (error) {
    console.error('Error parsing JSON file:', error);
    return [];
  }
}

// Parse text file
async function parseTextFile(filePath) {
  const fs = require('fs');
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const lines = fileContent.split('\n').map(line => line.trim()).filter(line => line);

  const tasks = [];

  for (const line of lines) {
    // Support different text formats:
    // 1. "Task name | Category"
    // 2. "Task name - Category"
    // 3. "Task name : Category"
    // 4. "Task name, Category"

    let kegiatanHarian = '';
    let klasifikasiTugas = '';

    if (line.includes(' | ')) {
      [kegiatanHarian, klasifikasiTugas] = line.split(' | ');
    } else if (line.includes(' - ')) {
      [kegiatanHarian, klasifikasiTugas] = line.split(' - ');
    } else if (line.includes(' : ')) {
      [kegiatanHarian, klasifikasiTugas] = line.split(' : ');
    } else if (line.includes(', ')) {
      [kegiatanHarian, klasifikasiTugas] = line.split(', ');
    }

    if (kegiatanHarian && klasifikasiTugas) {
      tasks.push({
        kegiatan_harian: kegiatanHarian.trim(),
        klasifikasi_tugas: klasifikasiTugas.trim()
      });
    }
  }

  return tasks;
}

// Parse Excel file
async function parseExcelFile(filePath) {
  try {
    const XLSX = require('xlsx');
    const workbook = XLSX.readFile(filePath);

    // Get the first worksheet
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convert to JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    if (jsonData.length === 0) {
      return [];
    }

    // Check if first row is header
    const firstRow = jsonData[0];
    const hasHeader = firstRow.some(cell =>
      String(cell).toLowerCase().includes('kegiatan') ||
      String(cell).toLowerCase().includes('klasifikasi') ||
      String(cell).toLowerCase().includes('task') ||
      String(cell).toLowerCase().includes('category')
    );

    const dataRows = hasHeader ? jsonData.slice(1) : jsonData;
    const tasks = [];

    for (const row of dataRows) {
      if (row && row.length >= 2) {
        const kegiatanHarian = String(row[0] || '').trim();
        const klasifikasiTugas = String(row[1] || '').trim();

        if (kegiatanHarian && klasifikasiTugas) {
          tasks.push({
            kegiatan_harian: kegiatanHarian,
            klasifikasi_tugas: klasifikasiTugas
          });
        }
      }
    }

    return tasks;

  } catch (error) {
    console.error('Error parsing Excel file:', error);
    return [];
  }
}

// Setup IPC handlers
function setupIpcHandlers() {
  // Database operations
  ipcMain.handle('db-get-tasks', async () => {
    try {
      return await database.getAllTasks();
    } catch (error) {
      console.error('Error getting tasks:', error);
      throw error;
    }
  });

  ipcMain.handle('db-add-task', async (event, task) => {
    try {
      return await database.addTask(task.kegiatan_harian, task.klasifikasi_tugas);
    } catch (error) {
      console.error('Error adding task:', error);
      throw error;
    }
  });

  ipcMain.handle('db-update-task', async (event, id, task) => {
    try {
      return await database.updateTask(id, task.kegiatan_harian, task.klasifikasi_tugas);
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  });

  ipcMain.handle('db-delete-task', async (event, id) => {
    try {
      return await database.deleteTask(id);
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  });

  // Schedule operations
  ipcMain.handle('generate-schedule', async (event, month, year) => {
    try {
      const tasks = await database.getAllTasks();
      if (tasks.length === 0) {
        return [];
      }

      const schedule = generateRandomSchedule(tasks, month, year, {
        maxTasksPerDay: 3,
        distributeEvenly: true
      });

      return schedule;
    } catch (error) {
      console.error('Error generating schedule:', error);
      throw error;
    }
  });

  ipcMain.handle('get-schedule', async (event, month, year) => {
    try {
      return await database.getSchedule(month, year);
    } catch (error) {
      console.error('Error getting schedule:', error);
      throw error;
    }
  });

  ipcMain.handle('save-schedule', async (event, schedule) => {
    try {
      return await database.saveSchedule(schedule);
    } catch (error) {
      console.error('Error saving schedule:', error);
      throw error;
    }
  });

  ipcMain.handle('clear-schedule', async (event, month, year) => {
    try {
      return await database.clearSchedule(month, year);
    } catch (error) {
      console.error('Error clearing schedule:', error);
      throw error;
    }
  });

  // Utility operations
  ipcMain.handle('get-holidays', async (event, year) => {
    try {
      return getHolidaysForYear(year);
    } catch (error) {
      console.error('Error getting holidays:', error);
      throw error;
    }
  });

  ipcMain.handle('get-working-days', async (event, month, year) => {
    try {
      return getWorkingDaysInMonth(month, year);
    } catch (error) {
      console.error('Error getting working days:', error);
      throw error;
    }
  });

  // File operations
  ipcMain.handle('select-file', async () => {
    try {
      const { dialog } = require('electron');
      const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openFile'],
        filters: [
          { name: 'CSV Files', extensions: ['csv'] },
          { name: 'JSON Files', extensions: ['json'] },
          { name: 'Text Files', extensions: ['txt'] },
          { name: 'Excel Files', extensions: ['xlsx', 'xls'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      });

      return result.canceled ? null : result.filePaths[0];
    } catch (error) {
      console.error('Error selecting file:', error);
      throw error;
    }
  });

  ipcMain.handle('import-tasks-from-file', async (event, filePath) => {
    try {
      const fs = require('fs');
      const path = require('path');

      if (!fs.existsSync(filePath)) {
        return { success: false, error: 'File not found' };
      }

      const fileExtension = path.extname(filePath).toLowerCase();
      let tasks = [];

      // Parse different file formats
      switch (fileExtension) {
        case '.csv':
          tasks = await parseCSVFile(filePath);
          break;
        case '.json':
          tasks = await parseJSONFile(filePath);
          break;
        case '.txt':
          tasks = await parseTextFile(filePath);
          break;
        case '.xlsx':
        case '.xls':
          tasks = await parseExcelFile(filePath);
          break;
        default:
          // Try to parse as CSV by default
          tasks = await parseCSVFile(filePath);
      }

      if (tasks.length === 0) {
        return { success: false, error: 'No valid tasks found in file' };
      }

      let imported = 0;
      let skipped = 0;

      // Valid categories
      const validCategories = [
        'Backup dan Pemulihan Data',
        'Prosedur Sistem Jaringan',
        'Deteksi dan Perbaikan Jaringan',
        'Pemeliharaan Infrastruktur TI',
        'Pemasangan Infrastruktur TI',
        'Pengembangan Aplikasi',
        'Instalasi dan Konfigurasi',
        'Editing Multimedia',
        'Tugas Lainnya',
        'Laporan Pelaksanaan'
      ];

      // Mapping dari deskripsi lengkap ke kategori singkat
      const categoryMapping = {
        'Melakukan backup atau pemulihan data': 'Backup dan Pemulihan Data',
        'Menyusun prosedur pemanfaatan sistem jaringan': 'Prosedur Sistem Jaringan',
        'Melakukan deteksi dan atau perbaikan terhadap permasalahan yang terjadi pada sistem jaringan kompleks': 'Deteksi dan Perbaikan Jaringan',
        'Melakukan pemeliharaan infrastruktur TI': 'Pemeliharaan Infrastruktur TI',
        'Melakukan pemasangan infrastruktur TI': 'Pemasangan Infrastruktur TI',
        'Mengembangkan program aplikasi sistem informasi': 'Pengembangan Aplikasi',
        'Melakukan instalasi/upgrade dan konfigurasi sistem operasi/aplikasi': 'Instalasi dan Konfigurasi',
        'Melakukan editing objek multimedia kompleks dengan piranti lunak': 'Editing Multimedia',
        'Melaksanakan tugas lainnya yang diperintahkan oleh pimpinan': 'Tugas Lainnya',
        'Membuat laporan pelaksanaan tugas sesuai petunjuk pelaksanaan (juklak) sebagai pertanggung jawaban kerja': 'Laporan Pelaksanaan',
        'Membuat laporan pelaksanaan tugas sesuai petunjuk pelaksanaan (juklak) sebagai pertanggung jawaban kerja.': 'Laporan Pelaksanaan'
      };

      for (const task of tasks) {
        try {
          const kegiatanHarian = task.kegiatan_harian;
          let klasifikasiTugas = task.klasifikasi_tugas;

          if (kegiatanHarian && klasifikasiTugas) {
            const originalCategory = klasifikasiTugas;

            // Auto-convert dari deskripsi lengkap ke kategori singkat
            if (categoryMapping[klasifikasiTugas]) {
              klasifikasiTugas = categoryMapping[klasifikasiTugas];
              console.log(`Auto-converted: "${originalCategory}" → "${klasifikasiTugas}"`);
            }

            // Validate category
            if (validCategories.includes(klasifikasiTugas)) {
              await database.addTask(kegiatanHarian, klasifikasiTugas);
              imported++;
            } else {
              console.warn(`Invalid category: ${klasifikasiTugas}`);
              skipped++;
            }
          } else {
            skipped++;
          }
        } catch (error) {
          console.error('Error processing task:', task, error);
          skipped++;
        }
      }

      return {
        success: true,
        imported,
        skipped,
        message: `Imported ${imported} tasks, skipped ${skipped} tasks`
      };

    } catch (error) {
      console.error('Error importing tasks:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('export-tasks', async (event, tasks) => {
    try {
      const { dialog } = require('electron');
      const result = await dialog.showSaveDialog(mainWindow, {
        defaultPath: `tasks_export_${new Date().toISOString().split('T')[0]}.xlsx`,
        filters: [
          { name: 'Excel Files', extensions: ['xlsx'] },
          { name: 'CSV Files', extensions: ['csv'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      });

      if (result.canceled) {
        return { success: false, canceled: true };
      }

      const filePath = result.filePath;
      const fileExtension = path.extname(filePath).toLowerCase();

      if (fileExtension === '.xlsx') {
        await exportTasksToExcel(tasks, filePath);
      } else if (fileExtension === '.csv') {
        await exportTasksToCSV(tasks, filePath);
      } else {
        // Default to Excel if no extension
        const excelPath = filePath.endsWith('.xlsx') ? filePath : filePath + '.xlsx';
        await exportTasksToExcel(tasks, excelPath);
      }

      return { success: true, filePath };
    } catch (error) {
      console.error('Error exporting tasks:', error);
      throw error;
    }
  });

  // App info
  ipcMain.handle('get-app-version', () => {
    return app.getVersion();
  });
}

// Export functions
async function exportTasksToExcel(tasks, filePath) {
  const XLSX = require('xlsx');

  // Prepare data for Excel
  const data = [
    ['kegiatan_harian', 'klasifikasi_tugas'], // Header
    ...tasks.map(task => [task.kegiatan_harian, task.klasifikasi_tugas])
  ];

  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet(data);

  // Set column widths
  worksheet['!cols'] = [
    { wch: 50 }, // kegiatan_harian
    { wch: 30 }  // klasifikasi_tugas
  ];

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Tasks');

  // Write file
  XLSX.writeFile(workbook, filePath);
}

async function exportTasksToCSV(tasks, filePath) {
  const fs = require('fs');

  // Prepare CSV content
  const header = 'kegiatan_harian,klasifikasi_tugas\n';
  const rows = tasks.map(task =>
    `"${task.kegiatan_harian.replace(/"/g, '""')}","${task.klasifikasi_tugas.replace(/"/g, '""')}"`
  ).join('\n');

  const csvContent = header + rows;

  // Write file
  fs.writeFileSync(filePath, csvContent, 'utf8');
}

// Close database when app is closing
app.on('before-quit', () => {
  if (database) {
    database.close();
  }
});
