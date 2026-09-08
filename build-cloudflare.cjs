#!/usr/bin/env node
'use strict';

/**
 * WIND SIGHT PRS deployment packaging CF2.
 * Run: node build-cloudflare.cjs
 * Deploy: npx wrangler deploy --assets ./public
 *
 * Copies ONLY the named static resources from beside this script into public/.
 * No dependencies, network access, application edits or Wrangler config edits.
 * public/ is generated output; make future application changes in the root files.
 * An invalid source or unexpected output entry stops the build, not the user app.
 */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const ROOT = __dirname;
const OUT = path.join(ROOT, 'public');
const MAX_BYTES = 25 * 1024 * 1024;
const REQUIRED = [
  'index.html', 'service-worker.js', 'manifest.webmanifest',
  'apple-touch-icon.png', 'icon-192.png', 'icon-512.png',
  'wind-sight-icon.png', 'zealtech-transparent.png',
  'backup-before-update.html',
];
// Existing provider header/redirect rules are carried forward, not invented.
const OPTIONAL = ['_headers', '_redirects'];
const ALLOWED = new Set([...REQUIRED, ...OPTIONAL]);
const hash = data => crypto.createHash('sha256').update(data).digest('hex');
const stat = file => {
  try { return fs.lstatSync(file); }
  catch (error) { if (error.code === 'ENOENT') return null; throw error; }
};

function build() {
  const inputs = [];
  for (const name of [...REQUIRED, ...OPTIONAL]) {
    const source = path.join(ROOT, name);
    const info = stat(source);
    if (!info && OPTIONAL.includes(name)) continue;
    if (!info) throw new Error(`Missing required source: ${name}. Put this script beside index.html.`);
    if (!info.isFile() || info.isSymbolicLink()) throw new Error(`Source must be a regular file, not a link: ${name}`);
    if (info.size > MAX_BYTES) throw new Error(`Source exceeds 25 MiB: ${name}`);
    if (REQUIRED.includes(name) && info.size === 0) throw new Error(`Empty required source: ${name}`);
    const data = fs.readFileSync(source);
    if (data.length > MAX_BYTES) throw new Error(`Source grew beyond 25 MiB: ${name}`);
    inputs.push({name, data, sha256: hash(data)});
  }
  // Fail rather than delete an unrelated existing folder or publish extra files.
  const oldOutput = stat(OUT);
  if (oldOutput) {
    if (!oldOutput.isDirectory() || oldOutput.isSymbolicLink()) throw new Error('public must be a real directory, not a file or link.');
    for (const name of fs.readdirSync(OUT)) {
      const info = fs.lstatSync(path.join(OUT, name));
      if (!ALLOWED.has(name) || !info.isFile() || info.isSymbolicLink()) {
        throw new Error(`Unexpected entry in generated public/: ${name}. Build stopped; nothing removed. Review that entry before rebuilding.`);
      }
    }
  }
  let staging = fs.mkdtempSync(path.join(ROOT, '.wsp-public-build-'));
  let previous = null;
  try {
    for (const entry of inputs) {
      const file = path.join(staging, entry.name);
      fs.writeFileSync(file, entry.data, {flag: 'wx', mode: 0o644});
      if (hash(fs.readFileSync(file)) !== entry.sha256) throw new Error(`Copy verification failed: ${entry.name}`);
    }
    if (oldOutput) {
      // Reserve a unique name. Rename the old directory only after source/copy checks pass.
      previous = fs.mkdtempSync(path.join(ROOT, '.wsp-public-previous-'));
      fs.rmdirSync(previous);
      fs.renameSync(OUT, previous);
    }
    try {
      fs.renameSync(staging, OUT);
      staging = null;
    } catch (error) {
      if (previous) { fs.renameSync(previous, OUT); previous = null; }
      throw error;
    }
    if (previous) { fs.rmSync(previous, {recursive: true}); previous = null; }
  } finally {
    if (staging && stat(staging)) fs.rmSync(staging, {recursive: true});
  }
  const bytes = inputs.reduce((sum, entry) => sum + entry.data.length, 0);
  const largest = inputs.reduce((a, b) => a.data.length >= b.data.length ? a : b);
  console.log('WIND SIGHT CLOUDFLARE CF2: PUBLIC ASSETS READY');
  console.log(`Assets directory: ${OUT}`);
  console.log(`Files: ${inputs.length}; total bytes: ${bytes}; largest: ${largest.name} (${largest.data.length} bytes)`);
  console.log('Deploy assets from ./public, NOT . or the repository root.');
  for (const entry of inputs) console.log(`${entry.sha256}  public/${entry.name}`);
}

try { build(); }
catch (error) {
  console.error(`CLOUDFLARE CF2 BUILD STOPPED: ${error.message}`);
  process.exitCode = 1;
}
