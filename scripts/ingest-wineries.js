#!/usr/bin/env node

const fs = require('fs/promises');
const path = require('path');

const PROJECT_ROOT = process.cwd();
const GPS_CSV_PATH = path.join(PROJECT_ROOT, 'original data', 'stripped gps data.csv');
const TS_PATH = path.join(PROJECT_ROOT, 'lib', 'wineries-data.ts');

async function main() {
  const [tsSource, gpsCsv] = await Promise.all([
    fs.readFile(TS_PATH, 'utf8'),
    fs.readFile(GPS_CSV_PATH, 'utf8')
  ]);

  const gpsMap = buildGpsMap(gpsCsv);
  const { header, helpers, wineries } = extractWineries(tsSource);

  const missing = [];
  wineries.forEach(winery => {
    const coords = gpsMap.get(normalizeName(winery.name));
    if (!coords) {
      missing.push(winery.name);
      return;
    }
    winery.lat = coords.lat;
    winery.lng = coords.lng;
  });

  if (missing.length) {
    console.warn('⚠ Missing GPS coordinates for:', missing);
  }

  const formatted = formatWineries(wineries);
  const nextContent = `${header}export const wineries: Winery[] = [\n${formatted}\n];\n\n${helpers}`;

  await fs.writeFile(TS_PATH, nextContent, 'utf8');
  console.log(`✔ Updated ${TS_PATH} with ${wineries.length} wineries.`);
}

function buildGpsMap(csvText) {
  const map = new Map();
  const lines = csvText.split(/\r?\n/).filter(Boolean);
  lines.slice(1).forEach(line => {
    const [name, latStr, lonStr] = splitSimpleCsv(line, 3);
    if (!name) return;
    const key = normalizeName(name);
    const lat = Number(latStr);
    const lon = Number(lonStr);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return;
    map.set(key, { lat, lng: lon });
  });
  return map;
}

function splitSimpleCsv(line, expectedParts) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
      continue;
    }
    current += char;
  }
  result.push(current);

  while (result.length < expectedParts) {
    result.push('');
  }
  return result.map(part => part.trim());
}

function normalizeName(name) {
  return (name || '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

function extractWineries(source) {
  const helpersIndex = source.indexOf('// Helper function to get all unique regions with counts');
  if (helpersIndex === -1) {
    throw new Error('Could not locate helper section in wineries-data.ts');
  }

  const headerEnd = source.indexOf('export const wineries');
  if (headerEnd === -1) {
    throw new Error('Could not locate wineries export in wineries-data.ts');
  }

  const header = source.slice(0, headerEnd);
  const helpers = source.slice(helpersIndex);
  const dataSegment = source.slice(headerEnd, helpersIndex);

  const sanitized = dataSegment
    .replace(/import[^;]+;\s*/g, '')
    .replace(/export const wineries:\s*Winery\[]\s*=\s*/, 'const wineries = ')
    .trim();

  const wineries = evaluateArrayLiteral(sanitized);
  return { header, helpers, wineries };
}

function evaluateArrayLiteral(code) {
  const vm = require('vm');
  const context = { result: null };
  vm.createContext(context);
  vm.runInContext(`${code}; result = wineries;`, context, {
    filename: 'wineries-data.evaluator.js',
  });
  if (!Array.isArray(context.result)) {
    throw new Error('Failed to evaluate wineries array');
  }
  return context.result;
}

function formatWineries(wineries) {
  return wineries
    .map(w => formatWinery(w))
    .join('\n');
}

function formatWinery(winery) {
  const props = [
    `    id: "${winery.id}",`,
    `    name: "${escapeString(winery.name)}",`,
    `    street: "${escapeString(winery.street)}",`,
    `    city: "${escapeString(winery.city)}",`,
    `    state: "${escapeString(winery.state)}",`,
    `    zip: "${escapeString(winery.zip)}",`,
    `    phone: "${escapeString(winery.phone)}",`,
    `    website: "${escapeString(winery.website)}",`,
    `    region: "${escapeString(winery.region)}",`,
    `    categories: [${(winery.categories || []).map(cat => `"${cat}"`).join(', ')}],`
  ];

  if (typeof winery.lat === 'number') {
    props.push(`    lat: ${winery.lat},`);
  }
  if (typeof winery.lng === 'number') {
    props.push(`    lng: ${winery.lng}`);
  }

  // Remove trailing comma on last property
  const lastIndex = props.length - 1;
  props[lastIndex] = props[lastIndex].replace(/,+\s*$/, '');

  return ['  {', ...props, '  },'].join('\n');
}

function escapeString(value) {
  return (value || '').replace(/\\/g, '\\\\').replace(/"/g, '\"');
}

main().catch(err => {
  console.error('Failed to update wineries-data.ts:', err);
  process.exit(1);
});
