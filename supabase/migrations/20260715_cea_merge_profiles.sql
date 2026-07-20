-- ============================================================================
-- CEA Phase 0 — Ticket 1.1: Fusion 5 profils → profiles
-- ============================================================================
-- Avant : client_profiles, professional_profiles, supplier_profiles,
--         business_profiles, enterprise_profiles
-- Après  : profiles (table unique) + vues de rétrocompatibilité
-- ============================================================================

-- 1. Créer la table unifiée
CREATE TABLE IF NOT EXISTS profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  profile_type TEXT NOT NULL CHECK (profile_type IN ('client','professional','supplier','business','enterprise')),

  -- Champs communs à tous les types
  display_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  location GEOGRAPHY(POINT, 4326),
  city TEXT,
  commune TEXT,
  address TEXT,
  is_active BOOLEAN DEFAULT true,
  rating DECIMAL(3,2) DEFAULT 0.00 CHECK (rating >= 0 AND rating <= 5),
  total_jobs INT DEFAULT 0 CHECK (total_jobs >= 0),
  total_revenue INT DEFAULT 0 CHECK (total_revenue >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Données spécifiques au type (JSONB)
  data JSONB DEFAULT '{}'
);

CREATE INDEX idx_profiles_type ON profiles(profile_type);
CREATE INDEX idx_profiles_location ON profiles USING GIST(location) WHERE location IS NOT NULL;
CREATE INDEX idx_profiles_active ON profiles(is_active) WHERE is_active = TRUE;

-- 2. Fonction helper pour migrer les profils existants
CREATE OR REPLACE FUNCTION migrate_profiles() RETURNS void AS $$
BEGIN
  -- Migrer client_profiles
  INSERT INTO profiles (user_id, profile_type, display_name, avatar_url, location, is_active, rating, total_jobs, total_revenue, data)
  SELECT
    user_id, 'client',
    first_name || ' ' || last_name,
    avatar_url, location, TRUE, 0, total_jobs, total_spent,
    jsonb_build_object(
      'first_name', first_name,
      'last_name', last_name,
      'default_address', default_address,
      'loyalty_points', loyalty_points,
      'preferred_payment_method', preferred_payment_method,
      'notification_preferences', notification_preferences
    )
  FROM client_profiles
  ON CONFLICT (user_id) DO NOTHING;

  -- Migrer professional_profiles
  INSERT INTO profiles (user_id, profile_type, display_name, avatar_url, location, city, commune, is_active, rating, total_jobs, total_revenue, data)
  SELECT
    user_id, 'professional',
    COALESCE(business_name, first_name || ' ' || last_name),
    avatar_url, location, city, commune, is_active, rating, total_jobs, total_earned,
    jsonb_build_object(
      'business_name', business_name,
      'first_name', first_name,
      'last_name', last_name,
      'categories', categories,
      'sub_categories', sub_categories,
      'bio', bio,
      'hourly_rate', hourly_rate,
      'min_job_price', min_job_price,
      'verification_level', verification_level,
      'trust_score', trust_score,
      'trust_score_components', trust_score_components,
      'trust_score_updated_at', trust_score_updated_at,
      'service_radius_km', service_radius_km,
      'is_available', is_available,
      'is_online', is_online,
      'wallet_balance', wallet_balance,
      'pending_balance', pending_balance,
      'subscription_tier', subscription_tier,
      'subscription_expires_at', subscription_expires_at,
      'last_active_at', last_active_at,
      'id_document_url', id_document_url,
      'id_document_verified_at', id_document_verified_at,
      'cert_document_url', cert_document_url,
      'cert_document_verified_at', cert_document_verified_at,
      'background_check_url', background_check_url,
      'background_check_verified_at', background_check_verified_at,
      'availability_status', availability_status,
      'category_id', category_id
    )
  FROM professional_profiles
  ON CONFLICT (user_id) DO NOTHING;

  -- Migrer supplier_profiles
  INSERT INTO profiles (user_id, profile_type, display_name, avatar_url, phone, address, city, is_active, rating, data)
  SELECT
    user_id, 'supplier',
    company_name,
    COALESCE(logo_url, photo_url),
    phone, address, city, is_active, rating,
    jsonb_build_object(
      'company_name', company_name,
      'owner_name', owner_name,
      'email', email,
      'logo_url', logo_url,
      'photo_url', photo_url,
      'legal_docs_urls', legal_docs_urls,
      'status', status,
      'commission_rate', commission_rate,
      'total_products', total_products,
      'total_orders', total_orders,
      'reviewed_by', reviewed_by,
      'reviewed_at', reviewed_at,
      'rejection_reason', rejection_reason
    )
  FROM supplier_profiles
  ON CONFLICT (user_id) DO NOTHING;

  -- Migrer business_profiles
  INSERT INTO profiles (user_id, profile_type, display_name, is_active, data)
  SELECT
    user_id, 'business',
    business_name, TRUE,
    jsonb_build_object(
      'business_name', business_name,
      'tax_id', tax_id,
      'team_size', team_size,
      'subscription_tier', subscription_tier,
      'subscription_expires_at', subscription_expires_at
    )
  FROM business_profiles
  ON CONFLICT (user_id) DO NOTHING;

  -- Migrer enterprise_profiles
  INSERT INTO profiles (user_id, profile_type, display_name, is_active, data)
  SELECT
    user_id, 'enterprise',
    company_name, TRUE,
    jsonb_build_object(
      'company_name', company_name,
      'industry', industry,
      'billing_address', billing_address,
      'account_manager_id', account_manager_id,
      'contract_start_date', contract_start_date,
      'contract_end_date', contract_end_date
    )
  FROM enterprise_profiles
  ON CONFLICT (user_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

SELECT migrate_profiles();
DROP FUNCTION migrate_profiles;

-- 3. Index GIN sur data pour requêtes par type
CREATE INDEX idx_profiles_data ON profiles USING GIN(data jsonb_path_ops);

-- 4. Index FTS sur display_name pour recherche globale
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS fts tsvector GENERATED ALWAYS AS (
  to_tsvector('french', coalesce(display_name, ''))
) STORED;
CREATE INDEX IF NOT EXISTS idx_profiles_fts ON profiles USING GIN(fts);

-- ============================================================================
-- Vues de rétrocompatibilité
-- ============================================================================

CREATE OR REPLACE VIEW v_client_profiles AS
SELECT
  user_id,
  data->>'first_name' AS first_name,
  data->>'last_name' AS last_name,
  data->>'default_address' AS default_address,
  location,
  avatar_url,
  COALESCE((data->>'loyalty_points')::int, 0) AS loyalty_points,
  total_jobs,
  total_revenue AS total_spent,
  data->>'preferred_payment_method' AS preferred_payment_method,
  COALESCE(data->'notification_preferences', '{"push": true, "sms": true, "email": false, "whatsapp": true}') AS notification_preferences,
  created_at,
  updated_at
FROM profiles
WHERE profile_type = 'client';

CREATE OR REPLACE VIEW v_professional_profiles AS
SELECT
  p.user_id,
  p.data->>'business_name' AS business_name,
  p.data->>'first_name' AS first_name,
  p.data->>'last_name' AS last_name,
  COALESCE(p.data->'categories', '[]'::jsonb) AS categories,
  p.data->>'sub_categories' AS sub_categories,
  p.data->>'bio' AS bio,
  (p.data->>'hourly_rate')::int AS hourly_rate,
  COALESCE((p.data->>'min_job_price')::int, 5000) AS min_job_price,
  COALESCE((p.data->>'verification_level')::text, 'none') AS verification_level,
  p.rating,
  p.total_jobs,
  p.total_revenue AS total_earned,
  p.location,
  COALESCE((p.data->>'service_radius_km')::int, 10) AS service_radius_km,
  p.is_active,
  COALESCE((p.data->>'is_available')::boolean, true) AS is_available,
  COALESCE((p.data->>'is_online')::boolean, false) AS is_online,
  p.avatar_url,
  p.data->>'id_document_url' AS id_document_url,
  (p.data->>'id_document_verified_at')::timestamptz AS id_document_verified_at,
  p.data->>'cert_document_url' AS cert_document_url,
  (p.data->>'cert_document_verified_at')::timestamptz AS cert_document_verified_at,
  p.data->>'background_check_url' AS background_check_url,
  (p.data->>'background_check_verified_at')::timestamptz AS background_check_verified_at,
  COALESCE((p.data->>'wallet_balance')::int, 0) AS wallet_balance,
  COALESCE((p.data->>'pending_balance')::int, 0) AS pending_balance,
  COALESCE((p.data->>'subscription_tier')::text, 'free') AS subscription_tier,
  (p.data->>'subscription_expires_at')::timestamptz AS subscription_expires_at,
  COALESCE((p.data->>'trust_score')::int, 0) AS trust_score,
  COALESCE(p.data->'trust_score_components', '{}'::jsonb) AS trust_score_components,
  (p.data->>'trust_score_updated_at')::timestamptz AS trust_score_updated_at,
  COALESCE((p.data->>'availability_status')::text, 'available') AS availability_status,
  (p.data->>'last_active_at')::timestamptz AS last_active_at,
  (p.data->>'category_id')::uuid AS category_id,
  p.created_at,
  p.updated_at
FROM profiles p
WHERE p.profile_type = 'professional';

CREATE OR REPLACE VIEW v_supplier_profiles AS
SELECT
  user_id,
  data->>'company_name' AS company_name,
  data->>'owner_name' AS owner_name,
  COALESCE(phone, data->>'phone') AS phone,
  data->>'email' AS email,
  address,
  city,
  data->>'logo_url' AS logo_url,
  data->>'photo_url' AS photo_url,
  COALESCE(p.data->'legal_docs_urls', '{}'::jsonb) AS legal_docs_urls,
  COALESCE((p.data->>'status')::text, 'EN_ATTENTE') AS status,
  COALESCE((p.data->>'commission_rate')::decimal, 10.00) AS commission_rate,
  rating,
  COALESCE((data->>'total_products')::int, 0) AS total_products,
  COALESCE((data->>'total_orders')::int, 0) AS total_orders,
  total_revenue,
  p.avatar_url AS logo_url,
  is_active,
  (data->>'reviewed_by')::uuid AS reviewed_by,
  (data->>'reviewed_at')::timestamptz AS reviewed_at,
  data->>'rejection_reason' AS rejection_reason,
  created_at,
  updated_at
FROM profiles p
WHERE p.profile_type = 'supplier';

CREATE OR REPLACE VIEW v_business_profiles AS
SELECT
  user_id,
  data->>'business_name' AS business_name,
  data->>'tax_id' AS tax_id,
  COALESCE((data->>'team_size')::int, 0) AS team_size,
  COALESCE((data->>'subscription_tier')::text, 'free') AS subscription_tier,
  (data->>'subscription_expires_at')::timestamptz AS subscription_expires_at,
  created_at,
  updated_at
FROM profiles
WHERE profile_type = 'business';

CREATE OR REPLACE VIEW v_enterprise_profiles AS
SELECT
  user_id,
  data->>'company_name' AS company_name,
  data->>'industry' AS industry,
  data->>'billing_address' AS billing_address,
  (data->>'account_manager_id')::uuid AS account_manager_id,
  (data->>'contract_start_date')::date AS contract_start_date,
  (data->>'contract_end_date')::date AS contract_end_date,
  created_at,
  updated_at
FROM profiles
WHERE profile_type = 'enterprise';

-- ============================================================================
-- Désactiver les anciennes tables (supprimer après validation)
-- ============================================================================
-- COMMENT ON TABLE client_profiles IS 'DEPRECATED - use profiles table instead';
-- COMMENT ON TABLE professional_profiles IS 'DEPRECATED - use profiles table instead';
-- COMMENT ON TABLE supplier_profiles IS 'DEPRECATED - use profiles table instead';
-- COMMENT ON TABLE business_profiles IS 'DEPRECATED - use profiles table instead';
-- COMMENT ON TABLE enterprise_profiles IS 'DEPRECATED - use profiles table instead';
