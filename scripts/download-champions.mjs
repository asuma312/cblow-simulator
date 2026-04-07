import https from 'https'
import http from 'http'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const DDRAGON_VERSION = '15.1.1'
const CHAMPION_LIST_URL = `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/data/en_US/champion.json`
const ICON_URL = (id) => `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/champion/${id}.png`

const ICONS_DIR = path.join(__dirname, '../public/champions')

function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
    }
}

function downloadFile(url, dest) {
    return new Promise((resolve, reject) => {
        if (fs.existsSync(dest)) {
            resolve('skipped')
            return
        }
        const file = fs.createWriteStream(dest)
        const client = url.startsWith('https') ? https : http
        client.get(url, (res) => {
            if (res.statusCode !== 200) {
                file.close()
                fs.unlinkSync(dest)
                reject(new Error(`HTTP ${res.statusCode} for ${url}`))
                return
            }
            res.pipe(file)
            file.on('finish', () => file.close(() => resolve('downloaded')))
        }).on('error', (err) => {
            file.close()
            if (fs.existsSync(dest)) fs.unlinkSync(dest)
            reject(err)
        })
    })
}

async function fetchJson(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = ''
            res.on('data', chunk => data += chunk)
            res.on('end', () => {
                try { resolve(JSON.parse(data)) }
                catch (e) { reject(e) }
            })
        }).on('error', reject)
    })
}

async function main() {
    ensureDir(ICONS_DIR)

    console.log(`Fetching champion list (DDragon ${DDRAGON_VERSION})...`)
    const data = await fetchJson(CHAMPION_LIST_URL)
    const champions = Object.values(data.data)
    console.log(`${champions.length} campeões encontrados.\n`)

    let downloaded = 0
    let skipped = 0
    let errors = 0

    for (let i = 0; i < champions.length; i++) {
        const { id } = champions[i]
        const progress = `[${i + 1}/${champions.length}]`

        try {
            const result = await downloadFile(ICON_URL(id), path.join(ICONS_DIR, `${id}.png`))
            if (result === 'downloaded') downloaded++
            else skipped++
        } catch (e) {
            console.error(`\n${progress} ERRO ${id}: ${e.message}`)
            errors++
        }

        process.stdout.write(`\r${progress} ${id.padEnd(20)} | baixados: ${downloaded} | já existiam: ${skipped} | erros: ${errors}`)
    }

    console.log(`\n\nConcluído!`)
    console.log(`  Baixados      : ${downloaded}`)
    console.log(`  Já existiam   : ${skipped}`)
    console.log(`  Erros         : ${errors}`)
    console.log(`\nImagens salvas em: public/champions/<ChampId>.png`)
}

main().catch(console.error)
