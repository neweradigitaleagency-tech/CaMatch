-- Active mode: single user account with client/professional mode switching

ALTER TABLE users ADD COLUMN IF NOT EXISTS active_mode user_role NOT NULL DEFAULT 'client';

-- Auto-create client_profiles when a new user is created
CREATE OR REPLACE FUNCTION create_client_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO client_profiles (user_id, first_name, last_name)
  VALUES (NEW.id, '', '')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS after_users_insert_create_client_profile ON users;
CREATE TRIGGER after_users_insert_create_client_profile
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION create_client_profile();
