export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  // date of birth in dd-MM-yyyy format
  dob: string;
  // UTC ISO 8601 timestamp
  ts: string;
  acceptTerms: boolean;
  // MFA - Optional phone number for two-factor authentication
  phoneNumber?: string;
  // MFA - Enable MFA during registration (requires phoneNumber)
  enableMfa?: boolean;
  // Honorific title (e.g., Mr, Mrs, Ms)
  title?: string;
}
