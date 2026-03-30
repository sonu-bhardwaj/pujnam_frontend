// Frontend-friendly data models that work with both Supabase-style data and
// the current MongoDB/Express API responses. All non-essential fields are
// optional so the UI can gracefully fall back when data is missing.
export interface Category {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  image_url?: string;
  image?: string;
  parent_id?: string | null;
  parent?: string | null;
  is_active?: boolean;
  isActive?: boolean;
  created_at?: string;
  createdAt?: string;
}

export interface Product {
  id: string;
  _id?: string;
  name: string;
  slug?: string;
  description?: string;
  short_description?: string;
  price: number;
  compare_at_price?: number | null;
  originalPrice?: number;
  category_id?: string | null;
  category?: string | Category | null;
  image_url?: string;
  images?: string[];
  stock_quantity?: number;
  stock?: number;
  low_stock_threshold?: number;
  featured?: boolean;
  is_featured?: boolean;
  isFeatured?: boolean;
  is_bestseller?: boolean;
  isBestseller?: boolean;
  is_active?: boolean;
  isActive?: boolean;
  deity?: string;
  attributes?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image_url: string;
  link_url: string;
  button_text: string;
  position?: string;
  is_active?: boolean;
  display_order?: number;
  created_at?: string;
}

export interface PanchangData {
  id: string;
  date: string;
  tithi: string;
  nakshatra: string;
  yoga: string;
  karana?: string;
  paksha?: string;
  vaar?: string;
  location?: string;
  sunrise: string;
  sunset: string;
  moonrise?: string;
  moonset?: string;
  created_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  product: string | Product;
  name?: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  user?: string | null;
  order_number?: string;
  status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'confirmed';
  orderStatus?: Order['status'];
  subtotal: number;
  discount?: number;
  shipping_cost?: number;
  shippingCost?: number;
  tax: number;
  total: number;
  items?: OrderItem[];
  shipping_address?: any;
  shippingAddress?: any;
  payment_method?: string;
  paymentMethod?: string;
  payment_status?: string;
  paymentStatus?: string;
  invoiceNumber?: string;
  tracking_id?: string;
  notes?: string;
  orderTimeline?: Array<{ status: string; note?: string; timestamp: string | Date }>
  created_at?: string;
  updated_at?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Customer {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  total_orders: number;
  total_spent: number;
  created_at: string;
  updated_at: string;
  last_order_at: string | null;
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_value: number;
  max_discount: number | null;
  valid_from: string;
  valid_until: string;
  usage_limit: number | null;
  used_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
