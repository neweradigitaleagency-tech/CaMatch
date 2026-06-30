-- Ça Match — Admin, Plans & Verification System
-- Run this in Supabase SQL Editor after the base migration

-- ============================================================================
-- 1. ENRICH existing enum/check constraints
-- ============================================================================

ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_tier_check;
ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_tier_check
  CHECK (tier IN ('standard', 'pro', 'pro_plus'));

ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS commission_rate DECIMAL(3,2) DEFAULT 0.15;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS validated_by UUID REFERENCES users(id);
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS provider_reference TEXT;

-- ============================================================================
-- 2. SUBSCRIPTION PAYMENTS (pending → approved/rejected)
-- ============================================================================

CREATE TABLE IF NOT EXISTS subscription_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL CHECK (plan IN ('verified', 'pro', 'pro_plus')),
  amount INT NOT NULL CHECK (amount >= 0),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('orange_money', 'mtn_momo', 'moov_money')),
  phone_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  validated_by UUID REFERENCES users(id),
  validated_at TIMESTAMPTZ,
  rejected_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subpay_user ON subscription_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_subpay_status ON subscription_payments(status);

-- ============================================================================
-- 3. ENRICH verification_requests
-- ============================================================================

ALTER TABLE verification_requests ADD COLUMN IF NOT EXISTS selfie_url TEXT;
ALTER TABLE verification_requests ADD COLUMN IF NOT EXISTS face_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE verification_requests ADD COLUMN IF NOT EXISTS verification_expires_at TIMESTAMPTZ;

-- Add new document types
ALTER TABLE verification_requests DROP CONSTRAINT IF EXISTS verification_requests_document_type_check;
ALTER TABLE verification_requests ADD CONSTRAINT verification_requests_document_type_check
  CHECK (document_type IN ('cni', 'passport', 'permis', 'casier_judiciaire', 'certification'));

-- ============================================================================
-- 4. ADD is_verified to professional_profiles
-- ============================================================================

ALTER TABLE professional_profiles ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE professional_profiles ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;

-- ============================================================================
-- 5. ADD is_admin to users
-- ============================================================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- ============================================================================
-- 6. DISPUTES table (if not exists)
-- ============================================================================

CREATE TABLE IF NOT EXISTS disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE RESTRICT,
  raiser_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  reason TEXT NOT NULL CHECK (reason IN ('no_show', 'poor_quality', 'overcharge', 'damage', 'other')),
  description TEXT NOT NULL CHECK (char_length(description) <= 2000),
  evidence_urls TEXT[] CHECK (array_length(evidence_urls, 1) <= 10),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'under_review', 'resolved', 'escalated', 'closed')),
  resolution TEXT,
  refund_amount INT CHECK (refund_amount >= 0),
  resolved_by UUID REFERENCES users(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dispute_job ON disputes(job_id);
CREATE INDEX IF NOT EXISTS idx_dispute_status ON disputes(status);
CREATE INDEX IF NOT EXISTS idx_dispute_raiser ON disputes(raiser_id);

-- ============================================================================
-- 7. RLS for new tables
-- ============================================================================

ALTER TABLE subscription_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;

-- Subscription payments: user sees own, admin sees all
CREATE POLICY "Users view own payments" ON subscription_payments
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users create own payments" ON subscription_payments
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins manage all payments" ON subscription_payments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- Disputes: parties see own, admin sees all
CREATE POLICY "Parties view own disputes" ON disputes
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM jobs j
      JOIN service_requests sr ON j.request_id = sr.id
      WHERE j.id = disputes.job_id
      AND (sr.client_id = auth.uid() OR sr.professional_id = auth.uid()))
  );

CREATE POLICY "Parties create disputes" ON disputes
  FOR INSERT WITH CHECK (raiser_id = auth.uid());

CREATE POLICY "Admins manage all disputes" ON disputes
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- ============================================================================
-- 8. FUNCTION: auto-activate subscription on payment approval
-- ============================================================================

CREATE OR REPLACE FUNCTION auto_activate_subscription()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status = 'pending' THEN
    -- Upsert subscription
    INSERT INTO subscriptions (user_id, tier, status, current_period_start, current_period_end, price_monthly, commission_rate, payment_method, validated_by)
    VALUES (
      NEW.user_id,
      NEW.plan,
      'active',
      NOW(),
      NOW() + INTERVAL '30 days',
      NEW.amount,
      CASE NEW.plan
        WHEN 'pro' THEN 0.12
        WHEN 'pro_plus' THEN 0.08
        ELSE 0.15
      END,
      NEW.payment_method,
      NEW.validated_by
    )
    ON CONFLICT (user_id, id) DO UPDATE SET
      tier = EXCLUDED.tier,
      status = 'active',
      current_period_end = NOW() + INTERVAL '30 days',
      commission_rate = EXCLUDED.commission_rate,
      updated_at = NOW();

    -- If verified plan, also update professional_profiles
    IF NEW.plan = 'verified' THEN
      UPDATE professional_profiles
      SET is_verified = TRUE, verified_at = NOW()
      WHERE user_id = NEW.user_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_auto_activate_subscription
  AFTER UPDATE ON subscription_payments
  FOR EACH ROW
  WHEN (NEW.status = 'approved' AND OLD.status = 'pending')
  EXECUTE FUNCTION auto_activate_subscription();

-- ============================================================================
-- 9. FUNCTION: update commission_rate on subscription change
-- ============================================================================

CREATE OR REPLACE FUNCTION get_user_commission_rate(user_uuid UUID)
RETURNS DECIMAL AS $$
DECLARE
  rate DECIMAL;
BEGIN
  SELECT COALESCE(s.commission_rate, 0.15) INTO rate
  FROM subscriptions s
  WHERE s.user_id = user_uuid AND s.status = 'active'
  ORDER BY s.current_period_end DESC
  LIMIT 1;

  RETURN rate;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- 10. SEED admin user (replace with actual admin email)
-- ============================================================================

-- Uncomment and run once to make first user admin:
-- UPDATE users SET is_admin = TRUE WHERE email = 'admin@camatch.ci';
