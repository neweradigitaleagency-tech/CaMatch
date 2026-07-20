-- ============================================================================
-- CEA Phase 0 — Ticket 1.2: Fusion categories + product_categories
-- ============================================================================
-- Avant : categories (services), product_categories (fournisseur)
-- Après  : categories (table unique avec domain discriminator)
-- ============================================================================

-- 1. Ajouter domain et domaine à la table categories
ALTER TABLE categories ADD COLUMN IF NOT EXISTS domain TEXT NOT NULL DEFAULT 'service'
  CHECK (domain IN ('service', 'product', 'freelance'));
ALTER TABLE categories ADD COLUMN IF NOT EXISTS icon TEXT;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- 2. Index sur domain
CREATE INDEX IF NOT EXISTS idx_categories_domain ON categories(domain);

-- 3. Migrer les catégories produit si product_categories existe
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'product_categories') THEN
    INSERT INTO categories (name, slug, parent_id, sort_order, is_active, domain, icon, metadata, created_at, updated_at)
    SELECT
      name, slug, NULL, sort_order, is_active, 'product', NULL, '{}'::jsonb, created_at, updated_at
    FROM product_categories
    ON CONFLICT (slug) DO NOTHING;

    -- Migrer sous-catégories (besoin d'un mapping parent_id)
    INSERT INTO categories (name, slug, parent_id, sort_order, is_active, domain, icon, metadata, created_at, updated_at)
    SELECT
      pc.name, pc.slug,
      c.id AS parent_id,
      pc.sort_order, pc.is_active, 'product', NULL, '{}'::jsonb,
      pc.created_at, pc.updated_at
    FROM product_categories pc
    JOIN categories c ON c.slug = (SELECT slug FROM product_categories p WHERE p.id = pc.parent_id)
    WHERE pc.parent_id IS NOT NULL
    ON CONFLICT (slug) DO NOTHING;
  END IF;
END $$;

-- 4. Vue de rétrocompatibilité
CREATE OR REPLACE VIEW v_product_categories AS
SELECT * FROM categories WHERE domain = 'product';

-- ============================================================================
-- Mettre à jour les FKs pour pointer vers categories
-- ============================================================================
-- Noter : supplier_products.category_id pointe déjà vers product_categories.id
-- On ne peut pas changer la FK sans supprimer la contrainte.
-- Solution : la vue v_product_categories sert d'interface.
-- Phase 2 (après validation) : ALTER TABLE supplier_products DROP CONSTRAINT ...
--                                ALTER TABLE supplier_products ADD FOREIGN KEY (category_id) REFERENCES categories(id)
COMMENT ON TABLE product_categories IS 'DEPRECATED - use categories with domain=product instead';
