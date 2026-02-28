import { BookingStatus, EventType } from '../enums';
import { User } from './user.types';

export interface Booking {
  id: string;
  clientId: string;
  client?: User;
  inquiryId: string | null;
  eventType: EventType;
  eventDate: string;
  eventTime: string;
  eventTimezone: string;
  eventEndDate: string | null;
  eventLocation: string;
  packageName: string;
  packagePrice: number;
  depositAmount: number;
  status: BookingStatus;
  lifecycleStage?:
    | 'pending_deposit'
    | 'upcoming'
    | 'pending_full_payment'
    | 'pending_delivery'
    | 'completed'
    | 'cancelled';
  contractUrl: string | null;
  contractSignedAt: string | null;
  adminNotes: string | null;
  clientNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingDto {
  clientId: string;
  inquiryId?: string;
  eventType: EventType;
  eventDate: string;
  eventTime?: string;
  eventTimezone?: string;
  eventEndDate?: string;
  eventLocation: string;
  packageName: string;
  packagePrice: number;
  depositAmount: number;
}

export interface UpdateBookingDto {
  eventDate?: string;
  eventTime?: string;
  eventTimezone?: string;
  eventEndDate?: string;
  eventLocation?: string;
  status?: BookingStatus;
  adminNotes?: string;
  clientNotes?: string;
}
