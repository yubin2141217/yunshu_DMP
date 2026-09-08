#!/usr/bin/env node
/**
 * 将**外部** Arco 静态母版同步到包根 frame/admin（runtime 部分）。
 * Canonical 母版在 `frame/admin/`，日常直接在该目录维护即可。
 *
 * 用法:
 *   node sync-arco-template.mjs --from /path/to/external-arco-prototype
 *   node sync-arco-template.mjs --help
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PACK_ROOT = path.resolve(__dirname, '../../../..')
const RUNTIME_DST = path.join(PACK_ROOT, 'frame/admin')
const META_DIR = path.join(RUNTIME_DST, '_meta')
const MANIFEST_PATH = path.join(META_DIR, 'template.manifest.json')
const IGNORE = new Set(['node_modules', '.git', 'README.md', 'package.json', '_meta', 'package-lock.json'])

function parseArgs(argv) {
  const opts = {}
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if ((a === '--from' || a === '-f') && argv[i + 1]) opts.from = argv[++i]
    else if (a === '--help' || a === '-h') opts.help = true
  }
  return opts
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true })
  for (const name of fs.readdirSync(src)) {
    if (IGNORE.has(name)) continue
    const s = path.join(src, name)
    const d = path.join(dest, name)
    if (fs.statSync(s).isDirectory()) copyDir(s, d)
    else fs.copyFileSync(s, d)
  }
}

function printHelp() {
  console.log(`Usage: node sync-arco-template.mjs --from <external-arco-dir>

Sync an external Arco Pro static prototype into:
  ${RUNTIME_DST}

frame/admin/ is the canonical copy. Edit it directly for day-to-day work.
This script is only needed when importing from another checkout or export.

Options:
  --from, -f   Source directory (required to sync)
  --help, -h   Show this help`)
}

function main() {
  const opts = parseArgs(process.argv.slice(2))
  if (opts.help || !opts.from) {
    printHelp()
    if (!opts.from && !opts.help) {
      console.log('\nNo --from provided. Template is self-maintained under frame/admin/.')
    }
    process.exit(opts.help || !opts.from ? 0 : 0)
  }

  const src = path.resolve(opts.from)
  if (!fs.existsSync(src)) {
    console.error('Source not found:', src)
    process.exit(1)
  }

  if (fs.existsSync(RUNTIME_DST)) {
    for (const name of fs.readdirSync(RUNTIME_DST)) {
      if (name === '_meta') continue
      fs.rmSync(path.join(RUNTIME_DST, name), { recursive: true, force: true })
    }
  } else {
    fs.mkdirSync(RUNTIME_DST, { recursive: true })
  }

  copyDir(src, RUNTIME_DST)

  if (fs.existsSync(MANIFEST_PATH)) {
    const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'))
    manifest.status = 'synced'
    manifest.syncedAt = new Date().toISOString().slice(0, 10)
    manifest.source = src
    manifest.runtimeDir = '..'
    fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n')
    console.log('Updated meta', MANIFEST_PATH)
  } else {
    console.warn('[sync] manifest not found:', MANIFEST_PATH)
  }

  console.log('Synced runtime', src, '->', RUNTIME_DST)
}

main()
