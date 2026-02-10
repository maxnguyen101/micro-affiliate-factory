#!/usr/bin/env node
import { promises as fs } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const CC_DIR = path.join(ROOT, 'command_center');
const OUT_DIR = path.join(ROOT, 'dashboard_data');

const nowIso = new Date().toISOString();

async function readText(filePath, fallback = '') {
  try {
    return await fs.readFile(filePath, 'utf8');
  } catch {
    return fallback;
  }
}

function parseSections(markdown) {
  const sections = {};
  let current = 'root';
  sections[current] = [];
  for (const line of markdown.split(/\r?\n/)) {
    const match = line.match(/^##\s+(.+)$/);
    if (match) {
      current = match[1].trim();
      sections[current] = sections[current] || [];
      continue;
    }
    sections[current].push(line);
  }
  return sections;
}

function parseList(lines) {
  return lines
    .map((line) => line.match(/^\s*(?:[-*]|\d+\.)\s+(.+)$/)?.[1]?.trim())
    .filter(Boolean);
}

function parseStatus(md) {
  const status = {
    activeNiche: null,
    currentStage: null,
    nextAction: null,
    blockers: null,
    lastRun: null,
    publishState: null,
  };

  for (const line of md.split(/\r?\n/)) {
    const m = line.match(/^\s*-\s+\*\*(.+?):\*\*\s*(.*)$/);
    if (!m) continue;
    const key = m[1].trim().toLowerCase();
    const value = m[2].trim();
    if (key.startsWith('active niche')) status.activeNiche = value;
    else if (key.startsWith('current stage')) status.currentStage = value;
    else if (key.startsWith('next action')) status.nextAction = value;
    else if (key.startsWith('blockers')) status.blockers = value;
    else if (key.startsWith('last run')) status.lastRun = value;
    else if (key.startsWith('publish state')) status.publishState = value;
  }

  return status;
}

function parseLogs(md) {
  const entries = [];
  let current = null;

  for (const line of md.split(/\r?\n/)) {
    const header = line.match(/^##\s+(.+)$/);
    if (header) {
      current = { title: header[1].trim(), notes: [] };
      entries.push(current);
      continue;
    }
    const bullet = line.match(/^\s*-\s+(.+)$/);
    if (bullet && current) {
      current.notes.push(bullet[1].trim());
    }
  }

  return entries.reverse();
}

function parseArtifacts(md) {
  const paths = [];
  for (const line of md.split(/\r?\n/)) {
    const all = [...line.matchAll(/`([^`]+)`/g)].map((m) => m[1]);
    if (all.length) {
      for (const candidate of all) {
        if (candidate.includes('/')) paths.push(candidate);
      }
    }
  }
  return Array.from(new Set(paths)).sort();
}

async function listSitePages() {
  const pagesDir = path.join(ROOT, 'src', 'pages');
  const results = [];

  async function walk(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const abs = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(abs);
        continue;
      }
      if (!entry.name.endsWith('.astro')) continue;
      const rel = path.relative(pagesDir, abs).replace(/\\/g, '/');
      const noExt = rel.replace(/\.astro$/, '');
      const route = noExt === 'index' ? '/' : `/${noExt.replace(/\/index$/, '/')}`;
      const section = route === '/' ? 'home' : route.split('/').filter(Boolean)[0] || 'home';
      const type = route.startsWith('/money/')
        ? 'money'
        : route.startsWith('/support/')
        ? 'support'
        : route.startsWith('/tools/')
        ? 'tool'
        : route.startsWith('/data/')
        ? 'data'
        : route === '/dashboard'
        ? 'dashboard'
        : 'page';
      results.push({
        route,
        source: `src/pages/${rel}`,
        section,
        type,
        slug: route === '/' ? 'home' : route.split('/').filter(Boolean).pop(),
      });
    }
  }

  try {
    await walk(pagesDir);
  } catch {
    return [];
  }

  return results.sort((a, b) => a.route.localeCompare(b.route));
}

function summarizeAnalytics(analyticsJsonText) {
  let parsed = {};
  try {
    parsed = JSON.parse(analyticsJsonText || '{}');
  } catch {
    parsed = {};
  }

  return {
    generatedAt: parsed.generatedAt || null,
    topPages: Array.isArray(parsed.pages) ? parsed.pages : [],
    events: Array.isArray(parsed.events) ? parsed.events : [],
    sources: Array.isArray(parsed.sources) ? parsed.sources : [],
    hasData:
      (Array.isArray(parsed.pages) && parsed.pages.length > 0) ||
      (Array.isArray(parsed.events) && parsed.events.length > 0) ||
      (Array.isArray(parsed.sources) && parsed.sources.length > 0),
  };
}

function summarizeSearchConsole(searchConsoleJsonText) {
  let parsed = {};
  try {
    parsed = JSON.parse(searchConsoleJsonText || '{}');
  } catch {
    parsed = {};
  }

  const performance = parsed.performance || {};
  const totals = performance.totals || {};
  const topPages = Array.isArray(performance.topPages) ? performance.topPages : [];
  const sitemapTotals = parsed.sitemaps?.totals || {};
  const crawlErrors = parsed.crawlErrors || {};
  const inspections = Array.isArray(parsed.inspections) ? parsed.inspections : [];

  return {
    generatedAt: parsed.generatedAt || null,
    siteUrl: parsed.siteUrl || null,
    performance: {
      clicks: Number(totals.clicks || 0),
      impressions: Number(totals.impressions || 0),
      ctr: Number(totals.ctr || 0),
      position: Number(totals.position || 0),
      topPages,
    },
    indexing: {
      submitted: Number(sitemapTotals.submitted || 0),
      indexed: Number(sitemapTotals.indexed || 0),
      warnings: Number(sitemapTotals.warnings || 0),
      errors: Number(sitemapTotals.errors || 0),
      crawlErrorsLatest: Number(crawlErrors.totalLatest || 0),
      crawlErrorCategories: Array.isArray(crawlErrors.categories) ? crawlErrors.categories : [],
      inspections,
    },
    hasData:
      Number(totals.impressions || 0) > 0 ||
      topPages.length > 0 ||
      Number(sitemapTotals.submitted || 0) > 0 ||
      Number(sitemapTotals.indexed || 0) > 0 ||
      inspections.length > 0,
  };
}

async function gitInfo() {
  const { execFile } = await import('node:child_process');
  const run = (args) =>
    new Promise((resolve) => {
      execFile('git', args, { cwd: ROOT }, (err, stdout) => {
        resolve(err ? '' : String(stdout).trim());
      });
    });

  const branch = await run(['rev-parse', '--abbrev-ref', 'HEAD']);
  const sha = await run(['rev-parse', '--short', 'HEAD']);
  const remote = await run(['config', '--get', 'remote.origin.url']);
  return { branch: branch || null, sha: sha || null, remote: remote || null };
}

function parseQueue(md) {
  const sections = parseSections(md);
  return {
    inProgress: parseList(sections['In Progress'] || []),
    completed: parseList(sections['Completed'] || []),
    onHold: parseList(sections['On Hold'] || []),
  };
}

function nowHuman() {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(new Date());
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function writeJson(name, data) {
  const outPath = path.join(OUT_DIR, name);
  await fs.writeFile(outPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

async function main() {
  await ensureDir(OUT_DIR);

  const [queueMd, logsMd, artifactsMd, statusMd, analyticsJsonText, searchConsoleJsonText, pages] = await Promise.all([
    readText(path.join(CC_DIR, 'queue.md')),
    readText(path.join(CC_DIR, 'logs.md')),
    readText(path.join(CC_DIR, 'artifacts.md')),
    readText(path.join(CC_DIR, 'status.md')),
    readText(path.join(CC_DIR, 'analytics-weekly.json'), '{}'),
    readText(path.join(CC_DIR, 'search-console-weekly.json'), '{}'),
    listSitePages(),
  ]);

  const queue = parseQueue(queueMd);
  const logs = parseLogs(logsMd);
  const artifacts = parseArtifacts(artifactsMd);
  const status = parseStatus(statusMd);
  const analytics = summarizeAnalytics(analyticsJsonText);
  const searchConsole = summarizeSearchConsole(searchConsoleJsonText);
  const git = await gitInfo();

  const contentIndex = {
    generatedAt: nowIso,
    generatedAtLocal: nowHuman(),
    totalPages: pages.length,
    pages,
    artifacts,
  };

  const gatesLast = {
    generatedAt: nowIso,
    gates: [
      { name: 'build', command: 'npm run build', status: 'unknown' },
      { name: 'disclosure', command: 'npm run gate:disclosure', status: 'unknown' },
      { name: 'citations', command: 'npm run gate:citations', status: 'unknown' },
      { name: 'duplication', command: 'npm run gate:duplication', status: 'unknown' },
      { name: 'ymyl', command: 'npm run gate:ymyl', status: 'unknown' },
    ],
    note: 'Gate statuses are placeholders unless a gate runner writes results.',
  };

  const runs = {
    generatedAt: nowIso,
    latest: logs[0] || null,
    timeline: logs,
    queue,
    systemsStatus: status,
  };

  const deployState = {
    generatedAt: nowIso,
    branch: git.branch,
    commit: git.sha,
    remote: git.remote,
    publishState: status.publishState,
    lastRun: status.lastRun,
    dashboardPath: '/dashboard',
  };

  await Promise.all([
    writeJson('content_index.json', contentIndex),
    writeJson('gates_last.json', gatesLast),
    writeJson('analytics_summary.json', {
      generatedAt: nowIso,
      ...analytics,
    }),
    writeJson('search_console_summary.json', {
      generatedAt: nowIso,
      ...searchConsole,
    }),
    writeJson('deploy_state.json', deployState),
    writeJson('runs.json', runs),
  ]);

  console.log(`Dashboard data generated in ${OUT_DIR} at ${nowIso}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
