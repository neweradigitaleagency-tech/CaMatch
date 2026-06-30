-- Ça Match — Trust Engine (Queue-Based, Corrected Architecture)
-- Run after 20260624_admin_plans.sql
-- Design: separate components fn + score fn + queue processing

-- ============================================================================
-- 1. PROFESSIONAL PROFILES — new columns
-- ============================================================================

ALTER TABLE professional_profiles ADD COLUMN IF NOT EXISTS trust_score INT DEFAULT 50;
ALTER TABLE professional_profiles ADD COLUMN IF NOT EXISTS trust_score_components JSONB DEFAULT '{}';
ALTER TABLE professional_profiles ADD COLUMN IF NOT EXISTS trust_score_updated_at TIMESTAMPTZ;
ALTER TABLE professional_profiles ADD COLUMN IF NOT EXISTS availability_status TEXT DEFAULT 'offline'
  CHECK (availability_status IN ('available', 'busy', 'offline'));
ALTER TABLE professional_profiles ADD COLUMN IF NOT EXISTS availability_updated_at TIMESTAMPTZ;
ALTER TABLE professional_profiles ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ;
ALTER TABLE professional_profiles ADD COLUMN IF NOT EXISTS avg_response_time_minutes INT DEFAULT 0;
ALTER TABLE professional_profiles ADD COLUMN IF NOT EXISTS completion_rate DECIMAL(5,2) DEFAULT 100.00;
ALTER TABLE professional_profiles ADD COLUMN IF NOT EXISTS total_cancellations INT DEFAULT 0;
ALTER TABLE professional_profiles ADD COLUMN IF NOT EXISTS recommendation_rate DECIMAL(5,2) DEFAULT 0;
ALTER TABLE professional_profiles ADD COLUMN IF NOT EXISTS member_since TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE professional_profiles ADD COLUMN IF NOT EXISTS total_offers INT DEFAULT 0;
ALTER TABLE professional_profiles ADD COLUMN IF NOT EXISTS accepted_offers INT DEFAULT 0;
ALTER TABLE professional_profiles ADD COLUMN IF NOT EXISTS job_acceptance_rate DECIMAL(5,2) DEFAULT 100.00;

-- ============================================================================
-- 2. REVIEWS — add direct professional_id FK to avoid expensive JOIN chain
-- ============================================================================

ALTER TABLE reviews ADD COLUMN IF NOT EXISTS professional_id UUID REFERENCES professional_profiles(id);
CREATE INDEX IF NOT EXISTS idx_reviews_professional ON reviews(professional_id);

-- Migrate existing data
UPDATE reviews r
SET professional_id = jp.id
FROM jobs j
JOIN professional_profiles jp ON j.professional_id = jp.id
WHERE r.job_id = j.id AND r.professional_id IS NULL;

-- ============================================================================
-- 3. TRUST SCORE QUEUE (replaces heavy triggers)
-- ============================================================================

CREATE TABLE IF NOT EXISTS trust_score_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES professional_profiles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'review_insert', 'job_update', 'verification_update',
    'dispute_update', 'availability_change'
  )),
  priority INT DEFAULT 0,
  processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_tsq_unprocessed ON trust_score_queue(processed, created_at);

-- ============================================================================
-- 4. TRUST SCORE LOG (audit trail)
-- ============================================================================

CREATE TABLE IF NOT EXISTS trust_score_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID REFERENCES professional_profiles(id) ON DELETE CASCADE,
  score_before INT NOT NULL,
  score_after INT NOT NULL,
  components_before JSONB,
  components_after JSONB,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tsl_professional ON trust_score_log(professional_id);

-- ============================================================================
-- 5. PORTFOLIO GALLERY (with is_featured for hero top-3)
-- ============================================================================

CREATE TABLE IF NOT EXISTS portfolio_gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES professional_profiles(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  category TEXT NOT NULL CHECK (category IN ('realisation', 'before_after', 'certificate', 'equipment', 'other')),
  caption TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gallery_professional ON portfolio_gallery(professional_id);

-- ============================================================================
-- 6. USER VERIFICATIONS (with attempt tracking, replaces unique constraint)
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  level INT NOT NULL CHECK (level BETWEEN 0 AND 5),
  attempt INT DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  metadata JSONB DEFAULT '{}',
  reviewed_by UUID REFERENCES users(id),
  review_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_uv_user ON user_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_uv_user_level ON user_verifications(user_id, level);

-- ============================================================================
-- 7. FUNCTIONS — Trust Score Calculation (decoupled components)
-- ============================================================================

-- Calculate individual components (source of truth)
CREATE OR REPLACE FUNCTION calculate_trust_components(pro_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_avg_rating DECIMAL;
  v_total_jobs INT;
  v_completed_jobs INT;
  v_verif_level INT;
  v_avg_response INT;
  v_days_member INT;
  v_open_disputes INT;
  v_recent_cancellations INT;
  v_acceptance_rate DECIMAL;
  result JSONB;
BEGIN
  -- Reviews score (max 40): avg_rating * 8, clamped to [0, 40]
  SELECT COALESCE(AVG(r.rating), 0) INTO v_avg_rating
  FROM reviews r WHERE r.professional_id = pro_id;

  -- Completion rate (max 25): (completed / total) * 25
  SELECT
    COUNT(*) FILTER (WHERE status = 'completed'),
    COUNT(*)
  INTO v_completed_jobs, v_total_jobs
  FROM jobs WHERE professional_id = pro_id;

  -- Verification level (max 20): highest approved level * 4
  SELECT COALESCE(MAX(uv.level), 0) INTO v_verif_level
  FROM user_verifications uv
  JOIN professional_profiles pp ON pp.user_id = uv.user_id
  WHERE pp.id = pro_id AND uv.status = 'approved';

  -- Response time (max 10): inverse scale
  SELECT COALESCE(avg_response_time_minutes, 999) INTO v_avg_response
  FROM professional_profiles WHERE id = pro_id;

  -- Account age (max 5): days / 730 * 5, capped at 5
  SELECT COALESCE(EXTRACT(DAY FROM NOW() - member_since)::INT, 0) INTO v_days_member
  FROM professional_profiles WHERE id = pro_id;

  -- Acceptance rate (max 0, bonus/penalty modifier)
  SELECT COALESCE(job_acceptance_rate, 100) INTO v_acceptance_rate
  FROM professional_profiles WHERE id = pro_id;

  -- Penalties: disputes + cancellations
  SELECT COUNT(*) INTO v_open_disputes
  FROM disputes d
  JOIN jobs j ON d.job_id = j.id
  WHERE j.professional_id = pro_id AND d.status NOT IN ('resolved', 'closed');

  SELECT COUNT(*) INTO v_recent_cancellations
  FROM jobs
  WHERE professional_id = pro_id
    AND status = 'cancelled'
    AND updated_at > NOW() - INTERVAL '30 days';

  result := jsonb_build_object(
    'reviews_score', LEAST(GREATEST(ROUND((v_avg_rating * 8)::DECIMAL, 1), 0), 40),
    'completion_rate_score', LEAST(GREATEST(ROUND(
      CASE WHEN v_total_jobs > 0
        THEN (v_completed_jobs::DECIMAL / v_total_jobs) * 25
        ELSE 25 END, 1), 0), 25),
    'verification_score', LEAST(GREATEST(ROUND((v_verif_level * 4)::DECIMAL, 1), 0), 20),
    'response_time_score', LEAST(GREATEST(ROUND(
      CASE
        WHEN v_avg_response <= 5 THEN 10
        WHEN v_avg_response <= 15 THEN 8
        WHEN v_avg_response <= 30 THEN 6
        WHEN v_avg_response <= 60 THEN 4
        WHEN v_avg_response <= 120 THEN 2
        ELSE 1 END, 1), 0), 10),
    'account_age_score', LEAST(ROUND((v_days_member / 730.0 * 5)::DECIMAL, 1), 5),
    -- Raw data for transparency
    'raw_avg_rating', ROUND(v_avg_rating, 2),
    'raw_completed_jobs', v_completed_jobs,
    'raw_total_jobs', v_total_jobs,
    'raw_verification_level', v_verif_level,
    'raw_avg_response_minutes', v_avg_response,
    'raw_days_member', v_days_member,
    -- Penalties
    'open_disputes', v_open_disputes,
    'recent_cancellations', v_recent_cancellations,
    'acceptance_rate', ROUND(v_acceptance_rate, 1)
  );

  RETURN result;
END;
$$ LANGUAGE plpgsql STABLE;

-- Compute final score from components (pure function, no DB access)
CREATE OR REPLACE FUNCTION calculate_trust_score_from_components(components JSONB)
RETURNS INT AS $$
DECLARE
  v_base DECIMAL;
  v_penalties DECIMAL;
BEGIN
  v_base := (components->>'reviews_score')::DECIMAL
          + (components->>'completion_rate_score')::DECIMAL
          + (components->>'verification_score')::DECIMAL
          + (components->>'response_time_score')::DECIMAL
          + (components->>'account_age_score')::DECIMAL;

  -- Penalties: -15 per open dispute
  v_penalties := COALESCE((components->>'open_disputes')::INT, 0) * 15
               + COALESCE((components->>'recent_cancellations')::INT, 0) * 5;

  RETURN GREATEST(0, LEAST(100, ROUND(v_base - v_penalties)));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================================
-- 8. QUEUE PROCESSOR (called by cron every 30s)
-- ============================================================================

CREATE OR REPLACE FUNCTION process_trust_score_queue()
RETURNS INT AS $$
DECLARE
  v_entry RECORD;
  v_components JSONB;
  v_new_score INT;
  v_old_score INT;
  v_old_components JSONB;
  v_count INT := 0;
BEGIN
  FOR v_entry IN
    SELECT q.* FROM trust_score_queue q
    WHERE q.processed = FALSE
    ORDER BY q.priority DESC, q.created_at ASC
    LIMIT 50
    FOR UPDATE SKIP LOCKED
  LOOP
    -- Get current values
    SELECT trust_score, trust_score_components
    INTO v_old_score, v_old_components
    FROM professional_profiles WHERE id = v_entry.professional_id;

    -- Calculate new
    v_components := calculate_trust_components(v_entry.professional_id);
    v_new_score := calculate_trust_score_from_components(v_components);

    -- Update profile
    UPDATE professional_profiles
    SET trust_score = v_new_score,
        trust_score_components = v_components,
        trust_score_updated_at = NOW()
    WHERE id = v_entry.professional_id;

    -- Log if changed
    IF v_new_score IS DISTINCT FROM v_old_score THEN
      INSERT INTO trust_score_log
        (professional_id, score_before, score_after, components_before, components_after, reason)
      VALUES (v_entry.professional_id, v_old_score, v_new_score, v_old_components, v_components, v_entry.event_type);
    END IF;

    -- Mark processed
    UPDATE trust_score_queue
    SET processed = TRUE, processed_at = NOW()
    WHERE id = v_entry.id;

    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 9. LIGHTWEIGHT TRIGGERS (only enqueue, never compute)
-- ============================================================================

CREATE OR REPLACE FUNCTION enqueue_trust_recalculation()
RETURNS TRIGGER AS $$
DECLARE
  v_pro_id UUID;
  v_event TEXT;
BEGIN
  v_event := CASE TG_TABLE_NAME
    WHEN 'reviews' THEN 'review_insert'
    WHEN 'jobs' THEN 'job_update'
    WHEN 'user_verifications' THEN 'verification_update'
    WHEN 'disputes' THEN 'dispute_update'
    ELSE 'job_update'
  END;

  -- Resolve professional_id
  v_pro_id := CASE TG_TABLE_NAME
    WHEN 'reviews' THEN
      COALESCE(NEW.professional_id, (SELECT professional_id FROM jobs WHERE id = NEW.job_id))
    WHEN 'jobs' THEN NEW.professional_id
    WHEN 'user_verifications' THEN
      (SELECT pp.id FROM professional_profiles pp WHERE pp.user_id = NEW.user_id LIMIT 1)
    WHEN 'disputes' THEN
      (SELECT j.professional_id FROM jobs j WHERE j.id = NEW.job_id)
    ELSE NULL
  END;

  IF v_pro_id IS NOT NULL THEN
    INSERT INTO trust_score_queue (professional_id, event_type)
    VALUES (v_pro_id, v_event);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_enqueue_review_trust
  AFTER INSERT ON reviews FOR EACH ROW EXECUTE FUNCTION enqueue_trust_recalculation();
CREATE TRIGGER trg_enqueue_job_trust
  AFTER UPDATE OF status ON jobs FOR EACH ROW EXECUTE FUNCTION enqueue_trust_recalculation();
CREATE TRIGGER trg_enqueue_verification_trust
  AFTER INSERT OR UPDATE OF status ON user_verifications
  FOR EACH ROW EXECUTE FUNCTION enqueue_trust_recalculation();
CREATE TRIGGER trg_enqueue_dispute_trust
  AFTER INSERT OR UPDATE OF status ON disputes
  FOR EACH ROW EXECUTE FUNCTION enqueue_trust_recalculation();

-- ============================================================================
-- 10. FUNCTION: update response time on message
-- ============================================================================

CREATE OR REPLACE FUNCTION update_response_time()
RETURNS TRIGGER AS $$
DECLARE
  v_pro_id UUID;
  v_first_response INTERVAL;
BEGIN
  -- Only track first response in a conversation
  IF TG_TABLE_NAME = 'messages' AND NEW.sender_id IN (
    SELECT user_id FROM professional_profiles
  ) THEN
    v_pro_id := (SELECT id FROM professional_profiles WHERE user_id = NEW.sender_id LIMIT 1);

    IF v_pro_id IS NOT NULL THEN
      -- Calculate time from first message in conversation to this response
      WITH first_msg AS (
        SELECT created_at FROM messages
        WHERE conversation_id = NEW.conversation_id
        ORDER BY created_at ASC LIMIT 1
      )
      SELECT EXTRACT(EPOCH FROM (NEW.created_at - fm.created_at)) / 60
      INTO v_first_response
      FROM first_msg fm;

      IF v_first_response IS NOT NULL AND v_first_response > 0 THEN
        UPDATE professional_profiles
        SET avg_response_time_minutes = (
          SELECT ROUND(AVG(sub.resp_min)::DECIMAL, 0)
          FROM (
            SELECT EXTRACT(EPOCH FROM (m.created_at - fm2.created_at)) / 60 AS resp_min
            FROM messages m
            CROSS JOIN LATERAL (
              SELECT created_at FROM messages
              WHERE conversation_id = m.conversation_id
              ORDER BY created_at ASC LIMIT 1
            ) fm2
            WHERE m.sender_id = NEW.sender_id
              AND m.created_at > fm2.created_at
            LIMIT 100
          ) sub
        )
        WHERE id = v_pro_id;

        INSERT INTO trust_score_queue (professional_id, event_type, priority)
        VALUES (v_pro_id, 'job_update', 1)
        ON CONFLICT DO NOTHING;
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_response_time
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION update_response_time();

-- ============================================================================
-- 11. FUNCTION: update availability based on idle time (called by cron)
-- ============================================================================

CREATE OR REPLACE FUNCTION auto_decay_availability()
RETURNS INT AS $$
DECLARE
  v_count INT;
BEGIN
  -- Mark as offline if no activity for 15 min and not on a job
  UPDATE professional_profiles
  SET availability_status = 'offline',
      availability_updated_at = NOW()
  WHERE availability_status = 'available'
    AND (last_active_at IS NULL OR last_active_at < NOW() - INTERVAL '15 minutes')
    AND id NOT IN (
      SELECT professional_id FROM jobs
      WHERE status IN ('accepted', 'en_route', 'in_progress')
    );

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 12. FUNCTION: auto-set busy when job is active
-- ============================================================================

CREATE OR REPLACE FUNCTION auto_set_busy_on_job()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IN ('accepted', 'en_route', 'in_progress') THEN
    UPDATE professional_profiles
    SET availability_status = 'busy',
        availability_updated_at = NOW()
    WHERE id = NEW.professional_id;
  ELSIF NEW.status IN ('completed', 'cancelled') THEN
    UPDATE professional_profiles
    SET availability_status = 'available',
        availability_updated_at = NOW()
    WHERE id = NEW.professional_id
      AND NOT EXISTS (
        SELECT 1 FROM jobs
        WHERE professional_id = NEW.professional_id
          AND status IN ('accepted', 'en_route', 'in_progress')
          AND id != NEW.id
      );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_auto_busy_on_job
  AFTER UPDATE OF status ON jobs
  FOR EACH ROW EXECUTE FUNCTION auto_set_busy_on_job();

-- ============================================================================
-- 13. RLS for new tables
-- ============================================================================

ALTER TABLE trust_score_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE trust_score_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_verifications ENABLE ROW LEVEL SECURITY;

-- Trust score: user sees own queue, admin sees all
CREATE POLICY "Users view own queue" ON trust_score_queue
  FOR SELECT USING (
    professional_id IN (
      SELECT id FROM professional_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins manage queue" ON trust_score_queue
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- Trust score log: read-only, user sees own, admin sees all
CREATE POLICY "Users view own logs" ON trust_score_log
  FOR SELECT USING (
    professional_id IN (
      SELECT id FROM professional_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins view all logs" ON trust_score_log
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- Gallery: public read, pro manages own
CREATE POLICY "Public view gallery" ON portfolio_gallery
  FOR SELECT USING (TRUE);

CREATE POLICY "Pros manage own gallery" ON portfolio_gallery
  FOR ALL USING (
    professional_id IN (
      SELECT id FROM professional_profiles WHERE user_id = auth.uid()
    )
  );

-- Verifications: user sees own, admin sees all
CREATE POLICY "Users view own verifications" ON user_verifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users create own verifications" ON user_verifications
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins manage verifications" ON user_verifications
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = TRUE)
  );
