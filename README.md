# Aedifico

Marketing site for Aedifico, a general contractor based in Indonesia. Built with Astro + Tailwind CSS v4, content managed through Keystatic.

## Commands

| Command           | Action                                       |
| :----------------- | :-------------------------------------------- |
| `npm install`       | Install dependencies                          |
| `npm run dev`       | Start local dev server at `localhost:4321`    |
| `npm run build`     | Build the production site to `./dist/`        |
| `npm run preview`   | Preview the production build locally          |

## Content (Keystatic CMS)

Project entries (the portfolio carousel) are managed through [Keystatic](https://keystatic.com), not hardcoded.

### Editing locally

Run `npm run dev`, then visit **`localhost:4321/keystatic`**. No login needed in local mode — it edits the files in `src/content/projects/` directly on disk.

Each project has:
- **Nama Proyek** — the project name
- **Tipe** — Pembangunan or Renovasi
- **Sektor** — Residensial, Komersil, or Industri
- **Layanan** — one or more tags (Arsitektur, Interior, Eksterior, MEP, Infrastruktur, Konstruksi General)
- **Tahun** — year
- **Detail Proyek** — a short description
- **Foto** — the project photo
- **Tampilkan di Beranda** ("highlight") — check this to show the project in the homepage carousel. Unchecked projects still exist in the CMS but won't appear on the homepage (useful once the full `/portfolio` page is built out later).

## Deploying to Vercel

This project is configured for Vercel (`@astrojs/vercel` adapter). Steps:

1. **Push this project to a GitHub repository**, if it isn't already.
2. Go to **[vercel.com](https://vercel.com)** and sign up (free tier is enough for this site).
3. Click **"Add New Project"**, select your GitHub repo. Vercel auto-detects Astro — no manual build config needed. Click **Deploy**.
4. After a couple minutes, your site is live at a `*.vercel.app` URL. Add your real domain under the project's **Settings → Domains** whenever you have one ready.
5. From here on, **every push to your GitHub repo's main branch automatically redeploys the live site** — this is also exactly what makes Keystatic Cloud work seamlessly later (an admin saving a project = a commit = an automatic redeploy).

⚠️ **Known issue, not something to fix on your end:** `npm install` currently reports a few high-severity vulnerabilities tracing back to a `path-to-regexp` dependency several layers inside Vercel's own build tooling (`@astrojs/vercel` → `@vercel/routing-utils`). This is a build-time-only dependency (not code that runs on your live site handling visitor requests), and there's currently no newer patched version of the adapter available — it's an open upstream issue on Vercel's side. Worth re-running `npm audit` before going live in case it's been patched since, but not something to block deployment on.

### Deploying elsewhere instead

If you'd rather use Netlify or a plain Node host: swap the adapter in `astro.config.mjs` — `npx astro add netlify`, or use `@astrojs/node` (which this project used previously) for any generic Node host (Railway, Render, Fly.io, a VPS). The rest of the site (everything except the `/keystatic` admin route) is statically pre-rendered regardless of host.

## Going live: connecting Keystatic Cloud

For the admin (non-technical, no GitHub account needed) to add/edit projects on the **live** site, connect this repo to Keystatic Cloud:

1. Go to **[keystatic.cloud](https://keystatic.cloud)** and create a free account/team (free for up to 3 users).
2. Create a new project in Keystatic Cloud and connect it to the same GitHub repo you deployed to Vercel.
3. Keystatic Cloud will give you a snippet — update `keystatic.config.ts` at the project root:

   ```ts
   export default config({
     storage: {
       kind: 'cloud', // was 'local'
     },
     cloud: {
       project: 'YOUR_TEAM_NAME/YOUR_PROJECT_NAME', // from the Keystatic Cloud dashboard
     },
     // ...rest of the config stays the same
   });
   ```

4. Invite the admin's email to your Keystatic Cloud team. They'll then log in with email/password (or Google/GitHub) at `yoursite.com/keystatic` — no Git knowledge required. Saving a project commits directly to GitHub, which triggers a Vercel rebuild automatically, live within a minute or two.

## Learn more

- [Astro docs](https://docs.astro.build)
- [Keystatic docs](https://keystatic.com/docs)
