import { z } from 'zod';

export const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
export type Pagination = z.infer<typeof PaginationSchema>;

export const LocaleSchema = z.enum(['uz', 'ru', 'en']);
export type Locale = z.infer<typeof LocaleSchema>;

export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
}
