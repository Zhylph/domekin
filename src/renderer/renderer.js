// Global state
let currentMonth = new Date().getMonth() + 1;
let currentYear = new Date().getFullYear();
let currentTasks = [];
let currentSchedule = [];
let editingTaskId = null;

// DOM elements
const elements = {
  currentMonth: document.getElementById('currentMonth'),
  calendarGrid: document.getElementById('calendarGrid'),
  calendarTitle: document.getElementById('calendarTitle'),
  totalTasks: document.getElementById('totalTasks'),
  scheduledTasks: document.getElementById('scheduledTasks'),
  workingDays: document.getElementById('workingDays'),
  taskCategories: document.getElementById('taskCategories'),
  loadingOverlay: document.getElementById('loadingOverlay'),

  // Buttons
  prevMonth: document.getElementById('prevMonth'),
  nextMonth: document.getElementById('nextMonth'),
  generateSchedule: document.getElementById('generateSchedule'),
  manageTasks: document.getElementById('manageTasks'),
  exportSchedule: document.getElementById('exportSchedule'),
  exportTasks: document.getElementById('exportTasks'),
  importTasks: document.getElementById('importTasks'),
  clearSchedule: document.getElementById('clearSchedule'),

  // Task Modal
  taskModal: document.getElementById('taskModal'),
  closeTaskModal: document.getElementById('closeTaskModal'),
  taskModalTitle: document.getElementById('taskModalTitle'),
  taskName: document.getElementById('taskName'),
  taskCategory: document.getElementById('taskCategory'),
  addTask: document.getElementById('addTask'),
  updateTask: document.getElementById('updateTask'),
  cancelTask: document.getElementById('cancelTask'),
  taskListContainer: document.getElementById('taskListContainer'),

  // Task Detail Modal
  taskDetailModal: document.getElementById('taskDetailModal'),
  closeTaskDetailModal: document.getElementById('closeTaskDetailModal'),
  taskDetailContent: document.getElementById('taskDetailContent')
};

// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
  await initializeApp();
  setupEventListeners();
  await loadData();
});

// Initialize application
async function initializeApp() {
  updateMonthDisplay();
  updateCalendarTitle();
  showLoading(false);
}

// Setup event listeners
function setupEventListeners() {
  // Month navigation
  elements.prevMonth.addEventListener('click', () => navigateMonth(-1));
  elements.nextMonth.addEventListener('click', () => navigateMonth(1));

  // Main actions
  elements.generateSchedule.addEventListener('click', generateSchedule);
  elements.manageTasks.addEventListener('click', openTaskModal);
  elements.exportSchedule.addEventListener('click', exportSchedule);
  elements.exportTasks.addEventListener('click', exportTasks);
  elements.importTasks.addEventListener('click', importTasks);
  elements.clearSchedule.addEventListener('click', clearSchedule);

  // Task modal
  elements.closeTaskModal.addEventListener('click', closeTaskModal);
  elements.addTask.addEventListener('click', addTask);
  elements.updateTask.addEventListener('click', updateTask);
  elements.cancelTask.addEventListener('click', cancelTaskEdit);

  // Task detail modal
  elements.closeTaskDetailModal.addEventListener('click', closeTaskDetailModal);

  // Menu event listeners
  window.electronAPI.onMenuNewSchedule(() => generateSchedule());
  window.electronAPI.onMenuRegenerateSchedule(() => generateSchedule());
  window.electronAPI.onMenuManageTasks(() => openTaskModal());
  window.electronAPI.onMenuImportTasks(() => importTasks());

  // Close modals when clicking outside
  elements.taskModal.addEventListener('click', (e) => {
    if (e.target === elements.taskModal) closeTaskModal();
  });

  elements.taskDetailModal.addEventListener('click', (e) => {
    if (e.target === elements.taskDetailModal) closeTaskDetailModal();
  });
}

// Load initial data
async function loadData() {
  try {
    showLoading(true);
    await Promise.all([
      loadTasks(),
      loadSchedule(),
      loadWorkingDays()
    ]);
    updateUI();
  } catch (error) {
    console.error('Error loading data:', error);
    showError('Failed to load data');
  } finally {
    showLoading(false);
  }
}

// Load tasks from database
async function loadTasks() {
  try {
    currentTasks = await window.electronAPI.getTasks();
    updateTaskStats();
    updateTaskCategories();
  } catch (error) {
    console.error('Error loading tasks:', error);
    throw error;
  }
}

// Load schedule for current month
async function loadSchedule() {
  try {
    currentSchedule = await window.electronAPI.getSchedule(currentMonth, currentYear);
    updateScheduleStats();
  } catch (error) {
    console.error('Error loading schedule:', error);
    throw error;
  }
}

// Load working days count
async function loadWorkingDays() {
  try {
    const workingDays = await window.electronAPI.getWorkingDays(currentMonth, currentYear);
    elements.workingDays.textContent = workingDays.length;
  } catch (error) {
    console.error('Error loading working days:', error);
    throw error;
  }
}

// Navigate between months
async function navigateMonth(direction) {
  currentMonth += direction;

  if (currentMonth > 12) {
    currentMonth = 1;
    currentYear++;
  } else if (currentMonth < 1) {
    currentMonth = 12;
    currentYear--;
  }

  updateMonthDisplay();
  updateCalendarTitle();
  await loadData();
}

// Update month display
function updateMonthDisplay() {
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  elements.currentMonth.textContent = `${monthNames[currentMonth - 1]} ${currentYear}`;
}

// Update calendar title
function updateCalendarTitle() {
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  elements.calendarTitle.textContent = `Jadwal Tugas - ${monthNames[currentMonth - 1]} ${currentYear}`;
}

// Update task statistics
function updateTaskStats() {
  elements.totalTasks.textContent = currentTasks.length;
}

// Update schedule statistics
function updateScheduleStats() {
  elements.scheduledTasks.textContent = currentSchedule.length;
}

// Update task categories display
function updateTaskCategories() {
  const categoryCount = {};
  currentTasks.forEach(task => {
    const category = task.klasifikasi_tugas || 'Other';
    categoryCount[category] = (categoryCount[category] || 0) + 1;
  });

  elements.taskCategories.innerHTML = '';

  Object.entries(categoryCount).forEach(([category, count]) => {
    const categoryItem = document.createElement('div');
    categoryItem.className = 'category-item';
    categoryItem.innerHTML = `
      <span>${category}</span>
      <span class="category-count">${count}</span>
    `;
    elements.taskCategories.appendChild(categoryItem);
  });
}

// Generate calendar grid
async function generateCalendar() {
  try {
    const calendarData = await window.electronAPI.getWorkingDays(currentMonth, currentYear);
    const holidays = await window.electronAPI.getHolidays(currentYear);

    // Create calendar grid
    const firstDay = new Date(currentYear, currentMonth - 1, 1);
    const lastDay = new Date(currentYear, currentMonth, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    elements.calendarGrid.innerHTML = '';

    // Add day headers
    const dayHeaders = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    dayHeaders.forEach(day => {
      const headerElement = document.createElement('div');
      headerElement.className = 'calendar-header-day';
      headerElement.textContent = day;
      headerElement.style.cssText = `
        background-color: var(--bg-tertiary);
        padding: 0.75rem;
        text-align: center;
        font-weight: 600;
        font-size: 0.875rem;
        color: var(--text-secondary);
      `;
      elements.calendarGrid.appendChild(headerElement);
    });

    // Add empty cells for days before month starts
    for (let i = 0; i < startDayOfWeek; i++) {
      const emptyDay = document.createElement('div');
      emptyDay.className = 'calendar-day empty';
      elements.calendarGrid.appendChild(emptyDay);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth - 1, day);
      const dateString = date.toISOString().split('T')[0];

      const dayElement = document.createElement('div');
      dayElement.className = 'calendar-day';
      dayElement.dataset.date = dateString;

      // Check if it's weekend
      const dayOfWeek = date.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        dayElement.classList.add('weekend');
      }

      // Check if it's holiday
      const isHoliday = holidays.some(holiday => holiday.date === dateString);
      if (isHoliday) {
        dayElement.classList.add('holiday');
      }

      // Add day number with task indicator
      const dayNumber = document.createElement('div');
      dayNumber.className = 'day-number';

      const dayNumberText = document.createElement('span');
      dayNumberText.textContent = day;
      dayNumber.appendChild(dayNumberText);

      // Add scheduled tasks for this day
      const dayTasks = currentSchedule.filter(task => task.scheduled_date === dateString);
      if (dayTasks.length > 0) {
        dayElement.classList.add('has-task');

        // Create task indicator
        const taskIndicator = document.createElement('div');
        taskIndicator.className = 'task-indicator';

        // Add task count
        const taskCount = document.createElement('div');
        taskCount.className = 'task-count';
        taskCount.textContent = dayTasks.length;
        taskIndicator.appendChild(taskCount);

        // Add task dots (max 5 dots)
        const taskDots = document.createElement('div');
        taskDots.className = 'task-dots';

        const maxDots = Math.min(dayTasks.length, 5);
        for (let i = 0; i < maxDots; i++) {
          const dot = document.createElement('div');
          dot.className = `task-dot category-${dayTasks[i].klasifikasi_tugas.toLowerCase().replace(/\s+/g, '-')}`;
          dot.title = dayTasks[i].klasifikasi_tugas;
          taskDots.appendChild(dot);
        }

        taskIndicator.appendChild(taskDots);
        dayNumber.appendChild(taskIndicator);
      }

      dayElement.appendChild(dayNumber);

      // Add click event for day
      dayElement.addEventListener('click', () => {
        if (dayTasks.length > 0) {
          showDayTasks(dateString, dayTasks);
        }
      });

      elements.calendarGrid.appendChild(dayElement);
    }
  } catch (error) {
    console.error('Error generating calendar:', error);
    showError('Failed to generate calendar');
  }
}

// Update UI
async function updateUI() {
  await generateCalendar();
}

// Show loading overlay
function showLoading(show) {
  if (show) {
    elements.loadingOverlay.classList.remove('hidden');
  } else {
    elements.loadingOverlay.classList.add('hidden');
  }
}

// Show error message
function showError(message) {
  // Simple error display - could be enhanced with a proper notification system
  alert(`Error: ${message}`);
}

// Show success message
function showSuccess(message) {
  // Simple success display - could be enhanced with a proper notification system
  console.log(`Success: ${message}`);
}

// Generate schedule
async function generateSchedule() {
  if (currentTasks.length === 0) {
    showError('No tasks available. Please add some tasks first.');
    return;
  }

  try {
    showLoading(true);
    const newSchedule = await window.electronAPI.generateSchedule(currentMonth, currentYear);
    await window.electronAPI.saveSchedule(newSchedule);
    await loadSchedule();
    await updateUI();
    showSuccess('Schedule generated successfully!');
  } catch (error) {
    console.error('Error generating schedule:', error);
    showError('Failed to generate schedule');
  } finally {
    showLoading(false);
  }
}

// Clear schedule
async function clearSchedule() {
  if (currentSchedule.length === 0) {
    showError('No schedule to clear.');
    return;
  }

  if (confirm('Are you sure you want to clear the current schedule?')) {
    try {
      showLoading(true);
      await window.electronAPI.clearSchedule(currentMonth, currentYear);
      await loadSchedule();
      await updateUI();
      showSuccess('Schedule cleared successfully!');
    } catch (error) {
      console.error('Error clearing schedule:', error);
      showError('Failed to clear schedule');
    } finally {
      showLoading(false);
    }
  }
}

// Export tasks to Excel/CSV
async function exportTasks() {
  if (currentTasks.length === 0) {
    showError('No tasks to export. Please add some tasks first.');
    return;
  }

  try {
    showLoading(true);
    const result = await window.electronAPI.exportTasks(currentTasks);
    if (result.success) {
      showSuccess(`Tasks exported successfully to: ${result.filePath}`);
    } else {
      showError('Export was cancelled or failed');
    }
  } catch (error) {
    console.error('Error exporting tasks:', error);
    showError('Failed to export tasks');
  } finally {
    showLoading(false);
  }
}

// Task Modal Functions
function openTaskModal() {
  editingTaskId = null;
  elements.taskModalTitle.textContent = 'Manage Tasks';
  elements.taskName.value = '';
  elements.taskCategory.value = '';
  elements.addTask.classList.remove('hidden');
  elements.updateTask.classList.add('hidden');
  elements.taskModal.classList.remove('hidden');
  loadTaskList();
}

function closeTaskModal() {
  elements.taskModal.classList.add('hidden');
  editingTaskId = null;
}

function cancelTaskEdit() {
  editingTaskId = null;
  elements.taskName.value = '';
  elements.taskCategory.value = '';
  elements.addTask.classList.remove('hidden');
  elements.updateTask.classList.add('hidden');
}

// Add new task
async function addTask() {
  const name = elements.taskName.value.trim();
  const category = elements.taskCategory.value.trim();

  if (!name || !category) {
    showError('Please fill in all fields');
    return;
  }

  try {
    await window.electronAPI.addTask({ kegiatan_harian: name, klasifikasi_tugas: category });
    await loadTasks();
    loadTaskList();
    cancelTaskEdit();
    showSuccess('Task added successfully!');
  } catch (error) {
    console.error('Error adding task:', error);
    showError('Failed to add task');
  }
}

// Update existing task
async function updateTask() {
  if (!editingTaskId) return;

  const name = elements.taskName.value.trim();
  const category = elements.taskCategory.value.trim();

  if (!name || !category) {
    showError('Please fill in all fields');
    return;
  }

  try {
    await window.electronAPI.updateTask(editingTaskId, { kegiatan_harian: name, klasifikasi_tugas: category });
    await loadTasks();
    loadTaskList();
    cancelTaskEdit();
    showSuccess('Task updated successfully!');
  } catch (error) {
    console.error('Error updating task:', error);
    showError('Failed to update task');
  }
}

// Load task list in modal
function loadTaskList() {
  elements.taskListContainer.innerHTML = '';

  if (currentTasks.length === 0) {
    elements.taskListContainer.innerHTML = '<p class="text-muted text-center">No tasks available</p>';
    return;
  }

  currentTasks.forEach(task => {
    const taskItem = document.createElement('div');
    taskItem.className = 'task-item';
    taskItem.innerHTML = `
      <div class="task-info">
        <div class="task-name">${task.kegiatan_harian}</div>
        <div class="task-category">${task.klasifikasi_tugas}</div>
      </div>
      <div class="task-actions">
        <button class="btn btn-outline" onclick="editTask(${task.id})">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn btn-danger" onclick="deleteTask(${task.id})">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `;
    elements.taskListContainer.appendChild(taskItem);
  });
}

// Edit task
function editTask(taskId) {
  const task = currentTasks.find(t => t.id === taskId);
  if (!task) return;

  editingTaskId = taskId;
  elements.taskName.value = task.kegiatan_harian;
  elements.taskCategory.value = task.klasifikasi_tugas;
  elements.addTask.classList.add('hidden');
  elements.updateTask.classList.remove('hidden');
}

// Delete task
async function deleteTask(taskId) {
  if (confirm('Are you sure you want to delete this task?')) {
    try {
      await window.electronAPI.deleteTask(taskId);
      await loadTasks();
      loadTaskList();
      showSuccess('Task deleted successfully!');
    } catch (error) {
      console.error('Error deleting task:', error);
      showError('Failed to delete task');
    }
  }
}

// Show task detail modal
function showTaskDetail(task) {
  elements.taskDetailContent.innerHTML = `
    <div class="task-detail">
      <h4>${task.kegiatan_harian}</h4>
      <p><strong>Category:</strong> ${task.klasifikasi_tugas}</p>
      <p><strong>Scheduled Date:</strong> ${formatDate(task.scheduled_date)}</p>
    </div>
  `;
  elements.taskDetailModal.classList.remove('hidden');
}

// Close task detail modal
function closeTaskDetailModal() {
  elements.taskDetailModal.classList.add('hidden');
}

// Show day tasks
function showDayTasks(date, tasks) {
  const formattedDate = formatDate(date);
  const dayName = new Date(date).toLocaleDateString('id-ID', { weekday: 'long' });

  const content = `
    <div class="day-tasks">
      <div class="day-header">
        <h4>${dayName}, ${formattedDate}</h4>
        <div class="task-summary">
          <span class="task-count-badge">${tasks.length} Task${tasks.length > 1 ? 's' : ''}</span>
        </div>
      </div>

      <div class="task-list-detailed">
        ${tasks.map((task, index) => `
          <div class="task-item-detailed">
            <div class="task-number">${index + 1}</div>
            <div class="task-content">
              <div class="task-name">${task.kegiatan_harian}</div>
              <div class="task-category-badge category-${task.klasifikasi_tugas.toLowerCase().replace(/\s+/g, '-')}">
                ${task.klasifikasi_tugas}
              </div>
            </div>
          </div>
        `).join('')}
      </div>

      <div class="task-actions-footer">
        <button class="btn btn-outline" onclick="closeTaskDetailModal()">
          <i class="fas fa-times"></i> Close
        </button>
      </div>
    </div>
  `;

  elements.taskDetailContent.innerHTML = content;
  elements.taskDetailModal.classList.remove('hidden');
}

// Export schedule
async function exportSchedule() {
  if (currentSchedule.length === 0) {
    showError('No schedule to export');
    return;
  }

  try {
    // Create CSV content
    const csvContent = [
      'Date,Task,Category',
      ...currentSchedule.map(item =>
        `${item.scheduled_date},"${item.kegiatan_harian}","${item.klasifikasi_tugas}"`
      )
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `schedule-${currentMonth}-${currentYear}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    showSuccess('Schedule exported successfully!');
  } catch (error) {
    console.error('Error exporting schedule:', error);
    showError('Failed to export schedule');
  }
}

// Import tasks
async function importTasks() {
  try {
    const filePath = await window.electronAPI.selectFile();
    if (filePath) {
      showLoading(true);
      const result = await window.electronAPI.importTasksFromFile(filePath);

      if (result.success) {
        await loadTasks();
        if (elements.taskModal && !elements.taskModal.classList.contains('hidden')) {
          loadTaskList();
        }
        showSuccess(`Successfully imported ${result.imported} tasks. ${result.skipped} tasks were skipped.`);
      } else {
        showError(`Import failed: ${result.error}`);
      }
    }
  } catch (error) {
    console.error('Error importing tasks:', error);
    showError('Failed to import tasks');
  } finally {
    showLoading(false);
  }
}

// Utility function to format date
function formatDate(dateString) {
  const date = new Date(dateString);
  const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  return date.toLocaleDateString('id-ID', options);
}

// Make functions globally available for onclick handlers
window.editTask = editTask;
window.deleteTask = deleteTask;
