-- Run this in the Supabase SQL editor (Dashboard → SQL Editor → New query)

-- ─── posts ────────────────────────────────────────────────────────────────────

CREATE TABLE posts (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        text        UNIQUE NOT NULL,
  title       text        NOT NULL,
  excerpt     text        NOT NULL DEFAULT '',
  body        text        NOT NULL,
  published   boolean     NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Anyone can read published posts
CREATE POLICY "Public can read published posts"
  ON posts FOR SELECT
  USING (published = true);

-- Authenticated users can do everything (you'll disable public signups in the dashboard)
CREATE POLICY "Auth users have full access to posts"
  ON posts FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ─── about ────────────────────────────────────────────────────────────────────

CREATE TABLE about (
  key         text        PRIMARY KEY,
  value       text        NOT NULL,
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE about ENABLE ROW LEVEL SECURITY;

-- Anyone can read the about table
CREATE POLICY "Public can read about"
  ON about FOR SELECT
  USING (true);

-- Authenticated users can do everything
CREATE POLICY "Auth users have full access to about"
  ON about FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ─── updated_at triggers ──────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER about_updated_at
  BEFORE UPDATE ON about
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
