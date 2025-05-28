// Indonesian National Holidays
// Note: Some holidays like Idul Fitri, Idul Adha, etc. change dates each year based on lunar calendar
// This is a basic implementation - for production, you'd want to use a proper Islamic calendar library

const indonesianHolidays = {
  2024: [
    { date: '2024-01-01', name: 'Tahun Baru Masehi' },
    { date: '2024-02-10', name: 'Tahun Baru Imlek 2575 Kongzili' },
    { date: '2024-03-11', name: 'Hari Raya Nyepi Tahun Baru Saka 1946' },
    { date: '2024-03-29', name: 'Wafat Isa Almasih' },
    { date: '2024-04-10', name: 'Hari Raya Idul Fitri 1445 Hijriah' },
    { date: '2024-04-11', name: 'Hari Raya Idul Fitri 1445 Hijriah' },
    { date: '2024-05-01', name: 'Hari Buruh Internasional' },
    { date: '2024-05-09', name: 'Kenaikan Isa Almasih' },
    { date: '2024-05-23', name: 'Hari Raya Waisak 2568' },
    { date: '2024-06-01', name: 'Hari Lahir Pancasila' },
    { date: '2024-06-17', name: 'Hari Raya Idul Adha 1445 Hijriah' },
    { date: '2024-07-07', name: 'Tahun Baru Islam 1446 Hijriah' },
    { date: '2024-08-17', name: 'Hari Kemerdekaan Republik Indonesia' },
    { date: '2024-09-16', name: 'Maulid Nabi Muhammad SAW' },
    { date: '2024-12-25', name: 'Hari Raya Natal' }
  ],
  2025: [
    // Hari Libur Nasional 2025
    { date: '2025-01-01', name: 'Tahun Baru Masehi' },
    { date: '2025-01-29', name: 'Tahun Baru Imlek 2576 Kongzili' },
    { date: '2025-03-29', name: 'Hari Raya Nyepi Tahun Baru Saka 1947' },
    { date: '2025-03-30', name: 'Hari Raya Idul Fitri 1446 Hijriah' },
    { date: '2025-03-31', name: 'Hari Raya Idul Fitri 1446 Hijriah' },
    { date: '2025-04-18', name: 'Wafat Isa Almasih' },
    { date: '2025-05-01', name: 'Hari Buruh Internasional' },
    { date: '2025-05-12', name: 'Hari Raya Waisak 2569 BE' },
    { date: '2025-05-29', name: 'Kenaikan Yesus Kristus' },
    { date: '2025-06-01', name: 'Hari Lahir Pancasila' },
    { date: '2025-06-06', name: 'Hari Raya Idul Adha 1446 Hijriah' },
    { date: '2025-06-26', name: 'Tahun Baru Islam 1447 Hijriah' },
    { date: '2025-08-17', name: 'Hari Kemerdekaan Republik Indonesia' },
    { date: '2025-09-05', name: 'Maulid Nabi Muhammad SAW' },
    { date: '2025-12-25', name: 'Hari Raya Natal' },

    // Cuti Bersama 2025
    { date: '2025-01-02', name: 'Cuti Bersama Tahun Baru Masehi' },
    { date: '2025-01-30', name: 'Cuti Bersama Tahun Baru Imlek' },
    { date: '2025-01-31', name: 'Cuti Bersama Tahun Baru Imlek' },
    { date: '2025-03-28', name: 'Cuti Bersama Hari Raya Nyepi' },
    { date: '2025-04-01', name: 'Cuti Bersama Hari Raya Idul Fitri' },
    { date: '2025-04-02', name: 'Cuti Bersama Hari Raya Idul Fitri' },
    { date: '2025-04-03', name: 'Cuti Bersama Hari Raya Idul Fitri' },
    { date: '2025-04-04', name: 'Cuti Bersama Hari Raya Idul Fitri' },
    { date: '2025-05-13', name: 'Cuti Bersama Hari Raya Waisak' },
    { date: '2025-05-30', name: 'Cuti Bersama Kenaikan Yesus Kristus' },
    { date: '2025-06-05', name: 'Cuti Bersama Hari Raya Idul Adha' },
    { date: '2025-08-18', name: 'Cuti Bersama Hari Kemerdekaan RI' },
    { date: '2025-12-24', name: 'Cuti Bersama Hari Raya Natal' },
    { date: '2025-12-26', name: 'Cuti Bersama Hari Raya Natal' }
  ],
  2026: [
    { date: '2026-01-01', name: 'Tahun Baru Masehi' },
    { date: '2026-02-17', name: 'Tahun Baru Imlek 2577 Kongzili' },
    { date: '2026-03-19', name: 'Hari Raya Idul Fitri 1447 Hijriah' },
    { date: '2026-03-20', name: 'Hari Raya Idul Fitri 1447 Hijriah' },
    { date: '2026-03-21', name: 'Hari Raya Nyepi Tahun Baru Saka 1948' },
    { date: '2026-04-03', name: 'Wafat Isa Almasih' },
    { date: '2026-05-01', name: 'Hari Buruh Internasional' },
    { date: '2026-05-14', name: 'Kenaikan Isa Almasih' },
    { date: '2026-05-26', name: 'Hari Raya Idul Adha 1447 Hijriah' },
    { date: '2026-06-01', name: 'Hari Lahir Pancasila' },
    { date: '2026-06-02', name: 'Hari Raya Waisak 2570' },
    { date: '2026-06-16', name: 'Tahun Baru Islam 1448 Hijriah' },
    { date: '2026-08-17', name: 'Hari Kemerdekaan Republik Indonesia' },
    { date: '2026-08-25', name: 'Maulid Nabi Muhammad SAW' },
    { date: '2026-12-25', name: 'Hari Raya Natal' }
  ]
};

/**
 * Get Indonesian holidays for a specific year
 * @param {number} year - The year to get holidays for
 * @returns {Array} Array of holiday objects with date and name
 */
function getHolidaysForYear(year) {
  return indonesianHolidays[year] || [];
}

/**
 * Check if a specific date is an Indonesian holiday
 * @param {Date|string} date - The date to check
 * @returns {Object|null} Holiday object if it's a holiday, null otherwise
 */
function isHoliday(date) {
  let dateString;
  let year;

  if (typeof date === 'string') {
    dateString = date;
    year = new Date(date).getFullYear();
  } else {
    // For Date objects, format as YYYY-MM-DD in local timezone to avoid timezone issues
    year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    dateString = `${year}-${month}-${day}`;
  }

  const holidays = getHolidaysForYear(year);
  return holidays.find(holiday => holiday.date === dateString) || null;
}

/**
 * Get all holidays for a specific month and year
 * @param {number} month - Month (1-12)
 * @param {number} year - Year
 * @returns {Array} Array of holiday objects for the specified month
 */
function getHolidaysForMonth(month, year) {
  const holidays = getHolidaysForYear(year);
  return holidays.filter(holiday => {
    const holidayDate = new Date(holiday.date);
    return holidayDate.getMonth() + 1 === month;
  });
}

/**
 * Get holiday dates as an array of Date objects for a specific year
 * @param {number} year - The year to get holiday dates for
 * @returns {Array<Date>} Array of Date objects representing holidays
 */
function getHolidayDates(year) {
  const holidays = getHolidaysForYear(year);
  return holidays.map(holiday => new Date(holiday.date));
}

/**
 * Check if a date is a weekend (Saturday or Sunday)
 * @param {Date|string} date - The date to check
 * @returns {boolean} True if it's a weekend, false otherwise
 */
function isWeekend(date) {
  let dayOfWeek;

  if (typeof date === 'string') {
    dayOfWeek = new Date(date).getDay();
  } else {
    dayOfWeek = date.getDay();
  }

  return dayOfWeek === 0 || dayOfWeek === 6; // Sunday = 0, Saturday = 6
}

/**
 * Check if a date is a working day (not weekend and not holiday)
 * @param {Date|string} date - The date to check
 * @returns {boolean} True if it's a working day, false otherwise
 */
function isWorkingDay(date) {
  return !isWeekend(date) && !isHoliday(date);
}

/**
 * Get all working days for a specific month and year
 * @param {number} month - Month (1-12)
 * @param {number} year - Year
 * @returns {Array<Date>} Array of Date objects representing working days
 */
function getWorkingDaysInMonth(month, year) {
  const workingDays = [];
  const daysInMonth = new Date(year, month, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);
    if (isWorkingDay(date)) {
      workingDays.push(date);
    }
  }

  return workingDays;
}

/**
 * Get the count of working days in a specific month and year
 * @param {number} month - Month (1-12)
 * @param {number} year - Year
 * @returns {number} Number of working days
 */
function getWorkingDaysCount(month, year) {
  return getWorkingDaysInMonth(month, year).length;
}

/**
 * Add more holidays for future years (can be called to extend the holiday data)
 * @param {number} year - Year to add holidays for
 * @param {Array} holidays - Array of holiday objects
 */
function addHolidaysForYear(year, holidays) {
  indonesianHolidays[year] = holidays;
}

module.exports = {
  getHolidaysForYear,
  isHoliday,
  getHolidaysForMonth,
  getHolidayDates,
  isWeekend,
  isWorkingDay,
  getWorkingDaysInMonth,
  getWorkingDaysCount,
  addHolidaysForYear,
  indonesianHolidays
};
