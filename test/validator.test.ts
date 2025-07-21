import { getFullNICDetails, getFullValidNICInfo, getNICBirthDay, getNICBirthMonth, getNICBirthYear, getNICDayOfYear, getNICGender, getSimpleValidNICInfo, isFullValidNIC, isSimpleValidNIC } from '../src/validator';

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
        expect(isFullValidNIC(nic)).toBe(true);
      });
    });

    it('should invalidate all invalid NICs (simple)', () => {
      invalidFormatNICs.forEach(nic => {
        expect(isSimpleValidNIC(nic)).toBe(false);
      });
    });

    it('should invalidate all invalid NICs (full)', () => {
      [...invalidFormatNICs].forEach(nic => {
        expect(isFullValidNIC(nic)).toBe(false);
      });
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
});