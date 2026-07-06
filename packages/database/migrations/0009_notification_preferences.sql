-- Admin notification preferences (order alerts, low stock, etc.)
CREATE TABLE IF NOT EXISTS notification_preferences (
  id serial PRIMARY KEY NOT NULL,
  notify_on_new_order boolean DEFAULT true NOT NULL,
  notify_on_low_stock boolean DEFAULT true NOT NULL,
  notify_on_refund boolean DEFAULT true NOT NULL,
  notify_on_review boolean DEFAULT false NOT NULL,
  recipient_emails text DEFAULT '' NOT NULL,
  updated_at timestamp DEFAULT now() NOT NULL
);

INSERT INTO notification_preferences (id)
SELECT 1
WHERE NOT EXISTS (SELECT 1 FROM notification_preferences LIMIT 1);
