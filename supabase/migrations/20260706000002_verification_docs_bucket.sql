-- Storage bucket for verification documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('verification-docs', 'verification-docs', false, 20971520, ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf'])
ON CONFLICT (id) DO NOTHING;

-- Admins full access
CREATE POLICY "Admins full access verification-docs" ON storage.objects
  FOR ALL USING (
    bucket_id = 'verification-docs' AND
    EXISTS (SELECT 1 FROM admin_roles ar JOIN roles r ON ar.role_id = r.id WHERE ar.admin_id = auth.uid())
  );

-- Professionals upload their own docs
CREATE POLICY "Professionals upload own verification-docs" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'verification-docs' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Professionals read their own docs
CREATE POLICY "Professionals read own verification-docs" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'verification-docs' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Professionals update/delete their own pending docs
CREATE POLICY "Professionals manage own pending verification-docs" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'verification-docs' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
