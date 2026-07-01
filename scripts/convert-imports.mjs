import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs'
import { resolve, dirname, relative, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const SRC_DIR = resolve(__dirname, '../src')
const EXCLUDED = ['generated']

function getAllFiles(dir) {
  const files = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      if (EXCLUDED.includes(entry)) continue
      files.push(...getAllFiles(full))
    } else if (full.endsWith('.ts')) {
      files.push(full)
    }
  }
  return files
}

let totalChanged = 0

for (const filePath of getAllFiles(SRC_DIR)) {
  const fileDir = dirname(filePath)
  let content = readFileSync(filePath, 'utf8')
  let changed = false

  const newContent = content.replace(
    /from ['"](\.[^'"]+)['"]/g,
    (match, importPath) => {
      if (!importPath.startsWith('.')) return match
      const absPath = resolve(fileDir, importPath)
      if (!absPath.startsWith(SRC_DIR)) return match
      const relFromSrc = relative(SRC_DIR, absPath).replace(/\\/g, '/')
      changed = true
      return `from '@/${relFromSrc}'`
    }
  )

  if (changed) {
    writeFileSync(filePath, newContent)
    console.log('✓', relative(SRC_DIR, filePath))
    totalChanged++
  }
}

console.log(`\nConverted ${totalChanged} files.`)
