# Sri Lanka NIC Validator 

[![npm version](https://badge.fury.io/js/sl_nic_validator.svg)](https://badge.fury.io/js/sl_nic_validator)
[![Build Status](https://github.com/hushanthaK/sl_nic_validator/actions/workflows/test.yml/badge.svg)](https://github.com/hushanthaK/sl_nic_validator/actions/workflows/test.yml)
[![Coverage Status](https://coveralls.io/repos/github/hushanthaK/sl_nic_validator/badge.svg?branch=main)](https://coveralls.io/github/hushanthaK/sl_nic_validator?branch=main)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A lightweight utility library for validating and extracting information from **Sri Lankan National Identity Card (NIC)** numbers - both **old** and **new** formats.

---
## Features

✅ Format & structural validation  
✅ Supports both old (10-char) and new (12-digit) NIC formats  
✅ Extracts gender, birth year, birth month, birth day  
✅ Returns detailed validation errors  
✅ TypeScript support with clear typings  
✅ Fully tested with Jest

---

## Installation

```bash
npm install @teknyo/sl_nic_validator
```

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

##### import
```javascript
import { validateNIC  } from '@teknyo/sl_nic_validator';
```

**1. `isSimpleValidNIC(nic: string): boolean`**

Validates format only.
```ts
isSimpleValidNIC('853456789V'); // true
isSimpleValidNIC('123');        // false
```

**2. `isFullValidNIC(nic: string): boolean`**

Validates format + logical birth values (day, year ranges).
```ts
isFullValidNIC('199845612345'); // true
isFullValidNIC('199813513456'); // false (invalid day)
```

**3. `getSimpleValidNICInfo(nic: string): NICBasicDetails`**

Returns basic info:
```ts
{
  nic: "853456789V",
  isValid: true,
  type: "old",
  error: ""
}
```

**4. `getFullValidNICInfo(nic: string): NICBasicDetails`**

Same as above but includes validation errors if invalid:
```ts
{
  nic: "123",
  isValid: false,
  type: null,
  error: "NIC format is invalid"
}
```

**5. `getFullNICDetails(nic: string): NICFullDetails`**

Returns all extracted metadata:
```ts
{
  nic: "853456789V",
  isValid: true,
  type: "old",
  gender: "male",
  birthYear: 1985,
  birthMonth: 12,
  birthDay: 11,
  error: undefined
}
```

### Helper Functions

These utilities let you build custom logic using raw NIC values.

| Function                | Returns                      |
| ----------------------- | ---------------------------- |
| `getNICGender(nic)`     | `'male'` / `'female'` / null |
| `getNICBirthYear(nic)`  | `number` (e.g. 1985) / null  |
| `getNICDayOfYear(nic)`  | `number` (1–366) / null      |
| `getNICBirthMonth(nic)` | `number` (1–12) / null       |
| `getNICBirthDay(nic)`   | `number` (1–31) / null       |


## Validation Criteria

Both simple and full validations check for format and logical correctness.

#####  Old NIC (Format: YYDDDNNNNV)
| Segment   | Description                             | Example               | Rules                                                      |
| --------- | --------------------------------------- | --------------------- | ---------------------------------------------------------- |
| `YY`      | Last 2 digits of birth year             | `85`                  | Interpreted as `1900 + YY`                                 |
| `DDD`     | Day of year                             | `001–366` / `501–866` | > 500 indicates **female**, subtract 500 to get actual day |
| `NNNN`    | Serial portion (not validated strictly) | `1234`                | Ignored in logic validation                                |
| `V` / `X` | Suffix                                  | `V`                   | Must be either `V` or `X`                                  |

#####  New NIC (Format: YYYYDDDNNNN)
| Segment | Description     | Example               | Rules                                     |
| ------- | --------------- | --------------------- | ----------------------------------------- |
| `YYYY`  | Full birth year | `2000`                | Must be between **1900** and current year |
| `DDD`   | Day of year     | `001–366` / `501–866` | Same rule as old NIC: >500 = female       |
| `NNNN`  | Serial portion  | `5678`                | Ignored in logic validation               |


## License

MIT © [Teknyo.lk](https://teknyo.lk)