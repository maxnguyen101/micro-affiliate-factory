#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { google } from 'googleapis';

const root = '/Users/maxwellnguyen/.openclaw/workspace/affiliate-microsites';
const siteUrl = process.env.GSC_SITE_URL;
const keyPath =
  process.env.GSC_SERVICE_ACCOUNT_JSON ||
  process.env.GA_SERVICE_ACCOUNT_JSON ||
  '/Users/maxwellnguyen/.openclaw/workspace/private/ga-service-account.json';
const sampleUrls = (process.env.GSC_SAMPLE_URLS || '')
  .split(',')
  .map((v) => v.trim())
  .filter(Boolean)
  .slice(0, 5);

if (!siteUrl) {
  console.error('Missing GSC_SITE_URL env var (ex: sc-domain:example.com or https://example.com/).');
  process.exit(1);
}
if (!fs.existsSync(keyPath)) {
  console.error(`Service account key missing at ${keyPath}`);
  process.exit(1);
}

const key = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
const auth = new google.auth.GoogleAuth({
  credentials: key,
  scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
});

const webmasters = google.webmasters({ version: 'v3', auth });
const searchconsole = google.searchconsole({ version: 'v1', auth });
const now = new Date().toISOString();

function toNumber(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function pct(v) {
  return Number.isFinite(v) ? Number((v * 100).toFixed(2)) : 0;
}

async function getPerformance(startDate, endDate) {
  try {
    const totalsRes = await webmasters.searchanalytics.query({
      siteUrl,
      requestBody: { startDate, endDate, rowLimit: 1 },
    });

    const topPagesRes = await webmasters.searchanalytics.query({
      siteUrl,
      requestBody: {
        startDate,
        endDate,
        dimensions: ['page'],
        rowLimit: 15,
        startRow: 0,
      },
    });

    const totalRow = totalsRes.data.rows?.[0] || {};
    const topPages = (topPagesRes.data.rows || []).map((row) => ({
      page: row.keys?.[0] || 'unknown',
      clicks: toNumber(row.clicks),
      impressions: toNumber(row.impressions),
      ctr: pct(toNumber(row.ctr)),
      position: Number(toNumber(row.position).toFixed(2)),
    }));

    return {
      range: { startDate, endDate },
      totals: {
        clicks: toNumber(totalRow.clicks),
        impressions: toNumber(totalRow.impressions),
        ctr: pct(toNumber(totalRow.ctr)),
        position: Number(toNumber(totalRow.position).toFixed(2)),
      },
      topPages,
    };
  } catch (err) {
    return {
      range: { startDate, endDate },
      totals: { clicks: 0, impressions: 0, ctr: 0, position: 0 },
      topPages: [],
      error: err?.message || String(err),
    };
  }
}

async function getSitemaps() {
  try {
    const res = await webmasters.sitemaps.list({ siteUrl });
    const items = (res.data.sitemap || []).map((s) => ({
      path: s.path || 'unknown',
      type: s.type || 'unknown',
      pending: toNumber(s.pending),
      lastSubmitted: s.lastSubmitted || null,
      isPending: Boolean(s.isPending),
      isSitemapsIndex: Boolean(s.isSitemapsIndex),
      warnings: toNumber(s.warnings),
      errors: toNumber(s.errors),
      indexed: (s.contents || []).reduce((acc, c) => acc + toNumber(c.indexed), 0),
      submitted: (s.contents || []).reduce((acc, c) => acc + toNumber(c.submitted), 0),
      contents: (s.contents || []).map((c) => ({
        type: c.type || 'unknown',
        submitted: toNumber(c.submitted),
        indexed: toNumber(c.indexed),
      })),
    }));

    return {
      items,
      totals: {
        sitemapCount: items.length,
        submitted: items.reduce((acc, s) => acc + s.submitted, 0),
        indexed: items.reduce((acc, s) => acc + s.indexed, 0),
        warnings: items.reduce((acc, s) => acc + s.warnings, 0),
        errors: items.reduce((acc, s) => acc + s.errors, 0),
      },
    };
  } catch (err) {
    return {
      items: [],
      totals: { sitemapCount: 0, submitted: 0, indexed: 0, warnings: 0, errors: 0 },
      error: err?.message || String(err),
    };
  }
}

async function getCrawlErrors() {
  const api = webmasters.urlcrawlerrorscounts;
  if (!api?.query) {
    return {
      categories: [],
      totalLatest: 0,
      note: 'crawl error count endpoint unavailable in current client/API version',
    };
  }

  try {
    const res = await api.query({ siteUrl });
    const categories = (res.data.countPerTypes || []).map((entry) => ({
      category: entry.category || 'unknown',
      platform: entry.platform || 'unknown',
      latestCount: toNumber(entry.entries?.[0]?.count),
      lastCrawled: entry.entries?.[0]?.timestamp || null,
    }));

    return {
      categories,
      totalLatest: categories.reduce((acc, c) => acc + c.latestCount, 0),
    };
  } catch (err) {
    return {
      categories: [],
      totalLatest: 0,
      error: err?.message || String(err),
    };
  }
}

async function inspectSampleUrls() {
  if (!sampleUrls.length) return [];

  const inspections = await Promise.all(
    sampleUrls.map(async (inspectionUrl) => {
      try {
        const res = await searchconsole.urlInspection.index.inspect({
          requestBody: {
            inspectionUrl,
            siteUrl,
            languageCode: 'en-US',
          },
        });
        const index = res.data.inspectionResult?.indexStatusResult;
        return {
          url: inspectionUrl,
          verdict: index?.verdict || 'UNKNOWN',
          coverageState: index?.coverageState || null,
          indexingState: index?.indexingState || null,
          lastCrawlTime: index?.lastCrawlTime || null,
          referringUrlsCount: Array.isArray(index?.referringUrls) ? index.referringUrls.length : 0,
        };
      } catch (err) {
        return {
          url: inspectionUrl,
          verdict: 'ERROR',
          error: err?.message || String(err),
        };
      }
    })
  );

  return inspections;
}

function buildMarkdown(data) {
  const perf = data.performance?.totals || {};
  const sitemapTotals = data.sitemaps?.totals || {};
  const crawl = data.crawlErrors || {};
  const inspections = data.inspections || [];

  const pageLines = (data.performance?.topPages || [])
    .slice(0, 10)
    .map(
      (p) =>
        `- ${p.page} | clicks: ${p.clicks} | impressions: ${p.impressions} | ctr: ${p.ctr}% | avg position: ${p.position}`
    )
    .join('\n') || '- no data';

  const crawlLines = (crawl.categories || [])
    .map((c) => `- ${c.category} (${c.platform}): ${c.latestCount}`)
    .join('\n') || '- unavailable';

  const inspectLines = inspections
    .map((i) => `- ${i.url} | verdict: ${i.verdict} | coverage: ${i.coverageState || 'n/a'} | last crawl: ${i.lastCrawlTime || 'n/a'}`)
    .join('\n') || '- no inspection URLs configured';

  return `# Search Console Snapshot\n\nGenerated: ${data.generatedAt}\nSite: ${data.siteUrl}\n\n## Performance (last 7 days)\n- Clicks: ${perf.clicks || 0}\n- Impressions: ${perf.impressions || 0}\n- CTR: ${perf.ctr || 0}%\n- Avg position: ${perf.position || 0}\n\n## Top pages\n${pageLines}\n\n## Indexing / Coverage\n- Submitted URLs (sitemaps): ${sitemapTotals.submitted || 0}\n- Indexed URLs (sitemaps): ${sitemapTotals.indexed || 0}\n- Sitemap warnings: ${sitemapTotals.warnings || 0}\n- Sitemap errors: ${sitemapTotals.errors || 0}\n- Crawl errors (latest): ${crawl.totalLatest || 0}\n\n### Crawl error categories\n${crawlLines}\n\n### URL inspection samples\n${inspectLines}\n`;
}

const end = new Date();
const start = new Date(end);
start.setDate(end.getDate() - 7);
const startDate = start.toISOString().slice(0, 10);
const endDate = end.toISOString().slice(0, 10);

const [performance, sitemaps, crawlErrors, inspections] = await Promise.all([
  getPerformance(startDate, endDate),
  getSitemaps(),
  getCrawlErrors(),
  inspectSampleUrls(),
]);

const payload = {
  generatedAt: now,
  siteUrl,
  performance,
  sitemaps,
  crawlErrors,
  inspections,
};

const outDir = path.join(root, 'command_center');
fs.writeFileSync(path.join(outDir, 'search-console-weekly.json'), JSON.stringify(payload, null, 2));
fs.writeFileSync(path.join(outDir, 'search-console-weekly.md'), buildMarkdown(payload));
console.log('Wrote command_center/search-console-weekly.md');
