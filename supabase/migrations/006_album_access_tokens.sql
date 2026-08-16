-- Persistent, revocable access tokens for QR-code auto-login into a specific album.
-- Unlike a one-time OTP, this token can be scanned/used repeatedly until revoked.
CREATE TABLE IF NOT EXISTS album_access_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  album_id UUID NOT NULL UNIQUE REFERENCES albums(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  revoked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS album_access_tokens_token_idx ON album_access_tokens (token);

-- Only the service-role (used server-side by admin actions and the /album-access route
-- handler) ever reads or writes this table; no anon/authenticated policies are needed.
ALTER TABLE album_access_tokens ENABLE ROW LEVEL SECURITY;
