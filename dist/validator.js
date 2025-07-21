"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSimpleValidNIC = isSimpleValidNIC;
exports.isFullValidNIC = isFullValidNIC;
exports.getSimpleValidNICInfo = getSimpleValidNICInfo;
exports.getFullValidNICInfo = getFullValidNICInfo;
exports.getNICGender = getNICGender;
exports.getNICBirthYear = getNICBirthYear;
exports.getNICDayOfYear = getNICDayOfYear;
exports.getNICBirthMonth = getNICBirthMonth;
exports.getNICBirthDay = getNICBirthDay;
exports.getFullNICDetails = getFullNICDetails;
const constants_1 = require("./constants");
/**
 * Validate Sri Lankan NIC Number (old and new formats)
 *
 * Old NIC: 9 digits + 'V' or 'X' (e.g., 123456789V)
 * New NIC: 12 digits (e.g., 200012345678)
 *
 * @param {string} nic - The NIC number to validate.
 * @returns {boolean} Returns `true` if the NIC is valid, otherwise `false`.
 */
function isSimpleValidNIC(nic) {
    if (typeof nic !== 'string')
        return false;
    nic = nic.trim().toUpperCase();
    return constants_1.NEW_NIC_REGEX.test(nic) || constants_1.OLD_NIC_REGEX.test(nic);
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
function isFullValidNIC(nic) {
    if (typeof nic !== 'string')
        return false;
    nic = nic.trim().toUpperCase();
    if (constants_1.OLD_NIC_REGEX.test(nic))
        return validateOldNIC(nic).valid;
    if (constants_1.NEW_NIC_REGEX.test(nic))
        return validateNewNIC(nic).valid;
    return false;
}
/**
 * Validates a Sri Lankan old format NIC number.
 *
 * Rules:
 * - First 2 digits: birth year (from 1900).
 * - Next 3 digits: day of the year (001–366).
 *   If the value is above 500, it indicates a female and is adjusted by subtracting 500.
 * - Day must be within the valid range (1–366).
 *
 * @param {string} nic - NIC in the old format (10 characters).
 * @returns {boolean} Returns true if valid, otherwise false.
 */
function validateOldNIC(nic) {
    const year = parseInt(nic.slice(0, 2), 10) + 1900;
    let day = parseInt(nic.slice(2, 5), 10);
    if (isNaN(year) || isNaN(day))
        return { valid: false, error: 'Invalid year or day number' };
    if (day > 500)
        day -= 500;
    if (day < 1 || day > 366)
        return { valid: false, error: 'Invalid day number for old NIC' };
    return { valid: true };
}
/**
 * Validates a Sri Lankan new format NIC number.
 *
 * Rules:
 * - First 4 digits: birth year (e.g., 2000).
 * - Next 3 digits: day of the year (001–366).
 *   If the value is above 500, it indicates a female and is adjusted by subtracting 500.
 * - Day must be within the valid range (1–366).
 * - Year must be between 1900 and current year.
 *
 * @param {string} nic - NIC in the new format (12 characters).
 * @returns {boolean} Returns true if valid, otherwise false.
 */
function validateNewNIC(nic) {
    const year = parseInt(nic.slice(0, 4), 10);
    let day = parseInt(nic.slice(4, 7), 10);
    if (isNaN(year) || isNaN(day))
        return { valid: false, error: 'Invalid year or day number' };
    if (year < 1900 || year > new Date().getFullYear())
        return { valid: false, error: 'Unrealistic birth year' };
    if (day > 500)
        day -= 500;
    if (day < 1 || day > 366)
        return { valid: false, error: 'Invalid day number for new NIC' };
    return { valid: true };
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
function getSimpleValidNICInfo(nic) {
    var _a;
    const trimmed = (_a = nic === null || nic === void 0 ? void 0 : nic.trim().toUpperCase()) !== null && _a !== void 0 ? _a : '';
    const isValid = isSimpleValidNIC(trimmed);
    return {
        nic: trimmed,
        isValid,
        type: isValid ? (trimmed.length === constants_1.NEW_NIC_LENGTH ? 'new' : 'old') : null,
        error: trimmed ? '' : 'NIC is empty'
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
function getFullValidNICInfo(nic) {
    var _a;
    const trimmed = (_a = nic === null || nic === void 0 ? void 0 : nic.trim().toUpperCase()) !== null && _a !== void 0 ? _a : '';
    if (!trimmed)
        return { nic: '', isValid: false, type: null, error: 'NIC is empty' };
    if (constants_1.OLD_NIC_REGEX.test(trimmed)) {
        const { valid, error } = validateOldNIC(trimmed);
        return { nic: trimmed, isValid: valid, type: valid ? 'old' : null, ...(error && { error }) };
    }
    if (constants_1.NEW_NIC_REGEX.test(trimmed)) {
        const { valid, error } = validateNewNIC(trimmed);
        return { nic: trimmed, isValid: valid, type: valid ? 'new' : null, ...(error && { error }) };
    }
    return { nic: trimmed, isValid: false, type: null, error: 'NIC format is invalid' };
}
/**
 * Extract gender from NIC day segment.
 * @param dayOfYear - The day part from NIC (e.g. 123 or 623)
 * @returns 'male' or 'female'
 */
function getNICGender(nic) {
    nic = nic.trim();
    let dayStr;
    if (nic.length === constants_1.OLD_NIC_LENGTH)
        dayStr = nic.slice(2, 5);
    else if (nic.length === constants_1.NEW_NIC_LENGTH)
        dayStr = nic.slice(4, 7);
    else
        return null;
    let day = parseInt(dayStr, 10);
    if (isNaN(day))
        return null;
    return day == null ? null : day > 500 ? 'female' : 'male';
}
/**
 * Extract full birth year from NIC.
 * @param nic - NIC number
 * @returns number representing birth year
 */
function getNICBirthYear(nic) {
    nic = nic.trim();
    if (nic.length === constants_1.OLD_NIC_LENGTH)
        return 1900 + parseInt(nic.slice(0, 2), 10);
    if (nic.length === constants_1.NEW_NIC_LENGTH)
        return parseInt(nic.slice(0, 4), 10);
    return null;
}
/**
 * Extract day of year from NIC number (used to determine birth month & day).
 * @param nic - NIC number
 * @returns day of year (1–366), or null if invalid
 */
function getNICDayOfYear(nic) {
    nic = nic.trim();
    let dayStr;
    if (nic.length === constants_1.OLD_NIC_LENGTH)
        dayStr = nic.slice(2, 5);
    else if (nic.length === constants_1.NEW_NIC_LENGTH)
        dayStr = nic.slice(4, 7);
    else
        return null;
    let day = parseInt(dayStr, 10);
    if (isNaN(day))
        return null;
    return day > 500 ? day - 500 : day;
}
/**
 * Get the birth month from NIC year and day-of-year.
 * @param year - full birth year
 * @param dayOfYear - day of the year (1–366)
 * @returns month number (1–12) or null if invalid
 */
function getNICBirthMonth(nic) {
    const year = getNICBirthYear(nic);
    const day = getNICDayOfYear(nic);
    if (!year || !day || day < 1 || day > 366)
        return null;
    const date = new Date(year, 0);
    date.setDate(day);
    return date.getMonth() + 1;
}
/**
 * Get the birth day of the month from NIC year and day-of-year.
 * @param year - full birth year
 * @param dayOfYear - day of the year (1–366)
 * @returns day number (1–31) or null if invalid
 */
function getNICBirthDay(nic) {
    const year = getNICBirthYear(nic);
    const day = getNICDayOfYear(nic);
    if (!year || !day || day < 1 || day > 366)
        return null;
    const date = new Date(year, 0);
    date.setDate(day);
    return date.getDate();
}
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
function getFullNICDetails(nic) {
    var _a;
    const trimmed = (_a = nic === null || nic === void 0 ? void 0 : nic.trim().toUpperCase()) !== null && _a !== void 0 ? _a : '';
    const isOld = constants_1.OLD_NIC_REGEX.test(trimmed);
    const isNew = constants_1.NEW_NIC_REGEX.test(trimmed);
    if (!isOld && !isNew) {
        return {
            nic: trimmed,
            isValid: false,
            type: null,
            gender: null,
            birthYear: null,
            birthMonth: null,
            birthDay: null,
            error: 'NIC format is invalid'
        };
    }
    const type = isOld ? 'old' : 'new';
    const birthYear = getNICBirthYear(trimmed);
    const dayOfYearRaw = isOld ? parseInt(trimmed.slice(2, 5), 10) : parseInt(trimmed.slice(4, 7), 10);
    const dayOfYear = getNICDayOfYear(trimmed);
    if (birthYear == null || dayOfYearRaw == null ||
        isNaN(birthYear) || isNaN(dayOfYearRaw) ||
        birthYear < 1900 || birthYear > new Date().getFullYear() ||
        dayOfYearRaw < 1 || dayOfYearRaw > 866 ||
        dayOfYear == null || dayOfYear < 1 || dayOfYear > 366) {
        return {
            nic: trimmed,
            isValid: false,
            type,
            gender: null,
            birthYear,
            birthMonth: null,
            birthDay: null,
            error: 'Invalid birth year or day of year'
        };
    }
    const gender = getNICGender(trimmed);
    const birthMonth = getNICBirthMonth(trimmed);
    const birthDay = getNICBirthDay(trimmed);
    return {
        nic: trimmed,
        isValid: true,
        type,
        gender,
        birthYear,
        birthMonth,
        birthDay,
        error: undefined
    };
}
