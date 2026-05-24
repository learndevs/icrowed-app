-- Contact page content (admin-managed via store_settings.contact_page).
ALTER TABLE store_settings ADD COLUMN IF NOT EXISTS contact_page jsonb;

UPDATE store_settings
SET contact_page = jsonb_build_object(
  'heading', 'Contact Us',
  'subtitle', 'We are here to help. Reach out via phone, email, or social media.',
  'phone2', ''
)
WHERE contact_page IS NULL;
