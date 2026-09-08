import * as esbuild from 'esbuild'
import fs from 'fs'
import path from 'path'

const outDir = 'vendor/unovis'
fs.mkdirSync(outDir, { recursive: true })

await esbuild.build({
  entryPoints: ['scripts/unovis-entry.js'],
  bundle: true,
  format: 'iife',
  globalName: 'Unovis',
  outfile: path.join(outDir, 'unovis.min.js'),
  minify: true,
  platform: 'browser',
  target: ['es2020'],
  logLevel: 'info',
})

console.log('wrote vendor/unovis/unovis.min.js')
