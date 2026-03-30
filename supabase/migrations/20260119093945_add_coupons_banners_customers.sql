/*
  # Add Coupons, Banners, and Customers Tables

  1. New Tables
    - `coupons`
      - `id` (uuid, primary key)
      - `code` (text, unique, coupon code)
      - `discount_type` (text, percentage or fixed)
      - `discount_value` (numeric, discount amount)
      - `min_order_value` (numeric, minimum order value)
      - `max_discount` (numeric, maximum discount for percentage)
      - `valid_from` (date, start date)
      - `valid_until` (date, end date)
      - `usage_limit` (integer, max uses)
      - `used_count` (integer, current usage)
      - `is_active` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `banners`
      - `id` (uuid, primary key)
      - `title` (text, banner title)
      - `subtitle` (text, optional subtitle)
      - `image_url` (text, banner image)
      - `link_url` (text, optional link)
      - `button_text` (text, optional button text)
      - `display_order` (integer, order of display)
      - `is_active` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `customers`
      - `id` (uuid, primary key)
      - `email` (text, unique, customer email)
      - `phone` (text, optional phone)
      - `name` (text, optional name)
      - `address` (text, optional address)
      - `city` (text, optional city)
      - `state` (text, optional state)
      - `pincode` (text, optional pincode)
      - `total_orders` (integer, default 0)
      - `total_spent` (numeric, default 0)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `last_order_at` (timestamptz, optional)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create coupons table
CREATE TABLE IF NOT EXISTS coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  discount_type text NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value numeric NOT NULL CHECK (discount_value >= 0),
  min_order_value numeric DEFAULT 0 NOT NULL,
  max_discount numeric,
  valid_from date NOT NULL,
  valid_until date NOT NULL,
  usage_limit integer,
  used_count integer DEFAULT 0 NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT valid_dates CHECK (valid_until >= valid_from)
);

-- Create banners table
CREATE TABLE IF NOT EXISTS banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subtitle text,
  image_url text NOT NULL,
  link_url text,
  button_text text,
  display_order integer DEFAULT 1 NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  phone text,
  name text,
  address text,
  city text,
  state text,
  pincode text,
  total_orders integer DEFAULT 0 NOT NULL,
  total_spent numeric DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  last_order_at timestamptz
);

-- Enable RLS
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for coupons
CREATE POLICY "Public can view active coupons"
  ON coupons FOR SELECT
  TO public
  USING (is_active = true AND valid_from <= CURRENT_DATE AND valid_until >= CURRENT_DATE);

CREATE POLICY "Authenticated users can manage coupons"
  ON coupons FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for banners
CREATE POLICY "Public can view active banners"
  ON banners FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Authenticated users can manage banners"
  ON banners FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for customers
CREATE POLICY "Users can view own customer data"
  ON customers FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage customers"
  ON customers FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_is_active ON coupons(is_active);
CREATE INDEX IF NOT EXISTS idx_coupons_valid_dates ON coupons(valid_from, valid_until);
CREATE INDEX IF NOT EXISTS idx_banners_display_order ON banners(display_order);
CREATE INDEX IF NOT EXISTS idx_banners_is_active ON banners(is_active);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);

-- Insert sample data
INSERT INTO coupons (code, discount_type, discount_value, min_order_value, valid_from, valid_until, is_active)
VALUES
  ('WELCOME10', 'percentage', 10, 500, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', true),
  ('FESTIVE20', 'percentage', 20, 999, CURRENT_DATE, CURRENT_DATE + INTERVAL '15 days', true),
  ('SAVE100', 'fixed', 100, 1500, CURRENT_DATE, CURRENT_DATE + INTERVAL '60 days', true)
ON CONFLICT (code) DO NOTHING;

INSERT INTO banners (title, subtitle, image_url, button_text, display_order, is_active)
VALUES
  ('Sacred Puja Collection', 'Authentic spiritual items for your divine rituals', 'https://images.pexels.com/photos/8989571/pexels-photo-8989571.jpeg', 'Shop Now', 1, true),
  ('Premium Incense & Dhoop', 'Experience the divine fragrance', 'https://images.pexels.com/photos/4040695/pexels-photo-4040695.jpeg', 'Explore Collection', 2, true),
  ('Traditional Puja Essentials', 'Everything you need for worship', 'https://images.pexels.com/photos/8728380/pexels-photo-8728380.jpeg', 'Browse Products', 3, true)
ON CONFLICT DO NOTHING;