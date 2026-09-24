export interface NICBasicDetails {
  nic: string;
  isValid: boolean;
  type: NICType  | null;
  error?: string;
}

export interface NICFullDetails extends NICBasicDetails {
  gender: NICGender | null;
  birthYear: number | null;
  birthMonth: number | null;
  birthDay: number | null;
  error?: string;
};

export interface NICFullValidationResult {
  isValid: boolean;
  errorReason: string | null;
}

export interface NICValidationResult extends NICFullValidationResult {
  nic: string;
  format: NICType | null;
  gender: NICGender | null;
  birthYear: number | null;
  birthMonth: number | null;
  birthDay: number | null;
}

export interface NICDetails extends NICValidationResult {
  dayOfYear: number | null;
  age: number | null;
  normalizedNIC: string | null;
  birthDate: Date | null;
}

export type NICSchemaMode = 'simple' | 'full';

export interface NICSchemaOptions {
  mode?: NICSchemaMode;
  message?: string;
}

export type NICType = 'old' | 'new';

export type NICGender = 'male'| 'female'
