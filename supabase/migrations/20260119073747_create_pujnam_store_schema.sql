/*
  # Pujnam Store E-commerce Database Schema

  1. New Tables
    - `categories`
      - `id` (uuid, primary key)
      - `name` (text) - Category name
      - `slug` (text) - URL-friendly name
      - `description` (text) - Category description
      - `image_url` (text) - Category icon/image
      - `parent_id` (uuid) - For subcategories
      - `display_order` (integer) - Order in menu
      - `created_at` (timestamptz)
    
    - `products`
      - `id` (uuid, primary key)
      - `name` (text) - Product name
      - `slug` (text) - URL-friendly name
      - `description` (text) - Full description
      - `short_description` (text) - Brief description
      - `price` (decimal) - Current price
      - `compare_at_price` (decimal) - Original price for discount display
      - `category_id` (uuid) - Foreign key to categories
      - `image_url` (text) - Main product image
      - `images` (jsonb) - Additional images array
      - `stock_quantity` (integer) - Available stock
      - `low_stock_threshold` (integer) - Alert threshold
      - `weight` (text) - Product weight
      - `fragrance` (text) - For incense/dhoop
      - `deity` (text) - Associated deity
      - `attributes` (jsonb) - Additional attributes
      - `is_featured` (boolean) - Show on homepage
      - `is_bestseller` (boolean) - Bestseller badge
      - `is_active` (boolean) - Published status
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `customers`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `name` (text)
      - `phone` (text)
      - `addresses` (jsonb) - Stored addresses array
      - `loyalty_points` (integer) - Reward points
      - `created_at` (timestamptz)
    
    - `orders`
      - `id` (uuid, primary key)
      - `customer_id` (uuid) - Foreign key
      - `order_number` (text, unique) - Human-readable order ID
      - `status` (text) - pending, processing, shipped, delivered, cancelled
      - `subtotal` (decimal)
      - `discount` (decimal)
      - `shipping_cost` (decimal)
      - `tax` (decimal)
      - `total` (decimal)
      - `shipping_address` (jsonb)
      - `payment_method` (text)
      - `payment_status` (text)
      - `tracking_id` (text)
      - `notes` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `order_items`
      - `id` (uuid, primary key)
      - `order_id` (uuid) - Foreign key
      - `product_id` (uuid) - Foreign key
      - `quantity` (integer)
      - `price` (decimal) - Price at time of order
      - `created_at` (timestamptz)
    
    - `banners`
      - `id` (uuid, primary key)
      - `title` (text)
      - `subtitle` (text)
      - `image_url` (text)
      - `link_url` (text)
      - `button_text` (text)
      - `position` (text) - hero, festive, promotional
      - `is_active` (boolean)
      - `display_order` (integer)
      - `created_at` (timestamptz)
    
    - `panchang_data`
      - `id` (uuid, primary key)
      - `date` (date, unique)
      - `tithi` (text)
      - `nakshatra` (text)
      - `yoga` (text)
      - `location` (text)
      - `sunrise` (text)
      - `sunset` (text)
      - `created_at` (timestamptz)
    
    - `coupons`
      - `id` (uuid, primary key)
      - `code` (text, unique)
      - `description` (text)
      - `discount_type` (text) - percentage, flat
      - `discount_value` (decimal)
      - `min_order_value` (decimal)
      - `max_discount` (decimal)
      - `valid_from` (timestamptz)
      - `valid_until` (timestamptz)
      - `usage_limit` (integer)
      - `used_count` (integer)
      - `is_active` (boolean)
      - `created_at` (timestamptz)
    
    - `reviews`
      - `id` (uuid, primary key)
      - `product_id` (uuid) - Foreign key
      - `customer_id` (uuid) - Foreign key
      - `rating` (integer) - 1-5 stars
      - `title` (text)
      - `comment` (text)
      - `is_verified` (boolean) - Verified purchase
      - `is_approved` (boolean) - Admin approved
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated admin users
    - Add policies for public read access where appropriate
*/

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text DEFAULT '',
  image_url text DEFAULT '',
  parent_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text DEFAULT '',
  short_description text DEFAULT '',
  price decimal(10,2) NOT NULL,
  compare_at_price decimal(10,2) DEFAULT NULL,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  image_url text DEFAULT '',
  images jsonb DEFAULT '[]'::jsonb,
  stock_quantity integer DEFAULT 0,
  low_stock_threshold integer DEFAULT 10,
  weight text DEFAULT '',
  fragrance text DEFAULT '',
  deity text DEFAULT '',
  attributes jsonb DEFAULT '{}'::jsonb,
  is_featured boolean DEFAULT false,
  is_bestseller boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  phone text DEFAULT '',
  addresses jsonb DEFAULT '[]'::jsonb,
  loyalty_points integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  order_number text UNIQUE NOT NULL,
  status text DEFAULT 'pending',
  subtotal decimal(10,2) NOT NULL,
  discount decimal(10,2) DEFAULT 0,
  shipping_cost decimal(10,2) DEFAULT 0,
  tax decimal(10,2) DEFAULT 0,
  total decimal(10,2) NOT NULL,
  shipping_address jsonb NOT NULL,
  payment_method text NOT NULL,
  payment_status text DEFAULT 'pending',
  tracking_id text DEFAULT '',
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  quantity integer NOT NULL,
  price decimal(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create banners table
CREATE TABLE IF NOT EXISTS banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subtitle text DEFAULT '',
  image_url text NOT NULL,
  link_url text DEFAULT '',
  button_text text DEFAULT 'Shop Now',
  position text DEFAULT 'hero',
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create panchang_data table
CREATE TABLE IF NOT EXISTS panchang_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date UNIQUE NOT NULL,
  tithi text NOT NULL,
  nakshatra text NOT NULL,
  yoga text NOT NULL,
  location text DEFAULT 'India',
  sunrise text DEFAULT '06:00 AM',
  sunset text DEFAULT '06:00 PM',
  created_at timestamptz DEFAULT now()
);

-- Create coupons table
CREATE TABLE IF NOT EXISTS coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  description text DEFAULT '',
  discount_type text NOT NULL,
  discount_value decimal(10,2) NOT NULL,
  min_order_value decimal(10,2) DEFAULT 0,
  max_discount decimal(10,2) DEFAULT NULL,
  valid_from timestamptz DEFAULT now(),
  valid_until timestamptz NOT NULL,
  usage_limit integer DEFAULT NULL,
  used_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title text DEFAULT '',
  comment text DEFAULT '',
  is_verified boolean DEFAULT false,
  is_approved boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE panchang_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Public read policies for categories
CREATE POLICY "Anyone can view active categories"
  ON categories FOR SELECT
  USING (true);

-- Public read policies for products
CREATE POLICY "Anyone can view active products"
  ON products FOR SELECT
  USING (is_active = true);

-- Public read policies for banners
CREATE POLICY "Anyone can view active banners"
  ON banners FOR SELECT
  USING (is_active = true);

-- Public read policies for panchang
CREATE POLICY "Anyone can view panchang data"
  ON panchang_data FOR SELECT
  USING (true);

-- Public read policies for reviews
CREATE POLICY "Anyone can view approved reviews"
  ON reviews FOR SELECT
  USING (is_approved = true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_products_bestseller ON products(is_bestseller) WHERE is_bestseller = true;
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_panchang_date ON panchang_data(date);
