# Analytics + Search Console Automation Setup

## Implemented
- Google tag installed site-wide (G-MBTT5PEJBB)
- Event tracking added:
  - `affiliate_click`
  - `tool_complete`
  - `tool_to_money_click`
- Automated GA pull script:
  - `scripts/fetch_analytics.mjs`
  - Outputs:
    - `command_center/analytics-weekly.md`
    - `command_center/analytics-weekly.json`
- Automated Search Console pull script:
  - `scripts/fetch_search_console.mjs`
  - Pulls performance (clicks, impressions, CTR, avg position), sitemap indexing totals, crawl error counts, and optional URL Inspection samples
  - Outputs:
    - `command_center/search-console-weekly.md`
    - `command_center/search-console-weekly.json`
- Combined pull runner:
  - `scripts/analytics_pull.sh`
  - Loads `.env.analytics` and runs GA + GSC pulls into command_center artifacts

## Required values in `.env.analytics`
Create from template:

```bash
cp .env.analytics.example .env.analytics
```

Then set:

```bash
GA4_PROPERTY_ID=YOUR_NUMERIC_PROPERTY_ID
GSC_SITE_URL=sc-domain:example.com
# optional:
# GSC_SAMPLE_URLS=https://example.com/,https://example.com/money/page
GA_SERVICE_ACCOUNT_JSON=/Users/maxwellnguyen/.openclaw/workspace/private/ga-service-account.json
# optional override if different key path for GSC:
# GSC_SERVICE_ACCOUNT_JSON=/Users/maxwellnguyen/.openclaw/workspace/private/gsc-service-account.json
```

## Service account permissions (no-secret pattern)
- Keep service account JSON on local disk only (outside client bundle)
- Never expose credentials in frontend code or dashboard data
- Grant the service account **Read** access in:
  - GA4 property (Viewer/Analyst is enough)
  - Google Search Console property (Full/Restricted read access)

## Where to find IDs
- **GA4 Property ID**: GA4 Admin -> Property Settings -> Property details
- **GSC Site URL**: Search Console -> property selector (copy exact property, e.g., `sc-domain:example.com`)
