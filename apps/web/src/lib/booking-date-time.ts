export const DEFAULT_BOOKING_TIMEZONE = "America/New_York";

export const bookingTimezoneOptions = [
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Phoenix", label: "Arizona Time (MST)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "America/Anchorage", label: "Alaska Time (AKT)" },
  { value: "Pacific/Honolulu", label: "Hawaii Time (HST)" },
];

function toDate(value?: string | Date | null): Date | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function isIsoDateOnly(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function normalizeDatePart(value?: string | Date | null): string {
  if (!value) return "";
  if (typeof value === "string" && isIsoDateOnly(value.trim())) {
    return value.trim();
  }
  const date = toDate(value);
  if (!date) return typeof value === "string" ? value : "";
  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(date.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function parseTimeParts(raw?: string | null): { hh: string; mm: string; ss: string } | null {
  if (!raw) return null;
  const value = raw.trim();

  const twentyFourMatch = value.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (twentyFourMatch) {
    const hour = Number(twentyFourMatch[1]);
    const minute = Number(twentyFourMatch[2]);
    const second = Number(twentyFourMatch[3] ?? "0");
    if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59 && second >= 0 && second <= 59) {
      return {
        hh: String(hour).padStart(2, "0"),
        mm: String(minute).padStart(2, "0"),
        ss: String(second).padStart(2, "0"),
      };
    }
  }

  const twelveHourMatch = value.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (twelveHourMatch) {
    const rawHour = Number(twelveHourMatch[1]);
    const minute = Number(twelveHourMatch[2]);
    const meridiem = twelveHourMatch[3].toUpperCase();
    if (rawHour >= 1 && rawHour <= 12 && minute >= 0 && minute <= 59) {
      let hour = rawHour % 12;
      if (meridiem === "PM") hour += 12;
      return {
        hh: String(hour).padStart(2, "0"),
        mm: String(minute).padStart(2, "0"),
        ss: "00",
      };
    }
  }

  return null;
}

function getTimeZoneAbbreviation(timeZone: string, anchorDate: Date): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "short",
  }).formatToParts(anchorDate);
  return parts.find((part) => part.type === "timeZoneName")?.value || timeZone;
}

export function formatTimestampWithTimezone(
  value?: string | Date | null,
  timeZone: string = DEFAULT_BOOKING_TIMEZONE,
): string {
  const date = toDate(value);
  if (!date) return "";

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
    timeZoneName: "short",
  }).formatToParts(date);

  const year = parts.find((part) => part.type === "year")?.value || "0000";
  const month = parts.find((part) => part.type === "month")?.value || "00";
  const day = parts.find((part) => part.type === "day")?.value || "00";
  const hour = parts.find((part) => part.type === "hour")?.value || "00";
  const minute = parts.find((part) => part.type === "minute")?.value || "00";
  const second = parts.find((part) => part.type === "second")?.value || "00";
  const zone = parts.find((part) => part.type === "timeZoneName")?.value || timeZone;

  return `${year}-${month}-${day} ${hour}:${minute}:${second} ${zone}`;
}

export function normalizeTimeForApi(raw?: string | null): string {
  const parsed = parseTimeParts(raw);
  if (!parsed) return "12:00:00";
  return `${parsed.hh}:${parsed.mm}:${parsed.ss}`;
}

export function toDateInputValue(value?: string | Date | null): string {
  const normalized = normalizeDatePart(value);
  return isIsoDateOnly(normalized) ? normalized : "";
}

export function toTimeInputValue(raw?: string | null): string {
  const parsed = parseTimeParts(raw);
  if (!parsed) return "12:00";
  return `${parsed.hh}:${parsed.mm}`;
}

export function formatBookingDateTime(
  eventDate?: string | Date | null,
  eventTime?: string | null,
  eventTimezone?: string | null,
): string {
  const datePart = normalizeDatePart(eventDate);
  if (!datePart) return "";

  const parsedTime = parseTimeParts(eventTime);
  const time = parsedTime ? `${parsedTime.hh}:${parsedTime.mm}` : "12:00";
  const timeZone = (eventTimezone || DEFAULT_BOOKING_TIMEZONE).trim() || DEFAULT_BOOKING_TIMEZONE;
  const anchor = new Date(`${datePart}T12:00:00.000Z`);
  const zone = getTimeZoneAbbreviation(timeZone, anchor);

  return `${datePart} ${time} ${zone}`;
}
