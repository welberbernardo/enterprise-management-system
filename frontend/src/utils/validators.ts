import { z } from 'zod';

export const emailSchema = z.string().email('Invalid email address');
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Must contain an uppercase letter')
  .regex(/[0-9]/, 'Must contain a number');

export const requiredString = (label: string) =>
  z.string().min(1, `${label} is required`);

export const positiveNumber = (label: string) =>
  z.number({ invalid_type_error: `${label} must be a number` }).min(0, `${label} must be positive`);

export function isValidEmail(email: string): boolean {
  return emailSchema.safeParse(email).success;
}

export const phoneRegex = /^[+]?[\d\s()-]{7,20}$/;

export function isValidPhone(phone: string): boolean {
  return phoneRegex.test(phone);
}
