-- ============================================================================
-- CEA Phase 0 — Ticket 1.3: Fusion coupons + promotions → discounts
-- ============================================================================
-- Avant : coupons (subscription discounts), promotions (marketing campaigns)
-- Après  : discounts (table unique)
-- ============================================================================

-- 1. Créer la table unifiée
CREATE TABLE IF NOT EXISTS discounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('percentage','fixed','free_month','free_shipping','waiver')),
  value INT NOT NULL,
  description TEXT,
  target TEXT NOT NULL DEFAULT 'all',
  max_uses INT,
  current_uses INT DEFAULT 0,
  min_order_amount INT,
  starts_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_discounts_code ON discounts(code);
CREATE INDEX IF NOT EXISTS idx_discounts_active ON discounts(is_active) WHERE is_active = TRUE;

-- 2. Migrer coupons
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'coupons') THEN
    INSERT INTO discounts (code, type, value, max_uses, current_uses, expires_at, is_active, created_by, created_at, metadata)
    SELECT
      code,
      CASE c.type
        WHEN 'percentage' THEN 'percentage'
        WHEN 'fixed' THEN 'fixed'
        WHEN 'free_month' THEN 'free_month'
      END,
      value, max_usage, current_usage, expires_at, is_active, created_by, created_at,
      jsonb_build_object('source', 'coupons', 'min_plan_type', min_plan_type, 'original_id', id)
    FROM coupons c
    ON CONFLICT (code) DO NOTHING;
  END IF;
END $$;

-- 3. Migrer promotions
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'promotions') THEN
    INSERT INTO discounts (code, type, value, description, target, max_uses, current_uses, starts_at, expires_at, is_active, created_by, created_at, metadata)
    SELECT
      code,
      CASE p.type
        WHEN 'percentage' THEN 'percentage'
        WHEN 'fixed' THEN 'fixed'
        WHEN 'free_shipping' THEN 'free_shipping'
        WHEN 'waiver' THEN 'waiver'
      END,
      value, description, target, max_uses, current_uses, starts_at, expires_at, is_active,
      (SELECT id FROM users LIMIT 1),
      created_at,
      jsonb_build_object('source', 'promotions', 'original_id', id)
    FROM promotions p
    ON CONFLICT (code) DO NOTHING;
  END IF;
END $$;

-- 4. Vues de rétrocompatibilité
CREATE OR REPLACE VIEW v_coupons AS
SELECT
  id, code,
  CASE type
    WHEN 'percentage' THEN 'percentage'::coupon_type
    WHEN 'fixed' THEN 'fixed'::coupon_type
    WHEN 'free_month' THEN 'free_month'::coupon_type
  END AS type,
  value, max_uses AS max_usage, current_uses AS current_usage,
  (metadata->>'min_plan_type')::text AS min_plan_type,
  expires_at, is_active, created_by, created_at, updated_at
FROM discounts
WHERE metadata->>'source' = 'coupons' OR metadata->>'source' IS NULL;

CREATE OR REPLACE VIEW v_promotions AS
SELECT
  id, code, type, value, description, target,
  max_uses, current_uses, starts_at, expires_at,
  is_active, created_at, updated_at
FROM discounts
WHERE metadata->>'source' = 'promotions' OR metadata->>'source' IS NULL;

COMMENT ON TABLE coupons IS 'DEPRECATED - use discounts table instead';
COMMENT ON TABLE promotions IS 'DEPRECATED - use discounts table instead';
