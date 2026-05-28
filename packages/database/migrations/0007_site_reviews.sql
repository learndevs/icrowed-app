CREATE TABLE IF NOT EXISTS site_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_name varchar(255) NOT NULL,
  rating integer NOT NULL,
  body text NOT NULL,
  is_approved boolean NOT NULL DEFAULT true,
  created_at timestamp NOT NULL DEFAULT now()
);

-- Seed home page with initial testimonials (only if table is empty)
INSERT INTO site_reviews (reviewer_name, rating, body, is_approved)
SELECT * FROM (VALUES
  (
    'James Carter',
    5,
    'I''ve been using this for about a week now, and it completely exceeded my expectations. The battery life holds up exactly as advertised, and the audio/display quality is incredibly crisp. Setup was seamless out of the box, and the build feels very premium. Highly recommend to anyone on the fence!',
    true
  ),
  (
    'Sarah Mitchell',
    5,
    'Fast delivery to Colombo and the product was exactly as described. Genuine warranty and friendly support when I had a question about setup. Will definitely order again from iCrowd.',
    true
  ),
  (
    'David Perera',
    5,
    'Best prices I found for flagship phones in Sri Lanka. Checkout was smooth, tracking updates were clear, and the packaging felt secure. Very happy with my purchase.',
    true
  )
) AS seed(reviewer_name, rating, body, is_approved)
WHERE NOT EXISTS (SELECT 1 FROM site_reviews LIMIT 1);
