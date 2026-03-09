-- Add Google Business location fields to businesses table
ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS google_location_id text,
  ADD COLUMN IF NOT EXISTS google_location_name text;

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  google_review_id text UNIQUE,
  google_account_id text,
  google_location_id text,
  reviewer_name text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text text NOT NULL DEFAULT '',
  review_date timestamptz NOT NULL DEFAULT now(),
  drafted_response text DEFAULT '',
  response_status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index for fast lookups by business
CREATE INDEX IF NOT EXISTS idx_reviews_business_id ON reviews(business_id);

-- Index for deduplication by google_review_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_reviews_google_review_id ON reviews(google_review_id)
  WHERE google_review_id IS NOT NULL;

-- No RLS on reviews table: all access goes through authenticated server-side
-- API routes that enforce ownership checks (e.g. reviews/list, reviews/reply).
-- The app uses the anon key from server-side only, never from the browser.
