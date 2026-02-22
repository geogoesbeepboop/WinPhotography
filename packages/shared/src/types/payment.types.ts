import { PaymentStatus, PaymentType } from '../enums';

export interface Payment {
  id: string;
  bookingId: string;
  clientId: string;
  paymentType: PaymentType;
  amount: number;
  currency: string;
  status: PaymentStatus;
  stripePaymentIntentId: string | null;
  stripeCheckoutSessionId: string | null;
  stripeInvoiceId: string | null;
  stripeReceiptUrl: string | null;
  dueDate: string | null;
  paidAt: string | null;
  description: string | null;
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentCheckoutDto {
  bookingId: string;
  paymentType: PaymentType;
  amount: number;
  description?: string;
}
