/**
 * Generic mock data generator for admin prototypes.
 *
 * Usage:
 *   node scripts/gen-mock-data.mjs                 # list presets
 *   node scripts/gen-mock-data.mjs all             # write all presets
 *   node scripts/gen-mock-data.mjs crm             # one preset
 *   node scripts/gen-mock-data.mjs crm --count 200 --seed 42
 *   node scripts/gen-mock-data.mjs --schema ./my-schema.json
 *
 * Schema file shape:
 * {
 *   "global": "ProFooRows",
 *   "out": "mock-foo.js",
 *   "count": 50,
 *   "seed": 1,
 *   "fields": {
 *     "id": { "type": "id", "prefix": "ORD-", "start": 1000, "step": -1 },
 *     "name": { "type": "name" },
 *     "email": { "type": "email" },
 *     "status": { "type": "enum", "values": ["open", "done"] },
 *     "amount": { "type": "money", "min": 100, "max": 9000, "decimals": 0 },
 *     "createdAt": { "type": "datetime", "from": "2026-01-01", "to": "2026-08-01" },
 *     "joined": { "type": "date", "from": "2026-01-01", "to": "2026-08-01" },
 *     "items": { "type": "template", "pattern": "{n} items", "n": { "min": 1, "max": 7 } },
 *     "priority": { "type": "int", "min": 1, "max": 3 },
 *     "flag": { "type": "const", "value": true },
 *     "note": { "type": "pick", "values": ["a", "b"], "mode": "cycle" }
 *   }
 * }
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const jsDir = path.resolve(__dirname, '../js')

const NAMES = [
  '\u738b\u96c5\u7433', '\u674e\u4fca\u6770', '\u9648\u7f8e\u73b2', '\u5f20\u4f1f', '\u5218\u601d\u96e8',
  '\u8d75\u5b50\u8f69', '\u5468\u96e8\u8431', '\u5434\u6d69\u7136', '\u90d1\u6b23\u6021', '\u5b59\u660e\u54f2',
  '\u9ec4\u8bd7\u6db5', '\u6797\u5fd7\u8fdc', '\u4f55\u4f73\u5b81', '\u7f57\u5b87\u8fb0', '\u9ad8\u5a49\u6e05',
  '\u5f90\u5929\u4f51', '\u9a6c\u601d\u742a', '\u8c22\u4fca\u8c6a', '\u97e9\u96e8\u6850', '\u51af\u542f\u822a',
  '\u66f9\u96c5\u5a77', '\u9093\u5b50\u58a8', '\u5f6d\u4f73\u6167', '\u848b\u6587\u535a', '\u8521\u5fc3\u6021',
  '\u8881\u6d69\u5b87', '\u53f6\u6e05\u598d', '\u7a0b\u7acb\u8f69', '\u6f58\u68a6\u7476', '\u9b4f\u5b50\u6db5',
  '\u6c88\u82e5\u66e6', '\u6881\u8fb0\u5e0c', '\u82cf\u5a49\u6674', '\u5510\u5b50\u5b89', '\u59dc\u96e8\u8587',
  '\u8303\u666f\u884c', '\u9646\u53ef\u99a8', '\u4e01\u6d69\u94ed', '\u4efb\u601d\u8fdc', '\u590f\u6e05\u626c',
]

const NAME_PINYIN = [
  'wangyalin', 'lijunjie', 'chenmeiling', 'zhangwei', 'liusiuyu',
  'zhaozixuan', 'zhouyuxuan', 'wuhaoran', 'zhengxinyi', 'sunmingzhe',
  'huangshihan', 'linzhiyuan', 'hejianing', 'luoyuchen', 'gaowanqing',
  'xutianyou', 'masiqi', 'xiejunhao', 'hanyutong', 'fengqihang',
  'caoyating', 'dengzimo', 'pengjiahui', 'jiangwenbo', 'caixinyi',
  'yuanhaoyu', 'yeqingyan', 'chenglixuan', 'panmengyao', 'weizihan',
  'shenruoxi', 'liangchenxi', 'suwanqing', 'tangzian', 'jiangyuwei',
  'fanjingxing', 'lukexin', 'dinghaoming', 'rensiyuan', 'xiaqingyang',
]

const EMAIL_DOMAINS = [
  'northstar.io', 'cedarpoint.co', 'brightpath.app', 'bluepeak.app', 'ridgefield.io',
  'pulselabs.ai', 'oakline.co', 'holloway.io', 'quantix.dev', 'clearledger.co',
  'streamline.app', 'westgate.io', 'firstharbor.co', 'northline.app', 'wildelm.co',
  'bridgepoint.io', 'vervegrid.app', 'pulseforge.io',
]

function mulberry32(seed) {
  let t = seed >>> 0
  return () => {
    t += 0x6d2b79f5
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

function pad(n, len = 2) {
  return String(n).padStart(len, '0')
}

function parseDay(s) {
  const [y, m, d] = String(s).split('-').map(Number)
  return new Date(y, m - 1, d, 0, 0, 0, 0)
}

function formatDate(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function formatDateTime(d) {
  return `${formatDate(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

function formatMoney(n, decimals = 0) {
  return `¥${n.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`
}

function pick(rand, values) {
  return values[Math.floor(rand() * values.length)]
}

function intBetween(rand, min, max) {
  return Math.floor(min + rand() * (max - min + 1))
}

function floatBetween(rand, min, max) {
  return min + rand() * (max - min)
}

function dayBetween(rand, from, to) {
  const a = parseDay(from).getTime()
  const b = parseDay(to).getTime()
  const t = a + rand() * Math.max(0, b - a)
  return new Date(t)
}

function resolveTemplate(pattern, ctx) {
  return String(pattern).replace(/\{(\w+)\}/g, (_, key) =>
    ctx[key] == null ? '' : String(ctx[key])
  )
}

function createCtx(seed) {
  const rand = mulberry32(seed)
  return {
    rand,
    name(i) {
      return NAMES[i % NAMES.length]
    },
    pinyin(i) {
      return NAME_PINYIN[i % NAME_PINYIN.length]
    },
    domain(i) {
      return EMAIL_DOMAINS[i % EMAIL_DOMAINS.length]
    },
  }
}

function fieldValue(spec, i, ctx, row) {
  const type = spec.type || 'const'
  switch (type) {
    case 'const':
      return spec.value
    case 'name':
      return ctx.name(i)
    case 'email': {
      const local = spec.local === 'pinyin' || !spec.local ? ctx.pinyin(i) : resolveTemplate(spec.local, { ...row, i, name: ctx.pinyin(i) })
      const domain = spec.domain || ctx.domain(i)
      return `${local}@${domain}`
    }
    case 'enum':
    case 'pick': {
      const values = spec.values || []
      if (!values.length) return null
      if (spec.mode === 'cycle') return values[i % values.length]
      return pick(ctx.rand, values)
    }
    case 'id': {
      const start = spec.start ?? 1000
      const step = spec.step ?? -1
      const n = start + i * step
      const width = spec.width
      const body = width ? pad(n, width) : String(n)
      return `${spec.prefix || ''}${body}${spec.suffix || ''}`
    }
    case 'int':
      return intBetween(ctx.rand, spec.min ?? 0, spec.max ?? 100)
    case 'float': {
      const n = floatBetween(ctx.rand, spec.min ?? 0, spec.max ?? 1)
      const decimals = spec.decimals ?? 2
      return Number(n.toFixed(decimals))
    }
    case 'money': {
      const raw = floatBetween(ctx.rand, spec.min ?? 100, spec.max ?? 10000)
      const decimals = spec.decimals ?? 0
      const factor = 10 ** decimals
      const n = Math.round(raw * factor) / factor
      return formatMoney(n, decimals)
    }
    case 'date': {
      if (spec.stepDays != null) {
        const base = parseDay(spec.from || spec.to || '2026-08-01')
        base.setDate(base.getDate() + i * Number(spec.stepDays))
        return formatDate(base)
      }
      const d = dayBetween(ctx.rand, spec.from || '2026-01-01', spec.to || '2026-08-01')
      if (spec.offsetDays != null) d.setDate(d.getDate() + Number(spec.offsetDays))
      return formatDate(d)
    }
    case 'datetime': {
      if (spec.stepDays != null || spec.start) {
        const base = parseDay(spec.start || spec.from || '2026-05-09')
        base.setDate(base.getDate() + i * Number(spec.stepDays ?? -1))
        base.setHours(intBetween(ctx.rand, spec.hourMin ?? 9, spec.hourMax ?? 22))
        base.setMinutes(intBetween(ctx.rand, 0, 59))
        base.setSeconds(intBetween(ctx.rand, 0, 59))
        return formatDateTime(base)
      }
      const d = dayBetween(ctx.rand, spec.from || '2026-01-01', spec.to || '2026-08-01')
      d.setHours(intBetween(ctx.rand, spec.hourMin ?? 9, spec.hourMax ?? 22))
      d.setMinutes(intBetween(ctx.rand, 0, 59))
      d.setSeconds(intBetween(ctx.rand, 0, 59))
      return formatDateTime(d)
    }
    case 'template': {
      const vars = { i, ...(spec.vars || {}) }
      for (const [k, v] of Object.entries(spec)) {
        if (k === 'type' || k === 'pattern' || k === 'vars') continue
        if (v && typeof v === 'object' && (v.min != null || v.max != null)) {
          vars[k] = intBetween(ctx.rand, v.min ?? 0, v.max ?? 10)
        }
      }
      return resolveTemplate(spec.pattern || '', { ...row, ...vars })
    }
    default:
      throw new Error(`Unknown field type: ${type}`)
  }
}

function generateRows(schema, overrides = {}) {
  const count = Number(overrides.count ?? schema.count ?? 50)
  const seed = Number(overrides.seed ?? schema.seed ?? 20260813)
  const ctx = createCtx(seed)
  const fields = schema.fields || {}
  const keys = Object.keys(fields)

  return Array.from({ length: count }, (_, i) => {
    const row = {}
    for (const key of keys) {
      row[key] = fieldValue(fields[key], i, ctx, row)
    }
    return row
  })
}

function writeBundle(globalName, rows, outFile) {
  const target = path.isAbsolute(outFile) ? outFile : path.resolve(jsDir, outFile)
  const body = `window.${globalName} = ${JSON.stringify(rows)};\n`
  fs.writeFileSync(target, body, 'utf8')
  return { target, count: rows.length, sample: rows[0] }
}

const PRESETS = {
  crm: {
    desc: 'CRM opportunities table (dashboard-crm)',
    global: 'ProCrmOpportunities',
    out: 'mock-crm-opportunities.js',
    count: 132,
    seed: 20260813,
    fields: {
      id: { type: 'id', prefix: 'OP-', start: 1842, step: -1 },
      account: { type: 'name' },
      stage: {
        type: 'enum',
        mode: 'cycle',
        values: ['Qualified', 'Discovery', 'Proposal Sent', 'Negotiation'],
      },
      priority: { type: 'const', value: 1 },
      health: {
        type: 'enum',
        values: ['On Track', 'Needs Review', 'At Risk', 'On Hold'],
      },
      value: { type: 'money', min: 8000, max: 100000, decimals: 0 },
    },
  },
  ecommerce: {
    desc: 'Ecommerce orders table (dashboard-ecommerce)',
    global: 'ProEcommerceOrders',
    out: 'mock-ecommerce-orders.js',
    count: 36,
    seed: 20260509,
    fields: {
      id: { type: 'id', prefix: '#', start: 14550, step: -14 },
      date: {
        type: 'datetime',
        start: '2026-05-09',
        stepDays: -1,
        hourMin: 9,
        hourMax: 23,
      },
      customer: { type: 'name' },
      payment: { type: 'enum', values: ['Pending', 'Paid', 'Refunded'] },
      total: { type: 'money', min: 30, max: 8000, decimals: 2 },
      items: {
        type: 'template',
        pattern: '{n} \u4ef6\u5546\u54c1',
        n: { min: 1, max: 7 },
      },
      fulfillment: {
        type: 'enum',
        values: ['Unfulfilled', 'Fulfilled', 'Returned'],
      },
    },
  },
  customer: {
    desc: 'Customer dashboard rows (dashboard-customer)',
    global: 'ProCustomerDashboardRows',
    out: 'mock-customer-dashboard.js',
    count: 60,
    seed: 20260430,
    fields: {
      id: { type: 'id', start: 18425, step: -1 },
      name: { type: 'name' },
      email: { type: 'email' },
      plan: {
        type: 'enum',
        mode: 'cycle',
        values: ['Enterprise', 'Growth', 'Pro', 'Starter'],
      },
      status: {
        type: 'enum',
        values: ['Subscribed', 'Inactive', 'Unsubscribed'],
      },
      billing: {
        type: 'enum',
        values: ['Paid', 'Pending', 'Overdue', 'Trial'],
      },
      joined: { type: 'date', from: '2026-04-30', stepDays: -1 },
    },
  },
}

function printHelp() {
  console.log(`Presets:`)
  for (const [key, p] of Object.entries(PRESETS)) {
    console.log(`  ${key.padEnd(12)} ${p.desc} -> js/${p.out}`)
  }
  console.log(`\nExamples:`)
  console.log(`  node scripts/gen-mock-data.mjs all`)
  console.log(`  node scripts/gen-mock-data.mjs crm --count 200`)
  console.log(`  node scripts/gen-mock-data.mjs --schema ./scripts/mock-schemas/example.json`)
}

function parseArgs(argv) {
  const args = { targets: [], count: null, seed: null, schema: null, help: false }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--help' || a === '-h') args.help = true
    else if (a === '--count') args.count = Number(argv[++i])
    else if (a === '--seed') args.seed = Number(argv[++i])
    else if (a === '--schema') args.schema = argv[++i]
    else if (a.startsWith('-')) throw new Error(`Unknown flag: ${a}`)
    else args.targets.push(a)
  }
  return args
}

function runPreset(name, overrides) {
  const schema = PRESETS[name]
  if (!schema) throw new Error(`Unknown preset: ${name}`)
  const rows = generateRows(schema, overrides)
  const result = writeBundle(schema.global, rows, schema.out)
  console.log(`wrote ${path.relative(process.cwd(), result.target)} (${result.count})`, result.sample)
}

function runSchemaFile(schemaPath, overrides) {
  const abs = path.resolve(process.cwd(), schemaPath)
  const schema = JSON.parse(fs.readFileSync(abs, 'utf8'))
  if (!schema.global || !schema.out || !schema.fields) {
    throw new Error('Schema requires global, out, fields')
  }
  const rows = generateRows(schema, overrides)
  const result = writeBundle(schema.global, rows, schema.out)
  console.log(`wrote ${path.relative(process.cwd(), result.target)} (${result.count})`, result.sample)
}

function main() {
  const args = parseArgs(process.argv.slice(2))
  if (args.help || (!args.targets.length && !args.schema)) {
    printHelp()
    return
  }

  const overrides = {}
  if (args.count != null && !Number.isNaN(args.count)) overrides.count = args.count
  if (args.seed != null && !Number.isNaN(args.seed)) overrides.seed = args.seed

  if (args.schema) {
    runSchemaFile(args.schema, overrides)
    return
  }

  const names = args.targets.includes('all') ? Object.keys(PRESETS) : args.targets
  for (const name of names) runPreset(name, overrides)
}

main()
