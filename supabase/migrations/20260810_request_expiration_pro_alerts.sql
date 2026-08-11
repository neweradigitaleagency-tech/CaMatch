-- Ça Match — Boucle 2 : persistance du flux client→pro
-- 1) Expiration des demandes (2 min, atomique côté lecture/acceptation)
-- 2) Politiques RLS alignées sur les catégories (TEXT[]) + expiration
-- Idempotent : fonctionne que la base soit déjà migrée par 20260708 ou non.

-- ============================================================================
-- 1. expires_at sur service_requests (défaut : maintenant + 2 minutes)
-- ============================================================================

ALTER TABLE service_requests
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '2 minutes');

CREATE INDEX IF NOT EXISTS idx_sr_pending_expiry
  ON service_requests(expires_at)
  WHERE status = 'pending';

-- ============================================================================
-- 2. Garantir le schéma catégories (TEXT[]) de façon idempotente
-- ============================================================================

-- service_requests : category TEXT → categories TEXT[]
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'service_requests' AND column_name = 'category'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'service_requests' AND column_name = 'categories'
  ) THEN
    ALTER TABLE service_requests RENAME COLUMN category TO categories;
    ALTER TABLE service_requests ALTER COLUMN categories SET DATA TYPE TEXT[] USING ARRAY[categories];
    ALTER TABLE service_requests ALTER COLUMN categories SET NOT NULL;
  END IF;
END $$;

-- sub_category → sub_categories (TEXT[])
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'service_requests' AND column_name = 'sub_category'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'service_requests' AND column_name = 'sub_categories'
  ) THEN
    ALTER TABLE service_requests RENAME COLUMN sub_category TO sub_categories;
    ALTER TABLE service_requests ALTER COLUMN sub_categories SET DATA TYPE TEXT[] USING ARRAY[sub_categories];
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_sr_categories ON service_requests USING GIN(categories);

-- professional_profiles : category TEXT → categories TEXT[]
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'professional_profiles' AND column_name = 'category'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'professional_profiles' AND column_name = 'categories'
  ) THEN
    ALTER TABLE professional_profiles RENAME COLUMN category TO categories;
    ALTER TABLE professional_profiles ALTER COLUMN categories SET DATA TYPE TEXT[] USING ARRAY[categories];
    ALTER TABLE professional_profiles ALTER COLUMN categories SET NOT NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_pro_categories ON professional_profiles USING GIN(categories);

-- ============================================================================
-- 3. RLS — Pros view matched requests (array overlap + expiration)
-- ============================================================================

DROP POLICY IF EXISTS "Pros view matched requests" ON service_requests;

CREATE POLICY "Pros view matched requests" ON service_requests
  FOR SELECT USING (
    professional_id = auth.uid()
    OR (
      professional_id IS NULL
      AND status IN ('pending', 'quoted')
      AND expires_at > NOW()
      AND categories && (
        SELECT pp.categories FROM professional_profiles pp WHERE pp.user_id = auth.uid()
      )
    )
  );

-- Acceptation atomique : un pro ne peut accepter qu'une demande visible,
-- encore en attente, non expirée, et non déjà prise. Une seule condition
-- garantit l'atomicité : la ligne mise à jour doit lui être assignée.
DROP POLICY IF EXISTS "Pros accept pending matched requests" ON service_requests;

CREATE POLICY "Pros accept pending matched requests" ON service_requests
  FOR UPDATE USING (
    professional_id IS NULL
    AND status IN ('pending', 'quoted')
    AND expires_at > NOW()
    AND categories && (
      SELECT pp.categories FROM professional_profiles pp WHERE pp.user_id = auth.uid()
    )
  )
  WITH CHECK (professional_id = auth.uid());

-- ============================================================================
-- 4. RLS — Pros view matched clients (prénom/nom des demandes visibles)
--    Le téléphone (users.phone_number) reste masqué jusqu'à l'acceptation :
--    la policy "Pros can view matched clients" de la table users exige
--    professional_id = auth.uid().
-- ============================================================================

DROP POLICY IF EXISTS "Pros view matched clients" ON client_profiles;

CREATE POLICY "Pros view matched clients" ON client_profiles
  FOR SELECT USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM service_requests sr
      WHERE sr.client_id = client_profiles.user_id
        AND (
          sr.professional_id = auth.uid()
          OR (
            sr.professional_id IS NULL
            AND sr.status IN ('pending', 'quoted')
            AND sr.expires_at > NOW()
            AND sr.categories && (
              SELECT pp.categories FROM professional_profiles pp WHERE pp.user_id = auth.uid()
            )
          )
        )
    )
  );
