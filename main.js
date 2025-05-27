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

  // Utility operations
  ipcMain.handle('get-holidays', async (event, year) => {
    try {
      return await database.getHolidays(year);
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

      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const lines = fileContent.split('\n').map(line => line.trim()).filter(line => line);

      if (lines.length === 0) {
        return { success: false, error: 'File is empty' };
      }

      // Check if first line is header
      const hasHeader = lines[0].toLowerCase().includes('kegiatan_harian') ||
                       lines[0].toLowerCase().includes('klasifikasi_tugas');

      const dataLines = hasHeader ? lines.slice(1) : lines;
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

      for (const line of dataLines) {
        try {
          // Simple CSV parsing (handles quoted fields)
          const fields = parseCSVLine(line);

          if (fields.length >= 2) {
            const kegiatanHarian = fields[0].trim();
            const klasifikasiTugas = fields[1].trim();

            if (kegiatanHarian && klasifikasiTugas) {
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
          } else {
            skipped++;
          }
        } catch (error) {
          console.error('Error processing line:', line, error);
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

  // App info
  ipcMain.handle('get-app-version', () => {
    return app.getVersion();
  });
}

// Close database when app is closing
app.on('before-quit', () => {
  if (database) {
    database.close();
  }
});
