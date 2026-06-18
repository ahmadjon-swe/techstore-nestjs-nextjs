import { z } from 'zod';

export const RegisterSchema = z.object({
  phone: z.string().regex(/^\+998\d{9}$/).optional(),
  email: z.string().email().optional(),
  password: z.string().min(8),
  name: z.string().min(1).optional(),
}).refine((d) => d.phone || d.email, { message: 'phone or email required' });
export type RegisterDto = z.infer<typeof RegisterSchema>;

export const LoginSchema = z.object({
  phone: z.string().optional(),
  email: z.string().email().optional(),
  password: z.string(),
}).refine((d) => d.phone || d.email, { message: 'phone or email required' });
export type LoginDto = z.infer<typeof LoginSchema>;

export const RefreshSchema = z.object({
  refreshToken: z.string(),
});
export type RefreshDto = z.infer<typeof RefreshSchema>;

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}
