export interface NICBasicDetails {
    nic: string;
    isValid: boolean;
    type: NICType | null;
    error?: string;
}
export interface NICFullDetails extends NICBasicDetails {
    gender: NICGender | null;
    birthYear: number | null;
    birthMonth: number | null;
    birthDay: number | null;
    error?: string;
}
export type NICType = 'old' | 'new';
export type NICGender = 'male' | 'female';
