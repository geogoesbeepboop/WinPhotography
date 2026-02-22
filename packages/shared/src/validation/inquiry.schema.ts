import { z } from 'zod';
import { EventType } from '../enums';

export const createInquirySchema = z.object({
  contactName: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(255, 'Name must be less than 255 characters'),
  contactEmail: z.string().email('Please enter a valid email address'),
  contactPhone: z
    .string()
    .max(50, 'Phone number is too long')
    .optional()
    .or(z.literal('')),
  eventType: z.nativeEnum(EventType, {
    errorMap: () => ({ message: 'Please select an event type' }),
  }),
  eventDate: z.string().optional().or(z.literal('')),
  eventLocation: z
    .string()
    .max(500, 'Location must be less than 500 characters')
    .optional()
    .or(z.literal('')),
  guestCount: z.coerce
    .number()
    .int()
    .positive('Guest count must be a positive number')
    .optional()
    .or(z.literal(0)),
  packageInterest: z.string().max(100).optional().or(z.literal('')),
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(5000, 'Message must be less than 5000 characters'),
  howFoundUs: z.string().max(255).optional().or(z.literal('')),
});

export type CreateInquiryInput = z.infer<typeof createInquirySchema>;
