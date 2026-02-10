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

## Automation Added
- Gate scripts:
  - `scripts/check-disclosures.mjs`
  - `scripts/check-citations.mjs`
  - `scripts/check-duplication.mjs`
  - `scripts/check-ymyl.mjs`
- NPM gate commands in `package.json` (`npm run gates`)
- CI workflow: `.github/workflows/gates.yml`
- New planning docs:
  - `content/plans/cluster-2-plan.md`
  - `content/plans/cluster-2-research-shortlist.md`
  - `command_center/qa-automation-checklist.md`

## Cron Jobs Configured
- Daily QA Sweep: `52c082c5-3f22-4c95-9a50-0e66d26dd22a`
- Weekly Growth Planning: `4dfda425-34c8-4081-bb74-03a0725631b9`

## Notes
- Site is live and gating baseline is now active.
- Cluster #2 implementation is queued next.
