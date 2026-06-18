import { z } from 'zod';

export const ConditionSchema = z.enum(['NEW', 'USED']);
export type Condition = z.infer<typeof ConditionSchema>;

export const UsedGradeSchema = z.enum(['A', 'B', 'C']);
export type UsedGrade = z.infer<typeof UsedGradeSchema>;

export const ProductFilterSchema = z.object({
  categorySlug: z.string().optional(),
  brandSlug: z.string().optional(),
  condition: ConditionSchema.optional(),
  minPrice: z.coerce.bigint().optional(),
  maxPrice: z.coerce.bigint().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
export type ProductFilter = z.infer<typeof ProductFilterSchema>;
