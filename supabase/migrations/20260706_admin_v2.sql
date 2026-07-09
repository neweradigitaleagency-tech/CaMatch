-- Ça Match — Admin Back-Office V2
-- New tables, columns, enums, buckets, RLS, seed data
-- Run after all previous migrations

-- ============================================================================
-- 1. EXTENDED ENUMS
-- ============================================================================

-- Extend payment methods for payouts
ALTER TABLE payouts DROP CONSTRAINT IF EXISTS payouts_method_check;
ALTER TABLE payouts ADD CONSTRAINT payouts_method_check
  CHECK (method IN ('wave', 'orange_money', 'mtn', 'bank_transfer', 'visa', 'mastercard', 'paypal', 'bitcoin', 'usdt', 'cash'));

-- Extend verification document types
ALTER TABLE verification_requests DROP CONSTRAINT IF EXISTS verification_requests_document_type_check;
ALTER TABLE verification_requests ADD CONSTRAINT verification_requests_document_type_check
  CHECK (document_type IN ('cni', 'passport', 'casier_judiciaire', 'certification', 'selfie', 'permis', 'diplome', 'attestation'));

-- Add verification columns to verification_requests
ALTER TABLE verification_requests
  ADD COLUMN IF NOT EXISTS selfie_url TEXT,
  ADD COLUMN IF NOT EXISTS ai_score DECIMAL(3,2),
  ADD COLUMN IF NOT EXISTS face_match_score DECIMAL(3,2);

-- ============================================================================
-- 2. COMMON STATUS TYPE
-- ============================================================================

CREATE TYPE common_status AS ENUM (
  'draft',
  'pending',
  'approved',
  'active',
  'suspended',
  'completed',
  'rejected',
  'cancelled',
  'archived',
  'deleted'
);

-- ============================================================================
-- 3. NEW COLUMNS ON EXISTING TABLES
-- ============================================================================

-- client_profiles
ALTER TABLE client_profiles
  ADD COLUMN IF NOT EXISTS city TEXT;

-- professional_profiles
ALTER TABLE professional_profiles
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS acceptance_rate DECIMAL(5,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS response_time_avg INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS cancellation_rate DECIMAL(5,2) DEFAULT 0;

-- category_id FK added after categories table creation

-- users
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES users(id);

-- Soft delete on major tables
ALTER TABLE professional_profiles
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by UUID;

ALTER TABLE jobs
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by UUID;

ALTER TABLE service_requests
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by UUID;

ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by UUID;

ALTER TABLE disputes
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by UUID;

-- admin_logs enrichment
ALTER TABLE admin_logs
  ADD COLUMN IF NOT EXISTS user_agent TEXT,
  ADD COLUMN IF NOT EXISTS old_value JSONB,
  ADD COLUMN IF NOT EXISTS new_value JSONB,
  ADD COLUMN IF NOT EXISTS entity TEXT,
  ADD COLUMN IF NOT EXISTS entity_id UUID;

-- admins
ALTER TABLE admins
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- ============================================================================
-- 4. NEW TABLES
-- ============================================================================

-- 4a. Feature Flags
CREATE TABLE IF NOT EXISTS feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  label TEXT NOT NULL,
  description TEXT,
  enabled BOOLEAN DEFAULT false,
  category TEXT NOT NULL DEFAULT 'general',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4b. Platform Settings
CREATE TABLE IF NOT EXISTS platform_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'text' CHECK (type IN ('text', 'number', 'boolean', 'json', 'email', 'url', 'image')),
  category TEXT NOT NULL DEFAULT 'general',
  is_encrypted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4c. Categories (hierarchical service categories)
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active) WHERE is_active = TRUE;

-- Add category_id FK to professional_profiles (table now exists)
ALTER TABLE professional_profiles
  ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id);

-- 4d. Professional Availability
CREATE TABLE IF NOT EXISTS professional_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES professional_profiles(user_id) ON DELETE CASCADE,
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_time_range CHECK (start_time < end_time)
);

CREATE INDEX IF NOT EXISTS idx_prof_avail_pro ON professional_availability(professional_id);
CREATE INDEX IF NOT EXISTS idx_prof_avail_day ON professional_availability(day_of_week);

-- 4e. Badges
CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  criteria TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4f. Professional Badges (many-to-many)
CREATE TABLE IF NOT EXISTS professional_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES professional_profiles(user_id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  granted_by UUID REFERENCES admins(id),
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(professional_id, badge_id)
);

CREATE INDEX IF NOT EXISTS idx_prof_badges_pro ON professional_badges(professional_id);
CREATE INDEX IF NOT EXISTS idx_prof_badges_badge ON professional_badges(badge_id);

-- 4g. Support Tickets
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number TEXT UNIQUE NOT NULL,
  client_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('bug', 'account', 'payment', 'premium', 'verification', 'other')),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  status common_status DEFAULT 'pending',
  assigned_to UUID REFERENCES admins(id),
  first_response_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE SEQUENCE IF NOT EXISTS ticket_number_seq START 1000;

CREATE INDEX IF NOT EXISTS idx_support_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_assigned ON support_tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_support_client ON support_tickets(client_id);
CREATE INDEX IF NOT EXISTS idx_support_priority ON support_tickets(priority);

-- 4h. Ticket Messages
CREATE TABLE IF NOT EXISTS ticket_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  content TEXT NOT NULL,
  file_urls TEXT[],
  is_internal_note BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ticket_msg_ticket ON ticket_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_msg_sender ON ticket_messages(sender_id);

-- 4i. Mission Timeline
CREATE TABLE IF NOT EXISTS mission_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  event TEXT NOT NULL,
  description TEXT,
  old_status common_status,
  new_status common_status,
  created_by UUID REFERENCES users(id),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mission_timeline_mission ON mission_timeline(mission_id);
CREATE INDEX IF NOT EXISTS idx_mission_timeline_created ON mission_timeline(created_at DESC);

-- 4j. Reports (Moderation)
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  reported_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  reason TEXT NOT NULL CHECK (reason IN ('spam', 'fake', 'scam', 'harassment', 'inappropriate', 'bad_service', 'other')),
  description TEXT,
  evidence_urls TEXT[],
  evidence_data JSONB,
  status common_status DEFAULT 'pending',
  reviewed_by UUID REFERENCES admins(id),
  resolution TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_reporter ON reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_reports_reported ON reports(reported_id);

-- 4k. Promotions & Coupons
CREATE TABLE IF NOT EXISTS promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('percentage', 'fixed', 'free_shipping', 'waiver')),
  value INT NOT NULL,
  min_order_amount INT DEFAULT 0,
  max_discount INT,
  max_uses INT,
  current_uses INT DEFAULT 0,
  target TEXT NOT NULL DEFAULT 'all' CHECK (target IN ('all', 'clients', 'professionals', 'new', 'premium')),
  starts_at TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  description TEXT,
  created_by UUID REFERENCES admins(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_promotions_code ON promotions(code);
CREATE INDEX IF NOT EXISTS idx_promotions_active ON promotions(is_active);
CREATE INDEX IF NOT EXISTS idx_promotions_expires ON promotions(expires_at);

-- 4l. CMS Pages
CREATE TABLE IF NOT EXISTS cms_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  meta_title TEXT,
  meta_description TEXT,
  status common_status DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  created_by UUID REFERENCES admins(id),
  updated_by UUID REFERENCES admins(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4m. Admin Sessions (tracking only)
CREATE TABLE IF NOT EXISTS admin_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
  ip_address INET,
  user_agent TEXT,
  browser TEXT,
  os TEXT,
  device TEXT,
  country TEXT,
  city TEXT,
  is_active BOOLEAN DEFAULT true,
  login_at TIMESTAMPTZ DEFAULT NOW(),
  logout_at TIMESTAMPTZ,
  last_activity TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_sessions_admin ON admin_sessions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_active ON admin_sessions(is_active) WHERE is_active = TRUE;

-- 4n. Fraud Alerts
CREATE TABLE IF NOT EXISTS fraud_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('suspicious_login', 'multiple_accounts', 'fake_documents', 'payment_fraud', 'review_manipulation', 'other')),
  target_type TEXT NOT NULL CHECK (target_type IN ('user', 'professional', 'transaction', 'review')),
  target_id UUID NOT NULL,
  score INT DEFAULT 0 CHECK (score BETWEEN 0 AND 100),
  description TEXT,
  metadata JSONB,
  status common_status DEFAULT 'pending',
  reviewed_by UUID REFERENCES admins(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fraud_status ON fraud_alerts(status);
CREATE INDEX IF NOT EXISTS idx_fraud_target ON fraud_alerts(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_fraud_score ON fraud_alerts(score DESC);

-- ============================================================================
-- 5. STORAGE BUCKETS
-- ============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('mission-media', 'mission-media', false, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'video/mp4']),
  ('support-files', 'support-files', false, 20971520, ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'application/msword'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies: mission-media
CREATE POLICY "Admin full access to mission-media" ON storage.objects
  FOR ALL USING (
    bucket_id = 'mission-media' AND
    EXISTS (SELECT 1 FROM admin_roles ar JOIN roles r ON ar.role_id = r.id WHERE ar.admin_id = auth.uid())
  );

CREATE POLICY "Authenticated users read mission-media" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'mission-media' AND
    auth.role() = 'authenticated'
  );

-- Storage policies: support-files (admins only)
CREATE POLICY "Admin full access to support-files" ON storage.objects
  FOR ALL USING (
    bucket_id = 'support-files' AND
    EXISTS (SELECT 1 FROM admin_roles ar JOIN roles r ON ar.role_id = r.id WHERE ar.admin_id = auth.uid())
  );

CREATE POLICY "Support staff read support-files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'support-files' AND
    EXISTS (SELECT 1 FROM admin_roles ar JOIN roles r ON ar.role_id = r.id WHERE ar.admin_id = auth.uid())
  );

-- ============================================================================
-- 6. RLS POLICIES
-- ============================================================================

-- Helper function to check if user is super admin
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_roles ar
    JOIN roles r ON ar.role_id = r.id
    WHERE ar.admin_id = auth.uid() AND r.name = 'platform_super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user has admin role
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_roles ar
    WHERE ar.admin_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Feature flags: all admins read, super admins write
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read feature_flags" ON feature_flags
  FOR SELECT USING (is_admin());

CREATE POLICY "Super admins manage feature_flags" ON feature_flags
  FOR ALL USING (is_super_admin());

-- Platform settings: all admins read, super admins write
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read platform_settings" ON platform_settings
  FOR SELECT USING (is_admin());

CREATE POLICY "Super admins manage platform_settings" ON platform_settings
  FOR ALL USING (is_super_admin());

-- Categories: all admins read, admins with categories permission write
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read categories" ON categories
  FOR SELECT USING (is_admin());

CREATE POLICY "Super admins manage categories" ON categories
  FOR ALL USING (is_super_admin());

-- Professional availability: admins read, super admins write
ALTER TABLE professional_availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read professional_availability" ON professional_availability
  FOR SELECT USING (is_admin());

CREATE POLICY "Super admins manage professional_availability" ON professional_availability
  FOR ALL USING (is_super_admin());

-- Badges: all admins read, super admins write
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read badges" ON badges
  FOR SELECT USING (is_admin());

CREATE POLICY "Super admins manage badges" ON badges
  FOR ALL USING (is_super_admin());

ALTER TABLE professional_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read professional_badges" ON professional_badges
  FOR SELECT USING (is_admin());

CREATE POLICY "Super admins manage professional_badges" ON professional_badges
  FOR ALL USING (is_super_admin());

-- Support tickets: all admins read, support+super manage
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read support_tickets" ON support_tickets
  FOR SELECT USING (is_admin());

CREATE POLICY "Support staff manage support_tickets" ON support_tickets
  FOR ALL USING (is_admin());

ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read ticket_messages" ON ticket_messages
  FOR SELECT USING (is_admin());

CREATE POLICY "Support staff manage ticket_messages" ON ticket_messages
  FOR ALL USING (is_admin());

-- Mission timeline: all admins read, super admins write
ALTER TABLE mission_timeline ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read mission_timeline" ON mission_timeline
  FOR SELECT USING (is_admin());

CREATE POLICY "Super admins manage mission_timeline" ON mission_timeline
  FOR ALL USING (is_super_admin());

-- Reports: trust_safety + super admins
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trust safety read reports" ON reports
  FOR SELECT USING (is_admin());

CREATE POLICY "Trust safety manage reports" ON reports
  FOR ALL USING (is_admin());

-- Promotions: all admins read, super admins write
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read promotions" ON promotions
  FOR SELECT USING (is_admin());

CREATE POLICY "Super admins manage promotions" ON promotions
  FOR ALL USING (is_super_admin());

-- CMS pages: all admins read, super admins write
ALTER TABLE cms_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read cms_pages" ON cms_pages
  FOR SELECT USING (is_admin());

CREATE POLICY "Super admins manage cms_pages" ON cms_pages
  FOR ALL USING (is_super_admin());

-- Admin sessions: admins read own, super admins read all
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view own sessions" ON admin_sessions
  FOR SELECT USING (admin_id = auth.uid() OR is_super_admin());

CREATE POLICY "Super admins manage sessions" ON admin_sessions
  FOR ALL USING (is_super_admin());

-- Fraud alerts: trust_safety + super admins
ALTER TABLE fraud_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trust safety read fraud_alerts" ON fraud_alerts
  FOR SELECT USING (is_admin());

CREATE POLICY "Trust safety manage fraud_alerts" ON fraud_alerts
  FOR ALL USING (is_admin());

-- ============================================================================
-- 7. TRIGGERS
-- ============================================================================

-- Auto-update updated_at for new tables
CREATE TRIGGER update_feature_flags_updated_at BEFORE UPDATE ON feature_flags
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_platform_settings_updated_at BEFORE UPDATE ON platform_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON support_tickets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_promotions_updated_at BEFORE UPDATE ON promotions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-log admin actions (extended from admin_backoffice migration)
CREATE OR REPLACE FUNCTION log_admin_action_v2()
RETURNS TRIGGER AS $$
DECLARE
  action_text TEXT;
  entity_name TEXT;
BEGIN
  entity_name := TG_TABLE_NAME;

  action_text := CASE TG_OP
    WHEN 'INSERT' THEN entity_name || '.create'
    WHEN 'UPDATE' THEN entity_name || '.update'
    WHEN 'DELETE' THEN entity_name || '.delete'
  END;

  INSERT INTO admin_logs (admin_id, action, entity, entity_id, old_value, new_value, ip_address)
  VALUES (
    auth.uid(),
    action_text,
    entity_name,
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END,
    inet_client_addr()
  );

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 8. SEED DATA
-- ============================================================================

-- Feature flags
INSERT INTO feature_flags (key, label, description, enabled, category) VALUES
  ('premium', 'Abonnements Premium', 'Activer les offres Premium pour les professionnels et clients', true, 'billing'),
  ('promotions', 'Promotions & Codes promo', 'Activer la création de codes promo et campagnes marketing', false, 'marketing'),
  ('chat', 'Messagerie en temps réel', 'Activer la messagerie instantanée entre clients et professionnels', true, 'communication'),
  ('wallet', 'Portefeuille virtuel', 'Activer le portefeuille numérique pour les professionnels', false, 'payment'),
  ('bitcoin', 'Paiement Bitcoin/USDT', 'Activer le paiement en cryptomonnaies', false, 'payment'),
  ('referral', 'Parrainage', 'Activer le système de parrainage et récompenses', true, 'marketing'),
  ('ratings', 'Avis et notations', 'Activer le système d''évaluation des professionnels', true, 'trust'),
  ('disputes', 'Litiges', 'Activer le système de résolution de litiges', true, 'trust'),
  ('cms', 'Pages CMS', 'Activer la gestion de contenu (FAQ, CGU, etc.)', true, 'content')
ON CONFLICT (key) DO NOTHING;

-- Platform settings
INSERT INTO platform_settings (key, value, description, type, category) VALUES
  ('platform_name', 'Ça Match', 'Nom de la plateforme', 'text', 'general'),
  ('platform_email', 'contact@camatch.ci', 'Email de contact principal', 'email', 'general'),
  ('platform_phone', '+225 07 59 66 509', 'Téléphone support', 'text', 'general'),
  ('platform_address', 'Abidjan, Côte d''Ivoire', 'Adresse de la plateforme', 'text', 'general'),
  ('platform_timezone', 'Africa/Abidjan', 'Fuseau horaire par défaut', 'text', 'general'),
  ('platform_language', 'fr', 'Langue par défaut', 'text', 'general'),
  ('platform_currency', 'XOF', 'Devise par défaut', 'text', 'general'),
  ('commission_rate', '15', 'Commission plateforme (%)', 'number', 'billing'),
  ('commission_fixed', '0', 'Commission fixe (F CFA)', 'number', 'billing'),
  ('commission_premium', '10', 'Commission Premium (%)', 'number', 'billing'),
  ('tva_rate', '18', 'TVA (%)', 'number', 'billing'),
  ('mission_max_distance', '50', 'Distance maximale (km)', 'number', 'missions'),
  ('mission_max_duration', '8', 'Durée maximale (heures)', 'number', 'missions'),
  ('mission_cancel_timeout', '2', 'Délai d''annulation (heures)', 'number', 'missions'),
  ('mission_max_requests', '5', 'Nombre max de demandes simultanées', 'number', 'missions'),
  ('mission_expire_hours', '24', 'Expiration des demandes (heures)', 'number', 'missions'),
  ('payment_min_amount', '5000', 'Montant minimum (F CFA)', 'number', 'payment'),
  ('payment_max_amount', '500000', 'Montant maximum (F CFA)', 'number', 'payment'),
  ('payment_payout_delay', '48', 'Délai de reversement (heures)', 'number', 'payment'),
  ('session_timeout', '1440', 'Timeout session admin (minutes)', 'number', 'security'),
  ('login_max_attempts', '5', 'Tentatives de connexion max', 'number', 'security')
ON CONFLICT (key) DO NOTHING;

-- Categories (current service categories)
INSERT INTO categories (name, slug, description, icon, color, sort_order, is_active) VALUES
  ('Électricité', 'electricite', 'Travaux électriques, installation, dépannage', 'zap', '#FFD700', 1, true),
  ('Plomberie', 'plomberie', 'Plomberie, fuites, débouchage, installation', 'droplets', '#00BFFF', 2, true),
  ('Climatisation', 'climatisation', 'Installation et réparation de climatiseurs', 'wind', '#00CED1', 3, true),
  ('Nettoyage', 'nettoyage', 'Nettoyage domestique et professionnel', 'sparkles', '#32CD32', 4, true),
  ('Peinture', 'peinture', 'Peinture intérieure et extérieure', 'palette', '#FF69B4', 5, true),
  ('Jardinage', 'jardinage', 'Entretien jardin, tonte, élagage', 'tree-pine', '#228B22', 6, true),
  ('Menuiserie', 'menuiserie', 'Meubles sur mesure, agencement', 'hammer', '#8B4513', 7, true),
  ('Transport', 'transport', 'Transport de biens et personnes', 'truck', '#FF4500', 8, true)
ON CONFLICT (slug) DO NOTHING;

-- Badges
INSERT INTO badges (name, slug, description, icon, color, criteria) VALUES
  ('Top Rated', 'top-rated', 'Professionnel le mieux noté par ses clients', 'star', '#FFD700', 'Note moyenne > 4.8, plus de 50 missions'),
  ('Rapide', 'rapide', 'Temps de réponse inférieur à 5 minutes', 'zap', '#00BFFF', 'Temps de réponse moyen < 5 min'),
  ('Élite', 'elite', 'Plus de 100 missions accomplies', 'crown', '#9B59B6', 'Plus de 100 missions terminées'),
  ('Premium', 'premium', 'Abonné à l''offre Premium', 'diamond', '#2ECC71', 'Abonnement Premium actif'),
  ('Fiable', 'fiable', '0 annulation et 0 litige', 'shield-check', '#1ABC9C', 'Taux d''annulation = 0, aucun litige'),
  ('Nouveau', 'nouveau', 'Nouveau sur la plateforme', 'sparkle', '#F39C12', 'Moins de 30 jours et moins de 5 missions'),
  ('Expert', 'expert', 'Professionnel certifié et vérifié', 'certificate', '#E74C3C', 'Niveau de vérification certifié ou élite'),
  ('Vétéran', 'veteran', 'Plus de 2 ans sur la plateforme', 'clock', '#34495E', 'Inscrit depuis plus de 2 ans')
ON CONFLICT (slug) DO NOTHING;
