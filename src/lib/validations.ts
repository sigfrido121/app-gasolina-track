import { z } from 'zod';

export const RefuelSchema = z.object({
    amount: z.coerce.number().positive("El importe debe ser mayor a 0").optional(),
    liters: z.coerce.number().positive("Los litros deben ser mayor a 0").optional(),
    pricePerLiter: z.coerce.number().positive("El precio por litro debe ser mayor a 0").optional(),
    odometer: z.coerce.number().int().positive("El kilometraje debe ser positivo").optional(),
    tripDistance: z.coerce.number().positive().optional(),
    isFullTank: z.coerce.boolean().default(true),
    date: z.coerce.date().default(() => new Date()),
    notes: z.string().optional(),
});

export type RefuelInput = z.infer<typeof RefuelSchema>;
