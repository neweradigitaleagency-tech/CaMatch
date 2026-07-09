-- Ça Match — Align DB categories with the 6 app service categories
-- Run after all previous migrations

-- ============================================================================
-- 1. professional_profiles: drop old CHECK, rename category → categories
-- ============================================================================

ALTER TABLE professional_profiles DROP CONSTRAINT IF EXISTS professional_profiles_category_check;

-- For existing rows, migrate single category value into the first element of the categories array
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'professional_profiles' AND column_name = 'category'
  ) THEN
    ALTER TABLE professional_profiles RENAME COLUMN category TO categories;
    ALTER TABLE professional_profiles ALTER COLUMN categories SET DATA TYPE TEXT[] USING ARRAY[categories];
  END IF;
END $$;

-- Add GIN index for array containment queries
CREATE INDEX IF NOT EXISTS idx_pro_categories ON professional_profiles USING GIN(categories);

-- Update the full-text search to include categories
-- (already includes business_name, first_name, last_name, bio)

-- ============================================================================
-- 2. service_requests: drop old CHECK, rename category → categories
-- ============================================================================

ALTER TABLE service_requests DROP CONSTRAINT IF EXISTS service_requests_category_check;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'service_requests' AND column_name = 'category'
  ) THEN
    ALTER TABLE service_requests RENAME COLUMN category TO categories;
    ALTER TABLE service_requests ALTER COLUMN categories SET DATA TYPE TEXT[] USING ARRAY[categories];
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_sr_categories ON service_requests USING GIN(categories);

-- Also rename sub_category → sub_categories for consistency
ALTER TABLE service_requests RENAME COLUMN sub_category TO sub_categories;
ALTER TABLE service_requests ALTER COLUMN sub_categories SET DATA TYPE TEXT[] USING ARRAY[sub_categories];

-- ============================================================================
-- 3. Seed the categories table with the 6 real categories + subcategories
-- ============================================================================

-- First, clear old seed data (the 8 old trades from admin_v2 migration)
DELETE FROM categories WHERE slug IN (
  'electricite', 'plomberie', 'climatisation', 'nettoyage',
  'peinture', 'jardinage', 'menuiserie', 'transport'
);

-- Insert the 6 parent categories (idempotent)
INSERT INTO categories (slug, name, description, icon, color, sort_order, is_active) VALUES
  ('maison-reparations', 'Maison & Réparations', 'Plomberie, électricité, maçonnerie, peinture et autres travaux domestiques', '🏠', '#2d6a4f', 1, true),
  ('transport-livraison', 'Transport & Livraison', 'Chauffeur privé, coursier, déménagement et transport de marchandises', '🚗', '#f4a261', 2, true),
  ('evenements', 'Événements', 'DJ, photographe, traiteur, décoration et animation pour tous vos événements', '🎉', '#457b9d', 3, true),
  ('education-formation', 'Éducation & Formation', 'Répétiteur, informatique, langues et préparation aux concours', '📚', '#52b788', 4, true),
  ('social-media-informatique', 'Social media & Informatique', 'Développement web/mobile, design, community management et marketing digital', '💻', '#457b9d', 5, true),
  ('assistance-services', 'Assistance & Services Quotidiens', 'Femme de ménage, baby-sitter, garde-malade, assistant personnel et courses', '🤝', '#f4a261', 6, true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color,
  sort_order = EXCLUDED.sort_order;

-- Insert subcategories (as children with parent_id reference)
DO $$
DECLARE
  parent_id UUID;
BEGIN
  -- Maison & Réparations
  SELECT id INTO parent_id FROM categories WHERE slug = 'maison-reparations';
  INSERT INTO categories (slug, name, description, icon, parent_id, sort_order, is_active) VALUES
    ('plombier', 'Plombier', 'Plomberie, fuites, débouchage', NULL, parent_id, 1, true),
    ('electricien', 'Électricien', 'Électricité, installation, dépannage', NULL, parent_id, 2, true),
    ('macn', 'Maçon', 'Construction, mur, fondation', NULL, parent_id, 3, true),
    ('peintre', 'Peintre', 'Peinture intérieure et extérieure', NULL, parent_id, 4, true),
    ('carreleur', 'Carreleur', 'Carrelage, faïence, dalle', NULL, parent_id, 5, true),
    ('menuisier', 'Menuisier', 'Menuiserie, bois, meuble', NULL, parent_id, 6, true),
    ('soudeur', 'Soudeur', 'Soudure, métal, fer', NULL, parent_id, 7, true),
    ('vitrier', 'Vitrier', 'Vitre, verre, fenêtre', NULL, parent_id, 8, true),
    ('serrurier', 'Serrurier', 'Serrurerie, porte fermée', NULL, parent_id, 9, true),
    ('climatisation', 'Climatisation', 'Installation et réparation climatisation', NULL, parent_id, 10, true),
    ('nettoyage', 'Nettoyage', 'Nettoyage domestique et professionnel', NULL, parent_id, 11, true),
    ('jardinage', 'Jardinage', 'Entretien jardin, tonte, élagage', NULL, parent_id, 12, true)
  ON CONFLICT (slug) DO NOTHING;

  -- Transport & Livraison
  SELECT id INTO parent_id FROM categories WHERE slug = 'transport-livraison';
  INSERT INTO categories (slug, name, description, icon, parent_id, sort_order, is_active) VALUES
    ('chauffeur-prive', 'Chauffeur privé', 'Transport de personnes, VTC', NULL, parent_id, 1, true),
    ('coursier', 'Coursier', 'Livraison rapide de colis et documents', NULL, parent_id, 2, true),
    ('demenagement', 'Déménagement', 'Déménagement et transport de meubles', NULL, parent_id, 3, true),
    ('transport-marchandises', 'Transport de marchandises', 'Transport de biens et cargaisons', NULL, parent_id, 4, true),
    ('remorquage', 'Remorquage', 'Dépannage et remorquage de véhicules', NULL, parent_id, 5, true)
  ON CONFLICT (slug) DO NOTHING;

  -- Événements
  SELECT id INTO parent_id FROM categories WHERE slug = 'evenements';
  INSERT INTO categories (slug, name, description, icon, parent_id, sort_order, is_active) VALUES
    ('dj', 'DJ', 'Animation musicale pour événements', NULL, parent_id, 1, true),
    ('animateur', 'Animateur', 'Animation et présentation d''événements', NULL, parent_id, 2, true),
    ('photographe', 'Photographe', 'Photographie pour tous types d''événements', NULL, parent_id, 3, true),
    ('videalste', 'Vidéaste', 'Tournage et montage vidéo', NULL, parent_id, 4, true),
    ('decoration', 'Décoration', 'Décoration d''intérieur et d''événements', NULL, parent_id, 5, true),
    ('sonorisation', 'Sonorisation', 'Sonorisation et équipement audio', NULL, parent_id, 6, true),
    ('eclairage', 'Éclairage', 'Éclairage et ambiances lumineuses', NULL, parent_id, 7, true),
    ('traiteur', 'Traiteur', 'Services de restauration et buffets', NULL, parent_id, 8, true),
    ('serveur', 'Serveur', 'Service en restauration et réceptions', NULL, parent_id, 9, true),
    ('location-materiel', 'Location de matériel', 'Location de tentes, tables, chaises', NULL, parent_id, 10, true)
  ON CONFLICT (slug) DO NOTHING;

  -- Éducation & Formation
  SELECT id INTO parent_id FROM categories WHERE slug = 'education-formation';
  INSERT INTO categories (slug, name, description, icon, parent_id, sort_order, is_active) VALUES
    ('repetiteur', 'Répétiteur', 'Soutien scolaire et aide aux devoirs', NULL, parent_id, 1, true),
    ('informatique', 'Informatique', 'Bureautique et compétences informatiques', NULL, parent_id, 2, true),
    ('cybersecurite', 'Cybersécurité', 'Sécurité informatique et protection des données', NULL, parent_id, 3, true),
    ('programmation', 'Programmation', 'Développement et programmation web/logiciel', NULL, parent_id, 4, true),
    ('ia', 'Intelligence artificielle', 'IA, machine learning et data', NULL, parent_id, 5, true),
    ('langues', 'Langues', 'Cours de langues (anglais, français, etc.)', NULL, parent_id, 6, true),
    ('preparation-concours', 'Préparation concours', 'Préparation aux examens et concours', NULL, parent_id, 7, true)
  ON CONFLICT (slug) DO NOTHING;

  -- Social media & Informatique
  SELECT id INTO parent_id FROM categories WHERE slug = 'social-media-informatique';
  INSERT INTO categories (slug, name, description, icon, parent_id, sort_order, is_active) VALUES
    ('developpement-web', 'Développement Web', 'Sites web et applications web', NULL, parent_id, 1, true),
    ('developpement-mobile', 'Développement Mobile', 'Applications iOS et Android', NULL, parent_id, 2, true),
    ('design-graphique', 'Design Graphique', 'Graphisme, affiches, flyers', NULL, parent_id, 3, true),
    ('creation-logo', 'Création Logo', 'Logo et identité visuelle', NULL, parent_id, 4, true),
    ('community-management', 'Community Management', 'Gestion des réseaux sociaux', NULL, parent_id, 5, true),
    ('montage-video', 'Montage Vidéo', 'Montage et édition vidéo', NULL, parent_id, 6, true),
    ('marketing-digital', 'Marketing Digital', 'Stratégie marketing en ligne', NULL, parent_id, 7, true),
    ('seo', 'SEO', 'Référencement naturel', NULL, parent_id, 8, true),
    ('publicite-facebook', 'Publicité Facebook', 'Facebook Ads et Meta Ads', NULL, parent_id, 9, true),
    ('publicite-google', 'Publicité Google', 'Google Ads et SEA', NULL, parent_id, 10, true)
  ON CONFLICT (slug) DO NOTHING;

  -- Assistance & Services Quotidiens
  SELECT id INTO parent_id FROM categories WHERE slug = 'assistance-services';
  INSERT INTO categories (slug, name, description, icon, parent_id, sort_order, is_active) VALUES
    ('femme-menage', 'Femme de ménage', 'Ménage et entretien de la maison', NULL, parent_id, 1, true),
    ('baby-sitter', 'Baby-sitter', 'Garde d''enfants', NULL, parent_id, 2, true),
    ('garde-malade', 'Garde-malade', 'Soins et assistance aux personnes âgées/malades', NULL, parent_id, 3, true),
    ('assistant-personnel', 'Assistant personnel', 'Assistance administrative et personnelle', NULL, parent_id, 4, true),
    ('courses', 'Courses', 'Courses et commissions', NULL, parent_id, 5, true),
    ('accompagnement-administratif', 'Accompagnement administratif', 'Aide avec les papiers et démarches', NULL, parent_id, 6, true)
  ON CONFLICT (slug) DO NOTHING;
END $$;

-- ============================================================================
-- 4. Update get_nearby_pros to use array containment
-- ============================================================================

CREATE OR REPLACE FUNCTION get_nearby_pros(
  target_categories TEXT[],
  max_distance_km INT DEFAULT 10,
  user_lat DECIMAL DEFAULT NULL,
  user_lng DECIMAL DEFAULT NULL
)
RETURNS SETOF professional_profiles AS $$
BEGIN
  RETURN QUERY
  SELECT p.*
  FROM professional_profiles p
  WHERE
    p.is_available = TRUE
    AND p.is_active = TRUE
    AND p.deleted_at IS NULL
    AND p.categories && target_categories  -- array overlap operator
    AND (
      user_lat IS NULL
      OR user_lng IS NULL
      OR ST_DWithin(
        p.location,
        ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography,
        max_distance_km * 1000
      )
    )
  ORDER BY p.rating DESC;
END;
$$ LANGUAGE plpgsql STABLE;
