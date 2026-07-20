-- ============================================================================
-- Phase 1A — Ticket 1A.2: Fonction DB search_all() unifiée
-- ============================================================================
-- Moteur de recherche transverse unique qui interroge profils (pros),
-- produits (fournisseurs) dans une même requête avec score de pertinence,
-- tri par distance optionnel et support de la recherche à vide (top-items).
-- ============================================================================

-- 1. Améliorer le FTS de profiles pour inclure plus de champs textes
DROP INDEX IF EXISTS idx_profiles_fts;
ALTER TABLE profiles DROP COLUMN IF EXISTS fts;
ALTER TABLE profiles ADD COLUMN fts tsvector
  GENERATED ALWAYS AS (
    to_tsvector('french',
      coalesce(display_name, '') || ' ' ||
      coalesce(data->>'bio', '') || ' ' ||
      coalesce(city, '') || ' ' ||
      coalesce(data->>'company_name', '') || ' ' ||
      coalesce(data->>'business_name', '')
    )
  ) STORED;
CREATE INDEX IF NOT EXISTS idx_profiles_fts ON profiles USING GIN(fts);

-- 2. Fonction de recherche unifiée
CREATE OR REPLACE FUNCTION search_all(
  search_query TEXT DEFAULT '',
  user_lat DOUBLE PRECISION DEFAULT NULL,
  user_lng DOUBLE PRECISION DEFAULT NULL,
  result_limit INT DEFAULT 20
) RETURNS TABLE (
  result_type TEXT,
  id UUID,
  title TEXT,
  description TEXT,
  category TEXT,
  price INT,
  rating DECIMAL,
  image_url TEXT,
  location_city TEXT,
  distance_km DOUBLE PRECISION,
  relevance_score DOUBLE PRECISION
) LANGUAGE plpgsql STABLE AS $$
DECLARE
  query_tsquery tsquery;
  empty_search BOOLEAN;
BEGIN
  empty_search := search_query IS NULL OR trim(search_query) = '';

  IF empty_search THEN
    query_tsquery := plainto_tsquery('french', '');
  ELSE
    query_tsquery := plainto_tsquery('french', search_query);
    -- Fallback trigram si FTS ne trouve rien : on garde la requête
    IF query_tsquery IS NULL THEN
      query_tsquery := plainto_tsquery('french', regexp_replace(search_query, '[^\w\s]', '', 'g'));
    END IF;
  END IF;

  RETURN QUERY
  WITH results AS (
    -- Professionals (via profiles table unifiée)
    SELECT
      'professional'::TEXT AS result_type,
      p.user_id AS id,
      p.display_name AS title,
      p.data->>'bio' AS description,
      p.data->>'categories' AS category,
      COALESCE((p.data->>'hourly_rate')::INT, 0) AS price,
      p.rating,
      p.avatar_url AS image_url,
      p.city AS location_city,
      CASE WHEN user_lat IS NOT NULL AND user_lng IS NOT NULL AND p.location IS NOT NULL THEN
        ROUND((ST_Distance(p.location::geography, ST_MakePoint(user_lng, user_lat)::geography) / 1000)::numeric, 1)
      ELSE NULL::numeric
      END::DOUBLE PRECISION AS distance_km,
      CASE
        WHEN empty_search THEN p.rating::DOUBLE PRECISION * 20
        WHEN p.fts IS NOT NULL AND query_tsquery IS NOT NULL THEN
          (ts_rank(p.fts, query_tsquery, 32) * 100)::DOUBLE PRECISION
        ELSE 0::DOUBLE PRECISION
      END AS relevance_score
    FROM profiles p
    WHERE p.profile_type = 'professional'
      AND p.is_active = TRUE
      AND (empty_search OR (p.fts IS NOT NULL AND p.fts @@ query_tsquery))

    UNION ALL

    -- Products (via supplier_products)
    SELECT
      'product'::TEXT,
      sp.id,
      sp.name,
      sp.description,
      pc.name,
      COALESCE(sp.recommended_price, sp.supplier_price, 0),
      0::DECIMAL,
      COALESCE(sp.images[1], ''),
      s.city,
      NULL::DOUBLE PRECISION,
      CASE
        WHEN empty_search THEN 0.5
        WHEN sp.fts IS NOT NULL AND query_tsquery IS NOT NULL THEN
          (ts_rank(sp.fts, query_tsquery, 32) * 100)::DOUBLE PRECISION
        ELSE 0::DOUBLE PRECISION
      END
    FROM supplier_products sp
    LEFT JOIN product_categories pc ON sp.category_id = pc.id
    LEFT JOIN profiles s ON s.user_id = sp.supplier_id AND s.profile_type = 'supplier'
    WHERE sp.is_visible = TRUE
      AND (empty_search OR (sp.fts IS NOT NULL AND sp.fts @@ query_tsquery))

    UNION ALL

    -- Suppliers (en tant que "boutiques")
    SELECT
      'supplier'::TEXT,
      p.user_id,
      p.display_name,
      jsonb_pretty(jsonb_build_object(
        'total_products', p.data->>'total_products',
        'total_orders', p.data->>'total_orders'
      )),
      NULL::TEXT,
      0,
      p.rating,
      p.data->>'logo_url',
      p.city,
      NULL::DOUBLE PRECISION,
      CASE
        WHEN empty_search THEN p.rating::DOUBLE PRECISION * 20
        WHEN p.fts IS NOT NULL AND query_tsquery IS NOT NULL THEN
          (ts_rank(p.fts, query_tsquery, 32) * 100)::DOUBLE PRECISION
        ELSE 0::DOUBLE PRECISION
      END
    FROM profiles p
    WHERE p.profile_type = 'supplier'
      AND p.is_active = TRUE
      AND (empty_search OR (p.fts IS NOT NULL AND p.fts @@ query_tsquery))
  )
  SELECT * FROM results
  ORDER BY relevance_score DESC, rating DESC
  LIMIT result_limit;
END;
$$;

-- 3. Helper RPC pour la recherche rapide (autocomplete)
CREATE OR REPLACE FUNCTION search_suggest(query_text TEXT, max_results INT DEFAULT 5)
RETURNS TABLE (
  suggestion TEXT,
  result_type TEXT,
  score DOUBLE PRECISION
) LANGUAGE plpgsql STABLE AS $$
BEGIN
  RETURN QUERY
  -- Noms de pros
  SELECT
    p.display_name::TEXT,
    'professional'::TEXT,
    similarity(p.display_name, query_text)::DOUBLE PRECISION
  FROM profiles p
  WHERE p.profile_type = 'professional'
    AND p.is_active = TRUE
    AND p.display_name % query_text
  ORDER BY similarity(p.display_name, query_text) DESC
  LIMIT max_results

  UNION ALL

  -- Noms de produits
  SELECT
    sp.name::TEXT,
    'product'::TEXT,
    similarity(sp.name, query_text)::DOUBLE PRECISION
  FROM supplier_products sp
  WHERE sp.is_visible = TRUE
    AND sp.name % query_text
  ORDER BY similarity(sp.name, query_text) DESC
  LIMIT max_results

  UNION ALL

  -- Noms de suppliers
  SELECT
    p.display_name::TEXT,
    'supplier'::TEXT,
    similarity(p.display_name, query_text)::DOUBLE PRECISION
  FROM profiles p
  WHERE p.profile_type = 'supplier'
    AND p.is_active = TRUE
    AND p.display_name % query_text
  ORDER BY similarity(p.display_name, query_text) DESC
  LIMIT max_results

  ORDER BY score DESC
  LIMIT max_results;
END;
$$;

-- 4. Activer pg_trgm si pas déjà fait
CREATE EXTENSION IF NOT EXISTS pg_trgm;
