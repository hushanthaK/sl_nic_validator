import {
  OLD_NIC_REGEX,
  NEW_NIC_REGEX
} from './constants.js';
import { daylk } from './daylk.js';
import type {
  NICGender,
  NICBasicDetails,
  NICFullDetails,
  NICType,
  NICFullValidationResult,
  NICValidationResult,
  NICDetails
} from './interfaces.js';

interface ParsedNIC {
  nic: string;
  format: NICType;
  birthYear: number;
  /** Day of year (1–366), or null if the NIC day segment is out of range */
  dayOfYear: number | null;
  gender: NICGender;
}

/**
 * Parse the segments of an NIC number that matches the old or new format.
 * @param nic - NIC number
 * @returns parsed segments, or null if the value is not a string in NIC format
 */
function parseNIC(nic: unknown): ParsedNIC | null {
  if (typeof nic !== 'string') return null;
  const value = nic.trim().toUpperCase();

  let format: NICType;
  let birthYear: number;
  let rawDay: number;
  if (OLD_NIC_REGEX.test(value)) {
    format = 'old';
    birthYear = 1900 + parseInt(value.slice(0, 2), 10);
    rawDay = parseInt(value.slice(2, 5), 10);
  } else if (NEW_NIC_REGEX.test(value)) {
    format = 'new';
    birthYear = parseInt(value.slice(0, 4), 10);
    rawDay = parseInt(value.slice(4, 7), 10);
  } else {
    return null;
  }

  const day = rawDay > 500 ? rawDay - 500 : rawDay;
  return {
    nic: value,
    format,
    birthYear,
    dayOfYear: day >= 1 && day <= daylk.TOTAL_DAYS_IN_YEAR ? day : null,
    gender: rawDay > 500 ? 'female' : 'male'
  };
}

/**
 * Check whether an NIC birth year and day-of-year is after today (Sri Lanka time).
 * @param year - full birth year
 * @param dayOfYear - NIC day of year (1–366)
 * @returns true if the birth date is in the future
 */
function isFutureBirthDate(year: number, dayOfYear: number): boolean {
  const now = daylk.now;
  return year > now.year || (year === now.year && dayOfYear > daylk.dayOfYear(now.month, now.day));
}

/**
 * Apply the logical checks to a parsed NIC.
 *
 * Rules:
 * - Day of year (001–366, or 501–866 for females) must be within 1–366.
 * - New NIC birth year must be between 1900 and the current year.
 * - The birth date must not be in the future.
 *
 * @param parsed - parsed NIC
 * @returns error reason, or null if valid
 */
function getLogicalError(parsed: ParsedNIC): string | null {
  const { format, birthYear, dayOfYear } = parsed;
  if (format === 'new' && (birthYear < 1900 || birthYear > daylk.now.year)) return 'Unrealistic birth year';
  if (dayOfYear == null) return `Invalid day number for ${format} NIC`;
  if (isFutureBirthDate(birthYear, dayOfYear)) return 'Birth date is in the future';
  return null;
}

/**
 * Validate Sri Lankan NIC Number (old and new formats)
 *
 * Old NIC: 9 digits + 'V' or 'X' (e.g., 123456789V)
 * New NIC: 12 digits (e.g., 200012345678)
 *
 * @param {string} nic - The NIC number to validate.
 * @returns {boolean} Returns `true` if the NIC is valid, otherwise `false`.
 */
export function isSimpleValidNIC(nic: string): boolean {
  return parseNIC(nic) !== null;
}

/**
 * Validate Sri Lankan NIC Number with format and logical checks (old and new formats)
 *
 * Checks the format, the birth year, the day of year (366-day NIC calendar)
 * and that the birth date is not in the future.
 *
 * @param {string} nic - The NIC number to validate.
 * @returns {NICFullValidationResult} `isValid` and the `errorReason` (null when valid).
 */
export function isFullValidNIC(nic: string): NICFullValidationResult {
  if (typeof nic !== 'string' || !nic.trim()) return { isValid: false, errorReason: 'NIC is empty' };

  const parsed = parseNIC(nic);
  if (!parsed) return { isValid: false, errorReason: 'NIC format is invalid' };

  const errorReason = getLogicalError(parsed);
  return { isValid: errorReason === null, errorReason };
}

/**
 * Get detailed information about a Sri Lankan NIC number.
 *
 * Supports both old and new format.
 *
 * @param nic - The NIC number as a string (with or without formatting).
 * @returns An object containing:
 *  - `nic`: Trimmed and formatted NIC string.
 *  - `isValid`: Whether the NIC is valid according to format and rules.
 *  - `type`: `"old"` | `"new"` if valid, otherwise `null`.
 */
export function getSimpleValidNICInfo(nic: string): NICBasicDetails {
  const trimmed = typeof nic === 'string' ? nic.trim().toUpperCase() : '';
  if (!trimmed) return { nic: '', isValid: false, type: null, error: 'NIC is empty' };

  const parsed = parseNIC(trimmed);
  return {
    nic: trimmed,
    isValid: parsed !== null,
    type: parsed?.format ?? null,
    error: parsed ? '' : 'NIC format is invalid'
  };
}

/**
 * Get detailed information about a Sri Lankan NIC number.
 *
 * Supports both old and new format.
 *
 * @param nic - The NIC number as a string (with or without formatting).
 * @returns An object containing:
 *  - `nic`: Trimmed and formatted NIC string.
 *  - `isValid`: Whether the NIC is valid according to format and rules.
 *  - `type`: `"old"` | `"new"` if valid, otherwise `null`.
 *  - `error`: Validation error.
 */
export function getFullValidNICInfo(nic: string): NICBasicDetails {
  const trimmed = typeof nic === 'string' ? nic.trim().toUpperCase() : '';
  const { isValid, errorReason } = isFullValidNIC(trimmed);
  if (!isValid) return { nic: trimmed, isValid: false, type: null, error: errorReason as string };

  return { nic: trimmed, isValid: true, type: (parseNIC(trimmed) as ParsedNIC).format };
}

/**
 * Extract gender from NIC day segment (> 500 is female).
 * @param nic - NIC number
 * @returns 'male' or 'female', or null if the NIC or its day segment is invalid
 */
export function getNICGender(nic: string): NICGender | null {
  const parsed = parseNIC(nic);
  return parsed?.dayOfYear != null ? parsed.gender : null;
}

/**
 * Extract full birth year from NIC.
 * @param nic - NIC number
 * @returns birth year, or null if the NIC format is invalid
 */
export function getNICBirthYear(nic: string): number | null {
  return parseNIC(nic)?.birthYear ?? null;
}

/**
 * Extract day of year from NIC number (used to determine birth month & day).
 * @param nic - NIC number
 * @returns day of year (1–366), or null if invalid
 */
export function getNICDayOfYear(nic: string): number | null {
  return parseNIC(nic)?.dayOfYear ?? null;
}

/**
 * Get the birth month from NIC day-of-year (366-day NIC calendar).
 * @param nic - NIC number
 * @returns month number (1–12) or null if invalid
 */
export function getNICBirthMonth(nic: string): number | null {
  const day = getNICDayOfYear(nic);
  return day == null ? null : daylk.toDate(day).month;
}

/**
 * Get the birth day of the month from NIC day-of-year (366-day NIC calendar).
 * @param nic - NIC number
 * @returns day number (1–31) or null if invalid
 */
export function getNICBirthDay(nic: string): number | null {
  const day = getNICDayOfYear(nic);
  return day == null ? null : daylk.toDate(day).day;
}

/**
 * Extracts detailed information from a Sri Lankan NIC number (old or new format).
 *
 * This function validates the NIC format and parses out the birth year, birth month,
 * birth day, gender, and NIC type. It also returns validation errors if any.
 *
 * @param {string} nic - The Sri Lankan National Identity Card number to be validated and parsed.
 * @returns {NICFullDetails} An object containing:
 *   - nic: The trimmed and uppercased NIC string.
 *   - isValid: Boolean indicating if the NIC is valid.
 *   - type: 'old' for old NIC format, 'new' for new NIC format, or null if invalid format.
 *   - gender: 'male' or 'female' inferred from the NIC, or null if invalid.
 *   - birthYear: Full 4-digit birth year (e.g. 1985) or null if invalid.
 *   - birthMonth: Birth month (1-12) or null if invalid.
 *   - birthDay: Birth day of month (1-31) or null if invalid.
 *   - error: Optional string describing the validation error if NIC is invalid.
 */
export function getFullNICDetails(nic: string): NICFullDetails {
  const details = getNICDetails(nic);
  if (details.isValid) {
    const { nic: trimmed, format, gender, birthYear, birthMonth, birthDay } = details;
    return { nic: trimmed, isValid: true, type: format, gender, birthYear, birthMonth, birthDay, error: undefined };
  }

  const parsed = parseNIC(nic);
  return {
    nic: details.nic,
    isValid: false,
    type: parsed?.format ?? null,
    gender: null,
    birthYear: parsed?.birthYear ?? null,
    birthMonth: null,
    birthDay: null,
    error: parsed ? 'Invalid birth year or day of year' : 'NIC format is invalid'
  };
}

/**
 * Convert an old format NIC to the new 12-digit format.
 *
 * Old `YYDDDSSSSV` becomes `19YYDDD0SSSS`
 * (e.g. `853456789V` → `198534506789`).
 *
 * @param nic - NIC in the old format
 * @returns new format NIC, or null if the input is not an old format NIC
 */
export function convertOldToNewNIC(nic: string): string | null {
  const parsed = parseNIC(nic);
  if (parsed?.format !== 'old') return null;
  return `19${parsed.nic.slice(0, 5)}0${parsed.nic.slice(5, 9)}`;
}

/**
 * Get full details of a Sri Lankan NIC number (old or new format).
 *
 * Runs full validation (see `isFullValidNIC`). Birth month and day follow the
 * 366-day NIC calendar, and age is calculated against today in Sri Lanka time.
 *
 * @param nic - The NIC number
 * @returns {NICDetails} Details; all extracted fields are null when invalid, with `errorReason` set.
 */
export function getNICDetails(nic: string): NICDetails {
  const trimmed = typeof nic === 'string' ? nic.trim().toUpperCase() : '';
  const { isValid, errorReason } = isFullValidNIC(trimmed);

  if (!isValid) {
    return {
      nic: trimmed,
      isValid: false,
      format: null,
      gender: null,
      birthYear: null,
      birthMonth: null,
      birthDay: null,
      dayOfYear: null,
      age: null,
      normalizedNIC: null,
      birthDate: null,
      errorReason
    };
  }

  // A fully valid NIC always parses with an in-range day of year
  const { format, birthYear, gender, dayOfYear: day } = parseNIC(trimmed) as ParsedNIC;
  const dayOfYear = day as number;
  const { month: birthMonth, day: birthDay } = daylk.toDate(dayOfYear);
  const now = daylk.now;
  const age = now.year - birthYear - (daylk.dayOfYear(now.month, now.day) < dayOfYear ? 1 : 0);

  return {
    nic: trimmed,
    isValid: true,
    format,
    gender,
    birthYear,
    birthMonth,
    birthDay,
    dayOfYear,
    age,
    normalizedNIC: format === 'old' ? convertOldToNewNIC(trimmed) : trimmed,
    birthDate: new Date(birthYear, birthMonth - 1, birthDay),
    errorReason: null
  };
}

/**
 * Validate a Sri Lankan NIC number and return the standard result
 * (format, gender and birth date parts).
 *
 * @param nic - The NIC number
 * @returns {NICValidationResult} Validation result
 */
export function validateNIC(nic: string): NICValidationResult {
  const { nic: trimmed, isValid, format, gender, birthYear, birthMonth, birthDay, errorReason } = getNICDetails(nic);
  return { nic: trimmed, isValid, format, gender, birthYear, birthMonth, birthDay, errorReason };
}
