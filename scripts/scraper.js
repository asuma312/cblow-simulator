#!/usr/bin/env node

/**
 * LoL Champion Counter Scraper
 * Puxa counter data de todos os champions via U.GG
 *
 * Uso:
 *   node scraper.js                    # todos os champions, role principal
 *   node scraper.js --role mid         # todos, filtrando por mid
 *   node scraper.js --champion yasuo   # só o Yasuo
 *   node scraper.js --top 5            # top 5 counters (default: 5)
 *   node scraper.js --output csv       # salva CSV além de JSON
 *   node scraper.js --path ./counters  # salva 1 JSON por champion em ./counters
 *   node scraper.js --delay 2000       # delay entre requests em ms (default: 1500)
 */

const fetch = globalThis.fetch ?? require("node-fetch");
const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");

// ─── Config ───────────────────────────────────────────────────────────────────

const DDRAGON_VERSIONS_URL =
  "https://ddragon.leagueoflegends.com/api/versions.json";
const DDRAGON_CHAMPIONS_URL = (ver) =>
  `https://ddragon.leagueoflegends.com/cdn/${ver}/data/en_US/champion.json`;
const UGG_COUNTER_URL = (slug, role) =>
  `https://u.gg/lol/champions/${slug}/counter${role ? `?role=${role}` : ""}`;

const ROLES = ["top", "jungle", "middle", "adc", "support"];

const DEFAULT_TOP = 5;
const DEFAULT_DELAY = 1500;

// ─── CLI Args ─────────────────────────────────────────────────────────────────

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = {
    champion: null,
    role: null,
    top: DEFAULT_TOP,
    delay: DEFAULT_DELAY,
    output: "json", // "json" | "csv" | "both"
    path: process.cwd(),
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case "--champion":
      case "-c":
        opts.champion = args[++i]?.toLowerCase();
        break;
      case "--role":
      case "-r":
        opts.role = args[++i]?.toLowerCase();
        break;
      case "--top":
      case "-t":
        opts.top = parseInt(args[++i], 10) || DEFAULT_TOP;
        break;
      case "--delay":
      case "-d":
        opts.delay = parseInt(args[++i], 10) || DEFAULT_DELAY;
        break;
      case "--output":
      case "-o":
        opts.output = args[++i]?.toLowerCase() || "json";
        break;
      case "--path":
      case "-p":
        opts.path = args[++i] || process.cwd();
        break;
      case "--help":
      case "-h":
        console.log(`
  LoL Champion Counter Scraper

  Opções:
    -c, --champion <name>   Scrape só um champion (ex: yasuo)
    -r, --role <role>        Filtra por role: top, jungle, middle, adc, support
    -t, --top <n>            Quantidade de counters por champion (default: 5)
    -d, --delay <ms>         Delay entre requests em ms (default: 1500)
    -o, --output <format>    json | csv | both (default: json)
    -p, --path <dir>         Diretório de saída (default: cwd)
    -h, --help               Mostra essa ajuda
        `);
        process.exit(0);
    }
  }

  return opts;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
};

// ─── Data Dragon: lista de champions ──────────────────────────────────────────

async function getChampionList() {
  console.log("Buscando versão atual do Data Dragon...");
  const versions = await fetch(DDRAGON_VERSIONS_URL).then((r) => r.json());
  const latest = versions[0];
  console.log(`Versão: ${latest}`);

  console.log("Buscando lista de champions...");
  const data = await fetch(DDRAGON_CHAMPIONS_URL(latest)).then((r) => r.json());

  return Object.values(data.data).map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.id.toLowerCase(), // U.GG usa lowercase do id
  }));
}

// ─── Parser: extrai counters do HTML do U.GG ─────────────────────────────────

function parseCounterPage(html, championName) {
  const $ = cheerio.load(html);
  const result = {
    champion: championName,
    patch: "",
    counters: [],     // quem ganha do champion (best picks against)
    weakAgainst: [],   // quem o champion ganha (worst picks against)
  };

  // Tenta extrair patch do título
  const title = $("title").text();
  const patchMatch = title.match(/Patch\s+([\d.]+)/i);
  if (patchMatch) result.patch = patchMatch[1];

  // U.GG renderiza server-side com links no formato:
  // <a href="/lol/champions/pantheon/build">
  //   <span>Pantheon</span>
  //   <span>56.12% WR</span>
  //   <span>784 games</span>
  // </a>
  //
  // Estratégia: procurar por blocos de texto que contenham "% WR" e "games"

  // Abordagem 1: extrair do texto raw da página (mais resiliente)
  const pageText = $.text();

  // Procura seções "Best Picks" e "Worst Picks"
  const bestPicksSection = extractSection(
    pageText,
    /best\s*picks?\s*vs/i,
    /worst\s*picks?\s*vs/i
  );
  const worstPicksSection = extractSection(
    pageText,
    /worst\s*picks?\s*vs/i,
    /early\s*game|lane\s*counters|GD.?15|$$/i
  );

  if (bestPicksSection) {
    result.counters = extractMatchups(bestPicksSection);
  }
  if (worstPicksSection) {
    result.weakAgainst = extractMatchups(worstPicksSection);
  }

  // Abordagem 2: fallback via links com padrão de WR
  if (result.counters.length === 0) {
    const links = [];
    $("a[href*='/lol/champions/']").each((_, el) => {
      const text = $(el).text().trim();
      const wrMatch = text.match(/([\d.]+)%\s*WR/);
      const gamesMatch = text.match(/([\d,]+)\s*games?/);
      const nameMatch = text.replace(/([\d.]+%\s*WR|[\d,]+\s*games?)/g, "").trim();
      if (wrMatch && gamesMatch && nameMatch) {
        links.push({
          champion: nameMatch,
          winRate: parseFloat(wrMatch[1]),
          games: parseInt(gamesMatch[1].replace(/,/g, ""), 10),
        });
      }
    });

    // Primeira metade = counters (sorted high WR), segunda metade = weak
    if (links.length > 0) {
      const sorted = [...links].sort((a, b) => b.winRate - a.winRate);
      const mid = Math.ceil(sorted.length / 2);
      result.counters = sorted.slice(0, mid);
      result.weakAgainst = sorted.slice(mid).reverse();
    }
  }

  return result;
}

function extractSection(text, startRegex, endRegex) {
  const startMatch = text.match(startRegex);
  if (!startMatch) return null;
  const startIdx = startMatch.index + startMatch[0].length;
  const remaining = text.slice(startIdx);
  const endMatch = remaining.match(endRegex);
  return endMatch ? remaining.slice(0, endMatch.index) : remaining.slice(0, 5000);
}

function extractMatchups(text) {
  const matchups = [];
  // Regex para capturar: "ChampionName XX.XX% WR N,NNN games"
  const regex =
    /([A-Z][a-zA-Z'\s.]+?)\s*([\d.]+)%\s*WR\s*([\d,]+)\s*games?/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    const name = match[1].trim();
    // Filtra nomes inválidos (muito curtos ou com lixo)
    if (name.length < 2 || name.length > 30) continue;
    matchups.push({
      champion: name,
      winRate: parseFloat(match[2]),
      games: parseInt(match[3].replace(/,/g, ""), 10),
    });
  }
  return matchups;
}

// ─── Scraper principal ───────────────────────────────────────────────────────

async function scrapeChampionCounters(champion, role, topN) {
  const url = UGG_COUNTER_URL(champion.slug, role);
  const resp = await fetch(url, { headers: HEADERS });

  if (!resp.ok) {
    console.error(`  ERRO ${resp.status} ao buscar ${url}`);
    return null;
  }

  const html = await resp.text();
  const data = parseCounterPage(html, champion.name);

  // Detecta role da página
  data.role = role || "main";

  // Limita ao top N
  data.counters = data.counters.slice(0, topN);
  data.weakAgainst = data.weakAgainst.slice(0, topN);

  return data;
}

// ─── Output ──────────────────────────────────────────────────────────────────

function saveJSON(results, filename) {
  const out = JSON.stringify(results, null, 2);
  fs.writeFileSync(filename, out, "utf-8");
  console.log(`\nJSON salvo em: ${filename} (${results.length} champions)`);
}

function saveCSV(results, filename, topN) {
  const rows = ["champion,role,patch,rank,type,counter_champion,win_rate,games"];

  for (const r of results) {
    for (let i = 0; i < r.counters.length; i++) {
      const c = r.counters[i];
      rows.push(
        `"${r.champion}","${r.role}","${r.patch}",${i + 1},"counter","${c.champion}",${c.winRate},${c.games}`
      );
    }
    for (let i = 0; i < r.weakAgainst.length; i++) {
      const c = r.weakAgainst[i];
      rows.push(
        `"${r.champion}","${r.role}","${r.patch}",${i + 1},"weak_against","${c.champion}",${c.winRate},${c.games}`
      );
    }
  }

  fs.writeFileSync(filename, rows.join("\n"), "utf-8");
  console.log(`CSV salvo em: ${filename} (${rows.length - 1} linhas)`);
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const opts = parseArgs();

  console.log("╔═══════════════════════════════════════╗");
  console.log("║   LoL Champion Counter Scraper        ║");
  console.log("║   Fonte: U.GG                         ║");
  console.log("╚═══════════════════════════════════════╝\n");

  // Pega lista de champions
  let champions = await getChampionList();
  console.log(`${champions.length} champions encontrados.\n`);

  // Filtra se pediu champion específico
  if (opts.champion) {
    champions = champions.filter(
      (c) =>
        c.slug === opts.champion ||
        c.name.toLowerCase() === opts.champion ||
        c.id.toLowerCase() === opts.champion
    );
    if (champions.length === 0) {
      console.error(`Champion "${opts.champion}" não encontrado!`);
      process.exit(1);
    }
  }

  // Prepara diretório de saída
  const outDir = path.resolve(opts.path);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
    console.log(`Diretório criado: ${outDir}`);
  }
  console.log(`Output: ${outDir}\n`);

  const results = [];
  const rolesToScrape = opts.role ? [opts.role] : ROLES;
  const total = champions.length;
  const grandTotal = total * rolesToScrape.length;
  let done = 0;
  let errors = 0;

  console.log(`Total de requests: ${grandTotal} (${total} champions × ${rolesToScrape.length} roles)\n`);

  for (let i = 0; i < total; i++) {
    const champ = champions[i];

    for (const role of rolesToScrape) {
      done++;
      const progress = `[${done}/${grandTotal}]`;
      process.stdout.write(`${progress} ${champ.name} (${role})...`);

      try {
        const data = await scrapeChampionCounters(champ, role, opts.top);
        if (data && data.counters.length > 0) {
          results.push(data);
          const topCounter = data.counters[0];
          console.log(` OK — #1 counter: ${topCounter.champion} (${topCounter.winRate}% WR)`);

          const champFile = path.join(outDir, `${champ.slug}_${role}.json`);
          fs.writeFileSync(champFile, JSON.stringify(data, null, 2), "utf-8");
        } else {
          console.log(` sem dados de counter`);
        }
      } catch (err) {
        console.log(` ERRO: ${err.message}`);
        errors++;
      }

      // Rate limit entre todos os requests
      if (done < grandTotal) {
        await sleep(opts.delay);
      }
    }
  }

  // Salva resultados
  console.log(`\n${"═".repeat(50)}`);
  console.log(`Concluído: ${results.length} OK, ${errors} erros`);
  console.log(`Arquivos salvos em: ${outDir}`);

  // CSV consolidado (opcional)
  if (opts.output === "csv" || opts.output === "both") {
    const timestamp = new Date().toISOString().slice(0, 10);
    const roleTag = opts.role ? `_${opts.role}` : "_all_roles";
    saveCSV(results, path.join(outDir, `_all_counters${roleTag}_${timestamp}.csv`), opts.top);
  }

  // Mostra preview
  if (results.length > 0 && results.length <= 5) {
    console.log("\n── Preview ──────────────────────────────");
    for (const r of results) {
      console.log(`\n${r.champion} (${r.role}) — Patch ${r.patch}`);
      console.log("  Counters (quem ganha dele):");
      r.counters.forEach((c, i) =>
        console.log(`    ${i + 1}. ${c.champion} — ${c.winRate}% WR (${c.games} games)`)
      );
      if (r.weakAgainst.length > 0) {
        console.log("  Weak against (quem ele ganha):");
        r.weakAgainst.forEach((c, i) =>
          console.log(`    ${i + 1}. ${c.champion} — ${c.winRate}% WR (${c.games} games)`)
        );
      }
    }
  }
}

main().catch((err) => {
  console.error("Erro fatal:", err);
  process.exit(1);
});