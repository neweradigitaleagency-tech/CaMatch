-- ============================================================================
-- CEA Phase 0 — Ticket 1.4: Fusion verification_requests + user_verifications
-- ============================================================================
-- Avant : verification_requests (document-based, single attempt)
--         user_verifications (level-based, multi-attempt)
-- Après  : user_verifications enrichie (table unique)
-- ============================================================================

-- 1. Enrichir user_verifications avec les colonnes manquantes
ALTER TABLE user_verifications
  ADD COLUMN IF NOT EXISTS document_url TEXT,
  ADD COLUMN IF NOT EXISTS document_back_url TEXT,
  ADD COLUMN IF NOT EXISTS selfie_url TEXT,
  ADD COLUMN IF NOT EXISTS document_type TEXT,
  ADD COLUMN IF NOT EXISTS ai_validation_score DECIMAL(5,2),
  ADD COLUMN IF NOT EXISTS verification_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- 2. Index sur la table unifiée
CREATE INDEX IF NOT EXISTS idx_user_verifications_level ON user_verifications(level);
CREATE INDEX IF NOT EXISTS idx_user_verifications_status ON user_verifications(status);

-- 3. Migrer les données depuis verification_requests
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'verification_requests') THEN
    INSERT INTO user_verifications (user_id, level, status, document_url, document_back_url, selfie_url,
      document_type, ai_validation_score, verification_expires_at, reviewed_by, review_notes, metadata, created_at, updated_at)
    SELECT
      vr.user_id,
      CASE vr.level
        WHEN 'phone' THEN 1 WHEN 'id' THEN 2
        WHEN 'background' THEN 3 WHEN 'certified' THEN 4
        WHEN 'elite' THEN 5 ELSE 0
      END,
      vr.status, vr.document_url, vr.document_back_url, vr.selfie_url,
      vr.document_type::text, vr.ai_validation_score, vr.verification_expires_at,
      vr.reviewed_by, vr.review_notes,
      jsonb_build_object('source', 'verification_requests', 'original_id', vr.id),
      vr.created_at, vr.updated_at
    FROM verification_requests vr
    ON CONFLICT (user_id, level, attempt) DO NOTHING;
  END IF;
END $$;

-- 4. Vue de rétrocompatibilité
CREATE OR REPLACE VIEW v_verification_requests AS
SELECT
  gen_random_uuid() AS id,
  user_id, level, status,
  document_url, document_back_url, selfie_url,
  document_type, ai_validation_score, verification_expires_at,
  reviewed_by, review_notes, attempt, metadata,
  created_at, updated_at
FROM user_verifications;

COMMENT ON TABLE verification_requests IS 'DEPRECATED - use user_verifications table instead';
