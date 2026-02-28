import { BookingStatus, PaymentStatus } from '@winphotography/shared';

export type BookingLifecycleStage =
  | 'pending_deposit'
  | 'upcoming'
  | 'pending_full_payment'
  | 'pending_delivery'
  | 'completed'
  | 'cancelled';

interface PaymentLike {
  amount?: number | string | null;
  status?: string | null;
}

interface GalleryLike {
  status?: string | null;
}

interface BookingLifecycleInput {
  status?: string | null;
  eventDate?: Date | string | null;
  depositAmount?: number | string | null;
  packagePrice?: number | string | null;
  payments?: PaymentLike[] | null;
  galleries?: GalleryLike[] | null;
}

function toNumber(value: number | string | null | undefined): number {
  const numeric =
    typeof value === 'number'
      ? value
      : typeof value === 'string'
        ? Number(value)
        : 0;
  return Number.isFinite(numeric) ? numeric : 0;
}

function paidAmount(payments?: PaymentLike[] | null): number {
  if (!payments?.length) return 0;
  return payments
    .filter(
      (payment) =>
        payment.status === PaymentStatus.SUCCEEDED || payment.status === 'paid',
    )
    .reduce((sum, payment) => sum + toNumber(payment.amount), 0);
}

function hasDeliveredGallery(galleries?: GalleryLike[] | null): boolean {
  if (!galleries?.length) return false;
  return galleries.some((gallery) => gallery.status === 'published');
}

function normalizeStatus(status?: string | null): BookingLifecycleStage | null {
  if (!status) return null;

  if (
    status === BookingStatus.PENDING_DEPOSIT ||
    status === BookingStatus.UPCOMING ||
    status === BookingStatus.PENDING_FULL_PAYMENT ||
    status === BookingStatus.PENDING_DELIVERY ||
    status === BookingStatus.COMPLETED ||
    status === BookingStatus.CANCELLED
  ) {
    return status;
  }

  // Temporary safety net while beta rows are migrated.
  switch (status) {
    case 'confirmed':
      return 'upcoming';
    case 'in_progress':
      return 'pending_full_payment';
    case 'editing':
      return 'pending_delivery';
    case 'delivered':
      return 'completed';
    default:
      return null;
  }
}

export function deriveBookingLifecycleStage(
  booking: BookingLifecycleInput,
): BookingLifecycleStage {
  const normalizedStatus = normalizeStatus(booking.status);

  if (normalizedStatus === BookingStatus.CANCELLED) {
    return 'cancelled';
  }

  const paid = paidAmount(booking.payments);
  const depositAmount = toNumber(booking.depositAmount);
  const packagePrice = toNumber(booking.packagePrice);
  const depositSatisfied = depositAmount <= 0 || paid + 0.01 >= depositAmount;
  const fullyPaid = packagePrice <= 0 || paid + 0.01 >= packagePrice;
  const eventTimestamp = booking.eventDate ? new Date(booking.eventDate).getTime() : 0;
  const eventHasPassed =
    Number.isFinite(eventTimestamp) && eventTimestamp > 0 && eventTimestamp < Date.now();
  const delivered = hasDeliveredGallery(booking.galleries);

  if (!depositSatisfied) {
    return 'pending_deposit';
  }

  if (!fullyPaid) {
    if (normalizedStatus === 'pending_full_payment' || eventHasPassed) {
      return 'pending_full_payment';
    }
    return 'upcoming';
  }

  if (delivered) {
    return 'completed';
  }

  if (normalizedStatus === 'pending_delivery' || eventHasPassed) {
    return 'pending_delivery';
  }

  return 'upcoming';
}
