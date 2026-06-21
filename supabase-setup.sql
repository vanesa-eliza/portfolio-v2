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

-- ─── projects ─────────────────────────────────────────────────────────────────

CREATE TABLE projects (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         text        UNIQUE NOT NULL,
  title        text        NOT NULL,
  year         text        NOT NULL DEFAULT '',
  subtitle     text        NOT NULL DEFAULT '',
  summary      text        NOT NULL DEFAULT '',
  description  text        NOT NULL DEFAULT '',
  highlights   text[]      NOT NULL DEFAULT '{}',
  tech         text[]      NOT NULL DEFAULT '{}',
  tags         text[]      NOT NULL DEFAULT '{}',
  github       text        NOT NULL DEFAULT '',
  images       jsonb       NOT NULL DEFAULT '[]',
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Anyone can read projects
CREATE POLICY "Public can read projects"
  ON projects FOR SELECT
  USING (true);

-- Authenticated users can do everything
CREATE POLICY "Auth users have full access to projects"
  ON projects FOR ALL
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

CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── seed data (optional) ───────────────────────────────────────────────────────
--
-- The `about` table is a key/value store. The site reads these keys; the JSON-valued
-- ones (skills/education/experience) must hold valid JSON in the shapes shown below.
-- These rows are starter placeholders so a fresh deploy renders something — edit them
-- later through the admin CMS. ON CONFLICT DO NOTHING means re-running this file never
-- overwrites content you have already saved.

INSERT INTO about (key, value) VALUES
  ('home_subtitle', 'CS & AI student building web and ML projects.'),
  ('bio', 'Write a short bio here.'),
  ('projects_description', 'A selection of things I have built.'),
  -- skills: object of category -> array of tags
  ('skills', '{"Languages":["Python","JavaScript"],"Frameworks & Libraries":["React"],"Tools":["Git"]}'),
  -- education: array of { period, title, institution, detail: [bullets] }
  ('education', '[{"period":"2023 — Present","title":"BSc Computer Science & AI","institution":"Queen Mary University of London","detail":["Add a highlight here."]}]'),
  -- experience: array of { period, title, context, detail: "text" }
  ('experience', '[{"period":"2024","title":"Your Role","context":"Company / org name","detail":"What you did."}]'),
  -- certificates: array of { title, issuer, date, image (public URL), url (verification link) }
  ('certificates', '[]')
ON CONFLICT (key) DO NOTHING;

-- ─── storage: project-images bucket ───────────────────────────────────────────
--
-- Project screenshots uploaded through the admin CMS live in a public
-- `project-images` bucket (project pages load them via public URLs). Re-runnable:
-- the bucket upsert keeps an existing bucket public, and policies are dropped
-- first so re-running never errors on "already exists".

INSERT INTO storage.buckets (id, name, public)
VALUES ('project-images', 'project-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public can read project-images" ON storage.objects;
CREATE POLICY "Public can read project-images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'project-images');

DROP POLICY IF EXISTS "Auth users manage project-images" ON storage.objects;
CREATE POLICY "Auth users manage project-images"
  ON storage.objects FOR ALL
  TO authenticated
  USING (bucket_id = 'project-images')
  WITH CHECK (bucket_id = 'project-images');

-- ─── storage: certificates bucket ─────────────────────────────────────────────
--
-- Certificate images uploaded through the admin CMS are stored in a public
-- `certificates` bucket (the carousel loads them via public URLs). This block is
-- re-runnable: the bucket upsert keeps an existing bucket public, and the policies
-- are dropped first so re-running never errors on "already exists".

INSERT INTO storage.buckets (id, name, public)
VALUES ('certificates', 'certificates', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public can read certificates" ON storage.objects;
CREATE POLICY "Public can read certificates"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'certificates');

DROP POLICY IF EXISTS "Auth users manage certificates" ON storage.objects;
CREATE POLICY "Auth users manage certificates"
  ON storage.objects FOR ALL
  TO authenticated
  USING (bucket_id = 'certificates')
  WITH CHECK (bucket_id = 'certificates');
