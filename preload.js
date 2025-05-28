const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Database operations
  getTasks: () => ipcRenderer.invoke('db-get-tasks'),
  addTask: (task) => ipcRenderer.invoke('db-add-task', task),
  updateTask: (id, task) => ipcRenderer.invoke('db-update-task', id, task),
  deleteTask: (id) => ipcRenderer.invoke('db-delete-task', id),

  // Schedule operations
  generateSchedule: (month, year) => ipcRenderer.invoke('generate-schedule', month, year),
  getSchedule: (month, year) => ipcRenderer.invoke('get-schedule', month, year),
  saveSchedule: (schedule) => ipcRenderer.invoke('save-schedule', schedule),
  clearSchedule: (month, year) => ipcRenderer.invoke('clear-schedule', month, year),

  // Utility operations
  getHolidays: (year) => ipcRenderer.invoke('get-holidays', year),
  getWorkingDays: (month, year) => ipcRenderer.invoke('get-working-days', month, year),

  // Menu event listeners
  onMenuNewSchedule: (callback) => ipcRenderer.on('menu-new-schedule', callback),
  onMenuRegenerateSchedule: (callback) => ipcRenderer.on('menu-regenerate-schedule', callback),
  onMenuManageTasks: (callback) => ipcRenderer.on('menu-manage-tasks', callback),
  onMenuImportTasks: (callback) => ipcRenderer.on('menu-import-tasks', callback),
  onMenuAbout: (callback) => ipcRenderer.on('menu-about', callback),

  // Remove listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),

  // File operations
  selectFile: () => ipcRenderer.invoke('select-file'),
  importTasksFromFile: (filePath) => ipcRenderer.invoke('import-tasks-from-file', filePath),
  exportTasks: (tasks) => ipcRenderer.invoke('export-tasks', tasks),
  exportSchedule: (schedule, month, year) => ipcRenderer.invoke('export-schedule', schedule, month, year),

  // App info
  getAppVersion: () => ipcRenderer.invoke('get-app-version')
});

// Expose Node.js APIs that are safe to use in the renderer
contextBridge.exposeInMainWorld('nodeAPI', {
  platform: process.platform,
  versions: process.versions
});
