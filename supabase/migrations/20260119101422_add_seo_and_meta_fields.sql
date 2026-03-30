/*
  # Add SEO and Meta Fields

  1. Updates to Products Table
    - Add `seo_keywords` (text array for SEO keywords)
    - Add `seo_description` (text for meta description)
    - Add `seo_title` (text for custom page title)

  2. New Site Settings Table
    - `id` (uuid, primary key)
    - `site_name` (text)
    - `site_logo` (text, logo URL)
    - `site_favicon` (text, favicon URL)
    - `meta_title` (text)
    - `meta_description` (text)
    - `meta_keywords` (text array)
    - `social_facebook` (text)
    - `social_instagram` (text)
    - `social_twitter` (text)
    - `contact_email` (text)
    - `contact_phone` (text)
    - `updated_at` (timestamptz)

  3. Security
    - Enable RLS on site_settings
    - Add policies for authenticated users
*/

-- Add SEO fields to products table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'seo_keywords'
  ) THEN
    ALTER TABLE products ADD COLUMN seo_keywords text[];
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'seo_description'
  ) THEN
    ALTER TABLE products ADD COLUMN seo_description text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'seo_title'
  ) THEN
    ALTER TABLE products ADD COLUMN seo_title text;
  END IF;
END $$;

-- Create site settings table
CREATE TABLE IF NOT EXISTS site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_name text DEFAULT 'Pujashree Store' NOT NULL,
  site_logo text,
  site_favicon text,
  meta_title text,
  meta_description text,
  meta_keywords text[],
  social_facebook text,
  social_instagram text,
  social_twitter text,
  contact_email text,
  contact_phone text,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for site_settings
CREATE POLICY "Public can view site settings"
  ON site_settings FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage site settings"
  ON site_settings FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert default site settings
INSERT INTO site_settings (
  site_name,
  meta_title,
  meta_description,
  meta_keywords,
  contact_email,
  contact_phone
)
VALUES (
  'Pujashree Store',
  'Pujashree - Aapki Aastha Ka Saarthi | Authentic Puja Items Online',
  'Shop authentic puja items, incense, dhoop, puja essentials, and traditional spiritual products. Free shipping on orders above ₹499.',
  ARRAY['puja items', 'spiritual products', 'incense', 'dhoop', 'puja essentials', 'hindu puja', 'online puja store'],
  'info@pujashree.in',
  '+91 98765 43210'
)
ON CONFLICT DO NOTHING;
