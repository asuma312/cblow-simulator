/**
 * Converte os arquivos .ts de src/data/champions/ para .json,
 * embutindo os dados de counters de data/counters/ em cada campeão.
 * Apaga os .ts originais ao final.
 */

import { readFileSync, writeFileSync, readdirSync, existsSync, unlinkSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const CHAMP_DIR = resolve(ROOT, 'src/data/champions')
const COUNTER_DIR = resolve(ROOT, 'data/counters')

function normalize(name) {
    return name.toLowerCase().replace(/[^a-z]/g, '')
}

const ROLES = ['top', 'jungle', 'middle', 'adc', 'support']

const files = readdirSync(CHAMP_DIR).filter(f => f.endsWith('.ts') && f !== 'index.ts')

let done = 0
let missingCounters = 0

for (const file of files) {
    const content = readFileSync(resolve(CHAMP_DIR, file), 'utf8')

    const idMatch    = content.match(/id:\s*['"]([^'"]+)['"]/)
    const nameMatch  = content.match(/name:\s*['"]([^'"]+)['"]/)
    const posMatch   = content.match(/positions:\s*\[([^\]]+)\]/)

    if (!idMatch || !nameMatch || !posMatch) {
        console.warn(`⚠ Não consegui parsear ${file}`)
        continue
    }

    const id        = idMatch[1]
    const name      = nameMatch[1]
    const positions = [...posMatch[1].matchAll(/['"]([^'"]+)['"]/g)].map(m => m[1])
    const champKey  = normalize(id)

    const counters = {}
    for (const role of ROLES) {
        const counterFile = resolve(COUNTER_DIR, `${champKey}_${role}.json`)
        if (!existsSync(counterFile)) {
            missingCounters++
            continue
        }
        const data = JSON.parse(readFileSync(counterFile, 'utf8'))
        const roleMap = {}
        for (const entry of data.counters) {
            roleMap[entry.champion] = entry.winRate
        }
        counters[role] = roleMap
    }

    const json = { id, name, positions, counters }
    const outPath = resolve(CHAMP_DIR, file.replace('.ts', '.json'))
    writeFileSync(outPath, JSON.stringify(json, null, 2) + '\n')

    unlinkSync(resolve(CHAMP_DIR, file))
    done++
}

console.log(`\n✓ ${done} campeões convertidos`)
if (missingCounters > 0) console.log(`  (${missingCounters} arquivos de counter não encontrados — normal para roles off-meta)`)
