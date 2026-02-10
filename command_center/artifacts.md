# Artifacts

## Created in this prep run
- Astro scaffold: `affiliate-microsites/`
- Command center files:
  - `command_center/status.md`
  - `command_center/queue.md`
  - `command_center/artifacts.md`
  - `command_center/logs.md`
- Planning docs:
  - `content/plans/niche-candidates.md`
  - `content/plans/top-niche-cluster-plan.md`
  - `content/plans/top-niche-tool-spec.md`
- Briefs:
  - `content/briefs/money-pages.md`
  - `content/briefs/support-pages.md`
- Ops scripts:
  - `scripts/run_manager.sh`
  - `scripts/install_cron.sh`

## Minimal Human Steps (GitHub + Cloudflare Pages)

### 1) GitHub repo creation (exact clicks)
1. Open https://github.com/new
2. **Repository name**: pick your desired name (example: `affiliate-microsites`)
3. Keep it **Public** (recommended for easier Pages debugging) or Private if preferred.
4. Do **not** initialize with README/.gitignore/license (local repo already exists).
5. Click **Create repository**.
6. Copy the repo URL (HTTPS).

### 2) Connect local repo (I’ll run after you share URL)
- I’ll set `origin`, commit prep files, and push to `main`.

### 3) Cloudflare Pages setup (exact clicks)
1. Go to https://dash.cloudflare.com/
2. Left nav: **Workers & Pages**
3. Click **Create application**
4. Select **Pages** tab
5. Click **Connect to Git**
6. Authorize GitHub if prompted.
7. Select your repo and click **Begin setup**.
8. Build settings:
   - **Production branch:** `main`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Root directory:** `/` (repo root)
9. Click **Save and Deploy**.

### 4) Optional free analytics
- In Cloudflare Pages project, enable Web Analytics (free) from Analytics section.

## Notes
- No publish/deploy was executed in this run.
- Money pages are planned with compliance-first structure (disclosure above first affiliate link, no inline Amazon prices by default).
