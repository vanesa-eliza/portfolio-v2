# Portfolio v2

Personal portfolio site built with React and Vite, backed by Supabase for all content and image storage.

## Features

- Canvas-based particle sphere on the homepage with Fibonacci distribution and spring physics
- Page transitions and scroll-triggered animations via Framer Motion
- Project image carousel with motion slide transitions
- Writing section with markdown-rendered blog posts
- Full admin CMS with protected routes for editing all site content
- Data/images uploads to Supabase Storage

## Live Demo
[Portfolio Site](https://vanesachetruscaportfolio.vercel.app)

## Why I Built This
My first ever portfolio was static HTML/PHP. I rebuilt v2 to learn a modern frontend stack while maintaining full control over design and behavior. The main challenge was architecting a CMS that could manage content, handle image uploads and maintain 
smooth animations across page transitions, all without UI frameworks.

## Key Design Decisions
- **Supabase for backend**: Real-time database + built-in auth for admin panel, avoiding the need for a separate backend server
- **Plain CSS over utility frameworks**: Per component CSS files with design tokens as CSS variables gives flexibility and keeps bundle small
- **Canvas for particle sphere**: Animating thousands of DOM elements would be slow. Built it in Canvas instead to keep it smooth and still obtain the desired outcome.
- **Supabase CMS with hidden admin access**: Instead of redeploying the entire site every time I update portfolio content, I built a CMS backed by Supabase. The admin panel is hidden from visitors but accessible to me for editing, keeping the site clean while staying easy to maintain.

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

3. Set up the Supabase database by running `supabase-setup.sql` in the Supabase SQL editor. This creates the `posts`, `about`, and `projects` tables with their RLS policies, and seeds placeholder content you can edit later through the admin CMS.

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

create policy "project-images delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'project-images');
```

6. Create the admin user and lock down sign-ups. The admin panel signs in an existing Supabase auth user — there is no public signup flow, so you must create your account manually:

   - In the Supabase dashboard, go to **Authentication → Users → Add user** and create your admin email and password.
   - Go to **Authentication → Sign In / Providers** (Email settings) and **disable public sign-ups**. The row-level security policies grant any authenticated user full read/write access, so leaving signups open would let anyone register and edit your content.

7. Start the dev server:

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
public/         Static assets (favicon, icons, robots.txt, sitemap.xml, llms.txt)
```

Writing posts and project images are stored in Supabase, posts as markdown in the `posts` table, images in the `project-images` storage bucket.

## Admin panel

The admin panel is not linked anywhere on the site. To access it, type `admin` anywhere on the page (outside a text input) — this triggers a secret keyboard shortcut that navigates to `/admin/login`.

Sign in with the Supabase auth user you created during setup (step 6). From there you can edit all site content: projects, about page, skills, timeline, and writing posts.

## What I Learned
- Full-stack architecture: How frontend and backend must work together for a seamless user experience
- Performance considerations: Optimizing animations, managing Canvas rendering and lazy-loading content. Also learning about the features made available by google search control to optimise visibility.
- Real-time databases: Using Supabase for authentication, real-time updates and file storage
- State management: Handling complex UI state with React hooks and route-synced scroll positions
- Deployment and DevOps: Deploying to production with environment variables, database migrations and storage policies.
