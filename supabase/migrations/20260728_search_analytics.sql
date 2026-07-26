-- ============================================================
-- Search Analytics: track user searches for trending/popular
-- ============================================================

CREATE TABLE search_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  query TEXT NOT NULL,
  vertical TEXT,
  results_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for trending queries
CREATE INDEX idx_search_analytics_query ON search_analytics(query);
CREATE INDEX idx_search_analytics_created_at ON search_analytics(created_at DESC);
CREATE INDEX idx_search_analytics_user_id ON search_analytics(user_id);

-- RLS
ALTER TABLE search_analytics ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (track anonymous searches too)
CREATE POLICY "Anyone can insert search analytics"
  ON search_analytics FOR INSERT
  WITH CHECK (true);

-- Only platform admins can read
CREATE POLICY "Admins can read search analytics"
  ON search_analytics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'platform_admin'
    )
  );

-- Function: get trending searches over the last N days
CREATE OR REPLACE FUNCTION get_trending_searches(
  p_days_back INTEGER DEFAULT 7,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE(query TEXT, count BIGINT) AS $$
  SELECT
    LOWER(TRIM(sa.query)) as query,
    COUNT(*) as count
  FROM search_analytics sa
  WHERE sa.created_at > NOW() - (p_days_back || ' days')::INTERVAL
    AND LENGTH(TRIM(sa.query)) > 2
  GROUP BY LOWER(TRIM(sa.query))
  ORDER BY count DESC
  LIMIT p_limit;
$$ LANGUAGE sql SECURITY DEFINER;
