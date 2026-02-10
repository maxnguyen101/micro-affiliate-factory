import fs from 'node:fs';
import path from 'node:path';
import { google } from 'googleapis';

const root = '/Users/maxwellnguyen/.openclaw/workspace/affiliate-microsites';
const propertyId = process.env.GA4_PROPERTY_ID;
const keyPath = process.env.GA_SERVICE_ACCOUNT_JSON || '/Users/maxwellnguyen/.openclaw/workspace/private/ga-service-account.json';

if (!propertyId) {
  console.error('Missing GA4_PROPERTY_ID env var (numeric GA4 property id).');
  process.exit(1);
}
if (!fs.existsSync(keyPath)) {
  console.error(`Service account key missing at ${keyPath}`);
  process.exit(1);
}

const key = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
const auth = new google.auth.GoogleAuth({
  credentials: key,
  scopes: ['https://www.googleapis.com/auth/analytics.readonly']
});

const analyticsData = google.analyticsdata({ version: 'v1beta', auth });

async function runReport(body) {
  const res = await analyticsData.properties.runReport({ property: `properties/${propertyId}`, requestBody: body });
  return res.data.rows || [];
}

const [pages, events, sources] = await Promise.all([
  runReport({
    dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
    dimensions: [{ name: 'pagePath' }],
    metrics: [{ name: 'screenPageViews' }],
    orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
    limit: 10
  }),
  runReport({
    dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
    dimensions: [{ name: 'eventName' }],
    metrics: [{ name: 'eventCount' }],
    dimensionFilter: { filter: { fieldName: 'eventName', inListFilter: { values: ['affiliate_click', 'tool_complete', 'tool_to_money_click'] } } },
    orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }],
    limit: 10
  }),
  runReport({
    dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
    dimensions: [{ name: 'sessionSource' }, { name: 'sessionMedium' }],
    metrics: [{ name: 'sessions' }],
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
    limit: 10
  })
]);

const outDir = path.join(root, 'command_center');
const now = new Date().toISOString();

const fmt = (rows, labels) => rows.map(r => `- ${labels.map((l, i) => `${l}: ${r.dimensionValues?.[i]?.value ?? ''}`).join(' | ')} | value: ${r.metricValues?.[0]?.value ?? 0}`).join('\n');

const md = `# Weekly Analytics Snapshot\n\nGenerated: ${now}\n\n## Top pages (last 7 days)\n${fmt(pages, ['path']) || '- no data'}\n\n## Key events (last 7 days)\n${fmt(events, ['event']) || '- no data'}\n\n## Top sources (last 7 days)\n${fmt(sources, ['source', 'medium']) || '- no data'}\n`;

fs.writeFileSync(path.join(outDir, 'analytics-weekly.md'), md);
fs.writeFileSync(path.join(outDir, 'analytics-weekly.json'), JSON.stringify({ generatedAt: now, pages, events, sources }, null, 2));
console.log('Wrote command_center/analytics-weekly.md');
