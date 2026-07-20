-- ============================================================================
-- Phase 1A — Ticket 1A.1: Full-Text Search sur supplier_products
-- ============================================================================
-- Ajoute un index FTS (tsvector) sur les colonnes texte des produits
-- pour permettre des recherches par pertinence (stemming français,
-- ranking, highlight) via la fonction search_all() unifiée.
-- ============================================================================

-- 1. Ajouter la colonne fts générée
ALTER TABLE supplier_products ADD COLUMN IF NOT EXISTS fts tsvector
  GENERATED ALWAYS AS (
    to_tsvector('french',
      coalesce(name, '') || ' ' ||
      coalesce(description, '') || ' ' ||
      coalesce(brand, '') || ' ' ||
      coalesce(manufacturer_reference, '')
    )
  ) STORED;

-- 2. Index GIN pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_sp_fts ON supplier_products USING GIN(fts);

-- 3. Index trigram pour la recherche floue (typos, accents)
CREATE INDEX IF NOT EXISTS idx_sp_name_trgm ON supplier_products USING GIN (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_sp_brand_trgm ON supplier_products USING GIN (brand gin_trgm_ops);
