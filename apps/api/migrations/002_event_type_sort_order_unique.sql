-- Ensure event type sort order values are unique before enforcing a unique index.
WITH duplicate_rows AS (
  SELECT
    id,
    sort_order,
    ROW_NUMBER() OVER (
      PARTITION BY sort_order
      ORDER BY created_at ASC, id ASC
    ) AS duplicate_rank
  FROM event_types
),
max_sort AS (
  SELECT COALESCE(MAX(sort_order), -1) AS value
  FROM event_types
),
reassignments AS (
  SELECT
    d.id,
    m.value + ROW_NUMBER() OVER (ORDER BY d.sort_order ASC, d.id ASC) AS new_sort_order
  FROM duplicate_rows d
  CROSS JOIN max_sort m
  WHERE d.duplicate_rank > 1
)
UPDATE event_types e
SET sort_order = r.new_sort_order
FROM reassignments r
WHERE e.id = r.id;

CREATE UNIQUE INDEX IF NOT EXISTS idx_event_types_sort_order ON event_types (sort_order);
