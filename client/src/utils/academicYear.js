/**
 * Calculates the current academic year based on the current date
 * Academic years start in September and end in August of the following year
 * @returns {string} The current academic year in the format "YYYY-YYYY"
 */
export const getCurrentAcademicYear = () => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // JavaScript months are 0-indexed
  
  // If we're in September or later, the academic year is currentYear-nextYear
  // Otherwise, it's previousYear-currentYear
  if (currentMonth >= 9) { // September is month 9
    return `${currentYear}-${currentYear + 1}`;
  } else {
    return `${currentYear - 1}-${currentYear}`;
  }
};

/**
 * Generates a list of academic years around the current one
 * @param {number} before - Number of years to include before the current academic year
 * @param {number} after - Number of years to include after the current academic year
 * @returns {string[]} Array of academic years in the format "YYYY-YYYY"
 */
export const getAcademicYearOptions = (before = 1, after = 2) => {
  const currentAcademicYear = getCurrentAcademicYear();
  const [startYear] = currentAcademicYear.split('-').map(Number);
  
  const years = [];
  
  // Add previous years
  for (let i = before; i > 0; i--) {
    const year = startYear - i;
    years.push(`${year}-${year + 1}`);
  }
  
  // Add current year
  years.push(currentAcademicYear);
  
  // Add future years
  for (let i = 1; i <= after; i++) {
    const year = startYear + i;
    years.push(`${year}-${year + 1}`);
  }
  
  return years;
};
