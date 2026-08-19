-- Blog posts & product review letters (admin-managed)
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(255) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  excerpt TEXT,
  body TEXT,
  post_type VARCHAR(20) NOT NULL DEFAULT 'article',
  cover_image_url TEXT,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name VARCHAR(255),
  brand_name VARCHAR(255),
  rating INTEGER CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5)),
  gallery_images JSONB NOT NULL DEFAULT '[]'::jsonb,
  video_urls JSONB NOT NULL DEFAULT '[]'::jsonb,
  pros JSONB NOT NULL DEFAULT '[]'::jsonb,
  cons JSONB NOT NULL DEFAULT '[]'::jsonb,
  related_links JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS blog_posts_published_idx ON blog_posts (is_published, published_at DESC);
CREATE INDEX IF NOT EXISTS blog_posts_type_idx ON blog_posts (post_type);
CREATE INDEX IF NOT EXISTS blog_posts_slug_idx ON blog_posts (slug);
