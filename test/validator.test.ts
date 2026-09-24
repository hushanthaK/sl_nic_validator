import { z } from 'zod';

import { convertOldToNewNIC, getFullNICDetails, getFullValidNICInfo, getNICBirthDay, getNICBirthMonth, getNICBirthYear, getNICDayOfYear, getNICDetails, getNICGender, getSimpleValidNICInfo, isFullValidNIC, isSimpleValidNIC, validateNIC } from '../src/validator';
import { daylk } from '../src/daylk';
import { createNICObjectSchema, nicDetailsSchema, nicFullSchema, nicSchema, nicSimpleSchema } from '../src/schemas';

describe('Sri Lankan NIC Validator', () => {
  const validNICs = [
  '991681493V', // old male
  '857891234V', // old female (789 - 500 = 289)
  '199916801493', // new male
  '200056712345'  // new female
  ];

  const validOldNIC = '991681493V'; // 1985, day 345 (male)
  const validOldNICFemale = '857891234V'; // 1985, day 789 (female: 789 - 500 = 289)
  const validNewNIC = '199916801493'; // 1998, day 456 (male)
  const validNewNICFemale = '200056712345'; // 2000, day 567 (female)

const invalidFormatNICs = [
  '',
  '123',
  'abc456789v',
  '2000450'
];

// const invalidSemanticNICs = [
  // '198916801493' // invalid day
  // '200020045678'  // invalid day
// ];

  describe('Bulk NIC Validations', () => {
    it('should validate all valid NICs correctly (simple)', () => {
      validNICs.forEach(nic => {
        expect(isSimpleValidNIC(nic)).toBe(true);
      });
    });

    it('should validate all valid NICs correctly (full)', () => {
      validNICs.forEach(nic => {
        expect(isFullValidNIC(nic)).toEqual({ isValid: true, errorReason: null });
      });
    });

    it('should invalidate all invalid NICs (simple)', () => {
      invalidFormatNICs.forEach(nic => {
        expect(isSimpleValidNIC(nic)).toBe(false);
      });
    });

    it('should invalidate all invalid NICs (full)', () => {
      [...invalidFormatNICs].forEach(nic => {
        expect(isFullValidNIC(nic).isValid).toBe(false);
      });
    });

    it('should give an error reason for invalid NICs (full)', () => {
      expect(isFullValidNIC('')).toEqual({ isValid: false, errorReason: 'NIC is empty' });
      expect(isFullValidNIC('123')).toEqual({ isValid: false, errorReason: 'NIC format is invalid' });
      expect(isFullValidNIC('853676789V')).toEqual({ isValid: false, errorReason: 'Invalid day number for old NIC' });
      expect(isFullValidNIC('199950012345')).toEqual({ isValid: false, errorReason: 'Invalid day number for new NIC' });
      expect(isFullValidNIC('189934567890')).toEqual({ isValid: false, errorReason: 'Unrealistic birth year' });
    });
  });

  describe('getSimpleValidNICInfo()', () => {
    it('should return valid info for old and new NICs', () => {
      expect(getSimpleValidNICInfo(validOldNIC)).toMatchObject({
        nic: validOldNIC,
        isValid: true,
        type: 'old'
      });

      expect(getSimpleValidNICInfo(validNewNIC)).toMatchObject({
        nic: validNewNIC,
        isValid: true,
        type: 'new'
      });
    });

    it('should return error for empty NIC', () => {
      expect(getSimpleValidNICInfo('')).toMatchObject({
        isValid: false,
        type: null,
        error: 'NIC is empty'
      });
    });
  });

  describe('getFullValidNICInfo()', () => {
    it('should return full info and no error for valid NICs', () => {
      expect(getFullValidNICInfo(validOldNIC).isValid).toBe(true);
      expect(getFullValidNICInfo(validNewNIC).isValid).toBe(true);
    });

    it('should return error for invalid NIC', () => {
      expect(getFullValidNICInfo('1234567890')).toMatchObject({
        isValid: false,
        error: expect.any(String)
      });
    });
  });

    describe('getNICGender()', () => {
    it('should return correct gender', () => {
      expect(getNICGender(validOldNIC)).toBe('male');
      expect(getNICGender(validOldNICFemale)).toBe('female');
      expect(getNICGender(validNewNICFemale)).toBe('female');
    });
  });

  describe('getNICBirthYear()', () => {
    it('should extract correct year', () => {
      expect(getNICBirthYear(validOldNIC)).toBe(1999);
      expect(getNICBirthYear(validNewNIC)).toBe(1999);
    });
  });

    describe('getNICDayOfYear()', () => {
    it('should extract correct day of year', () => {
      expect(getNICDayOfYear(validOldNIC)).toBe(168);
      expect(getNICDayOfYear(validOldNICFemale)).toBe(289);
    });
  });

  describe('getNICBirthMonth() and getNICBirthDay()', () => {
    it('should extract correct month/day', () => {
      const month = getNICBirthMonth(validOldNIC);
      const day = getNICBirthDay(validOldNIC);
      expect(month).toBeGreaterThanOrEqual(1);
      expect(month).toBeLessThanOrEqual(12);
      expect(day).toBeGreaterThanOrEqual(1);
      expect(day).toBeLessThanOrEqual(31);
    });

    it('should use the 366-day NIC calendar (Feb always 29 days) for non-leap years', () => {
      // 1999 is not a leap year; day 60 = Feb 29, day 61 = Mar 1 in NIC convention
      expect(getNICBirthMonth('990601234V')).toBe(2);
      expect(getNICBirthDay('990601234V')).toBe(29);
      expect(getNICBirthMonth('990611234V')).toBe(3);
      expect(getNICBirthDay('990611234V')).toBe(1);
      // day 168 = June 16 (not June 17 as the real 1999 calendar would give)
      expect(getNICBirthMonth(validOldNIC)).toBe(6);
      expect(getNICBirthDay(validOldNIC)).toBe(16);
      // day 366 = Dec 31, female new NIC (866 - 500)
      expect(getNICBirthMonth('199986612345')).toBe(12);
      expect(getNICBirthDay('199986612345')).toBe(31);
    });

    it('should give the same result for leap years', () => {
      // 2000 is a leap year; day 61 = Mar 1
      expect(getNICBirthMonth('200006112345')).toBe(3);
      expect(getNICBirthDay('200006112345')).toBe(1);
    });
  });

  describe('daylk', () => {
    it('should convert between day of year and month/day with Feb always 29 days', () => {
      expect(daylk.dayOfYear(2, 29)).toBe(60);
      expect(daylk.dayOfYear(3, 1)).toBe(61);
      expect(daylk.dayOfYear(12, 31)).toBe(366);
      expect(daylk.toDate(60)).toEqual({ month: 2, day: 29 });
      expect(daylk.toDate(366)).toEqual({ month: 12, day: 31 });
      for (let d = 1; d <= daylk.TOTAL_DAYS_IN_YEAR; d++) {
        const { month, day } = daylk.toDate(d);
        expect(daylk.dayOfYear(month, day)).toBe(d);
      }
    });

    it('should return current day of year within range', () => {
      const d = daylk.currentDayOfYear();
      expect(d).toBeGreaterThanOrEqual(1);
      expect(d).toBeLessThanOrEqual(daylk.TOTAL_DAYS_IN_YEAR);
    });
  });

    describe('getNICDetails()', () => {
    it('should return full details for valid NIC', () => {
      const details = getFullNICDetails(validOldNIC);
      expect(details.isValid).toBe(true);
      expect(details.type).toBe('old');
      expect(details.gender).toBe('male');
      expect(details.birthYear).toBe(1999);
      expect(details.birthMonth).toBeGreaterThan(0);
      expect(details.birthDay).toBeGreaterThan(0);
    });

    it('should return error for invalid NIC', () => {
      const details = getFullNICDetails('abc');
      expect(details.isValid).toBe(false);
      expect(details.error).toBeDefined();
    });
  });

  describe('with a fixed date (2026-09-24, Sri Lanka time)', () => {
    beforeEach(() => {
      jest.useFakeTimers().setSystemTime(new Date('2026-09-24T12:00:00+05:30'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should reject a birth date in the future', () => {
      // 2026-09-24 is NIC day 268
      expect(isFullValidNIC('202626812345')).toEqual({ isValid: true, errorReason: null });
      expect(isFullValidNIC('202626912345')).toEqual({ isValid: false, errorReason: 'Birth date is in the future' });
      expect(isFullValidNIC('202776912345').isValid).toBe(false);
      expect(getFullNICDetails('202626912345').isValid).toBe(false);
    });

    it('getNICDetails() should return full details', () => {
      const details = getNICDetails('853456789V');
      expect(details).toEqual({
        nic: '853456789V',
        isValid: true,
        format: 'old',
        gender: 'male',
        birthYear: 1985,
        birthMonth: 12,
        birthDay: 10,
        dayOfYear: 345,
        age: 40,
        normalizedNIC: '198534506789',
        birthDate: new Date(1985, 11, 10),
        errorReason: null
      });
    });

    it('getNICDetails() should count the birthday as a completed year', () => {
      jest.setSystemTime(new Date('2026-12-10T00:30:00+05:30'));
      expect(getNICDetails('853456789V').age).toBe(41);
      expect(getNICDetails('198534506789').age).toBe(41);
    });

    it('getNICDetails() should handle new format and female NICs', () => {
      const details = getNICDetails('200056712345');
      expect(details).toMatchObject({
        format: 'new',
        gender: 'female',
        birthYear: 2000,
        birthMonth: 3,
        birthDay: 7,
        dayOfYear: 67,
        age: 26,
        normalizedNIC: '200056712345'
      });
    });

    it('getNICDetails() should return nulls and error reason for invalid NIC', () => {
      expect(getNICDetails('853676789V')).toMatchObject({
        isValid: false,
        format: null,
        birthYear: null,
        age: null,
        birthDate: null,
        errorReason: 'Invalid day number for old NIC'
      });
    });

    it('validateNIC() should return the standard validation result', () => {
      expect(validateNIC('853456789V')).toEqual({
        nic: '853456789V',
        isValid: true,
        format: 'old',
        gender: 'male',
        birthYear: 1985,
        birthMonth: 12,
        birthDay: 10,
        errorReason: null
      });
      expect(validateNIC('123')).toMatchObject({ isValid: false, errorReason: 'NIC format is invalid' });
    });
  });

  describe('edge cases', () => {
    it('getSimpleValidNICInfo() should give an error for invalid format', () => {
      expect(getSimpleValidNICInfo('123')).toEqual({ nic: '123', isValid: false, type: null, error: 'NIC format is invalid' });
      expect(getSimpleValidNICInfo(' 853456789v ')).toEqual({ nic: '853456789V', isValid: true, type: 'old', error: '' });
    });

    it('getFullValidNICInfo() should return the type and error', () => {
      expect(getFullValidNICInfo('200056712345')).toEqual({ nic: '200056712345', isValid: true, type: 'new' });
      expect(getFullValidNICInfo('')).toEqual({ nic: '', isValid: false, type: null, error: 'NIC is empty' });
      expect(getFullValidNICInfo('853676789V')).toEqual({ nic: '853676789V', isValid: false, type: null, error: 'Invalid day number for old NIC' });
    });

    it('helpers should return null for invalid format', () => {
      ['abcdefghij', '12ab5678901x', '123', ''].forEach(nic => {
        expect(getNICBirthYear(nic)).toBeNull();
        expect(getNICDayOfYear(nic)).toBeNull();
        expect(getNICGender(nic)).toBeNull();
        expect(getNICBirthMonth(nic)).toBeNull();
        expect(getNICBirthDay(nic)).toBeNull();
      });
    });

    it('helpers should return null for out of range day of year', () => {
      ['853676789V', '854006789V', '855006789V', '850006789V', '858676789V'].forEach(nic => {
        expect(getNICDayOfYear(nic)).toBeNull();
        expect(getNICGender(nic)).toBeNull();
        expect(getNICBirthMonth(nic)).toBeNull();
        expect(getNICBirthDay(nic)).toBeNull();
      });
      expect(getNICBirthYear('853676789V')).toBe(1985);
    });

    it('should not throw for non-string input', () => {
      const value = 123 as unknown as string;
      expect(isSimpleValidNIC(value)).toBe(false);
      expect(isFullValidNIC(value)).toEqual({ isValid: false, errorReason: 'NIC is empty' });
      expect(getNICGender(value)).toBeNull();
      expect(getNICBirthYear(value)).toBeNull();
      expect(getSimpleValidNICInfo(value).isValid).toBe(false);
      expect(getFullValidNICInfo(value).isValid).toBe(false);
      expect(getFullNICDetails(value).isValid).toBe(false);
      expect(getNICDetails(value).isValid).toBe(false);
      expect(convertOldToNewNIC(value)).toBeNull();
    });

    it('getFullNICDetails() should keep type and year for logically invalid NIC', () => {
      expect(getFullNICDetails('853676789V')).toEqual({
        nic: '853676789V',
        isValid: false,
        type: 'old',
        gender: null,
        birthYear: 1985,
        birthMonth: null,
        birthDay: null,
        error: 'Invalid birth year or day of year'
      });
      expect(getFullNICDetails('123').error).toBe('NIC format is invalid');
    });

    it('daylk.toDate() should fall back to Dec 31 past the end of the year', () => {
      expect(daylk.toDate(400)).toEqual({ month: 12, day: 31 });
    });
  });

  describe('convertOldToNewNIC()', () => {
    it('should convert old NIC to new format', () => {
      expect(convertOldToNewNIC('853456789V')).toBe('198534506789');
      expect(convertOldToNewNIC(' 857891234x ')).toBe('198578901234');
    });

    it('should return null for non old NICs', () => {
      expect(convertOldToNewNIC('198534567890')).toBeNull();
      expect(convertOldToNewNIC('abc')).toBeNull();
    });
  });

  describe('zod schemas', () => {
    it('nicSimpleSchema should validate format only', () => {
      expect(nicSimpleSchema.safeParse('853456789V')).toEqual({ success: true, data: '853456789V' });
      expect(nicSimpleSchema.safeParse('853676789V').success).toBe(true);
      expect(nicSimpleSchema.safeParse('123').success).toBe(false);
    });

    it('nicFullSchema should validate with logical checks', () => {
      expect(nicFullSchema.safeParse('198534567890')).toEqual({ success: true, data: '198534567890' });
      const result = nicFullSchema.safeParse('853676789V');
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toBe('Invalid day number for old NIC');
      expect(nicFullSchema.safeParse(123).success).toBe(false);
    });

    it('nicDetailsSchema should output NIC details', () => {
      const result = nicDetailsSchema.safeParse('853456789V');
      expect(result.success).toBe(true);
      expect(result.data?.gender).toBe('male');
      expect(result.data?.birthYear).toBe(1985);
      expect(nicDetailsSchema.safeParse('123').success).toBe(false);
    });

    it('nicSchema should use custom message and mode', () => {
      const message = 'Please enter a valid Sri Lankan NIC number';
      const full = nicSchema({ mode: 'full', message }).safeParse('853676789V');
      expect(full.error?.issues[0].message).toBe(message);
      const simple = nicSchema({ mode: 'simple', message }).safeParse('123');
      expect(simple.error?.issues[0].message).toBe(message);
      expect(nicSchema().safeParse('853676789V').success).toBe(false);
    });

    it('createNICObjectSchema should build an extendable object schema', () => {
      const userSchema = createNICObjectSchema('nic_number', 'full').extend({
        name: z.string(),
        email: z.string().email()
      });
      const user = { nic_number: '853456789V', name: 'John Doe', email: 'john@example.com' };
      expect(userSchema.parse(user)).toEqual(user);
      expect(userSchema.safeParse({ ...user, nic_number: '853676789V' }).success).toBe(false);

      expect(createNICObjectSchema().parse({ nic: '853456789V' })).toEqual({ nic: '853456789V' });
      expect(createNICObjectSchema('nic', 'simple').safeParse({ nic: '853676789V' }).success).toBe(true);
    });
  });
});