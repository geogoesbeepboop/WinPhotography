export type BookingLifecycleStage =
  | "pending_deposit"
  | "upcoming"
  | "pending_full_payment"
  | "pending_delivery"
  | "completed"
  | "cancelled";

interface PaymentLike {
  amount?: number | string | null;
  status?: string | null;
}

interface GalleryLike {
  status?: string | null;
}

interface BookingLifecycleInput {
  lifecycleStage?: string | null;
  status?: string | null;
  eventDate?: string | Date | null;
  depositAmount?: number | string | null;
  packagePrice?: number | string | null;
  payments?: PaymentLike[] | null;
  galleries?: GalleryLike[] | null;
}

function toNumber(value: number | string | null | undefined): number {
  const numeric =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : 0;
  return Number.isFinite(numeric) ? numeric : 0;
}

function normalizeStatus(status?: string | null): BookingLifecycleStage | null {
  if (!status) return null;

  if (
    status === "pending_deposit" ||
    status === "upcoming" ||
    status === "pending_full_payment" ||
    status === "pending_delivery" ||
    status === "completed" ||
    status === "cancelled"
  ) {
    return status;
  }

  // Temporary safety net for legacy beta rows.
  switch (status) {
    case "confirmed":
      return "upcoming";
    case "in_progress":
      return "pending_full_payment";
    case "editing":
      return "pending_delivery";
    case "delivered":
      return "completed";
    default:
      return null;
  }
}

export function deriveBookingLifecycleStage(
  booking: BookingLifecycleInput,
): BookingLifecycleStage {
  const normalizedStatus =
    normalizeStatus(booking.status) ?? normalizeStatus(booking.lifecycleStage);

  // Persisted booking status should be the source of truth for lifecycle display/state.
  if (normalizedStatus) {
    return normalizedStatus;
  }

  const paidAmount = (booking.payments || [])
    .filter((payment) => payment.status === "succeeded" || payment.status === "paid")
    .reduce((sum, payment) => sum + toNumber(payment.amount), 0);

  const depositAmount = toNumber(booking.depositAmount);
  const packagePrice = toNumber(booking.packagePrice);
  const depositSatisfied = depositAmount <= 0 || paidAmount + 0.01 >= depositAmount;
  const fullyPaid = packagePrice <= 0 || paidAmount + 0.01 >= packagePrice;
  const eventTimestamp = booking.eventDate ? new Date(booking.eventDate).getTime() : 0;
  const eventHasPassed = Number.isFinite(eventTimestamp) && eventTimestamp > 0 && eventTimestamp < Date.now();
  const hasPublishedGallery = (booking.galleries || []).some(
    (gallery) => gallery.status === "published",
  );

  if (!depositSatisfied) {
    return "pending_deposit";
  }

  if (!fullyPaid) {
    if (normalizedStatus === "pending_full_payment" || eventHasPassed) {
      return "pending_full_payment";
    }
    return "upcoming";
  }

  if (hasPublishedGallery) {
    return "completed";
  }

  if (normalizedStatus === "pending_delivery" || eventHasPassed) {
    return "pending_delivery";
  }

  return "upcoming";
}
