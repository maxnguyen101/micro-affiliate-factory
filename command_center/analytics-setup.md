# Analytics Automation Setup

## Implemented
- Google tag installed site-wide (G-MBTT5PEJBB)
- Event tracking added:
  - `affiliate_click`
  - `tool_complete`
  - `tool_to_money_click`
- Automated GA pull script added:
  - `scripts/fetch_analytics.mjs`
  - `scripts/analytics_pull.sh`
- Weekly system cron added (Mon 11:00 AM) to generate:
  - `command_center/analytics-weekly.md`
  - `command_center/analytics-weekly.json`

## One required value from GA
Set numeric property id in `.env.analytics`:

```bash
GA4_PROPERTY_ID=YOUR_NUMERIC_PROPERTY_ID
GA_SERVICE_ACCOUNT_JSON=/Users/maxwellnguyen/.openclaw/workspace/private/ga-service-account.json
```

Create from template:
`cp .env.analytics.example .env.analytics`

Where to find property id:
GA4 Admin -> Property Settings -> Property details -> Property ID (number).
