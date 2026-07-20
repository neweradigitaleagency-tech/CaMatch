-- ============================================================================
-- Phase 1B — Ticket 1B.4: XP Transactions (persistence DB)
-- ============================================================================
-- Migre le système XP du localStorage vers la base de données.
-- Le localStorage reste utilisé comme fallback (mode démo).
-- ============================================================================

-- 1. Table des transactions XP
CREATE TABLE IF NOT EXISTS xp_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'mission_completed', 'review_5star', 'quick_response', 'on_time',
    'returning_client', 'urgent_mission', 'profile_100', 'identity_verified',
    'portfolio_uploaded', 'streak_10_no_cancellation', 'badge_earned',
    'late_cancellation', 'significant_delay', 'bad_review', 'reported'
  )),
  xp INT NOT NULL,
  label TEXT NOT NULL,
  mission_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_xp_user ON xp_transactions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_xp_event ON xp_transactions(event_type);

-- 2. RLS
ALTER TABLE xp_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own XP" ON xp_transactions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System insert XP" ON xp_transactions
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- 3. Fonction pour ajouter XP
CREATE OR REPLACE FUNCTION add_xp(
  p_user_id UUID,
  p_event_type TEXT,
  p_mission_id UUID DEFAULT NULL
) RETURNS INT AS $$
DECLARE
  v_xp INT;
  v_label TEXT;
  v_cfg RECORD;
BEGIN
  SELECT xp, label INTO v_xp, v_label
  FROM (VALUES
    ('mission_completed', 100, 'Mission terminée'),
    ('review_5star', 30, 'Avis 5★'),
    ('quick_response', 10, 'Réponse rapide'),
    ('on_time', 15, 'Arrivé à l''heure'),
    ('returning_client', 20, 'Client récurrent'),
    ('urgent_mission', 25, 'Mission urgente'),
    ('profile_100', 150, 'Profil complété'),
    ('identity_verified', 200, 'Identité vérifiée'),
    ('portfolio_uploaded', 80, 'Portfolio uploadé'),
    ('streak_10_no_cancellation', 100, '10 missions sans annulation'),
    ('badge_earned', 50, 'Badge obtenu'),
    ('late_cancellation', -50, 'Annulation tardive'),
    ('significant_delay', -20, 'Retard important'),
    ('bad_review', -30, 'Mauvaise note'),
    ('reported', -100, 'Signalement')
  ) AS t(type, xp, label)
  WHERE t.type = p_event_type;

  IF v_xp IS NULL THEN
    RETURN 0;
  END IF;

  INSERT INTO xp_transactions (user_id, event_type, xp, label, mission_id)
  VALUES (p_user_id, p_event_type, v_xp, v_label, p_mission_id);

  RETURN v_xp;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Fonction pour récupérer le XP total
CREATE OR REPLACE FUNCTION get_total_xp(p_user_id UUID)
RETURNS INT AS $$
BEGIN
  RETURN COALESCE(
    (SELECT SUM(xp) FROM xp_transactions WHERE user_id = p_user_id),
    0
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- 5. Fonction pour récupérer le niveau pro
CREATE OR REPLACE FUNCTION get_pro_level_from_xp(p_xp INT)
RETURNS JSONB AS $$
BEGIN
  RETURN CASE
    WHEN p_xp >= 35000 THEN '{"level":"légende","commission":3,"emoji":"🏆","color":"text-yellow-400"}'::JSONB
    WHEN p_xp >= 19000 THEN '{"level":"master","commission":5,"emoji":"👑","color":"text-amber-500"}'::JSONB
    WHEN p_xp >= 9000 THEN '{"level":"élite","commission":7,"emoji":"💎","color":"text-purple-500"}'::JSONB
    WHEN p_xp >= 4000 THEN '{"level":"expert","commission":9,"emoji":"⭐","color":"text-blue-500"}'::JSONB
    WHEN p_xp >= 1500 THEN '{"level":"professionnel","commission":11,"emoji":"🛠","color":"text-cm-accent"}'::JSONB
    WHEN p_xp >= 500 THEN '{"level":"apprenti","commission":13,"emoji":"🔨","color":"text-yellow-600"}'::JSONB
    ELSE '{"level":"débutant","commission":15,"emoji":"🌱","color":"text-gray-500"}'::JSONB
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
