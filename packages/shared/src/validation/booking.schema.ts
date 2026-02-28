import { z } from 'zod';
import { EventType } from '../enums';

export const createBookingSchema = z.object({
  clientId: z.string().uuid('Invalid client ID'),
  inquiryId: z.string().uuid('Invalid inquiry ID').optional(),
  eventType: z.nativeEnum(EventType),
  eventDate: z.string().min(1, 'Event date is required'),
  eventTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, 'Event time must use HH:mm or HH:mm:ss')
    .optional(),
  eventTimezone: z.string().max(64, 'Timezone must be less than 64 characters').optional(),
  eventEndDate: z.string().optional(),
  eventLocation: z
    .string()
    .min(1, 'Event location is required')
    .max(500, 'Location must be less than 500 characters'),
  packageName: z
    .string()
    .min(1, 'Package name is required')
    .max(100, 'Package name must be less than 100 characters'),
  packagePrice: z.coerce.number().positive('Package price must be positive'),
  depositAmount: z.coerce.number().positive('Deposit amount must be positive'),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
