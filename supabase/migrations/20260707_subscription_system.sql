-- Ça Match — Subscription & Monetization System
-- Document ID: CM-DB-002
-- Prerequisite: 20260620_000001_init.sql

-- ============================================================================
-- NEW ENUM TYPES
-- ============================================================================

CREATE TYPE plan_type AS ENUM ('CLIENT', 'PRO', 'BUSINESS');
CREATE TYPE billing_cycle AS ENUM ('monthly', 'yearly');
CREATE TYPE subscription_status AS ENUM ('TRIAL', 'ACTIVE', 'PAST_DUE', 'CANCELLED', 'EXPIRED', 'FAILED');
CREATE TYPE payment_provider AS ENUM ('stripe', 'flutterwave', 'cinetpay', 'orange_money', 'wave', 'mtn_money');
CREATE TYPE coupon_type AS ENUM ('percentage', 'fixed', 'free_month');

-- ============================================================================
-- SUBSCRIPTION PLANS
-- ============================================================================

CREATE TABLE plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type plan_type NOT NULL,
    description TEXT,
    price_monthly INT NOT NULL CHECK (price_monthly >= 0),
    price_yearly INT NOT NULL CHECK (price_yearly >= 0),
    currency TEXT DEFAULT 'XOF' CHECK (currency IN ('XOF', 'USD', 'EUR')),
    active BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0,
    badge TEXT,
    recommended BOOLEAN DEFAULT FALSE,
    trial_days INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_plans_type ON plans(type);
CREATE INDEX idx_plans_active ON plans(active, display_order) WHERE active = TRUE;

-- ============================================================================
-- FEATURES
-- ============================================================================

CREATE TABLE features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    code TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_features_code ON features(code);

-- ============================================================================
-- PLAN-FEATURE JOIN
-- ============================================================================

CREATE TABLE plan_features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
    feature_id UUID NOT NULL REFERENCES features(id) ON DELETE CASCADE,
    enabled BOOLEAN DEFAULT TRUE,
    limit_value INT,
    UNIQUE(plan_id, feature_id)
);

CREATE INDEX idx_plan_features_plan ON plan_features(plan_id);
CREATE INDEX idx_plan_features_feature ON plan_features(feature_id);

-- ============================================================================
-- SUBSCRIPTIONS (extends existing table)
-- ============================================================================

ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS plan_id UUID REFERENCES plans(id);
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS trial_end TIMESTAMPTZ;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS canceled_at TIMESTAMPTZ;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS provider_subscription_id TEXT;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS provider_customer_id TEXT;

-- Rename/update status constraint
ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_status_check;
ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_status_check
    CHECK (status IN ('TRIAL', 'ACTIVE', 'PAST_DUE', 'CANCELLED', 'EXPIRED', 'FAILED'));

-- ============================================================================
-- PAYMENTS
-- ============================================================================

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
    provider payment_provider NOT NULL,
    provider_transaction_id TEXT,
    amount INT NOT NULL CHECK (amount > 0),
    currency TEXT DEFAULT 'XOF' CHECK (currency IN ('XOF', 'USD', 'EUR')),
    status payment_status DEFAULT 'pending',
    provider_response JSONB,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_payments_subscription ON payments(subscription_id) WHERE subscription_id IS NOT NULL;
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_created ON payments(created_at DESC);
CREATE INDEX idx_payments_provider_txn ON payments(provider_transaction_id) WHERE provider_transaction_id IS NOT NULL;

-- ============================================================================
-- INVOICES
-- ============================================================================

CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    invoice_number TEXT UNIQUE NOT NULL,
    pdf_url TEXT,
    amount INT NOT NULL CHECK (amount > 0),
    tax INT DEFAULT 0 CHECK (tax >= 0),
    total INT NOT NULL CHECK (total >= 0),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled', 'refunded')),
    due_date TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_invoices_user ON invoices(user_id);
CREATE INDEX idx_invoices_payment ON invoices(payment_id);
CREATE INDEX idx_invoices_status ON invoices(status);

-- ============================================================================
-- COUPONS
-- ============================================================================

CREATE TABLE coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    type coupon_type NOT NULL,
    value INT NOT NULL CHECK (value > 0),
    max_usage INT,
    current_usage INT DEFAULT 0 CHECK (current_usage >= 0),
    min_plan_type plan_type,
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_coupons_code ON coupons(code) WHERE is_active = TRUE;
CREATE INDEX idx_coupons_expires ON coupons(expires_at) WHERE is_active = TRUE;

ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS coupon_id UUID REFERENCES coupons(id);

-- ============================================================================
-- USAGE TRACKING
-- ============================================================================

CREATE TABLE usage_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    feature_code TEXT NOT NULL,
    usage INT DEFAULT 0 CHECK (usage >= 0),
    limit_value INT,
    reset_date TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, feature_code)
);

CREATE INDEX idx_usage_user ON usage_tracking(user_id);
CREATE INDEX idx_usage_feature ON usage_tracking(feature_code);
CREATE INDEX idx_usage_reset ON usage_tracking(reset_date);

-- ============================================================================
-- BOOSTS (visibility purchases for pros)
-- ============================================================================

CREATE TABLE boosts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    boost_type TEXT NOT NULL CHECK (boost_type IN ('search_top', 'category_top', 'featured')),
    duration_days INT NOT NULL CHECK (duration_days > 0),
    amount_paid INT NOT NULL CHECK (amount_paid > 0),
    starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ends_at TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    payment_id UUID REFERENCES payments(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_boosts_user ON boosts(user_id);
CREATE INDEX idx_boosts_active ON boosts(is_active, ends_at) WHERE is_active = TRUE;

-- ============================================================================
-- CREDITS (internal currency)
-- ============================================================================

CREATE TABLE credits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    balance INT DEFAULT 0 CHECK (balance >= 0),
    lifetime_earned INT DEFAULT 0 CHECK (lifetime_earned >= 0),
    lifetime_spent INT DEFAULT 0 CHECK (lifetime_spent >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

CREATE TABLE credit_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('purchase', 'spend', 'refund', 'bonus', 'expired')),
    amount INT NOT NULL CHECK (amount > 0),
    balance_after INT NOT NULL,
    reference_type TEXT,
    reference_id UUID,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_credit_txn_user ON credit_transactions(user_id, created_at DESC);

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE features ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE boosts ENABLE ROW LEVEL SECURITY;
ALTER TABLE credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

-- PLANS: public read (active ones), admin write
CREATE POLICY "Anyone can view active plans" ON plans
    FOR SELECT USING (active = TRUE);

CREATE POLICY "Admins can manage plans" ON plans
    FOR ALL USING (
        EXISTS (SELECT 1 FROM user_roles ur
                JOIN roles r ON ur.role_id = r.id
                WHERE ur.user_id = auth.uid() AND r.name = 'platform_admin')
    );

-- FEATURES: public read
CREATE POLICY "Anyone can view features" ON features
    FOR SELECT USING (TRUE);

CREATE POLICY "Admins can manage features" ON features
    FOR ALL USING (
        EXISTS (SELECT 1 FROM user_roles ur
                JOIN roles r ON ur.role_id = r.id
                WHERE ur.user_id = auth.uid() AND r.name = 'platform_admin')
    );

-- PLAN_FEATURES: public read
CREATE POLICY "Anyone can view plan features" ON plan_features
    FOR SELECT USING (TRUE);

CREATE POLICY "Admins can manage plan features" ON plan_features
    FOR ALL USING (
        EXISTS (SELECT 1 FROM user_roles ur
                JOIN roles r ON ur.role_id = r.id
                WHERE ur.user_id = auth.uid() AND r.name = 'platform_admin')
    );

-- PAYMENTS: user sees own, admin sees all
CREATE POLICY "Users view own payments" ON payments
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins view all payments" ON payments
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM user_roles ur
                JOIN roles r ON ur.role_id = r.id
                WHERE ur.user_id = auth.uid() AND r.name IN ('platform_admin', 'platform_finance'))
    );

CREATE POLICY "Users create payments" ON payments
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- INVOICES: user sees own, admin sees all
CREATE POLICY "Users view own invoices" ON invoices
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins view all invoices" ON invoices
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM user_roles ur
                JOIN roles r ON ur.role_id = r.id
                WHERE ur.user_id = auth.uid() AND r.name IN ('platform_admin', 'platform_finance'))
    );

-- COUPONS: public validate, admin manage
CREATE POLICY "Anyone can validate coupons" ON coupons
    FOR SELECT USING (is_active = TRUE AND (expires_at IS NULL OR expires_at > NOW()));

CREATE POLICY "Admins manage coupons" ON coupons
    FOR ALL USING (
        EXISTS (SELECT 1 FROM user_roles ur
                JOIN roles r ON ur.role_id = r.id
                WHERE ur.user_id = auth.uid() AND r.name = 'platform_admin')
    );

-- USAGE_TRACKING: user sees own
CREATE POLICY "Users view own usage" ON usage_tracking
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System manages usage" ON usage_tracking
    FOR ALL USING (
        user_id = auth.uid()
        OR EXISTS (SELECT 1 FROM user_roles ur
                JOIN roles r ON ur.role_id = r.id
                WHERE ur.user_id = auth.uid() AND r.name = 'platform_admin')
    );

-- BOOSTS: user sees own, public sees active
CREATE POLICY "Anyone can view active boosts" ON boosts
    FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Users view own boosts" ON boosts
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users create boosts" ON boosts
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins manage boosts" ON boosts
    FOR ALL USING (
        EXISTS (SELECT 1 FROM user_roles ur
                JOIN roles r ON ur.role_id = r.id
                WHERE ur.user_id = auth.uid() AND r.name = 'platform_admin')
    );

-- CREDITS: user sees own, admin sees all
CREATE POLICY "Users view own credits" ON credits
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins view all credits" ON credits
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM user_roles ur
                JOIN roles r ON ur.role_id = r.id
                WHERE ur.user_id = auth.uid() AND r.name IN ('platform_admin', 'platform_finance'))
    );

-- CREDIT_TRANSACTIONS: user sees own
CREATE POLICY "Users view own credit transactions" ON credit_transactions
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins view all credit transactions" ON credit_transactions
    FOR ALL USING (
        EXISTS (SELECT 1 FROM user_roles ur
                JOIN roles r ON ur.role_id = r.id
                WHERE ur.user_id = auth.uid() AND r.name = 'platform_admin')
    );

-- ============================================================================
-- AUDIT TRIGGERS
-- ============================================================================

CREATE TRIGGER audit_payments AFTER INSERT OR UPDATE OR DELETE ON payments
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_subscriptions AFTER INSERT OR UPDATE OR DELETE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- ============================================================================
-- SEED DATA
-- ============================================================================

-- Features
INSERT INTO features (name, description, code) VALUES
    ('Recherche professionnels', 'Accéder à l annuaire des professionnels', 'search_pros'),
    ('Création demandes', 'Publier des demandes de service', 'create_requests'),
    ('Réservation', 'Réserver un professionnel', 'booking'),
    ('Messagerie illimitée', 'Messagerie sans limite', 'unlimited_messages'),
    ('Avis et notation', 'Noter les professionnels', 'reviews'),
    ('Matching prioritaire', 'Être matché en priorité avec les meilleurs pros', 'priority_matching'),
    ('Demandes simultanées', 'Nombre de demandes actives simultanément', 'concurrent_requests'),
    ('Favoris illimités', 'Sauvegarder des pros en favoris sans limite', 'unlimited_favorites'),
    ('Historique complet', 'Accès à tout l historique des missions', 'full_history'),
    ('Support prioritaire', 'Support client prioritaire', 'priority_support'),
    ('Badge client vérifié', 'Badge de confiance sur le profil', 'verified_badge'),
    ('Matching IA avancé', 'Algorithme IA pour trouver le meilleur pro', 'ai_matching'),
    ('Concierge', 'Assistance personnelle pour vos demandes', 'concierge'),
    ('Offres exclusives', 'Accès à des offres et promotions exclusives', 'exclusive_offers'),
    ('Support VIP', 'Support dédié 24/7', 'vip_support'),
    ('Création profil pro', 'Créer et gérer son profil professionnel', 'pro_profile'),
    ('Ajout services', 'Configurer ses services et tarifs', 'manage_services'),
    ('Portfolio', 'Galerie de réalisations', 'portfolio'),
    ('Candidatures missions', 'Postuler aux demandes des clients', 'job_applications'),
    ('Badge professionnel', 'Badge vérifié sur le profil', 'pro_badge'),
    ('Statistiques basiques', 'Voir les stats de base', 'basic_stats'),
    ('Analytics avancées', 'Statistiques détaillées et rapports', 'advanced_analytics'),
    ('Boost automatique', 'Visibilité boostée automatiquement', 'auto_boost'),
    ('Gestion calendrier', 'Planning et disponibilités', 'calendar_management'),
    ('Gestion clients', 'CRM clients intégré', 'client_management'),
    ('Réponses automatiques', 'Messages automatiques personnalisables', 'auto_reply'),
    ('Top classement', 'Première position dans les recherches', 'top_ranking'),
    ('Badge Premium', 'Badge exclusif Premium', 'premium_badge'),
    ('Leads exclusifs', 'Accès aux leads clients premium', 'exclusive_leads'),
    ('Page recommandée', 'Profil mis en avant par la plateforme', 'featured_profile'),
    ('IA optimisation profil', 'Suggestions IA pour optimiser le profil', 'ai_profile_optimization'),
    ('Publicité interne', 'Campagnes pub sur la plateforme', 'internal_ads'),
    ('Profil amélioré', 'Profil enrichi avec plus d infos', 'enhanced_profile')
ON CONFLICT (code) DO NOTHING;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM plans LIMIT 1) THEN

-- Client Plans
INSERT INTO plans (name, type, description, price_monthly, price_yearly, display_order, badge, recommended, trial_days) VALUES
    ('Free', 'CLIENT', 'Accès de base à la plateforme', 0, 0, 1, NULL, FALSE, 0),
    ('Plus', 'CLIENT', 'Pour les clients réguliers', 4900, 49000, 2, 'POPULAIRE', TRUE, 7),
    ('Premium', 'CLIENT', 'Expérience VIP complète', 14900, 149000, 3, 'PREMIUM', FALSE, 7);

-- Pro Plans
INSERT INTO plans (name, type, description, price_monthly, price_yearly, display_order, badge, recommended, trial_days) VALUES
    ('Free', 'PRO', 'Pour démarrer', 0, 0, 1, NULL, FALSE, 0),
    ('Starter', 'PRO', 'Pour les pros en croissance', 9900, 99000, 2, 'POPULAIRE', TRUE, 14),
    ('Business', 'PRO', 'Pour les pros établis', 24900, 249000, 3, 'RECOMMANDÉ', FALSE, 14),
    ('Premium', 'PRO', 'Pour les pros au top', 49900, 499000, 4, 'PREMIUM', FALSE, 14);

-- Client Free features
INSERT INTO plan_features (plan_id, feature_id, enabled, limit_value)
SELECT p.id, f.id, TRUE, NULL
FROM plans p, features f
WHERE p.name = 'Free' AND p.type = 'CLIENT'
AND f.code IN ('search_pros', 'create_requests', 'booking', 'reviews')
ON CONFLICT (plan_id, feature_id) DO NOTHING;

INSERT INTO plan_features (plan_id, feature_id, enabled, limit_value)
SELECT p.id, f.id, TRUE, 5
FROM plans p, features f
WHERE p.name = 'Free' AND p.type = 'CLIENT'
AND f.code IN ('concurrent_requests')
ON CONFLICT (plan_id, feature_id) DO NOTHING;

INSERT INTO plan_features (plan_id, feature_id, enabled, limit_value)
SELECT p.id, f.id, FALSE, NULL
FROM plans p, features f
WHERE p.name = 'Free' AND p.type = 'CLIENT'
AND f.code IN ('unlimited_messages', 'priority_matching', 'unlimited_favorites', 'full_history', 'priority_support', 'verified_badge', 'ai_matching', 'concierge', 'exclusive_offers', 'vip_support')
ON CONFLICT (plan_id, feature_id) DO NOTHING;

-- Client Plus features
INSERT INTO plan_features (plan_id, feature_id, enabled, limit_value)
SELECT p.id, f.id, TRUE, NULL
FROM plans p, features f
WHERE p.name = 'Plus' AND p.type = 'CLIENT'
AND f.code IN ('search_pros', 'create_requests', 'booking', 'reviews', 'unlimited_messages', 'priority_matching', 'unlimited_favorites', 'full_history', 'priority_support', 'verified_badge', 'ai_matching')
ON CONFLICT (plan_id, feature_id) DO NOTHING;

INSERT INTO plan_features (plan_id, feature_id, enabled, limit_value)
SELECT p.id, f.id, TRUE, 10
FROM plans p, features f
WHERE p.name = 'Plus' AND p.type = 'CLIENT'
AND f.code IN ('concurrent_requests')
ON CONFLICT (plan_id, feature_id) DO NOTHING;

INSERT INTO plan_features (plan_id, feature_id, enabled, limit_value)
SELECT p.id, f.id, FALSE, NULL
FROM plans p, features f
WHERE p.name = 'Plus' AND p.type = 'CLIENT'
AND f.code IN ('concierge', 'exclusive_offers', 'vip_support')
ON CONFLICT (plan_id, feature_id) DO NOTHING;

-- Client Premium features
INSERT INTO plan_features (plan_id, feature_id, enabled, limit_value)
SELECT p.id, f.id, TRUE, NULL
FROM plans p, features f
WHERE p.name = 'Premium' AND p.type = 'CLIENT'
AND f.code IN ('search_pros', 'create_requests', 'booking', 'reviews', 'unlimited_messages', 'priority_matching', 'unlimited_favorites', 'full_history', 'priority_support', 'verified_badge', 'ai_matching', 'concierge', 'exclusive_offers', 'vip_support')
ON CONFLICT (plan_id, feature_id) DO NOTHING;

INSERT INTO plan_features (plan_id, feature_id, enabled, limit_value)
SELECT p.id, f.id, TRUE, -1
FROM plans p, features f
WHERE p.name = 'Premium' AND p.type = 'CLIENT'
AND f.code IN ('concurrent_requests')
ON CONFLICT (plan_id, feature_id) DO NOTHING;

-- Pro Free features
INSERT INTO plan_features (plan_id, feature_id, enabled, limit_value)
SELECT p.id, f.id, TRUE, NULL
FROM plans p, features f
WHERE p.name = 'Free' AND p.type = 'PRO'
AND f.code IN ('pro_profile', 'manage_services', 'portfolio', 'basic_stats')
ON CONFLICT (plan_id, feature_id) DO NOTHING;

INSERT INTO plan_features (plan_id, feature_id, enabled, limit_value)
SELECT p.id, f.id, TRUE, 3
FROM plans p, features f
WHERE p.name = 'Free' AND p.type = 'PRO'
AND f.code IN ('job_applications')
ON CONFLICT (plan_id, feature_id) DO NOTHING;

INSERT INTO plan_features (plan_id, feature_id, enabled, limit_value)
SELECT p.id, f.id, FALSE, NULL
FROM plans p, features f
WHERE p.name = 'Free' AND p.type = 'PRO'
AND f.code IN ('pro_badge', 'advanced_analytics', 'auto_boost', 'calendar_management', 'client_management', 'auto_reply', 'top_ranking', 'premium_badge', 'exclusive_leads', 'featured_profile', 'ai_profile_optimization', 'internal_ads', 'unlimited_messages', 'enhanced_profile')
ON CONFLICT (plan_id, feature_id) DO NOTHING;

-- Pro Starter features
INSERT INTO plan_features (plan_id, feature_id, enabled, limit_value)
SELECT p.id, f.id, TRUE, NULL
FROM plans p, features f
WHERE p.name = 'Starter' AND p.type = 'PRO'
AND f.code IN ('pro_profile', 'manage_services', 'portfolio', 'pro_badge', 'basic_stats', 'calendar_management', 'client_management', 'unlimited_messages')
ON CONFLICT (plan_id, feature_id) DO NOTHING;

INSERT INTO plan_features (plan_id, feature_id, enabled, limit_value)
SELECT p.id, f.id, TRUE, 50
FROM plans p, features f
WHERE p.name = 'Starter' AND p.type = 'PRO'
AND f.code IN ('job_applications')
ON CONFLICT (plan_id, feature_id) DO NOTHING;

INSERT INTO plan_features (plan_id, feature_id, enabled, limit_value)
SELECT p.id, f.id, FALSE, NULL
FROM plans p, features f
WHERE p.name = 'Starter' AND p.type = 'PRO'
AND f.code IN ('advanced_analytics', 'auto_boost', 'auto_reply', 'top_ranking', 'premium_badge', 'exclusive_leads', 'featured_profile', 'ai_profile_optimization', 'internal_ads', 'enhanced_profile')
ON CONFLICT (plan_id, feature_id) DO NOTHING;

-- Pro Business features
INSERT INTO plan_features (plan_id, feature_id, enabled, limit_value)
SELECT p.id, f.id, TRUE, NULL
FROM plans p, features f
WHERE p.name = 'Business' AND p.type = 'PRO'
AND f.code IN ('pro_profile', 'manage_services', 'portfolio', 'pro_badge', 'basic_stats', 'advanced_analytics', 'calendar_management', 'client_management', 'auto_reply', 'unlimited_messages', 'enhanced_profile')
ON CONFLICT (plan_id, feature_id) DO NOTHING;

INSERT INTO plan_features (plan_id, feature_id, enabled, limit_value)
SELECT p.id, f.id, TRUE, 100
FROM plans p, features f
WHERE p.name = 'Business' AND p.type = 'PRO'
AND f.code IN ('job_applications')
ON CONFLICT (plan_id, feature_id) DO NOTHING;

INSERT INTO plan_features (plan_id, feature_id, enabled, limit_value)
SELECT p.id, f.id, TRUE, NULL
FROM plans p, features f
WHERE p.name = 'Business' AND p.type = 'PRO'
AND f.code IN ('auto_boost', 'internal_ads')
ON CONFLICT (plan_id, feature_id) DO NOTHING;

INSERT INTO plan_features (plan_id, feature_id, enabled, limit_value)
SELECT p.id, f.id, FALSE, NULL
FROM plans p, features f
WHERE p.name = 'Business' AND p.type = 'PRO'
AND f.code IN ('top_ranking', 'premium_badge', 'exclusive_leads', 'featured_profile', 'ai_profile_optimization')
ON CONFLICT (plan_id, feature_id) DO NOTHING;

-- Pro Premium features
INSERT INTO plan_features (plan_id, feature_id, enabled, limit_value)
SELECT p.id, f.id, TRUE, NULL
FROM plans p, features f
WHERE p.name = 'Premium' AND p.type = 'PRO'
AND f.code IN ('pro_profile', 'manage_services', 'portfolio', 'pro_badge', 'basic_stats', 'advanced_analytics', 'auto_boost', 'calendar_management', 'client_management', 'auto_reply', 'top_ranking', 'premium_badge', 'exclusive_leads', 'featured_profile', 'ai_profile_optimization', 'internal_ads', 'unlimited_messages', 'enhanced_profile')
ON CONFLICT (plan_id, feature_id) DO NOTHING;

INSERT INTO plan_features (plan_id, feature_id, enabled, limit_value)
SELECT p.id, f.id, TRUE, -1
FROM plans p, features f
WHERE p.name = 'Premium' AND p.type = 'PRO'
AND f.code IN ('job_applications')
ON CONFLICT (plan_id, feature_id) DO NOTHING;

-- Free subscriptions for existing users (seed)
INSERT INTO subscriptions (user_id, plan_id, tier, status, current_period_start, current_period_end, price_monthly)
SELECT
    u.id,
    (SELECT id FROM plans WHERE type = 'CLIENT' AND name = 'Free' LIMIT 1),
    'free',
    'ACTIVE',
    NOW(),
    NOW() + INTERVAL '1 month',
    0
FROM users u
WHERE u.role = 'client'
AND NOT EXISTS (SELECT 1 FROM subscriptions s WHERE s.user_id = u.id);

INSERT INTO subscriptions (user_id, plan_id, tier, status, current_period_start, current_period_end, price_monthly)
SELECT
    u.id,
    (SELECT id FROM plans WHERE type = 'PRO' AND name = 'Free' LIMIT 1),
    'free',
    'ACTIVE',
    NOW(),
    NOW() + INTERVAL '1 month',
    0
FROM users u
WHERE u.role = 'professional'
AND NOT EXISTS (SELECT 1 FROM subscriptions s WHERE s.user_id = u.id);

  END IF;
END $$;

INSERT INTO subscriptions (user_id, plan_id, tier, status, current_period_start, current_period_end, price_monthly)
SELECT
    u.id,
    (SELECT id FROM plans WHERE type = 'PRO' AND name = 'Free' LIMIT 1),
    'free',
    'ACTIVE',
    NOW(),
    NOW() + INTERVAL '1 month',
    0
FROM users u
WHERE u.role = 'professional'
AND NOT EXISTS (SELECT 1 FROM subscriptions s WHERE s.user_id = u.id);
