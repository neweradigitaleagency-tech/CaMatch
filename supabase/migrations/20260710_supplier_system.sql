-- Ça Match — Supplier Management System (Phase 1)
-- Run after all previous migrations
-- Document ID: CM-DB-002

-- ============================================================================
-- 1. ENUM EXTENSIONS
-- ============================================================================

ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'supplier';

-- ============================================================================
-- 2. PRODUCT CATEGORIES (distinct from service categories)
-- ============================================================================

CREATE TABLE IF NOT EXISTS product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  parent_id UUID REFERENCES product_categories(id) ON DELETE SET NULL,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prod_cat_parent ON product_categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_prod_cat_active ON product_categories(is_active) WHERE is_active = TRUE;

-- ============================================================================
-- 3. SUPPLIER PROFILES
-- ============================================================================

CREATE TABLE IF NOT EXISTS supplier_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT,
  city TEXT NOT NULL,
  logo_url TEXT,
  photo_url TEXT,
  legal_docs_urls TEXT[],
  status TEXT DEFAULT 'EN_ATTENTE' CHECK (status IN ('EN_ATTENTE','VERIFIE','ACTIF','BLOQUE','REJETE')),
  commission_rate DECIMAL(5,2) DEFAULT 10.00 CHECK (commission_rate >= 0 AND commission_rate <= 100),
  rating DECIMAL(3,2) DEFAULT 0.00 CHECK (rating >= 0 AND rating <= 5),
  total_products INT DEFAULT 0,
  total_orders INT DEFAULT 0,
  total_revenue INT DEFAULT 0,
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_supplier_status ON supplier_profiles(status);
CREATE INDEX IF NOT EXISTS idx_supplier_city ON supplier_profiles(city);
CREATE INDEX IF NOT EXISTS idx_supplier_active ON supplier_profiles(is_active) WHERE is_active = TRUE;

-- ============================================================================
-- 4. SUPPLIER PRODUCTS (MVP flat model)
-- ============================================================================

CREATE TABLE IF NOT EXISTS supplier_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID NOT NULL REFERENCES supplier_profiles(user_id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES product_categories(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  description TEXT,
  images TEXT[] DEFAULT '{}',
  brand TEXT,
  manufacturer_reference TEXT,
  barcode TEXT,
  technical_specs JSONB DEFAULT '{}',
  unit_type TEXT DEFAULT 'piece' CHECK (unit_type IN ('piece','meter','kg','liter','bag','box','set')),

  -- Pricing
  supplier_price INT NOT NULL CHECK (supplier_price >= 0),
  recommended_price INT CHECK (recommended_price >= 0),

  -- Stock
  stock INT DEFAULT 0 CHECK (stock >= 0),
  reserved_stock INT DEFAULT 0 CHECK (reserved_stock >= 0),
  low_stock_threshold INT DEFAULT 5,
  unlimited_stock BOOLEAN DEFAULT false,

  -- Status
  is_active BOOLEAN DEFAULT true,
  is_visible BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sp_supplier ON supplier_products(supplier_id);
CREATE INDEX IF NOT EXISTS idx_sp_category ON supplier_products(category_id);
CREATE INDEX IF NOT EXISTS idx_sp_active ON supplier_products(supplier_id) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_sp_visible ON supplier_products(is_visible) WHERE is_visible = TRUE;

-- ============================================================================
-- 5. DELIVERY ZONES
-- ============================================================================

CREATE TABLE IF NOT EXISTS delivery_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID NOT NULL REFERENCES supplier_profiles(user_id) ON DELETE CASCADE,
  city TEXT NOT NULL,
  price INT NOT NULL DEFAULT 0,
  estimated_delay_hours INT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(supplier_id, city)
);

CREATE INDEX IF NOT EXISTS idx_dz_supplier ON delivery_zones(supplier_id);

-- ============================================================================
-- 6. SUPPLIER APPLICATIONS (registration flow)
-- ============================================================================

CREATE TABLE IF NOT EXISTS supplier_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT,
  city TEXT NOT NULL,
  legal_docs_urls TEXT[],
  photo_url TEXT,
  logo_url TEXT,
  delivery_cities TEXT[],
  status TEXT DEFAULT 'SUBMITTED' CHECK (status IN ('SUBMITTED','UNDER_REVIEW','APPROVED','REJECTED')),
  reviewed_by UUID REFERENCES users(id),
  review_notes TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_supp_app_status ON supplier_applications(status);
CREATE INDEX IF NOT EXISTS idx_supp_app_user ON supplier_applications(user_id);

-- ============================================================================
-- 7. MATERIAL ORDERS (linked to jobs + quotes)
-- ============================================================================

CREATE TYPE material_order_status AS ENUM (
  'PENDING_SUPPLIER',
  'ACCEPTED',
  'AWAITING_PAYMENT',
  'PREPARING',
  'READY',
  'DELIVERING',
  'DELIVERED',
  'PARTIALLY_DELIVERED',
  'CANCELLED',
  'DISPUTED'
);

CREATE TABLE IF NOT EXISTS material_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE RESTRICT,
  quote_id UUID REFERENCES quotes(id) ON DELETE SET NULL,
  supplier_id UUID NOT NULL REFERENCES supplier_profiles(user_id) ON DELETE RESTRICT,
  client_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  professional_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  status material_order_status DEFAULT 'PENDING_SUPPLIER',
  delivery_city TEXT,
  delivery_address TEXT,
  delivery_cost INT DEFAULT 0,
  subtotal INT NOT NULL DEFAULT 0,
  commission INT NOT NULL DEFAULT 0,
  total INT NOT NULL DEFAULT 0,
  notes TEXT,
  estimated_delivery_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mo_job ON material_orders(job_id);
CREATE INDEX IF NOT EXISTS idx_mo_supplier ON material_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_mo_client ON material_orders(client_id);
CREATE INDEX IF NOT EXISTS idx_mo_status ON material_orders(status);
CREATE INDEX IF NOT EXISTS idx_mo_quote ON material_orders(quote_id) WHERE quote_id IS NOT NULL;

-- ============================================================================
-- 8. MATERIAL ORDER ITEMS
-- ============================================================================

CREATE TABLE IF NOT EXISTS material_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES material_orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES supplier_products(id) ON DELETE RESTRICT,
  product_name TEXT NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  unit_price INT NOT NULL CHECK (unit_price >= 0),
  total_price INT GENERATED ALWAYS AS (quantity * unit_price) STORED,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_moi_order ON material_order_items(order_id);

-- ============================================================================
-- 9. SUPPLIER COMMISSION HISTORY
-- ============================================================================

CREATE TABLE IF NOT EXISTS supplier_commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID NOT NULL REFERENCES supplier_profiles(user_id) ON DELETE CASCADE,
  rate DECIMAL(5,2) NOT NULL CHECK (rate >= 0 AND rate <= 100),
  effective_from DATE NOT NULL,
  effective_to DATE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sc_supplier ON supplier_commissions(supplier_id);
CREATE INDEX IF NOT EXISTS idx_sc_active ON supplier_commissions(supplier_id) WHERE effective_to IS NULL;

-- ============================================================================
-- 10. RLS POLICIES
-- ============================================================================

ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_commissions ENABLE ROW LEVEL SECURITY;

-- Product categories: everyone can read
CREATE POLICY "Public can read active product categories" ON product_categories
  FOR SELECT USING (is_active = TRUE);

-- Supplier profiles: suppliers see own, pros/clients see active, admins see all
CREATE POLICY "Suppliers view own profile" ON supplier_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Public view active suppliers" ON supplier_profiles
  FOR SELECT USING (is_active = TRUE AND status = 'ACTIF');

CREATE POLICY "Admins view all supplier profiles" ON supplier_profiles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles ur JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'platform_admin')
  );

CREATE POLICY "Suppliers update own profile" ON supplier_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Supplier products: suppliers CRUD, authenticated users SELECT visible
CREATE POLICY "Suppliers manage own products" ON supplier_products
  FOR ALL USING (
    auth.uid() = supplier_id
    AND EXISTS (SELECT 1 FROM supplier_profiles sp WHERE sp.user_id = auth.uid() AND sp.is_active = TRUE)
  );

CREATE POLICY "Authenticated view visible products" ON supplier_products
  FOR SELECT USING (is_visible = TRUE);

-- Delivery zones: suppliers manage, anyone reads active
CREATE POLICY "Suppliers manage own zones" ON delivery_zones
  FOR ALL USING (
    auth.uid() = supplier_id
    AND EXISTS (SELECT 1 FROM supplier_profiles sp WHERE sp.user_id = auth.uid() AND sp.is_active = TRUE)
  );

CREATE POLICY "Public view active delivery zones" ON delivery_zones
  FOR SELECT USING (is_active = TRUE);

-- Supplier applications: user sees own, admin sees all
CREATE POLICY "Users view own applications" ON supplier_applications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users create own applications" ON supplier_applications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins manage all applications" ON supplier_applications
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles ur JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'platform_admin')
  );

-- Material orders: parties see their orders
CREATE POLICY "Suppliers view their orders" ON material_orders
  FOR SELECT USING (supplier_id = auth.uid());

CREATE POLICY "Suppliers update their orders" ON material_orders
  FOR UPDATE USING (
    supplier_id = auth.uid()
    AND status IN ('PENDING_SUPPLIER', 'ACCEPTED', 'PREPARING', 'READY')
  );

CREATE POLICY "Clients view their material orders" ON material_orders
  FOR SELECT USING (client_id = auth.uid());

CREATE POLICY "Pros view their material orders" ON material_orders
  FOR SELECT USING (professional_id = auth.uid());

CREATE POLICY "Admins view all material orders" ON material_orders
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles ur JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'platform_admin')
  );

-- Material order items: inherit from order
CREATE POLICY "Order items visible to order parties" ON material_order_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM material_orders mo
      WHERE mo.id = material_order_items.order_id
      AND (mo.supplier_id = auth.uid() OR mo.client_id = auth.uid() OR mo.professional_id = auth.uid())
    )
  );

CREATE POLICY "Admins view all order items" ON material_order_items
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles ur JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'platform_admin')
  );

-- Commissions: suppliers view own, admins manage
CREATE POLICY "Suppliers view own commissions" ON supplier_commissions
  FOR SELECT USING (supplier_id = auth.uid());

CREATE POLICY "Admins manage commissions" ON supplier_commissions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles ur JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'platform_admin')
  );

-- ============================================================================
-- 11. SEED DATA — initial product categories
-- ============================================================================

INSERT INTO product_categories (name, slug, description, icon, color, sort_order) VALUES
  ('Plomberie', 'plomberie', 'Tuyaux, robinets, joints, raccords', 'droplet', '#0066CC', 1),
  ('Électricité', 'electricite', 'Câbles, interrupteurs, disjoncteurs', 'zap', '#FF9900', 2),
  ('Peinture', 'peinture', 'Peintures, pinceaux, rouleaux', 'palette', '#9933FF', 3),
  ('Ciment & Maçonnerie', 'ciment-maconnerie', 'Ciment, sable, fer à béton, parpaings', 'package', '#666666', 4),
  ('Menuiserie', 'menuiserie', 'Bois, portes, fenêtres, quincaillerie', 'columns', '#8B4513', 5),
  ('Carrelage & Revêtement', 'carrelage-revetement', 'Carreaux, dalles, mortier-colle', 'grid', '#CC6600', 6),
  ('Toiture & Couverture', 'toiture-couverture', 'Tôles, tuiles, gouttières', 'home', '#CC3333', 7),
  ('Outillage', 'outillage', 'Marteaux, perceuses, scies, échelles', 'tool', '#333333', 8),
  ('Climatisation & Ventilation', 'climatisation-ventilation', 'Climatiseurs, ventilateurs, gaines', 'wind', '#009999', 9),
  ('Sécurité & Serrurerie', 'securite-serrurerie', 'Serrures, verrous, caméras, alarmes', 'shield', '#CC0000', 10)
ON CONFLICT (slug) DO NOTHING;
