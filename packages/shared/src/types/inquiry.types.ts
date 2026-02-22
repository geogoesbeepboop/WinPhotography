import { EventType, InquiryStatus } from '../enums';

export interface Inquiry {
  id: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string | null;
  eventType: EventType;
  eventDate: string | null;
  eventLocation: string | null;
  guestCount: number | null;
  packageInterest: string | null;
  message: string;
  howFoundUs: string | null;
  status: InquiryStatus;
  adminNotes: string | null;
  bookingId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInquiryDto {
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  eventType: EventType;
  eventDate?: string;
  eventLocation?: string;
  guestCount?: number;
  packageInterest?: string;
  message: string;
  howFoundUs?: string;
}

export interface UpdateInquiryDto {
  status?: InquiryStatus;
  adminNotes?: string;
}
