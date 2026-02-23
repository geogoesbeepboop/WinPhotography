interface EventTypeOption {
  slug?: string;
  name?: string;
}

function normalize(value?: string | null): string {
  return (value || "").trim().toLowerCase();
}

function toTitleCaseWords(value: string): string {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function humanizeEventType(value?: string | null): string {
  const normalized = normalize(value);
  if (!normalized) return "";
  return toTitleCaseWords(normalized.replace(/[-_]+/g, " "));
}

export function getEventTypeLabel(
  value?: string | null,
  eventTypes: EventTypeOption[] = [],
): string {
  const normalized = normalize(value);
  if (!normalized) return "";

  const match = eventTypes.find((eventType) => {
    const slug = normalize(eventType.slug);
    const name = normalize(eventType.name);
    return slug === normalized || name === normalized;
  });

  return match?.name || humanizeEventType(value);
}
