# Dashboard

- **URL:** `/dashboard`
- **Last generated:** 2026-02-10T05:38:34.111Z
- **Refresh cadence:** every 60s (client auto-refresh)
- **Data source build command:** `npm run dashboard:data`

## Data Files
- `dashboard_data/content_index.json`
- `dashboard_data/gates_last.json`
- `dashboard_data/analytics_summary.json`
- `dashboard_data/search_console_summary.json`
- `dashboard_data/deploy_state.json`
- `dashboard_data/runs.json`

## SEO / Indexing data flow
1. Pull Search Console server-side only:
   - `node scripts/fetch_search_console.mjs`
2. Generates command center artifacts:
   - `command_center/search-console-weekly.md`
   - `command_center/search-console-weekly.json`
3. Summarized by dashboard data build:
   - `npm run dashboard:data`
   - produces `dashboard_data/search_console_summary.json`
4. Rendered in `/dashboard` → **SEO / Indexing** card.

## Optional Obscurity Gate
- Set `PUBLIC_DASHBOARD_TOKEN` at build-time to require a client-side token prompt.
- This is not real security; no secrets should be stored in dashboard data.
