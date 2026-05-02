-- Add PayHere and Cash on Delivery to the payment_method enum.
-- Run this once in your Supabase SQL Editor (Dashboard → SQL Editor → New query).

ALTER TYPE payment_method ADD VALUE IF NOT EXISTS 'payhere';
ALTER TYPE payment_method ADD VALUE IF NOT EXISTS 'cash_on_delivery';
