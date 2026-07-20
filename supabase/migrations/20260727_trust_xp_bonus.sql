-- ============================================================================
-- Phase 1B — Ticket 1B.4: XP bonus dans le score de confiance
-- ============================================================================
-- Le niveau XP donne un bonus au score overall :
--   Expert (≥4000)  : +5
--   Élite  (≥9000)  : +10
--   Master (≥19000) : +15
--   Légende(≥35000) : +20
-- ============================================================================

-- 1. Fonction pour calculer le bonus XP
CREATE OR REPLACE FUNCTION xp_trust_bonus(p_xp INT)
RETURNS INT AS $$
BEGIN
  RETURN CASE
    WHEN p_xp >= 35000 THEN 20
    WHEN p_xp >= 19000 THEN 15
    WHEN p_xp >= 9000 THEN 10
    WHEN p_xp >= 4000 THEN 5
    ELSE 0
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 2. Mettre à jour le calcul overall dans calculate_unified_trust_scores
CREATE OR REPLACE FUNCTION calculate_unified_trust_scores(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_kyc INT;
  v_activity INT;
  v_payment INT;
  v_fraud INT;
  v_overall INT;
  v_xp INT;
  v_xp_bonus INT;
  v_trust_components JSONB;
BEGIN
  v_kyc := calculate_kyc_score(p_user_id);
  v_activity := calculate_activity_score(p_user_id);
  v_payment := calculate_payment_reliability_score(p_user_id);
  v_fraud := calculate_fraud_score(p_user_id);

  -- XP bonus
  v_xp := COALESCE(get_total_xp(p_user_id), 0);
  v_xp_bonus := xp_trust_bonus(v_xp);

  -- Overall = weighted average + XP bonus (fraud est inversé)
  v_overall := ROUND(
    v_kyc * 0.25
    + v_activity * 0.25
    + v_payment * 0.30
    + (100 - v_fraud) * 0.20
  )::INT + v_xp_bonus;

  -- Récupérer les composantes historiques si elles existent
  SELECT data->'trust_score_components' INTO v_trust_components
  FROM profiles WHERE user_id = p_user_id AND profile_type = 'professional';

  RETURN jsonb_build_object(
    'overall', GREATEST(LEAST(v_overall, 100), 0),
    'kyc', GREATEST(LEAST(v_kyc, 100), 0),
    'activity', GREATEST(LEAST(v_activity, 100), 0),
    'payment_reliability', GREATEST(LEAST(v_payment, 100), 0),
    'fraud_score', GREATEST(LEAST(v_fraud, 100), 0),
    'fraud_flags', (SELECT COUNT(*) FROM fraud_alerts WHERE target_id = p_user_id AND status IN ('pending', 'investigating')),
    'last_assessed', NOW()::TEXT,
    'xp_bonus', v_xp_bonus,
    'total_xp', v_xp,
    'legacy_components', COALESCE(v_trust_components, '{}'::JSONB)
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- 3. Ajouter les champs xp_bonus et total_xp à l'interface
-- Déjà inclus dans le JSON ci-dessus — MAJ du processeur v2
CREATE OR REPLACE FUNCTION process_trust_score_queue_v2()
RETURNS INT AS $$
DECLARE
  v_entry RECORD;
  v_unified_scores JSONB;
  v_old_data JSONB;
  v_count INT := 0;
BEGIN
  FOR v_entry IN
    SELECT q.*, p.user_id AS puid
    FROM trust_score_queue q
    JOIN professional_profiles pp ON pp.id = q.professional_id
    JOIN profiles p ON p.user_id = pp.user_id AND p.profile_type = 'professional'
    WHERE q.processed = FALSE
    ORDER BY q.priority DESC, q.created_at ASC
    LIMIT 50
    FOR UPDATE SKIP LOCKED
  LOOP
    v_old_data := calculate_trust_components(v_entry.professional_id);
    v_unified_scores := calculate_unified_trust_scores(v_entry.puid);

    UPDATE professional_profiles
    SET trust_score = (v_unified_scores->>'overall')::INT,
        trust_score_components = v_old_data,
        trust_score_updated_at = NOW()
    WHERE id = v_entry.professional_id;

    UPDATE profiles
    SET data = jsonb_set(
      COALESCE(data, '{}'),
      '{trust_scores}',
      v_unified_scores
    )
    WHERE user_id = v_entry.puid AND profile_type = 'professional';

    INSERT INTO trust_score_log
      (professional_id, score_before, score_after, components_before, components_after, reason)
    VALUES (
      v_entry.professional_id,
      COALESCE((SELECT trust_score FROM professional_profiles WHERE id = v_entry.professional_id), 0),
      (v_unified_scores->>'overall')::INT,
      v_old_data,
      v_unified_scores,
      v_entry.event_type || '_v2'
    );

    UPDATE trust_score_queue
    SET processed = TRUE, processed_at = NOW()
    WHERE id = v_entry.id;

    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
