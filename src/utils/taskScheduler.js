const { getWorkingDaysInMonth } = require('./holidays');
const { toISODateString } = require('./dateUtils');

/**
 * Shuffle array using Fisher-Yates algorithm
 * @param {Array} array - Array to shuffle
 * @returns {Array} Shuffled array
 */
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Generate random schedule for tasks in a given month with special rules
 * @param {Array} tasks - Array of task objects
 * @param {number} month - Month (1-12)
 * @param {number} year - Year
 * @param {Object} options - Scheduling options
 * @returns {Array} Array of scheduled task objects
 */
function generateRandomSchedule(tasks, month, year, options = {}) {
  const {
    maxTasksPerDay = 3,
    minTasksPerDay = 1,
    distributeEvenly = true,
    prioritizeCategories = [],
    excludeDates = []
  } = options;

  if (!tasks || tasks.length === 0) {
    return [];
  }

  // Get all working days for the month
  let workingDays = getWorkingDaysInMonth(month, year);

  // Exclude specific dates if provided
  if (excludeDates.length > 0) {
    workingDays = workingDays.filter(date => {
      const dateString = toISODateString(date);
      return !excludeDates.includes(dateString);
    });
  }

  if (workingDays.length === 0) {
    return [];
  }

  // Use new smart distribution algorithm
  return distributeTasksWithRules(tasks, workingDays, maxTasksPerDay, month, year);
}

/**
 * Distribute tasks with special rules:
 * 1. Each task must appear at least once per month
 * 2. Backup tasks only on last working days of month
 * 3. Maximum 3 tasks per day
 * @param {Array} tasks - Array of tasks
 * @param {Array} workingDays - Array of working days
 * @param {number} maxTasksPerDay - Maximum tasks per day
 * @param {number} month - Month number
 * @param {number} year - Year number
 * @returns {Array} Scheduled tasks
 */
function distributeTasksWithRules(tasks, workingDays, maxTasksPerDay, month, year) {
  const schedule = [];

  // Separate backup tasks from other tasks
  const backupTasks = tasks.filter(task =>
    task.klasifikasi_tugas === 'Backup dan Pemulihan Data'
  );
  const otherTasks = tasks.filter(task =>
    task.klasifikasi_tugas !== 'Backup dan Pemulihan Data'
  );

  // Get last working days for backup tasks (last 3-5 working days)
  const totalWorkingDays = workingDays.length;
  const backupDaysCount = Math.min(Math.ceil(totalWorkingDays * 0.2), 5); // 20% of month or max 5 days
  const lastWorkingDays = workingDays.slice(-backupDaysCount);
  const regularWorkingDays = workingDays.slice(0, -backupDaysCount);

  console.log(`Total working days: ${totalWorkingDays}`);
  console.log(`Backup days: ${backupDaysCount} (last ${backupDaysCount} days)`);
  console.log(`Regular days: ${regularWorkingDays.length}`);

  // Step 1: Ensure each non-backup task appears at least once
  const guaranteedTasks = [];
  otherTasks.forEach(task => {
    guaranteedTasks.push({
      task_id: task.id,
      scheduled_date: null, // Will be assigned later
      kegiatan_harian: task.kegiatan_harian,
      klasifikasi_tugas: task.klasifikasi_tugas,
      isGuaranteed: true
    });
  });

  // Step 2: Ensure each backup task appears at least once in last working days
  backupTasks.forEach(task => {
    guaranteedTasks.push({
      task_id: task.id,
      scheduled_date: null, // Will be assigned later
      kegiatan_harian: task.kegiatan_harian,
      klasifikasi_tugas: task.klasifikasi_tugas,
      isGuaranteed: true,
      isBackup: true
    });
  });

  // Step 3: Distribute guaranteed tasks
  const shuffledGuaranteedTasks = shuffleArray(guaranteedTasks);
  const daySchedule = {}; // Track tasks per day

  // Initialize day schedule
  workingDays.forEach(day => {
    daySchedule[toISODateString(day)] = [];
  });

  // Assign guaranteed backup tasks to last working days
  const backupTasksToAssign = shuffledGuaranteedTasks.filter(task => task.isBackup);
  const shuffledLastDays = shuffleArray([...lastWorkingDays]);

  backupTasksToAssign.forEach((task, index) => {
    const dayIndex = index % shuffledLastDays.length;
    const assignedDay = shuffledLastDays[dayIndex];
    const dateString = toISODateString(assignedDay);

    if (daySchedule[dateString].length < maxTasksPerDay) {
      task.scheduled_date = dateString;
      daySchedule[dateString].push(task);
      schedule.push(task);
    }
  });

  // Assign guaranteed non-backup tasks to regular working days
  const nonBackupTasksToAssign = shuffledGuaranteedTasks.filter(task => !task.isBackup);
  const shuffledRegularDays = shuffleArray([...regularWorkingDays]);

  nonBackupTasksToAssign.forEach((task, index) => {
    let assigned = false;

    // Try to assign to regular days first
    for (let i = 0; i < shuffledRegularDays.length && !assigned; i++) {
      const dayIndex = (index + i) % shuffledRegularDays.length;
      const assignedDay = shuffledRegularDays[dayIndex];
      const dateString = toISODateString(assignedDay);

      if (daySchedule[dateString].length < maxTasksPerDay) {
        task.scheduled_date = dateString;
        daySchedule[dateString].push(task);
        schedule.push(task);
        assigned = true;
      }
    }

    // If can't assign to regular days, try last working days (but avoid backup conflicts)
    if (!assigned) {
      for (let i = 0; i < shuffledLastDays.length && !assigned; i++) {
        const assignedDay = shuffledLastDays[i];
        const dateString = toISODateString(assignedDay);

        if (daySchedule[dateString].length < maxTasksPerDay) {
          task.scheduled_date = dateString;
          daySchedule[dateString].push(task);
          schedule.push(task);
          assigned = true;
        }
      }
    }
  });

  // Step 4: Fill remaining slots with random tasks (prioritize variety)
  const allAvailableTasks = [...otherTasks, ...backupTasks];
  const remainingSlots = calculateRemainingSlots(daySchedule, maxTasksPerDay);

  console.log(`Remaining slots to fill: ${remainingSlots}`);

  if (remainingSlots > 0) {
    fillRemainingSlots(schedule, daySchedule, allAvailableTasks, workingDays, lastWorkingDays, maxTasksPerDay, remainingSlots);
  }

  console.log(`Total scheduled tasks: ${schedule.length}`);
  return schedule;
}

/**
 * Calculate remaining slots across all days
 */
function calculateRemainingSlots(daySchedule, maxTasksPerDay) {
  let totalSlots = 0;
  Object.values(daySchedule).forEach(dayTasks => {
    totalSlots += Math.max(0, maxTasksPerDay - dayTasks.length);
  });
  return totalSlots;
}

/**
 * Fill remaining slots with random tasks
 */
function fillRemainingSlots(schedule, daySchedule, allTasks, workingDays, lastWorkingDays, maxTasksPerDay, remainingSlots) {
  const shuffledTasks = shuffleArray(allTasks);
  let slotsToFill = remainingSlots;
  let taskIndex = 0;

  while (slotsToFill > 0 && taskIndex < shuffledTasks.length * 10) { // Prevent infinite loop
    const task = shuffledTasks[taskIndex % shuffledTasks.length];
    const isBackupTask = task.klasifikasi_tugas === 'Backup dan Pemulihan Data';

    // Choose appropriate days based on task type
    const availableDays = isBackupTask ? lastWorkingDays : workingDays;
    const shuffledDays = shuffleArray([...availableDays]);

    // Try to assign to a day with available slots
    for (const day of shuffledDays) {
      const dateString = toISODateString(day);

      if (daySchedule[dateString].length < maxTasksPerDay) {
        const newTask = {
          task_id: task.id,
          scheduled_date: dateString,
          kegiatan_harian: task.kegiatan_harian,
          klasifikasi_tugas: task.klasifikasi_tugas,
          isGuaranteed: false
        };

        daySchedule[dateString].push(newTask);
        schedule.push(newTask);
        slotsToFill--;
        break;
      }
    }

    taskIndex++;
  }
}

/**
 * Distribute tasks evenly across working days
 * @param {Array} tasks - Array of tasks
 * @param {Array} workingDays - Array of working days
 * @param {number} maxTasksPerDay - Maximum tasks per day
 * @returns {Array} Scheduled tasks
 */
function distributeTasksEvenly(tasks, workingDays, maxTasksPerDay) {
  const schedule = [];
  const shuffledTasks = shuffleArray(tasks);
  const totalSlots = workingDays.length * maxTasksPerDay;

  // If we have more tasks than slots, we need to cycle through tasks
  const tasksToSchedule = [];
  if (shuffledTasks.length <= totalSlots) {
    tasksToSchedule.push(...shuffledTasks);
  } else {
    // If more tasks than slots, randomly select tasks to fit
    for (let i = 0; i < totalSlots; i++) {
      tasksToSchedule.push(shuffledTasks[i % shuffledTasks.length]);
    }
  }

  // Distribute tasks across days
  let taskIndex = 0;
  for (const workingDay of workingDays) {
    const tasksForDay = Math.min(maxTasksPerDay, tasksToSchedule.length - taskIndex);

    for (let i = 0; i < tasksForDay; i++) {
      if (taskIndex < tasksToSchedule.length) {
        schedule.push({
          task_id: tasksToSchedule[taskIndex].id,
          scheduled_date: toISODateString(workingDay),
          kegiatan_harian: tasksToSchedule[taskIndex].kegiatan_harian,
          klasifikasi_tugas: tasksToSchedule[taskIndex].klasifikasi_tugas
        });
        taskIndex++;
      }
    }
  }

  return schedule;
}

/**
 * Distribute tasks randomly with constraints
 * @param {Array} tasks - Array of tasks
 * @param {Array} workingDays - Array of working days
 * @param {number} minTasksPerDay - Minimum tasks per day
 * @param {number} maxTasksPerDay - Maximum tasks per day
 * @returns {Array} Scheduled tasks
 */
function distributeTasksRandomly(tasks, workingDays, minTasksPerDay, maxTasksPerDay) {
  const schedule = [];
  const shuffledTasks = shuffleArray(tasks);
  let taskIndex = 0;

  for (const workingDay of workingDays) {
    // Random number of tasks for this day
    const tasksForDay = Math.floor(Math.random() * (maxTasksPerDay - minTasksPerDay + 1)) + minTasksPerDay;

    for (let i = 0; i < tasksForDay; i++) {
      if (taskIndex < shuffledTasks.length) {
        schedule.push({
          task_id: shuffledTasks[taskIndex].id,
          scheduled_date: toISODateString(workingDay),
          kegiatan_harian: shuffledTasks[taskIndex].kegiatan_harian,
          klasifikasi_tugas: shuffledTasks[taskIndex].klasifikasi_tugas
        });
        taskIndex++;
      } else {
        // If we run out of tasks, cycle back to the beginning
        taskIndex = 0;
        if (shuffledTasks.length > 0) {
          schedule.push({
            task_id: shuffledTasks[taskIndex].id,
            scheduled_date: toISODateString(workingDay),
            kegiatan_harian: shuffledTasks[taskIndex].kegiatan_harian,
            klasifikasi_tugas: shuffledTasks[taskIndex].klasifikasi_tugas
          });
          taskIndex++;
        }
      }
    }
  }

  return schedule;
}

/**
 * Generate schedule with category balancing
 * @param {Array} tasks - Array of tasks
 * @param {number} month - Month (1-12)
 * @param {number} year - Year
 * @param {Object} options - Scheduling options
 * @returns {Array} Balanced scheduled tasks
 */
function generateBalancedSchedule(tasks, month, year, options = {}) {
  const { maxTasksPerDay = 3 } = options;

  // Group tasks by category
  const tasksByCategory = {};
  tasks.forEach(task => {
    const category = task.klasifikasi_tugas || 'Other';
    if (!tasksByCategory[category]) {
      tasksByCategory[category] = [];
    }
    tasksByCategory[category].push(task);
  });

  const workingDays = getWorkingDaysInMonth(month, year);
  const schedule = [];
  const categories = Object.keys(tasksByCategory);

  if (categories.length === 0 || workingDays.length === 0) {
    return [];
  }

  // Shuffle categories and working days
  const shuffledCategories = shuffleArray(categories);
  const shuffledWorkingDays = shuffleArray(workingDays);

  let categoryIndex = 0;

  for (const workingDay of shuffledWorkingDays) {
    const tasksForDay = Math.min(maxTasksPerDay, tasks.length);
    const selectedTasks = [];

    // Try to get tasks from different categories for variety
    for (let i = 0; i < tasksForDay; i++) {
      const currentCategory = shuffledCategories[categoryIndex % shuffledCategories.length];
      const categoryTasks = tasksByCategory[currentCategory];

      if (categoryTasks && categoryTasks.length > 0) {
        // Get a random task from this category
        const randomTaskIndex = Math.floor(Math.random() * categoryTasks.length);
        const selectedTask = categoryTasks[randomTaskIndex];

        selectedTasks.push({
          task_id: selectedTask.id,
          scheduled_date: toISODateString(workingDay),
          kegiatan_harian: selectedTask.kegiatan_harian,
          klasifikasi_tugas: selectedTask.klasifikasi_tugas
        });
      }

      categoryIndex++;
    }

    schedule.push(...selectedTasks);
  }

  return schedule;
}

/**
 * Validate schedule constraints
 * @param {Array} schedule - Generated schedule
 * @param {Object} constraints - Validation constraints
 * @returns {Object} Validation result
 */
function validateSchedule(schedule, constraints = {}) {
  const {
    maxTasksPerDay = 5,
    minTasksPerDay = 0,
    requiredCategories = []
  } = constraints;

  const errors = [];
  const warnings = [];

  // Group schedule by date
  const scheduleByDate = {};
  schedule.forEach(item => {
    const date = item.scheduled_date;
    if (!scheduleByDate[date]) {
      scheduleByDate[date] = [];
    }
    scheduleByDate[date].push(item);
  });

  // Check tasks per day constraints
  Object.entries(scheduleByDate).forEach(([date, tasks]) => {
    if (tasks.length > maxTasksPerDay) {
      errors.push(`Too many tasks on ${date}: ${tasks.length} (max: ${maxTasksPerDay})`);
    }
    if (tasks.length < minTasksPerDay) {
      warnings.push(`Too few tasks on ${date}: ${tasks.length} (min: ${minTasksPerDay})`);
    }
  });

  // Check required categories
  if (requiredCategories.length > 0) {
    const scheduledCategories = new Set(schedule.map(item => item.klasifikasi_tugas));
    requiredCategories.forEach(category => {
      if (!scheduledCategories.has(category)) {
        warnings.push(`Required category not scheduled: ${category}`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    stats: {
      totalTasks: schedule.length,
      uniqueDates: Object.keys(scheduleByDate).length,
      averageTasksPerDay: schedule.length / Object.keys(scheduleByDate).length,
      categories: [...new Set(schedule.map(item => item.klasifikasi_tugas))]
    }
  };
}

/**
 * Get schedule statistics
 * @param {Array} schedule - Schedule to analyze
 * @returns {Object} Schedule statistics
 */
function getScheduleStats(schedule) {
  if (!schedule || schedule.length === 0) {
    return {
      totalTasks: 0,
      uniqueDates: 0,
      averageTasksPerDay: 0,
      categories: [],
      categoryDistribution: {}
    };
  }

  const scheduleByDate = {};
  const categoryCount = {};

  schedule.forEach(item => {
    // Group by date
    const date = item.scheduled_date;
    if (!scheduleByDate[date]) {
      scheduleByDate[date] = [];
    }
    scheduleByDate[date].push(item);

    // Count categories
    const category = item.klasifikasi_tugas || 'Other';
    categoryCount[category] = (categoryCount[category] || 0) + 1;
  });

  const uniqueDates = Object.keys(scheduleByDate).length;

  return {
    totalTasks: schedule.length,
    uniqueDates,
    averageTasksPerDay: uniqueDates > 0 ? schedule.length / uniqueDates : 0,
    categories: Object.keys(categoryCount),
    categoryDistribution: categoryCount,
    tasksPerDay: Object.entries(scheduleByDate).map(([date, tasks]) => ({
      date,
      count: tasks.length
    }))
  };
}

module.exports = {
  generateRandomSchedule,
  generateBalancedSchedule,
  validateSchedule,
  getScheduleStats,
  shuffleArray
};
