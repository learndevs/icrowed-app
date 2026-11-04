-- Loyalty: optional fixed points per order (alternative to the percentage/rate earn).
ALTER TABLE loyalty_settings ADD COLUMN IF NOT EXISTS earn_type varchar(20) NOT NULL DEFAULT 'percentage';
ALTER TABLE loyalty_settings ADD COLUMN IF NOT EXISTS fixed_points integer NOT NULL DEFAULT 100;
