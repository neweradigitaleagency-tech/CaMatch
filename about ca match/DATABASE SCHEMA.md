Document ID: CM-DB-001
Version: 1.0
Date: June 17, 2026
Note: This expands on the schema provided in the PRD with additional tables, indexes, and optimization strategies.
3.1 COMPLETE SCHEMA

-- Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================================
-- ENUM TYPES
-- ============================================================================

CREATE TYPE user_role AS ENUM (
    'client', 
    'professional', 
    'business_admin', 
    'enterprise_admin', 
    'platform_admin'
);

CREATE TYPE request_status AS ENUM (
    'draft', 
    'pending', 
    'quoted', 
    'accepted', 
    'in_progress', 
    'completed', 
    'cancelled', 
    'disputed'
);

CREATE TYPE verification_level AS ENUM (
    'none', 
    'phone', 
    'id', 
    'background', 
    'certified', 
    'elite'
);

CREATE TYPE payment_status AS ENUM (
    'pending', 
    'authorized', 
    'captured', 
    'failed', 
    'refunded', 
    'partially_refunded'
);

CREATE TYPE payout_status AS ENUM (
    'pending', 
    'processing', 
    'completed', 
    'failed'
);

CREATE TYPE dispute_status AS ENUM (
    'open', 
    'under_review', 
    'resolved', 
    'escalated', 
    'closed'
);

CREATE TYPE notification_channel AS ENUM (
    'push', 
    'sms', 
    'whatsapp', 
    'email', 
    'in_app'
);

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- USERS (Core Authentication)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE,
    phone_number TEXT UNIQUE NOT NULL,
    phone_number_hash TEXT NOT NULL, -- For secure lookups
    password_hash TEXT,
    role user_role NOT NULL DEFAULT 'client',
    language TEXT DEFAULT 'fr' CHECK (language IN ('fr', 'en', 'nouchi')),
    timezone TEXT DEFAULT 'Africa/Abidjan',
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_users_phone ON users(phone_number);
CREATE INDEX idx_users_email ON users(email) WHERE email IS NOT NULL;
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_users_created ON users(created_at DESC);

-- Triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- CLIENT PROFILES
CREATE TABLE client_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    default_address TEXT,
    location GEOGRAPHY(POINT, 4326),
    avatar_url TEXT,
    loyalty_points INT DEFAULT 0 CHECK (loyalty_points >= 0),
    total_jobs INT DEFAULT 0,
    total_spent INT DEFAULT 0,
    preferred_payment_method TEXT,
    notification_preferences JSONB DEFAULT '{"push": true, "sms": true, "email": false, "whatsapp": true}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_client_location ON client_profiles USING GIST(location);
CREATE INDEX idx_client_loyalty ON client_profiles(loyalty_points DESC);

-- PROFESSIONAL PROFILES
CREATE TABLE professional_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    business_name TEXT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('electrician', 'plumber', 'ac_refrigeration', 'cleaner')),
    sub_categories TEXT[],
    bio TEXT CHECK (char_length(bio) <= 1000),
    hourly_rate INT CHECK (hourly_rate >= 0),
    min_job_price INT DEFAULT 5000 CHECK (min_job_price >= 0),
    verification_level verification_level DEFAULT 'none',
    rating DECIMAL(3,2) DEFAULT 0.00 CHECK (rating >= 0 AND rating <= 5),
    total_jobs INT DEFAULT 0 CHECK (total_jobs >= 0),
    total_earned INT DEFAULT 0 CHECK (total_earned >= 0),
    location GEOGRAPHY(POINT, 4326),
    service_radius_km INT DEFAULT 10 CHECK (service_radius_km > 0 AND service_radius_km <= 50),
    is_available BOOLEAN DEFAULT TRUE,
    is_online BOOLEAN DEFAULT FALSE,
    id_document_url TEXT,
    id_document_verified_at TIMESTAMPTZ,
    cert_document_url TEXT,
    cert_document_verified_at TIMESTAMPTZ,
    background_check_url TEXT,
    background_check_verified_at TIMESTAMPTZ,
    wallet_balance INT DEFAULT 0,
    pending_balance INT DEFAULT 0,
    subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'business')),
    subscription_expires_at TIMESTAMPTZ,
    last_active_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_pro_category ON professional_profiles(category);
CREATE INDEX idx_pro_location ON professional_profiles USING GIST(location);
CREATE INDEX idx_pro_verification ON professional_profiles(verification_level);
CREATE INDEX idx_pro_rating ON professional_profiles(rating DESC) WHERE rating > 0;
CREATE INDEX idx_pro_available ON professional_profiles(is_available, is_online) WHERE is_available = TRUE;
CREATE INDEX idx_pro_wallet ON professional_profiles(wallet_balance);

-- Full-text search
ALTER TABLE professional_profiles ADD COLUMN fts tsvector GENERATED ALWAYS AS (
    to_tsvector('french', 
        coalesce(business_name, '') || ' ' || 
        coalesce(first_name, '') || ' ' || 
        coalesce(last_name, '') || ' ' || 
        coalesce(bio, '')
    )
) STORED;
CREATE INDEX idx_pro_fts ON professional_profiles USING GIN(fts);

-- SERVICE REQUESTS
CREATE TABLE service_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    professional_id UUID REFERENCES users(id) ON DELETE SET NULL,
    enterprise_site_id UUID REFERENCES enterprise_sites(id) ON DELETE SET NULL,
    category TEXT NOT NULL CHECK (category IN ('electrician', 'plumber', 'ac_refrigeration', 'cleaner')),
    sub_category TEXT,
    description TEXT CHECK (char_length(description) <= 2000),
    media_urls TEXT[] CHECK (array_length(media_urls, 1) <= 5),
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    address TEXT NOT NULL,
    address_details TEXT,
    status request_status DEFAULT 'pending',
    urgency TEXT DEFAULT 'medium' CHECK (urgency IN ('low', 'medium', 'high', 'emergency')),
    estimated_price_min INT CHECK (estimated_price_min >= 0),
    estimated_price_max INT CHECK (estimated_price_max >= estimated_price_min),
    final_price INT CHECK (final_price >= 0),
    ai_confidence_score DECIMAL(3,2),
    ai_extracted_features JSONB,
    scheduled_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_req_client ON service_requests(client_id);
CREATE INDEX idx_req_pro ON service_requests(professional_id) WHERE professional_id IS NOT NULL;
CREATE INDEX idx_req_status ON service_requests(status);
CREATE INDEX idx_req_location ON service_requests USING GIST(location);
CREATE INDEX idx_req_category ON service_requests(category);
CREATE INDEX idx_req_created ON service_requests(created_at DESC);
CREATE INDEX idx_req_scheduled ON service_requests(scheduled_at) WHERE scheduled_at IS NOT NULL;

-- Partitioning (for large-scale)
-- CREATE TABLE service_requests_partitioned (LIKE service_requests INCLUDING ALL) PARTITION BY RANGE (created_at);

-- QUOTES
CREATE TABLE quotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
    professional_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    labor_cost INT NOT NULL CHECK (labor_cost >= 0),
    material_cost INT DEFAULT 0 CHECK (material_cost >= 0),
    total_cost INT NOT NULL CHECK (total_cost >= 0),
    materials_description TEXT,
    notes TEXT CHECK (char_length(notes) <= 1000),
    estimated_duration_mins INT CHECK (estimated_duration_mins > 0),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
    valid_until TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT total_cost_check CHECK (total_cost = labor_cost + material_cost)
);

-- Indexes
CREATE INDEX idx_quote_request ON quotes(request_id);
CREATE INDEX idx_quote_pro ON quotes(professional_id);
CREATE INDEX idx_quote_status ON quotes(status);
CREATE INDEX idx_quote_valid ON quotes(valid_until) WHERE status = 'pending';

-- JOBS
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
    quote_id UUID REFERENCES quotes(id) ON DELETE SET NULL,
    checklist_data JSONB,
    before_photos TEXT[] CHECK (array_length(before_photos, 1) <= 10),
    after_photos TEXT[] CHECK (array_length(after_photos, 1) <= 10),
    ai_quality_score DECIMAL(3,2) CHECK (ai_quality_score >= 0 AND ai_quality_score <= 1),
    client_notes TEXT CHECK (char_length(client_notes) <= 1000),
    pro_notes TEXT CHECK (char_length(pro_notes) <= 1000),
    gps_check_in GEOGRAPHY(POINT, 4326),
    gps_check_out GEOGRAPHY(POINT, 4326),
    duration_mins INT,
    payment_verified BOOLEAN DEFAULT FALSE,
    payment_verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_job_request ON jobs(request_id);
CREATE INDEX idx_job_quote ON jobs(quote_id) WHERE quote_id IS NOT NULL;
CREATE INDEX idx_job_quality ON jobs(ai_quality_score) WHERE ai_quality_score IS NOT NULL;

-- REVIEWS
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    reviewee_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT CHECK (char_length(comment) <= 1000),
    is_visible BOOLEAN DEFAULT FALSE,
    ai_sentiment_score DECIMAL(3,2),
    ai_flagged BOOLEAN DEFAULT FALSE,
    ai_flag_reason TEXT,
    status TEXT DEFAULT 'approved' CHECK (status IN ('approved', 'pending_review', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(job_id, reviewer_id),
    CONSTRAINT reviewer_reviewee_different CHECK (reviewer_id != reviewee_id)
);

-- Indexes
CREATE INDEX idx_review_job ON reviews(job_id);
CREATE INDEX idx_review_reviewee ON reviews(reviewee_id) WHERE is_visible = TRUE;
CREATE INDEX idx_review_rating ON reviews(rating) WHERE is_visible = TRUE;
CREATE INDEX idx_review_status ON reviews(status) WHERE status = 'pending_review';

-- TRANSACTIONS (Immutable Ledger)
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
    payer_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    payee_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    amount INT NOT NULL CHECK (amount > 0),
    platform_fee INT NOT NULL CHECK (platform_fee >= 0),
    net_amount INT NOT NULL CHECK (net_amount = amount - platform_fee),
    currency TEXT DEFAULT 'XOF' CHECK (currency IN ('XOF', 'USD', 'EUR')),
    payment_method TEXT NOT NULL CHECK (payment_method IN ('wave', 'orange_money', 'mtn', 'cash', 'card')),
    status payment_status DEFAULT 'pending',
    provider_reference TEXT,
    provider_response JSONB,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_txn_job ON transactions(job_id) WHERE job_id IS NOT NULL;
CREATE INDEX idx_txn_payer ON transactions(payer_id);
CREATE INDEX idx_txn_payee ON transactions(payee_id);
CREATE INDEX idx_txn_status ON transactions(status);
CREATE INDEX idx_txn_created ON transactions(created_at DESC);
CREATE INDEX idx_txn_provider ON transactions(provider_reference) WHERE provider_reference IS NOT NULL;

-- PAYMENT INTENTS
CREATE TABLE payment_intents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    payer_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    amount INT NOT NULL CHECK (amount > 0),
    currency TEXT DEFAULT 'XOF',
    method TEXT NOT NULL CHECK (method IN ('wave', 'orange_money', 'mtn', 'cash', 'card')),
    status payment_status DEFAULT 'pending',
    provider_reference TEXT,
    provider_response JSONB,
    webhook_received_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '15 minutes'),
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_payintent_job ON payment_intents(job_id);
CREATE INDEX idx_payintent_payer ON payment_intents(payer_id);
CREATE INDEX idx_payintent_status ON payment_intents(status);
CREATE INDEX idx_payintent_expires ON payment_intents(expires_at) WHERE status = 'pending';

-- PAYOUTS
CREATE TABLE payouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payee_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    amount INT NOT NULL CHECK (amount > 0),
    method TEXT NOT NULL CHECK (method IN ('wave', 'orange_money', 'mtn', 'bank_transfer')),
    status payout_status DEFAULT 'pending',
    provider_reference TEXT,
    provider_response JSONB,
    webhook_received_at TIMESTAMPTZ,
    hold_until TIMESTAMPTZ,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_payout_payee ON payouts(payee_id);
CREATE INDEX idx_payout_status ON payouts(status);
CREATE INDEX idx_payout_hold ON payouts(hold_until) WHERE status = 'pending';

-- CONVERSATIONS & MESSAGES
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
    participant_1 UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    participant_2 UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    last_message_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(participant_1, participant_2, job_id),
    CONSTRAINT participants_different CHECK (participant_1 != participant_2)
);

-- Indexes
CREATE INDEX idx_conv_participants ON conversations(participant_1, participant_2);
CREATE INDEX idx_conv_job ON conversations(job_id) WHERE job_id IS NOT NULL;
CREATE INDEX idx_conv_last_msg ON conversations(last_message_at DESC);

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    content TEXT CHECK (char_length(content) <= 5000),
    media_url TEXT,
    media_type TEXT CHECK (media_type IN ('image', 'video', 'voice_note', 'document')),
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_msg_conv ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_msg_sender ON messages(sender_id);
CREATE INDEX idx_msg_unread ON messages(conversation_id, is_read) WHERE is_read = FALSE;

-- NOTIFICATIONS
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    channel notification_channel DEFAULT 'push',
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    metadata JSONB,
    provider_reference TEXT,
    delivered_at TIMESTAMPTZ,
    failed_at TIMESTAMPTZ,
    failure_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_notif_user ON notifications(user_id, is_read, created_at DESC);
CREATE INDEX idx_notif_type ON notifications(type);
CREATE INDEX idx_notif_unread ON notifications(user_id, created_at DESC) WHERE is_read = FALSE;

-- DISPUTES
CREATE TABLE disputes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE RESTRICT,
    raiser_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    reason TEXT NOT NULL CHECK (reason IN ('no_show', 'poor_quality', 'overcharge', 'damage', 'other')),
    description TEXT NOT NULL CHECK (char_length(description) <= 2000),
    evidence_urls TEXT[] CHECK (array_length(evidence_urls, 1) <= 10),
    status dispute_status DEFAULT 'open',
    tier INT DEFAULT 1 CHECK (tier IN (1, 2, 3)),
    assigned_to UUID REFERENCES users(id),
    resolution TEXT,
    refund_amount INT CHECK (refund_amount >= 0),
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_dispute_job ON disputes(job_id);
CREATE INDEX idx_dispute_status ON disputes(status);
CREATE INDEX idx_dispute_tier ON disputes(tier, status);
CREATE INDEX idx_dispute_assigned ON disputes(assigned_to) WHERE assigned_to IS NOT NULL;

-- BUSINESS & ENTERPRISE PROFILES
CREATE TABLE business_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    tax_id TEXT,
    team_size INT CHECK (team_size > 0),
    subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'business', 'enterprise')),
    subscription_expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE enterprise_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    industry TEXT,
    billing_address TEXT,
    account_manager_id UUID REFERENCES users(id),
    contract_start_date DATE,
    contract_end_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE enterprise_sites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    enterprise_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    location GEOGRAPHY(POINT, 4326),
    site_manager_id UUID REFERENCES users(id),
    monthly_budget INT CHECK (monthly_budget >= 0),
    budget_used INT DEFAULT 0 CHECK (budget_used >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_site_enterprise ON enterprise_sites(enterprise_id);
CREATE INDEX idx_site_manager ON enterprise_sites(site_manager_id) WHERE site_manager_id IS NOT NULL;
CREATE INDEX idx_site_location ON enterprise_sites USING GIST(location);

-- AI TABLES
CREATE TABLE ai_request_embeddings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
    embedding vector(1536),
    extracted_features JSONB,
    model_version TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_ai_emb_request ON ai_request_embeddings(request_id);
CREATE INDEX idx_ai_emb_vector ON ai_request_embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

CREATE TABLE ai_pricing_models (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category TEXT NOT NULL,
    city TEXT NOT NULL,
    model_version TEXT NOT NULL,
    model_type TEXT NOT NULL CHECK (model_type IN ('xgboost', 'linear', 'neural')),
    model_weights JSONB NOT NULL,
    accuracy_score DECIMAL(5,4),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(category, city, model_version)
);

CREATE TABLE ai_professional_rankings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    professional_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    request_id UUID NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
    match_score DECIMAL(5,2) NOT NULL CHECK (match_score >= 0 AND match_score <= 100),
    rank INT NOT NULL CHECK (rank > 0),
    factors JSONB NOT NULL,
    selected BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_ai_rank_pro ON ai_professional_rankings(professional_id);
-- Indexes (continued)
CREATE INDEX idx_ai_rank_request ON ai_professional_rankings(request_id);
CREATE INDEX idx_ai_rank_score ON ai_professional_rankings(match_score DESC);
CREATE INDEX idx_ai_rank_selected ON ai_professional_rankings(selected) WHERE selected = TRUE;

-- AUDIT LOGS (Immutable)
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'PAYMENT', 'PAYOUT', 'VERIFICATION')),
    entity_type TEXT NOT NULL,
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);

-- ROLES & PERMISSIONS
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    permissions JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_system BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    scope_type TEXT CHECK (scope_type IN ('platform', 'enterprise', 'business')),
    scope_id UUID,
    granted_by UUID REFERENCES users(id),
    granted_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    UNIQUE(user_id, role_id, scope_id)
);

-- Indexes
CREATE INDEX idx_userrole_user ON user_roles(user_id);
CREATE INDEX idx_userrole_role ON user_roles(role_id);
CREATE INDEX idx_userrole_scope ON user_roles(scope_type, scope_id);

-- VERIFICATION REQUESTS
CREATE TABLE verification_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    level verification_level NOT NULL,
    document_type TEXT NOT NULL CHECK (document_type IN ('cni', 'passport', 'casier_judiciaire', 'certification')),
    document_url TEXT NOT NULL,
    document_back_url TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'needs_resubmission')),
    reviewed_by UUID REFERENCES users(id),
    review_notes TEXT,
    ai_validation_score DECIMAL(3,2),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_verif_user ON verification_requests(user_id);
CREATE INDEX idx_verif_status ON verification_requests(status);
CREATE INDEX idx_verif_pending ON verification_requests(created_at) WHERE status = 'pending';

-- SUBSCRIPTIONS (SaaS Tiers)
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tier TEXT NOT NULL CHECK (tier IN ('free', 'pro', 'business', 'enterprise')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'past_due', 'cancelled', 'trialing')),
    current_period_start TIMESTAMPTZ NOT NULL,
    current_period_end TIMESTAMPTZ NOT NULL,
    price_monthly INT NOT NULL,
    payment_method TEXT,
    provider_subscription_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_sub_user ON subscriptions(user_id);
CREATE INDEX idx_sub_status ON subscriptions(status);
CREATE INDEX idx_sub_active ON subscriptions(user_id) WHERE status = 'active';

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_intents ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- USERS policies
CREATE POLICY "Users can view own profile" ON users 
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Platform admins can view all users" ON users 
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM user_roles ur 
                JOIN roles r ON ur.role_id = r.id 
                WHERE ur.user_id = auth.uid() AND r.name = 'platform_admin')
    );

CREATE POLICY "Pros can view matched clients" ON users 
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM service_requests sr 
                WHERE sr.client_id = users.id AND sr.professional_id = auth.uid())
    );

-- CLIENT PROFILES policies
CREATE POLICY "Clients view own profile" ON client_profiles 
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Clients update own profile" ON client_profiles 
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Pros view matched clients" ON client_profiles 
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM service_requests sr 
                WHERE sr.client_id = client_profiles.user_id 
                AND sr.professional_id = auth.uid())
    );

-- PROFESSIONAL PROFILES policies
CREATE POLICY "Public can view active pros" ON professional_profiles 
    FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Pros view own profile" ON professional_profiles 
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Pros update own profile" ON professional_profiles 
    FOR UPDATE USING (user_id = auth.uid());

-- SERVICE REQUESTS policies
CREATE POLICY "Clients view own requests" ON service_requests 
    FOR SELECT USING (client_id = auth.uid());

CREATE POLICY "Clients create requests" ON service_requests 
    FOR INSERT WITH CHECK (client_id = auth.uid());

CREATE POLICY "Pros view matched requests" ON service_requests 
    FOR SELECT USING (
        professional_id = auth.uid() 
        OR (status IN ('pending', 'quoted') AND category IN (
            SELECT category FROM professional_profiles WHERE user_id = auth.uid()
        ))
    );

CREATE POLICY "Pros update assigned requests" ON service_requests 
    FOR UPDATE USING (professional_id = auth.uid());

-- QUOTES policies
CREATE POLICY "Clients view quotes on own requests" ON quotes 
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM service_requests sr 
                WHERE sr.id = quotes.request_id AND sr.client_id = auth.uid())
    );

CREATE POLICY "Pros view own quotes" ON quotes 
    FOR SELECT USING (professional_id = auth.uid());

CREATE POLICY "Pros create quotes" ON quotes 
    FOR INSERT WITH CHECK (professional_id = auth.uid());

-- TRANSACTIONS policies
CREATE POLICY "Users view own transactions" ON transactions 
    FOR SELECT USING (payer_id = auth.uid() OR payee_id = auth.uid());

CREATE POLICY "Platform admins view all transactions" ON transactions 
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM user_roles ur 
                JOIN roles r ON ur.role_id = r.id 
                WHERE ur.user_id = auth.uid() AND r.name = 'platform_admin')
    );

-- PAYMENT INTENTS policies
CREATE POLICY "Payers view own payment intents" ON payment_intents 
    FOR SELECT USING (payer_id = auth.uid());

CREATE POLICY "Clients create payment intents" ON payment_intents 
    FOR INSERT WITH CHECK (payer_id = auth.uid());

-- PAYOUTS policies
CREATE POLICY "Payees view own payouts" ON payouts 
    FOR SELECT USING (payee_id = auth.uid());

CREATE POLICY "Pros create payouts" ON payouts 
    FOR INSERT WITH CHECK (payee_id = auth.uid());

-- CONVERSATIONS policies
CREATE POLICY "Participants view conversations" ON conversations 
    FOR SELECT USING (participant_1 = auth.uid() OR participant_2 = auth.uid());

-- MESSAGES policies
CREATE POLICY "Participants view messages" ON messages 
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM conversations c 
                WHERE c.id = messages.conversation_id 
                AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid()))
    );

CREATE POLICY "Participants send messages" ON messages 
    FOR INSERT WITH CHECK (
        sender_id = auth.uid() 
        AND EXISTS (SELECT 1 FROM conversations c 
                    WHERE c.id = messages.conversation_id 
                    AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid()))
    );

-- NOTIFICATIONS policies
CREATE POLICY "Users view own notifications" ON notifications 
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users update own notifications" ON notifications 
    FOR UPDATE USING (user_id = auth.uid());

-- DISPUTES policies
CREATE POLICY "Parties view own disputes" ON disputes 
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM jobs j 
                JOIN service_requests sr ON j.request_id = sr.id 
                WHERE j.id = disputes.job_id 
                AND (sr.client_id = auth.uid() OR sr.professional_id = auth.uid()))
    );

CREATE POLICY "Parties create disputes" ON disputes 
    FOR INSERT WITH CHECK (raiser_id = auth.uid());

-- AUDIT LOGS policies
CREATE POLICY "Platform admins view audit logs" ON audit_logs 
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM user_roles ur 
                JOIN roles r ON ur.role_id = r.id 
                WHERE ur.user_id = auth.uid() AND r.name = 'platform_admin')
    );

-- VERIFICATION REQUESTS policies
CREATE POLICY "Users view own verification requests" ON verification_requests 
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users create verification requests" ON verification_requests 
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Platform admins manage verification" ON verification_requests 
    FOR ALL USING (
        EXISTS (SELECT 1 FROM user_roles ur 
                JOIN roles r ON ur.role_id = r.id 
                WHERE ur.user_id = auth.uid() AND r.name = 'platform_admin')
    );

-- SUBSCRIPTIONS policies
CREATE POLICY "Users view own subscriptions" ON subscriptions 
    FOR SELECT USING (user_id = auth.uid());

-- ============================================================================
-- DATABASE FUNCTIONS
-- ============================================================================

-- Function: Get nearby professionals with scoring
CREATE OR REPLACE FUNCTION get_nearby_pros(
    user_location GEOGRAPHY,
    target_category TEXT,
    radius_km INT DEFAULT 10,
    limit_count INT DEFAULT 10
) RETURNS TABLE (
    user_id UUID,
    business_name TEXT,
    first_name TEXT,
    rating DECIMAL,
    verification_level verification_level,
    distance_meters FLOAT,
    match_score DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.user_id, 
        p.business_name,
        p.first_name,
        p.rating,
        p.verification_level,
        ST_Distance(p.location, user_location)::FLOAT as distance_meters,
        -- Simplified match score
        (
            (100 - LEAST(ST_Distance(p.location, user_location)::FLOAT / 1000, 100)) * 0.25 +
            (CASE WHEN p.category = target_category THEN 100 ELSE 0 END) * 0.20 +
            (p.rating * 20) * 0.20 +
            (CASE p.verification_level 
                WHEN 'elite' THEN 100 
                WHEN 'certified' THEN 80 
                WHEN 'background' THEN 60 
                WHEN 'id' THEN 40 
                ELSE 20 
            END) * 0.15 +
            (CASE WHEN p.is_available AND p.is_online THEN 100 ELSE 0 END) * 0.10 +
            50 * 0.10
        )::DECIMAL as match_score
    FROM professional_profiles p
    WHERE 
        p.category = target_category
        AND p.is_available = TRUE
        AND p.is_active = TRUE
        AND ST_DWithin(p.location, user_location, radius_km * 1000)
    ORDER BY match_score DESC, distance_meters ASC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Calculate professional average rating
CREATE OR REPLACE FUNCTION update_professional_rating(pro_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE professional_profiles
    SET rating = (
        SELECT COALESCE(AVG(r.rating), 0)
        FROM reviews r
        WHERE r.reviewee_id = pro_id 
        AND r.is_visible = TRUE
        AND r.status = 'approved'
    ),
    total_jobs = (
        SELECT COUNT(*)
        FROM service_requests sr
        WHERE sr.professional_id = pro_id
        AND sr.status = 'completed'
    )
    WHERE user_id = pro_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Process platform fee collection
CREATE OR REPLACE FUNCTION calculate_platform_fee(amount INT, pro_level verification_level)
RETURNS INT AS $$
DECLARE
    fee_rate DECIMAL;
BEGIN
    -- Elite pros get reduced fees
    fee_rate := CASE pro_level
        WHEN 'elite' THEN 0.08
        WHEN 'certified' THEN 0.10
        WHEN 'background' THEN 0.12
        ELSE 0.15
    END;
    
    RETURN ROUND(amount * fee_rate);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function: Check enterprise budget
CREATE OR REPLACE FUNCTION check_enterprise_budget(site_uuid UUID, amount INT)
RETURNS BOOLEAN AS $$
DECLARE
    budget INT;
    used INT;
BEGIN
    SELECT monthly_budget, budget_used INTO budget, used
    FROM enterprise_sites WHERE id = site_uuid;
    
    RETURN (used + amount) <= budget;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Audit trigger
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_values, ip_address)
        VALUES (auth.uid(), 'INSERT', TG_TABLE_NAME, NEW.id, to_jsonb(NEW), inet_client_addr());
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_values, new_values, ip_address)
        VALUES (auth.uid(), 'UPDATE', TG_TABLE_NAME, NEW.id, to_jsonb(OLD), to_jsonb(NEW), inet_client_addr());
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_values, ip_address)
        VALUES (auth.uid(), 'DELETE', TG_TABLE_NAME, OLD.id, to_jsonb(OLD), inet_client_addr());
        RETURN OLD;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit triggers to key tables
CREATE TRIGGER audit_users AFTER INSERT OR UPDATE OR DELETE ON users
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_service_requests AFTER INSERT OR UPDATE OR DELETE ON service_requests
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_transactions AFTER INSERT OR UPDATE OR DELETE ON transactions
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Function: Update professional wallet balance
CREATE OR REPLACE FUNCTION update_wallet_balance(pro_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE professional_profiles
    SET 
        wallet_balance = COALESCE((
            SELECT SUM(net_amount) 
            FROM transactions 
            WHERE payee_id = pro_id AND status = 'captured'
        ), 0) - COALESCE((
            SELECT SUM(amount) 
            FROM payouts 
            WHERE payee_id = pro_id AND status IN ('processing', 'completed')
        ), 0),
        pending_balance = COALESCE((
            SELECT SUM(net_amount) 
            FROM transactions 
            WHERE payee_id = pro_id AND status = 'authorized'
        ), 0)
    WHERE user_id = pro_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SEED DATA
-- ============================================================================

-- Insert default roles
INSERT INTO roles (name, description, permissions, is_system) VALUES
('platform_super_admin', 'Full platform access', '{"all": true}'::jsonb, true),
('platform_support', 'Customer support access', '{"view_users": true, "view_jobs": true, "manage_disputes": true}'::jsonb, true),
('platform_finance', 'Financial oversight', '{"view_transactions": true, "manage_payouts": true, "view_reports": true}'::jsonb, true),
('platform_trust_safety', 'Verification and moderation', '{"manage_verifications": true, "moderate_content": true, "manage_disputes": true}'::jsonb, true),
('enterprise_admin', 'Enterprise full access', '{"manage_sites": true, "manage_users": true, "view_financials": true, "approve_quotes": true}'::jsonb, true),
('enterprise_site_manager', 'Site-level management', '{"manage_site_requests": true, "approve_quotes": true, "view_site_reports": true}'::jsonb, true),
('business_admin', 'SME business owner', '{"manage_team": true, "view_financials": true, "manage_subscription": true}'::jsonb, true),
('business_dispatcher', 'Job dispatcher', '{"dispatch_jobs": true, "view_team": true}'::jsonb, true),
('business_technician', 'Field technician', '{"execute_jobs": true, "view_own_earnings": true}'::jsonb, true);
