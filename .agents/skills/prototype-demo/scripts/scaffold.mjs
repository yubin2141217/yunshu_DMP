#!/usr/bin/env node
/**
 * 统一脚手架：按 end 从包根 frame/ 复制母版到交付目录。
 *
 * 用法:
 *   node scaffold.mjs --end admin [--theme arco] [--out admin] [--full]
 *   node scaffold.mjs --end web  [--out web]
 *   node scaffold.mjs --end app  [--out app]
 *
 * admin 默认 **lean**：只拷运行时基座 + login-cover.html；业务页由 Agent 按 pages.catalog.json 按需复制。
 * Meta（_meta/）不复制到交付目录。
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SKILL_ROOT = path.resolve(__dirname, '..')
const PACK_ROOT = path.resolve(SKILL_ROOT, '../../..')
const FRAME_ROOT = path.join(PACK_ROOT, 'frame')
const INDEX_PATH = path.join(FRAME_ROOT, 'index.json')

const ADMIN_RUNTIME_IGNORE = [
  'node_modules',
  '.git',
  '_meta',
  'scripts',
  'package.json',
  'package-lock.json',
  'README.md',
]

/** lean 模式：根目录保留的 HTML（其余样板页不进入交付） */
const ADMIN_LEAN_HTML_KEEP = new Set(['login-cover.html'])

const WEB_BASE_DIRS = ['fonts', 'vendor', 'images']
const APP_BASE_DIRS = ['css', 'js', 'fonts', 'images', 'vendor']

function parseArgs(argv) {
  const opts = {
    end: null,
    theme: 'arco',
    out: null,
    framework: null,
    allowPreviewOut: false,
    full: false,
    help: false,
  }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--end' && argv[i + 1]) opts.end = argv[++i]
    else if (a === '--theme' && argv[i + 1]) opts.theme = argv[++i]
    else if (a === '--out' && argv[i + 1]) opts.out = argv[++i]
    else if (a === '--framework' && argv[i + 1]) opts.framework = argv[++i]
    else if (a === '--allow-preview-out') opts.allowPreviewOut = true
    else if (a === '--full') opts.full = true
    else if (a === '--help' || a === '-h') opts.help = true
  }
  return opts
}

function loadIndex() {
  if (!fs.existsSync(INDEX_PATH)) {
    console.error(`frame/index.json not found: ${INDEX_PATH}`)
    process.exit(1)
  }
  return readJsonFile(INDEX_PATH)
}

function assertNotPreviewOutput(out, { allowPreviewOut = false } = {}) {
  const base = path.basename(path.resolve(process.cwd(), out))
  if (allowPreviewOut || !/-preview$/i.test(base)) return
  console.error(`Refusing preview output directory: ${base}`)
  console.error('Deliver to --out admin|web|app, or preview frame/<path>/ with a static server.')
  console.error('Override only if intentional: --allow-preview-out')
  process.exit(1)
}

function copyDir(src, dest, { ignore = [] } = {}) {
  if (!fs.existsSync(src)) return false
  fs.mkdirSync(dest, { recursive: true })
  for (const name of fs.readdirSync(src)) {
    if (ignore.includes(name)) continue
    const s = path.join(src, name)
    const d = path.join(dest, name)
    const stat = fs.statSync(s)
    if (stat.isDirectory()) copyDir(s, d, { ignore })
    else fs.copyFileSync(s, d)
  }
  return true
}

function copyNamedDirs(srcRoot, destRoot, names) {
  fs.mkdirSync(destRoot, { recursive: true })
  for (const name of names) {
    const s = path.join(srcRoot, name)
    if (!fs.existsSync(s)) continue
    copyDir(s, path.join(destRoot, name))
  }
}

function readJsonFile(filePath) {
  let text = fs.readFileSync(filePath, 'utf8')
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1)
  return JSON.parse(text)
}

function readManifest(frameworkAbs) {
  const p = path.join(frameworkAbs, '_meta', 'template.manifest.json')
  if (!fs.existsSync(p)) return null
  return readJsonFile(p)
}

function resolveAdminFramework(endCfg, theme, frameworkId) {
  const frameworks = endCfg.frameworks || {}
  let id = frameworkId
  if (!id) {
    id =
      Object.keys(frameworks).find((k) => frameworks[k].theme === theme) ||
      endCfg.defaultFramework
  }
  const entry = frameworks[id]
  if (!entry || entry.status === 'pending') {
    console.error(`Admin framework unavailable: ${id || theme}. Use --theme arco.`)
    process.exit(1)
  }
  return { id, entry }
}

function writeAdminConfig(outDir, { theme, templateId, manifest, frameworkId, scaffoldMode }) {
  const config = {
    end: 'admin',
    theme,
    frameworkId,
    templateId: templateId || frameworkId,
    templateVersion: manifest?.version ?? '1.0.0',
    scaffoldMode: scaffoldMode || 'lean',
    outputDir: path.basename(outDir),
    createdAt: new Date().toISOString().slice(0, 10),
  }
  fs.writeFileSync(
    path.join(outDir, '.admin-config.json'),
    JSON.stringify(config, null, 2) + '\n',
    'utf8'
  )
}

function writeProtoConfig(outDir, { end, frameworkId, manifest }) {
  const config = {
    end,
    frameworkId,
    frameworkVersion: manifest?.version ?? '1.0.0',
    outputDir: path.basename(outDir),
    createdAt: new Date().toISOString().slice(0, 10),
  }
  fs.writeFileSync(
    path.join(outDir, '.prototype-config.json'),
    JSON.stringify(config, null, 2) + '\n',
    'utf8'
  )
}

function ensureEmptyOrAbort(outDir) {
  if (fs.existsSync(outDir) && fs.readdirSync(outDir).length > 0) {
    console.error(`Output directory not empty: ${outDir}`)
    console.error('Scaffold aborted. Use empty dir or remove existing delivery folder.')
    process.exit(1)
  }
}

/** lean：去掉样板业务页，只留 login + 运行时；业务页按 catalog 按需复制 */
function trimAdminLeanDelivery(outDir) {
  for (const name of fs.readdirSync(outDir)) {
    if (!name.endsWith('.html')) continue
    if (ADMIN_LEAN_HTML_KEEP.has(name)) continue
    fs.unlinkSync(path.join(outDir, name))
  }
  const pagesDir = path.join(outDir, 'js', 'pages')
  if (fs.existsSync(pagesDir)) {
    for (const name of fs.readdirSync(pagesDir)) {
      fs.unlinkSync(path.join(pagesDir, name))
    }
  }
  // 页面级 CSS 仍保留在 css/（体积小；按需复制样板时也可覆盖）。演示页专用 css 可留，不阻塞交付。
}

function scaffoldAdmin(opts, endCfg) {
  const { id, entry } = resolveAdminFramework(endCfg, opts.theme, opts.framework)
  const src = path.join(FRAME_ROOT, entry.path)
  const outDir = path.resolve(process.cwd(), opts.out || endCfg.outputDir || 'admin')
  assertNotPreviewOutput(opts.out || endCfg.outputDir, { allowPreviewOut: opts.allowPreviewOut })
  ensureEmptyOrAbort(outDir)

  if (!fs.existsSync(src)) {
    console.error(`Framework not found: ${src}`)
    process.exit(1)
  }

  const mode = opts.full ? 'full' : 'lean'
  console.log(`Copying admin runtime ${src} -> ${outDir} (mode=${mode})`)
  copyDir(src, outDir, { ignore: ADMIN_RUNTIME_IGNORE })
  if (mode === 'lean') trimAdminLeanDelivery(outDir)

  const manifest = readManifest(src)
  writeAdminConfig(outDir, {
    theme: entry.theme || opts.theme,
    templateId: manifest?.id || id,
    manifest,
    frameworkId: id,
    scaffoldMode: mode,
  })
  console.log(`Done. end=admin framework=${id} theme=${entry.theme} mode=${mode}`)
  if (mode === 'lean') {
    console.log(
      'Lean: only login-cover.html + runtime. Copy pages from frame/.../_meta/pages.catalog.json'
    )
  }
  console.log('Next: references/admin/pages.md + pages.catalog.json')
}

function scaffoldWeb(opts, endCfg) {
  const id = opts.framework || endCfg.defaultFramework
  const entry = endCfg.frameworks[id]
  if (!entry) {
    console.error(`Unknown web framework: ${id}`)
    process.exit(1)
  }
  const src = path.join(FRAME_ROOT, entry.path)
  const outDir = path.resolve(process.cwd(), opts.out || endCfg.outputDir || 'web')
  assertNotPreviewOutput(opts.out || endCfg.outputDir, { allowPreviewOut: opts.allowPreviewOut })
  ensureEmptyOrAbort(outDir)

  console.log(`Copying web base dirs from ${src} -> ${outDir}`)
  copyNamedDirs(src, outDir, WEB_BASE_DIRS)
  const manifest = readManifest(src)
  writeProtoConfig(outDir, { end: 'web', frameworkId: id, manifest })
  console.log(`Done. end=web framework=${id}. Add pages per SKILL (index.html + css/js).`)
}

function scaffoldApp(opts, endCfg) {
  const id = opts.framework || endCfg.defaultFramework
  const entry = endCfg.frameworks[id]
  if (!entry) {
    console.error(`Unknown app framework: ${id}`)
    process.exit(1)
  }
  const src = path.join(FRAME_ROOT, entry.path)
  const outDir = path.resolve(process.cwd(), opts.out || endCfg.outputDir || 'app')
  assertNotPreviewOutput(opts.out || endCfg.outputDir, { allowPreviewOut: opts.allowPreviewOut })
  ensureEmptyOrAbort(outDir)

  console.log(`Copying app base dirs from ${src} -> ${outDir}`)
  copyNamedDirs(src, outDir, APP_BASE_DIRS)
  const globalSrc = path.join(src, 'css', 'global.css')
  if (fs.existsSync(globalSrc)) {
    fs.mkdirSync(path.join(outDir, 'css'), { recursive: true })
    fs.copyFileSync(globalSrc, path.join(outDir, 'css', 'global.css'))
  }
  const manifest = readManifest(src)
  writeProtoConfig(outDir, { end: 'app', frameworkId: id, manifest })
  console.log(`Done. end=app framework=${id}. Pick shell from frame/app/*.html`)
}

function main() {
  const opts = parseArgs(process.argv.slice(2))
  if (opts.help || !opts.end) {
    console.log(`Usage:
  node scaffold.mjs --end admin [--theme arco] [--out admin] [--full]
  node scaffold.mjs --end web  [--out web]
  node scaffold.mjs --end app  [--out app]

  admin default = lean (login + runtime only). --full = copy all sample pages.

Frame root: ${FRAME_ROOT}`)
    process.exit(opts.help ? 0 : 1)
  }

  const index = loadIndex()
  const endCfg = index.ends?.[opts.end]
  if (!endCfg) {
    console.error(`Unknown --end: ${opts.end}. Use admin|web|app.`)
    process.exit(1)
  }

  if (opts.end === 'admin') scaffoldAdmin(opts, endCfg)
  else if (opts.end === 'web') scaffoldWeb(opts, endCfg)
  else if (opts.end === 'app') scaffoldApp(opts, endCfg)
  else {
    console.error(`Unsupported end: ${opts.end}`)
    process.exit(1)
  }
}

main()
