import { z } from 'zod';

export const CreateOrderSchema = z.object({
  addressId: z.string().cuid().optional(),
  address: z.object({
    line1: z.string(),
    line2: z.string().optional(),
    city: z.string(),
    region: z.string().optional(),
    notes: z.string().optional(),
  }).optional(),
  paymentProvider: z.enum(['PAYME', 'CLICK', 'CASH']),
}).refine((d) => d.addressId || d.address, { message: 'address required' });
export type CreateOrderDto = z.infer<typeof CreateOrderSchema>;
