#!/usr/bin/env node
// Simple CSV import helper for net-worth-tracker (local utility)
// Usage: node scripts/import_csv.js path/to/file.csv

const fs = require('fs');
const path = require('path');

function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (lines.length === 0) return [];
  const headers = lines[0].split(',').map(h => h.trim());
  const rows = lines.slice(1).map(line => {
    const cols = line.split(',').map(c => c.trim());
    const obj = {};
    headers.forEach((h, i) => { obj[h] = cols[i] ?? ''; });
    return obj;
  });
  return rows;
}

function detectColumns(headers) {
  // simple heuristics to detect tickers/paired columns
  const detected = { manual: [], tickers: [] };
  for (const h of headers) {
    const low = h.toLowerCase();
    if (low.includes('share') || low.match(/\bshares?\b/)) {
      // probably a shares column, attempt to strip name
      const m = h.match(/(.*)\s*\(?([A-Z]{1,5})?\)?/);
      detected.tickers.push(h);
    } else if (low.includes('price') || low.match(/\bprice\b/)) {
      detected.tickers.push(h);
    } else if (low === 'date' || low === 'total') {
      // ignore
    } else {
      detected.manual.push(h);
    }
  }
  return detected;
}

async function main() {
  const argv = process.argv.slice(2);
  if (argv.length === 0) {
    console.log('Usage: node scripts/import_csv.js path/to/file.csv');
    process.exit(1);
  }
  const file = argv[0];
  if (!fs.existsSync(file)) { console.error('File not found:', file); process.exit(2); }
  const txt = fs.readFileSync(file, 'utf8');
  const rows = parseCSV(txt);
  if (rows.length === 0) { console.error('No rows parsed'); process.exit(3); }
  const headers = Object.keys(rows[0]);
  const detected = detectColumns(headers);
  const out = { headers, detected, sample: rows.slice(0,5) };
  const outPath = path.join(process.cwd(), 'out', 'import_preview.json');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
  console.log('Wrote import preview to', outPath);
  console.log('Detected columns:', JSON.stringify(detected, null, 2));
}

main();
