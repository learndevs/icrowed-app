-- Bank deposit details for checkout (admin-managed via store_settings.bank_details).
ALTER TABLE store_settings ADD COLUMN IF NOT EXISTS bank_details jsonb;

UPDATE store_settings
SET bank_details = jsonb_build_object(
  'bankName', 'Commercial Bank of Ceylon',
  'accountName', 'iCrowd (Pvt) Ltd',
  'accountNumber', '8002-XXXXXXXX',
  'branch', 'Colombo 03',
  'instructions', 'Use your order number as the payment reference. Your order will be confirmed within 24 hours after we verify your deposit.'
)
WHERE bank_details IS NULL;
