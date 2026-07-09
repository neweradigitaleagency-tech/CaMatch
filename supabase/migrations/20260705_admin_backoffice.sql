-- Ça Match — Admin Back-Office System
-- Run after base migration (20260620_000001_init.sql)
-- Tables: admins, admin_roles, admin_logs
-- Permissions fines dans roles.permissions (JSONB)
-- Seed roles mis à jour avec permissions granulaires

-- ============================================================================
-- 1. TABLE admins (1:1 avec auth.users)
-- ============================================================================

CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  firstname TEXT NOT NULL,
  lastname TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  department TEXT,
  job_title TEXT,
  phone TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'disabled')),
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admins_status ON admins(status);
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);

-- ============================================================================
-- 2. TABLE admin_roles (plusieurs rôles par admin)
-- ============================================================================

CREATE TABLE IF NOT EXISTS admin_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  granted_by UUID REFERENCES admins(id),
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(admin_id, role_id)
);

CREATE INDEX IF NOT EXISTS idx_admin_roles_admin ON admin_roles(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_roles_role ON admin_roles(role_id);

-- ============================================================================
-- 3. TABLE admin_logs (audit trail des actions admin)
-- ============================================================================

CREATE TABLE IF NOT EXISTS admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN (
    'LOGIN', 'LOGOUT',
    'USER_VIEW', 'USER_CREATE', 'USER_UPDATE', 'USER_DELETE', 'USER_SUSPEND', 'USER_BAN',
    'PRO_VIEW', 'PRO_VERIFY', 'PRO_UPDATE', 'PRO_DELETE',
    'MISSION_VIEW', 'MISSION_UPDATE', 'MISSION_CANCEL',
    'PAYMENT_VIEW', 'PAYMENT_REFUND',
    'SUPPORT_REPLY', 'SUPPORT_CLOSE',
    'REPORT_VIEW', 'REPORT_RESOLVE', 'REPORT_DISMISS',
    'VERIFICATION_APPROVE', 'VERIFICATION_REJECT', 'VERIFICATION_REQUEST_CHANGE',
    'NOTIFICATION_SEND',
    'SETTINGS_UPDATE',
    'ADMIN_CREATE', 'ADMIN_UPDATE', 'ADMIN_DELETE',
    'ROLE_UPDATE'
  )),
  target_type TEXT,
  target_id UUID,
  details JSONB,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_logs_admin ON admin_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_action ON admin_logs(action);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created ON admin_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_logs_target ON admin_logs(target_type, target_id);

-- ============================================================================
-- 4. RLS POLICIES
-- ============================================================================

ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

-- Admins: only super admins can write, admins can read own
CREATE POLICY "Admins view own profile" ON admins
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Super admins manage admins" ON admins
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admin_roles ar
            JOIN roles r ON ar.role_id = r.id
            WHERE ar.admin_id = auth.uid() AND r.name = 'platform_super_admin')
  );

-- Admin roles: super admins only
CREATE POLICY "Super admins manage admin_roles" ON admin_roles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admin_roles ar
            JOIN roles r ON ar.role_id = r.id
            WHERE ar.admin_id = auth.uid() AND r.name = 'platform_super_admin')
  );

CREATE POLICY "Admins view own roles" ON admin_roles
  FOR SELECT USING (admin_id = auth.uid() OR admin_id IN (
    SELECT id FROM admins WHERE id = auth.uid()
  ));

-- Admin logs: read-only for all admins (immutable)
CREATE POLICY "Admins view logs" ON admin_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM admin_roles ar
            JOIN roles r ON ar.role_id = r.id
            WHERE ar.admin_id = auth.uid())
  );

-- ============================================================================
-- 5. MISE À JOUR DES RÔLES EXISTANTS AVEC PERMISSIONS FINES
-- ============================================================================

UPDATE roles SET permissions = '{
  "all": true
}'::jsonb
WHERE name = 'platform_super_admin';

UPDATE roles SET permissions = '{
  "users.read": true,
  "pros.read": true,
  "missions.read": true,
  "support.reply": true,
  "support.read": true,
  "reports.read": true,
  "notifications.send": true,
  "logs.read": true
}'::jsonb
WHERE name = 'platform_support';

UPDATE roles SET permissions = '{
  "payments.read": true,
  "payments.refund": true,
  "payouts.read": true,
  "payouts.approve": true,
  "transactions.read": true,
  "analytics.read": true,
  "analytics.export": true
}'::jsonb
WHERE name = 'platform_finance';

UPDATE roles SET permissions = '{
  "pros.read": true,
  "pros.verify": true,
  "verifications.read": true,
  "verifications.approve": true,
  "verifications.reject": true,
  "verifications.request_change": true,
  "reports.read": true,
  "reports.resolve": true,
  "users.suspend": true,
  "users.ban": true,
  "reviews.moderate": true
}'::jsonb
WHERE name = 'platform_trust_safety';

-- ============================================================================
-- 6. FONCTION: admin_log_trigger (log automatique des actions admin)
-- ============================================================================

CREATE OR REPLACE FUNCTION log_admin_action()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO admin_logs (admin_id, action, target_type, target_id, details, ip_address)
  VALUES (
    auth.uid(),
    CASE TG_OP
      WHEN 'INSERT' THEN TG_ARGV[0] || '_CREATE'
      WHEN 'UPDATE' THEN TG_ARGV[0] || '_UPDATE'
      WHEN 'DELETE' THEN TG_ARGV[0] || '_DELETE'
    END,
    TG_TABLE_NAME,
    NEW.id,
    CASE TG_OP
      WHEN 'DELETE' THEN jsonb_build_object('old', to_jsonb(OLD))
      ELSE jsonb_build_object('new', to_jsonb(NEW))
    END,
    inet_client_addr()
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
