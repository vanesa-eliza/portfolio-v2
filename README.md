# Portfolio v2

Personal portfolio site built with React and Vite, backed by Supabase for all content and image storage.

## Features

- Canvas-based particle sphere on the homepage with Fibonacci distribution and spring physics
- Page transitions and scroll-triggered animations via Framer Motion
- Project image carousel with motion slide transitions
- Writing section with markdown-rendered blog posts
- Full admin CMS with protected routes for editing all site content
- Image uploads to Supabase Storage

## Tech stack

React, Vite, Supabase, Framer Motion, React Router, plain CSS

## Getting started

1. Clone the repo and install dependencies:

```bash
npm install
```

2. Create a `.env` file at the root (see `.env.example`):

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. Set up the Supabase database by running `supabase-setup.sql` in the Supabase SQL editor.

4. In the Supabase dashboard, go to **Storage** and create a public bucket named `project-images`.

5. In the SQL editor, add storage policies for the bucket so authenticated users can upload and read images:

```sql
create policy "project-images select"
  on storage.objects for select
  using (bucket_id = 'project-images');

create policy "project-images insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'project-images');

create policy "project-images update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'project-images');
```

6. Start the dev server:

```bash
npm run dev
```

## Project structure

```
src/
  components/   Shared UI components (Navbar, Footer, FadeIn, ParticleSphere, etc.)
  pages/        Page components, including an admin/ subfolder for CMS editors
  styles/       Per-component CSS files
  lib/          Supabase client and auth hook
  posts/        Markdown source files for writing posts
public/
  projects/     Local project images served statically
```

## Admin panel

The admin panel is not linked anywhere on the site. To access it, type `admin` anywhere on the page (outside a text input) — this triggers a secret keyboard shortcut that navigates to `/admin/login`.

Sign in with your Supabase auth credentials. From there you can edit all site content: projects, about page, skills, timeline, and writing posts.
