/**
 * Sri Lankan NIC calendar convention utilities.
 * The Sri Lankan government treats every year as having 366 days when encoding
 * birthdays in NICs. February is always 29 days, regardless of whether the birth
 * year is actually a leap year. This is the official NIC calendar convention.
 */
export const daylk = {
  /** Days in each month according to NIC convention (Feb always 29) */
  MONTH_DAYS: [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31] as const,

  /** Total days in a year for NIC calculations */
  TOTAL_DAYS_IN_YEAR: 366,

  /**
   * Get current date parts in Sri Lanka timezone
   */
  get now() {
    const now = new Date();
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Colombo',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hourCycle: 'h23'
    }).formatToParts(now);

    const get = (type: string): number =>
      Number(parts.find((p) => p.type === type)?.value ?? 0);

    return {
      year: get('year'),
      month: get('month'),
      day: get('day')
    };
  },

  /**
   * Calculate day of year from month and day
   * @param month - Month (1-12)
   * @param day - Day (1-31)
   * @returns Day of year (1-366)
   */
  dayOfYear(month: number, day: number): number {
    let total = 0;
    for (let i = 0; i < month - 1; i++) {
      total += this.MONTH_DAYS[i];
    }
    return total + day;
  },

  /**
   * Get current day of year in Sri Lanka timezone
   * @returns Current day of year (1-366)
   */
  currentDayOfYear(): number {
    const now = this.now;
    return this.dayOfYear(now.month, now.day);
  },

  /**
   * Convert day of year back to month and day
   * @param dayOfYear - Day of year (1-366)
   * @returns Object with month and day
   */
  toDate(dayOfYear: number): { month: number; day: number } {
    let remaining = dayOfYear;
    for (let month = 0; month < 12; month++) {
      if (remaining <= this.MONTH_DAYS[month]) {
        return { month: month + 1, day: remaining };
      }
      remaining -= this.MONTH_DAYS[month];
    }
    // Handle edge case for day 366
    return { month: 12, day: 31 };
  }
};
