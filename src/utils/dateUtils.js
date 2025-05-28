const moment = require('moment');
const { isWeekend, isHoliday, getWorkingDaysInMonth } = require('./holidays');

/**
 * Format date to Indonesian locale
 * @param {Date|string} date - Date to format
 * @param {string} format - Moment.js format string
 * @returns {string} Formatted date string
 */
function formatDate(date, format = 'DD MMMM YYYY') {
  moment.locale('id'); // Set Indonesian locale
  return moment(date).format(format);
}

/**
 * Get month name in Indonesian
 * @param {number} month - Month number (1-12)
 * @returns {string} Indonesian month name
 */
function getIndonesianMonthName(month) {
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  return monthNames[month - 1];
}

/**
 * Get day name in Indonesian
 * @param {Date|string} date - Date to get day name for
 * @returns {string} Indonesian day name
 */
function getIndonesianDayName(date) {
  const dayNames = [
    'Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'
  ];
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dayNames[dateObj.getDay()];
}

/**
 * Get all dates in a month
 * @param {number} month - Month (1-12)
 * @param {number} year - Year
 * @returns {Array<Date>} Array of all dates in the month
 */
function getDatesInMonth(month, year) {
  const dates = [];
  const daysInMonth = new Date(year, month, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    dates.push(new Date(year, month - 1, day));
  }

  return dates;
}

/**
 * Get calendar grid for a month (including previous/next month dates for complete weeks)
 * @param {number} month - Month (1-12)
 * @param {number} year - Year
 * @returns {Array<Array<Date>>} 2D array representing calendar weeks
 */
function getCalendarGrid(month, year) {
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const startDate = new Date(firstDay);
  const endDate = new Date(lastDay);

  // Adjust to start from Monday (Indonesian calendar typically starts with Monday)
  const startDayOfWeek = firstDay.getDay();
  const daysToSubtract = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;
  startDate.setDate(startDate.getDate() - daysToSubtract);

  // Adjust end date to complete the week
  const endDayOfWeek = lastDay.getDay();
  const daysToAdd = endDayOfWeek === 0 ? 0 : 7 - endDayOfWeek;
  endDate.setDate(endDate.getDate() + daysToAdd);

  const weeks = [];
  let currentWeek = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    currentWeek.push(new Date(currentDate));

    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return weeks;
}

/**
 * Check if a date belongs to the specified month
 * @param {Date} date - Date to check
 * @param {number} month - Month (1-12)
 * @param {number} year - Year
 * @returns {boolean} True if date belongs to the month
 */
function isDateInMonth(date, month, year) {
  return date.getMonth() + 1 === month && date.getFullYear() === year;
}

/**
 * Get date classification (working day, weekend, holiday)
 * @param {Date|string} date - Date to classify
 * @returns {Object} Classification object with type and details
 */
function classifyDate(date) {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isHoliday(dateObj)) {
    const holiday = isHoliday(dateObj);
    return {
      type: 'holiday',
      isWorkingDay: false,
      holiday: holiday,
      dayName: getIndonesianDayName(dateObj)
    };
  }

  if (isWeekend(dateObj)) {
    return {
      type: 'weekend',
      isWorkingDay: false,
      dayName: getIndonesianDayName(dateObj)
    };
  }

  return {
    type: 'working',
    isWorkingDay: true,
    dayName: getIndonesianDayName(dateObj)
  };
}

/**
 * Get working days between two dates (inclusive)
 * @param {Date|string} startDate - Start date
 * @param {Date|string} endDate - End date
 * @returns {Array<Date>} Array of working days
 */
function getWorkingDaysBetween(startDate, endDate) {
  const start = typeof startDate === 'string' ? new Date(startDate) : new Date(startDate);
  const end = typeof endDate === 'string' ? new Date(endDate) : new Date(endDate);
  const workingDays = [];

  const currentDate = new Date(start);
  while (currentDate <= end) {
    const classification = classifyDate(currentDate);
    if (classification.isWorkingDay) {
      workingDays.push(new Date(currentDate));
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return workingDays;
}

/**
 * Get the next working day after a given date
 * @param {Date|string} date - Starting date
 * @returns {Date} Next working day
 */
function getNextWorkingDay(date) {
  const nextDay = typeof date === 'string' ? new Date(date) : new Date(date);
  nextDay.setDate(nextDay.getDate() + 1);

  while (!classifyDate(nextDay).isWorkingDay) {
    nextDay.setDate(nextDay.getDate() + 1);
  }

  return nextDay;
}

/**
 * Get the previous working day before a given date
 * @param {Date|string} date - Starting date
 * @returns {Date} Previous working day
 */
function getPreviousWorkingDay(date) {
  const prevDay = typeof date === 'string' ? new Date(date) : new Date(date);
  prevDay.setDate(prevDay.getDate() - 1);

  while (!classifyDate(prevDay).isWorkingDay) {
    prevDay.setDate(prevDay.getDate() - 1);
  }

  return prevDay;
}

/**
 * Convert date to ISO string (YYYY-MM-DD)
 * @param {Date|string} date - Date to convert
 * @returns {string} ISO date string
 */
function toISODateString(date) {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  // Format as YYYY-MM-DD in local timezone to avoid timezone issues
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get current month and year
 * @returns {Object} Object with current month and year
 */
function getCurrentMonthYear() {
  const now = new Date();
  return {
    month: now.getMonth() + 1,
    year: now.getFullYear()
  };
}

/**
 * Get month navigation (previous and next month/year)
 * @param {number} month - Current month (1-12)
 * @param {number} year - Current year
 * @returns {Object} Object with previous and next month/year
 */
function getMonthNavigation(month, year) {
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;

  return {
    previous: { month: prevMonth, year: prevYear },
    next: { month: nextMonth, year: nextYear }
  };
}

/**
 * Validate if a date string is valid
 * @param {string} dateString - Date string to validate
 * @returns {boolean} True if valid date
 */
function isValidDate(dateString) {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
}

module.exports = {
  formatDate,
  getIndonesianMonthName,
  getIndonesianDayName,
  getDatesInMonth,
  getCalendarGrid,
  isDateInMonth,
  classifyDate,
  getWorkingDaysBetween,
  getNextWorkingDay,
  getPreviousWorkingDay,
  toISODateString,
  getCurrentMonthYear,
  getMonthNavigation,
  isValidDate
};
