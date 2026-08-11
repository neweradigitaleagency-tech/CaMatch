-- Google (et autres OAuth) : un utilisateur Google n'a qu'une ligne auth.users,
-- jamais de ligne publique users → les FK (service_requests.client_id, conversations,
-- paiements…) échoueraient. On crée la ligne users automatiquement à l'inscription.

-- Les utilisateurs OAuth n'ont pas de téléphone : les colonnes deviennent nullables.
ALTER TABLE users
  ALTER COLUMN phone_number DROP NOT NULL,
  ALTER COLUMN phone_number_hash DROP NOT NULL;

-- Crée la ligne publique users à la création d'un compte auth (email, téléphone, OAuth).
-- Crée aussi client_profiles directement : le trigger after_users_insert_create_client_profile
-- (migration active_mode) n'existe pas forcément sur la base distante (drift).
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.users (id, email, role, last_login_at)
  VALUES (NEW.id, NEW.email, 'client', NOW())
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.client_profiles (user_id, first_name, last_name)
  VALUES (NEW.id, '', '')
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM anon;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM authenticated;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- handle_new_user exécute ses triggers imbriqués avec search_path=''.
-- create_client_profile et audit_trigger_function (SECURITY DEFINER sans
-- SET search_path) héritaient de ce search_path vide et ne résolvaient plus
-- 'client_profiles' / 'audit_logs' non qualifiés → toute création de compte
-- échouait. On les sécurise de la même façon (schéma qualifié).
CREATE OR REPLACE FUNCTION public.create_client_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.client_profiles (user_id, first_name, last_name)
  VALUES (NEW.id, '', '')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.audit_trigger_function()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, new_values, ip_address)
        VALUES (auth.uid(), 'INSERT', TG_TABLE_NAME, NEW.id, to_jsonb(NEW), inet_client_addr());
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, old_values, new_values, ip_address)
        VALUES (auth.uid(), 'UPDATE', TG_TABLE_NAME, NEW.id, to_jsonb(OLD), to_jsonb(NEW), inet_client_addr());
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, old_values, ip_address)
        VALUES (auth.uid(), 'DELETE', TG_TABLE_NAME, OLD.id, to_jsonb(OLD), inet_client_addr());
        RETURN OLD;
    END IF;
END;
$$;
