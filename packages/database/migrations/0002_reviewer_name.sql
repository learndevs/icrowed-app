-- Guest reviews: display name when user is not signed in.
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS reviewer_name varchar(255);
