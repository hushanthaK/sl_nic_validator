import type { NICGender, NICBasicDetails, NICFullDetails } from './interfaces';
/**
 * Validate Sri Lankan NIC Number (old and new formats)
 *
 * Old NIC: 9 digits + 'V' or 'X' (e.g., 123456789V)
 * New NIC: 12 digits (e.g., 200012345678)
 *
 * @param {string} nic - The NIC number to validate.
 * @returns {boolean} Returns `true` if the NIC is valid, otherwise `false`.
 */
export declare function isSimpleValidNIC(nic: string): boolean;
/**
 * Validate Sri Lankan NIC Number (old and new formats)
 *
 * Old NIC: 9 digits + 'V' or 'X' (e.g., 123456789V)
 * New NIC: 12 digits (e.g., 200012345678)
 *
 * @param {string} nic - The NIC number to validate.
 * @returns {boolean} Returns `true` if the NIC is valid, otherwise `false`.
 */
export declare function isFullValidNIC(nic: string): boolean;
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
export declare function getSimpleValidNICInfo(nic: string): NICBasicDetails;
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
export declare function getFullValidNICInfo(nic: string): NICBasicDetails;
/**
 * Extract gender from NIC day segment.
 * @param dayOfYear - The day part from NIC (e.g. 123 or 623)
 * @returns 'male' or 'female'
 */
export declare function getNICGender(nic: string): NICGender | null;
/**
 * Extract full birth year from NIC.
 * @param nic - NIC number
 * @returns number representing birth year
 */
export declare function getNICBirthYear(nic: string): number | null;
/**
 * Extract day of year from NIC number (used to determine birth month & day).
 * @param nic - NIC number
 * @returns day of year (1–366), or null if invalid
 */
export declare function getNICDayOfYear(nic: string): number | null;
/**
 * Get the birth month from NIC year and day-of-year.
 * @param year - full birth year
 * @param dayOfYear - day of the year (1–366)
 * @returns month number (1–12) or null if invalid
 */
export declare function getNICBirthMonth(nic: string): number | null;
/**
 * Get the birth day of the month from NIC year and day-of-year.
 * @param year - full birth year
 * @param dayOfYear - day of the year (1–366)
 * @returns day number (1–31) or null if invalid
 */
export declare function getNICBirthDay(nic: string): number | null;
/**
 * Extracts detailed information from a Sri Lankan NIC number (old or new format).
 *
 * This function validates the NIC format and parses out the birth year, birth month,
 * birth day, gender, and NIC type. It also returns validation errors if any.
 *
 * @param {string} nic - The Sri Lankan National Identity Card number to be validated and parsed.
 * @returns {NICDetails} An object containing:
 *   - nic: The trimmed and uppercased NIC string.
 *   - isValid: Boolean indicating if the NIC is valid.
 *   - type: 'old' for old NIC format, 'new' for new NIC format, or null if invalid format.
 *   - gender: 'male' or 'female' inferred from the NIC, or null if invalid.
 *   - birthYear: Full 4-digit birth year (e.g. 1985) or null if invalid.
 *   - birthMonth: Birth month (1-12) or null if invalid.
 *   - birthDay: Birth day of month (1-31) or null if invalid.
 *   - error: Optional string describing the validation error if NIC is invalid.
 */
export declare function getFullNICDetails(nic: string): NICFullDetails;
