-- ============================================================================
-- Phase 1B — Ticket 1B.1: Scores de confiance spécialisés (format Admin)
-- ============================================================================
-- Aligne les 5 composantes SQL historiques sur le modèle attendu par
-- l'interface Admin : KYC, Activité, Fiabilité paiement, Fraude, Overall.
-- Étend la queue de recalcul et stocke le résultat unifié dans
-- profiles.data->'trust_scores'.
-- ============================================================================

-- 1. Ajouter les nouveaux event_type à trust_score_queue
ALTER TABLE trust_score_queue DROP CONSTRAINT IF EXISTS trust_score_queue_event_type_check;
ALTER TABLE trust_score_queue ADD CONSTRAINT trust_score_queue_event_type_check
  CHECK (event_type IN (
    'review_insert', 'job_update', 'verification_update',
    'dispute_update', 'availability_change',
    'payment_event', 'fraud_alert', 'kyc_update', 'activity_update'
  ));

-- ============================================================================
-- 2. Fonctions de calcul des scores spécialisés
-- ============================================================================

-- KYC Score (0-100) : basé sur les documents vérifiés et le niveau max
CREATE OR REPLACE FUNCTION calculate_kyc_score(p_user_id UUID)
RETURNS INT AS $$
DECLARE
  v_max_level INT;
  v_approved_count INT;
  v_fast_verification BOOLEAN;
BEGIN
  -- Niveau de vérification max approuvé
  SELECT COALESCE(MAX(level), 0) INTO v_max_level
  FROM user_verifications
  WHERE user_id = p_user_id AND status = 'approved';

  -- Nombre de documents vérifiés
  SELECT COUNT(*) INTO v_approved_count
  FROM user_verifications
  WHERE user_id = p_user_id AND status = 'approved';

  -- Vérification rapide (dans les 7 jours)
  SELECT EXISTS (
    SELECT 1 FROM user_verifications
    WHERE user_id = p_user_id
      AND status = 'approved'
      AND updated_at - created_at < INTERVAL '7 days'
  ) INTO v_fast_verification;

  RETURN LEAST(
    GREATEST(
      v_max_level * 20
      + CASE WHEN v_approved_count >= 2 THEN 10 ELSE 0 END
      + CASE WHEN v_fast_verification THEN 10 ELSE 0 END,
      0
    ),
    100
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- Activity Score (0-100) : missions, réactivité, régularité
CREATE OR REPLACE FUNCTION calculate_activity_score(p_user_id UUID)
RETURNS INT AS $$
DECLARE
  v_total_jobs INT;
  v_response_time INT;
  v_last_active INTERVAL;
  v_acceptance_rate DECIMAL;
  v_reviews_avg DECIMAL;
  v_score INT := 0;
BEGIN
  -- Depuis profiles table unifiée (tous types)
  SELECT
    COALESCE(total_jobs, 0),
    COALESCE((data->>'avg_response_time_minutes')::INT, 999),
    COALESCE((data->>'last_active_at')::TIMESTAMPTZ, created_at),
    COALESCE((data->>'job_acceptance_rate')::DECIMAL, 100),
    rating
  INTO v_total_jobs, v_response_time, v_last_active, v_acceptance_rate, v_reviews_avg
  FROM profiles
  WHERE user_id = p_user_id;

  -- Nombre de missions (max 30 pts)
  v_score := v_score + LEAST(v_total_jobs * 3, 30);

  -- Temps de réponse (max 25 pts)
  v_score := v_score + CASE
    WHEN v_response_time <= 5 THEN 25
    WHEN v_response_time <= 15 THEN 20
    WHEN v_response_time <= 30 THEN 15
    WHEN v_response_time <= 60 THEN 10
    WHEN v_response_time <= 120 THEN 5
    ELSE 2
  END;

  -- Dernière activité (max 20 pts)
  IF v_last_active IS NOT NULL THEN
    v_score := v_score + CASE
      WHEN v_last_active >= NOW() - INTERVAL '1 hour' THEN 20
      WHEN v_last_active >= NOW() - INTERVAL '1 day' THEN 15
      WHEN v_last_active >= NOW() - INTERVAL '3 days' THEN 10
      WHEN v_last_active >= NOW() - INTERVAL '7 days' THEN 5
      ELSE 0
    END;
  END IF;

  -- Taux d'acceptation (max 25 pts)
  v_score := v_score + LEAST(GREATEST(ROUND(v_acceptance_rate * 0.25)::INT, 0), 25);

  RETURN LEAST(GREATEST(v_score, 0), 100);
END;
$$ LANGUAGE plpgsql STABLE;

-- Payment Reliability Score (0-100) : paiements, litiges, historique
CREATE OR REPLACE FUNCTION calculate_payment_reliability_score(p_user_id UUID)
RETURNS INT AS $$
DECLARE
  v_total_payments INT;
  v_completed_payments INT;
  v_disputes_as_client INT;
  v_disputes_as_pro INT;
  v_on_time_payments INT;
  v_score INT := 50; -- start neutral
BEGIN
  -- Paiements effectués en tant que client
  SELECT COUNT(*), COUNT(*) FILTER (WHERE status = 'completed')
  INTO v_total_payments, v_completed_payments
  FROM payment_intents
  WHERE payer_id = p_user_id;

  -- Litiges
  SELECT COUNT(*) INTO v_disputes_as_client
  FROM disputes d
  JOIN jobs j ON d.job_id = j.id
  WHERE j.client_id = p_user_id AND d.status NOT IN ('resolved', 'closed');

  -- Litiges en tant que pro (via ses missions)
  SELECT COUNT(*) INTO v_disputes_as_pro
  FROM disputes d
  JOIN jobs j ON d.job_id = j.id
  WHERE j.professional_id = p_user_id AND d.status NOT IN ('resolved', 'closed');

  -- Paiements complétés sans litige (proxy: on-time)
  SELECT COUNT(*) INTO v_on_time_payments
  FROM payment_intents
  WHERE payer_id = p_user_id
    AND status = 'completed'
    AND created_at > NOW() - INTERVAL '90 days';

  -- Score
  IF v_total_payments > 0 THEN
    v_score := ROUND((v_completed_payments::DECIMAL / v_total_payments) * 60)::INT;
  END IF;

  -- Bonus paiements ponctuels récents
  v_score := v_score + LEAST(v_on_time_payments * 5, 20);

  -- Pénalité litiges
  v_score := v_score - (v_disputes_as_client + v_disputes_as_pro) * 15;

  RETURN LEAST(GREATEST(v_score, 0), 100);
END;
$$ LANGUAGE plpgsql STABLE;

-- Fraud Score (0-100) : INVERTED — 0 = clean, 100 = high risk
CREATE OR REPLACE FUNCTION calculate_fraud_score(p_user_id UUID)
RETURNS INT AS $$
DECLARE
  v_fraud_alerts INT;
  v_cancellations_30d INT;
  v_rapid_cancellations INT;
  v_reports INT;
  v_max_fraud_score INT;
  v_score INT := 0;
BEGIN
  -- Alertes fraude actives
  SELECT COUNT(*), COALESCE(MAX(score), 0)
  INTO v_fraud_alerts, v_max_fraud_score
  FROM fraud_alerts
  WHERE target_id = p_user_id
    AND status IN ('pending', 'investigating');

  -- Annulations récentes (30 jours)
  SELECT COUNT(*) INTO v_cancellations_30d
  FROM jobs
  WHERE professional_id = p_user_id
    AND status = 'cancelled'
    AND updated_at > NOW() - INTERVAL '30 days';

  -- Annulations rapides (< 1h après acceptation)
  SELECT COUNT(*) INTO v_rapid_cancellations
  FROM jobs
  WHERE professional_id = p_user_id
    AND status = 'cancelled'
    AND updated_at - created_at < INTERVAL '1 hour';

  -- Signalements (disputes où le user est impliqué)
  SELECT COUNT(*) INTO v_reports
  FROM disputes
  WHERE raiser_id = p_user_id
    AND status IN ('open', 'investigating');

  v_score :=
    LEAST(v_fraud_alerts * 20, 40)      -- max 40 from alerts
    + LEAST(v_cancellations_30d * 5, 20) -- max 20 from cancellations
    + LEAST(v_rapid_cancellations * 10, 20) -- max 20 from rapid cancels
    + LEAST(v_reports * 5, 20);          -- max 20 from reports

  RETURN LEAST(v_score, 100);
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- 3. Fonction unifiée : calcule les 5 scores au format Admin
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_unified_trust_scores(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_kyc INT;
  v_activity INT;
  v_payment INT;
  v_fraud INT;
  v_overall INT;
  v_trust_components JSONB;
  v_old_overall INT;
BEGIN
  v_kyc := calculate_kyc_score(p_user_id);
  v_activity := calculate_activity_score(p_user_id);
  v_payment := calculate_payment_reliability_score(p_user_id);
  v_fraud := calculate_fraud_score(p_user_id);

  -- Overall = weighted average (fraud est inversé)
  v_overall := ROUND(
    v_kyc * 0.25
    + v_activity * 0.25
    + v_payment * 0.30
    + (100 - v_fraud) * 0.20
  )::INT;

  -- Récupérer les composantes historiques si elles existent (rétrocompatibilité)
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
    -- Garder les composantes historiques pour rétrocompatibilité
    'legacy_components', COALESCE(v_trust_components, '{}'::JSONB)
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- 4. Met à jour le processeur de queue pour utiliser le nouveau format
-- ============================================================================

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
    -- Anciennes composantes (rétrocompatibilité)
    v_old_data := calculate_trust_components(v_entry.professional_id);

    -- Nouvelles composantes unifiées
    v_unified_scores := calculate_unified_trust_scores(v_entry.puid);

    -- Mettre à jour professional_profiles (ancien système)
    UPDATE professional_profiles
    SET trust_score = (v_unified_scores->>'overall')::INT,
        trust_score_components = v_old_data,
        trust_score_updated_at = NOW()
    WHERE id = v_entry.professional_id;

    -- Mettre à jour profiles (nouveau système unifié)
    UPDATE profiles
    SET data = jsonb_set(
      COALESCE(data, '{}'),
      '{trust_scores}',
      v_unified_scores
    )
    WHERE user_id = v_entry.puid AND profile_type = 'professional';

    -- Log
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
-- 5. Trigger helper : enqueue pour tous les types de profil
-- ============================================================================

CREATE OR REPLACE FUNCTION enqueue_trust_recalculation_v2()
RETURNS TRIGGER AS $$
DECLARE
  v_pro_id UUID;
  v_event TEXT;
  v_profile_type TEXT;
  v_target_user_id UUID;
BEGIN
  v_event := CASE TG_TABLE_NAME
    WHEN 'reviews' THEN 'review_insert'
    WHEN 'jobs' THEN 'job_update'
    WHEN 'user_verifications' THEN 'kyc_update'
    WHEN 'disputes' THEN 'dispute_update'
    WHEN 'payment_intents' THEN 'payment_event'
    WHEN 'fraud_alerts' THEN 'fraud_alert'
    ELSE 'job_update'
  END;

  -- Résoudre l'ID du professionnel (rétrocompatibilité trust_score_queue)
  v_pro_id := CASE TG_TABLE_NAME
    WHEN 'reviews' THEN
      COALESCE(NEW.professional_id, (SELECT professional_id FROM jobs WHERE id = NEW.job_id))
    WHEN 'jobs' THEN NEW.professional_id
    WHEN 'user_verifications' THEN
      (SELECT pp.id FROM professional_profiles pp WHERE pp.user_id = NEW.user_id LIMIT 1)
    WHEN 'disputes' THEN
      (SELECT j.professional_id FROM jobs j WHERE j.id = NEW.job_id)
    WHEN 'payment_intents' THEN
      (SELECT pp.id FROM professional_profiles pp WHERE pp.user_id = NEW.payer_id LIMIT 1)
    WHEN 'fraud_alerts' THEN
      (SELECT pp.id FROM professional_profiles pp WHERE pp.user_id = NEW.target_id LIMIT 1)
    ELSE NULL
  END;

  -- Résoudre l'user_id pour les profils unifiés
  v_target_user_id := CASE TG_TABLE_NAME
    WHEN 'reviews' THEN (SELECT professional_id FROM jobs WHERE id = NEW.job_id)
    WHEN 'jobs' THEN NEW.professional_id
    WHEN 'user_verifications' THEN NEW.user_id
    WHEN 'disputes' THEN (SELECT j.professional_id FROM jobs j WHERE j.id = NEW.job_id)
    WHEN 'payment_intents' THEN NEW.payer_id
    WHEN 'fraud_alerts' THEN NEW.target_id
    ELSE NULL
  END;

  -- Enqueue si on a un professional_id (ancien système)
  IF v_pro_id IS NOT NULL THEN
    INSERT INTO trust_score_queue (professional_id, event_type)
    VALUES (v_pro_id, v_event)
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Nouveaux triggers pour les events supplémentaires
DROP TRIGGER IF EXISTS trg_enqueue_payment_trust ON payment_intents;
CREATE TRIGGER trg_enqueue_payment_trust
  AFTER INSERT OR UPDATE OF status ON payment_intents
  FOR EACH ROW EXECUTE FUNCTION enqueue_trust_recalculation_v2();

DROP TRIGGER IF EXISTS trg_enqueue_fraud_trust ON fraud_alerts;
CREATE TRIGGER trg_enqueue_fraud_trust
  AFTER INSERT OR UPDATE OF status ON fraud_alerts
  FOR EACH ROW EXECUTE FUNCTION enqueue_trust_recalculation_v2();

-- ============================================================================
-- 6. Fonction RPC pour le frontend
-- ============================================================================

CREATE OR REPLACE FUNCTION get_trust_scores(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql STABLE
AS $$
DECLARE
  v_scores JSONB;
BEGIN
  -- Chercher dans profiles.data->trust_scores d'abord (déjà calculé)
  SELECT data->'trust_scores' INTO v_scores
  FROM profiles
  WHERE user_id = p_user_id
    AND profile_type IN ('professional', 'supplier', 'client');

  -- Si pas trouvé ou obsolète, calculer à la volée
  IF v_scores IS NULL OR (v_scores->>'last_assessed')::TIMESTAMPTZ < NOW() - INTERVAL '1 hour' THEN
    v_scores := calculate_unified_trust_scores(p_user_id);

    -- Cache le résultat
    UPDATE profiles
    SET data = jsonb_set(COALESCE(data, '{}'), '{trust_scores}', v_scores)
    WHERE user_id = p_user_id AND profile_type IN ('professional', 'supplier', 'client');
  END IF;

  RETURN v_scores;
END;
$$;
