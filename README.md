# Sri Lanka NIC Validator 

[![npm version](https://img.shields.io/npm/v/@teknyo/sl_nic_validator.svg)](https://www.npmjs.com/package/@teknyo/sl_nic_validator)
[![Build Status](https://github.com/hushanthaK/sl_nic_validator/actions/workflows/test.yml/badge.svg)](https://github.com/hushanthaK/sl_nic_validator/actions/workflows/test.yml)
[![Coverage Status](https://coveralls.io/repos/github/hushanthaK/sl_nic_validator/badge.svg?branch=main)](https://coveralls.io/github/hushanthaK/sl_nic_validator?branch=main)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A lightweight utility library for validating and extracting information from **Sri Lankan National Identity Card (NIC)** numbers - both **old** and **new** formats.

---
## Features

✅ Format & structural validation  
✅ Supports both old (10-char) and new (12-digit) NIC formats  
✅ Extracts gender, birth year, birth month, birth day, age  
✅ Uses the official 366-day NIC calendar (February always 29 days)  
✅ Converts old NICs to the new format  
✅ Zod schemas for form validation  
✅ Returns detailed validation errors  
✅ TypeScript support with clear typings  
✅ Fully tested with Jest

---

## Installation

```bash
npm install @teknyo/sl_nic_validator zod
```

`zod` (v4) is a peer dependency used by the schema exports.

## NIC Formats
| Type | Format        | Example        | Notes                     |
| ---- | ------------- | -------------- | ------------------------- |
| Old  | `YYDDDNNNN(V or X)`  | `853456789V`   | 2-digit year, day of year |
| New  | `YYYYDDDNNNNN` | `199845612345` | 4-digit year, day of year |

- **DDD** is day-of-year:

- If `DDD > 500`, indicates a female

- Otherwise, male

- Final character in old NIC is **V** or **X**

## Usage

### Validation

```ts
import {
  isSimpleValidNIC,
  isFullValidNIC,
  getNICDetails,
  validateNIC
} from '@teknyo/sl_nic_validator';

// Simple format validation (no logical checks)
isSimpleValidNIC('853456789V'); // true
isSimpleValidNIC('123');        // false

// Full validation with logical checks
isFullValidNIC('198534567890');
// { isValid: true, errorReason: null }
isFullValidNIC('853676789V');
// { isValid: false, errorReason: 'Invalid day number for old NIC' }

// Standard validation
const validation = validateNIC('853456789V');
validation.isValid;   // true
validation.format;    // 'old'
validation.gender;    // 'male'
validation.birthYear; // 1985
```

Full validation checks the format, the birth year (1900 – current year), the day of year
(1–366, or 501–866 for females) and that the birth date is not in the future (Sri Lanka time).

### NIC details

```ts
const details = getNICDetails('853456789V');

if (details.isValid) {
  details.gender;        // 'male'
  details.birthYear;     // 1985
  details.birthMonth;    // 12
  details.birthDay;      // 10
  details.dayOfYear;     // 345
  details.age;           // age in years (Sri Lanka time)
  details.normalizedNIC; // '198534506789' (new format)
  details.birthDate;     // Date (local midnight)
} else {
  console.error(details.errorReason);
}
```

### Helper functions

```ts
getNICGender('853456789V');       // 'male' | 'female' | null
getNICBirthYear('853456789V');    // 1985 | null
getNICDayOfYear('853456789V');    // 345 | null
getNICBirthMonth('853456789V');   // 12 | null
getNICBirthDay('853456789V');     // 10 | null
convertOldToNewNIC('853456789V'); // '198534506789' | null
```

### Zod schemas

```ts
import {
  nicSimpleSchema,
  nicFullSchema,
  nicDetailsSchema,
  nicSchema,
  createNICObjectSchema
} from '@teknyo/sl_nic_validator';
import { z } from 'zod';

nicSimpleSchema.safeParse('853456789V');   // format only
nicFullSchema.safeParse('198534567890');   // format + logical checks

const result = nicDetailsSchema.safeParse('853456789V');
if (result.success) result.data.birthYear; // 1985 (full NICDetails object)

// Custom schema
nicSchema({
  mode: 'full', // 'simple' | 'full' ('full' by default)
  message: 'Please enter a valid Sri Lankan NIC number'
});

// Object schema for forms: createNICObjectSchema(fieldName = 'nic', mode = 'full')
const userSchema = createNICObjectSchema('nic_number', 'full').extend({
  name: z.string(),
  email: z.string().email()
});
```

Without a custom `message`, the schema error message is the validation error reason.

### NIC calendar (`daylk`)

The Sri Lankan government treats every year as having 366 days when encoding birthdays
in NICs — February always has 29 days, even in non-leap years. `daylk` implements this:

```ts
import { daylk } from '@teknyo/sl_nic_validator';

daylk.dayOfYear(3, 1);     // 61 (in every year)
daylk.toDate(345);         // { month: 12, day: 10 }
daylk.currentDayOfYear();  // today's NIC day of year (Sri Lanka time)
```

> Day 60 (Feb 29) is accepted in any year. For a non-leap year, `birthDate` rolls over to March 1
> because a JavaScript `Date` cannot represent Feb 29 in that year.

### Legacy functions

**`getSimpleValidNICInfo(nic: string): NICBasicDetails`**

Returns basic info:
```ts
{
  nic: "853456789V",
  isValid: true,
  type: "old",
  error: ""
}
```

**`getFullValidNICInfo(nic: string): NICBasicDetails`**

Same as above but includes validation errors if invalid:
```ts
{
  nic: "123",
  isValid: false,
  type: null,
  error: "NIC format is invalid"
}
```

**`getFullNICDetails(nic: string): NICFullDetails`**

Returns all extracted metadata:
```ts
{
  nic: "853456789V",
  isValid: true,
  type: "old",
  gender: "male",
  birthYear: 1985,
  birthMonth: 12,
  birthDay: 10,
  error: undefined
}
```


## Validation Criteria

Simple validation checks the format only. Full validation also checks the birth year, the day of year
(366-day NIC calendar) and that the birth date is not in the future.

#####  Old NIC (Format: YYDDDNNNNV)
| Segment   | Description                             | Example               | Rules                                                      |
| --------- | --------------------------------------- | --------------------- | ---------------------------------------------------------- |
| `YY`      | Last 2 digits of birth year             | `85`                  | Interpreted as `1900 + YY`                                 |
| `DDD`     | Day of year                             | `001–366` / `501–866` | > 500 indicates **female**, subtract 500 to get actual day |
| `NNNN`    | Serial portion (not validated strictly) | `1234`                | Ignored in logic validation                                |
| `V` / `X` | Suffix                                  | `V`                   | Must be either `V` or `X`                                  |

#####  New NIC (Format: YYYYDDDNNNNN)
| Segment | Description     | Example               | Rules                                     |
| ------- | --------------- | --------------------- | ----------------------------------------- |
| `YYYY`  | Full birth year | `2000`                | Must be between **1900** and current year |
| `DDD`   | Day of year     | `001–366` / `501–866` | Same rule as old NIC: >500 = female       |
| `NNNNN` | Serial portion  | `05678`               | Ignored in logic validation               |


## License

MIT © [Teknyo.lk](https://teknyo.lk)