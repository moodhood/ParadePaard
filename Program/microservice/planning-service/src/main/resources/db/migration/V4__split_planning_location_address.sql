ALTER TABLE planning_locations
    ADD COLUMN IF NOT EXISTS street_name VARCHAR(255);

ALTER TABLE planning_locations
    ADD COLUMN IF NOT EXISTS house_number VARCHAR(255);

ALTER TABLE planning_locations
    ADD COLUMN IF NOT EXISTS house_number_suffix VARCHAR(255);

ALTER TABLE planning_locations
    ADD COLUMN IF NOT EXISTS postal_code VARCHAR(255);

ALTER TABLE planning_locations
    ADD COLUMN IF NOT EXISTS city VARCHAR(255);

UPDATE planning_locations
SET street_name = address
WHERE street_name IS NULL
  AND address IS NOT NULL;
