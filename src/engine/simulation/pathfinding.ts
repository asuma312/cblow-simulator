import { WALK_SPEED } from './constants'
import { stepToward } from './helpers'

export const GRID_COLS = 50
export const GRID_ROWS = 50
export const CELL_SIZE = 10
const GRID_SIZE = GRID_COLS * GRID_ROWS

const WALK_GRID_DATA = [
    'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXX......X....X.....XXXXXXXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXX......X....X......X.XX.......XXXXXXXXXX',
    'XXXXXXXXXXX....XXXXXXXXXX....X.XX......XXXXXXXXXXX',
    'XXXXXXXXXXX...XXXXX..XX.XX.XXX.XX.....XXXXXXXXXXXX',
    'XXXXXXXXXXXX..X.........XXXXX..XX....XXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXXX...XXXXX..X...XX..XXXXXXX.XXXXXX',
    'XXXXXX..XXXXXXX..XXXXX.XXX...XXXXX.XXXXXXX..XXXXXX',
    'XXXXX...XXXXX......XX..XXXX..XX.XXXXXXXXX...XXXXXX',
    'XXXXX.....XXX..XXX..X..XX.X..X...XXXXXXX....XXXXXX',
    'XXXXX.....XXXX.XXX..X.....X.XX..XXXXXXX.....XXXXXX',
    'XXXXX...XX.XXX.XXX..X....XXXX..XXXXXXX......XXXXXX',
    'XXXXX..XXXXXXXXX....XXXXXXX.XXXXXXXXXXXX....XXXXXX',
    'XXXXX..XX.XXXXXXXXX..XX..XX..XXXXXXX..XXXXXXXXXXXX',
    'XXXXX...X.XX.XXXXXXXXXXX....XXXXXXX.....XXXXXXXXXX',
    'XXXXX..XX.XX..XXXXXXX..XX..XXXXXXXXXXX..X...XXXXXX',
    'XXXXX..XX..XXX..XXXXX...XXXXXXXXXXX..XX.XX..XXXXXX',
    'XXXXX..X...XXXXXXXXXXXX...XXXXXX.XX.XXXX.X..XXXXXX',
    'XXXXX..XXXXXXX.XXX.XXXXX.XXXXXXX.XX..X.X.X..XXXXXX',
    'XXXXXXX..XXXXX.XXX..XXXXXXXXXXXX.XX...XXXX..XXXXXX',
    'XXXXX..XXXX....XXXX..XXXXXXXX..XXXXXXXXXXXX.XXXXXX',
    'XXXXX...XXXXXXXX..X..XXXXXXXX...XXX....XX.XXXXXXXX',
    'XXXXX...X.XX...XX.X.XXXXXXXXXX..XXX.XXXXX..XXXXXXX',
    'XXXXX...X.XXXX.XX.XXXXXXXXXXXXX.XXX.XXXXXXX.XXXXXX',
    'XXXXX...X..XXX.XX.XXXXXXX.XXXXXXXXXXXXX..XXXXXXXXX',
    'XXXXX...X...XXXXXXXXXX..XX.XXXXXXX.XXXX...XXXXXXXX',
    'XXXXX....X......XXXXX....XXXXXXXXXX...XXX.XXXXXXXX',
    'XXXXXXXXXX.....XXXXX...XX..XXXXXXXXXX..XXXX.XXXXXX',
    'XXXXXXXXXXXXX.XXXXXXX..XX.XXX....XXXXX.XXX..XXXXXX',
    'XXXXXX....XXXXXXXXX.XX.XXXXXXX...XXXXX..XX..XXXXXX',
    'XXXXXX......XXXXXXX.XXXX.....XX.XXXXXXXXXXXXXXXXXX',
    'XXXXXX.....XXXXXXX.XX.XX.....XX.XXX..XXX.XXXXXXXXX',
    'XXXXXX....XXXXXXX..XX..X.XX..XX.XXX..XXX...XXXXXXX',
    'XXXXXX...XXXXXXXXXXXX..XXXX.XXXX.....XXXX...XXXXXX',
    'XXXXXX..XXXXXXX.XXX.X...XXXXXXXXX..XXXXXX...XXXXXX',
    'XXXXXX.XXXXXXX..XXX.XX..XX......XXXX...XXXXXXXXXXX',
    'XXXXXXXXXXXXX....XX..XXXX..XX......X...XXXXXXXXXXX',
    'XXXXXXXXXXXX.....XX.XX..XX.XXXXXXXXXX..XXXXXXXXXXX',
    'XXXXXXXXXXX......XX.X....XXXXXXX..XXXX.XXXXXXXXXXX',
    'XXXXXXXXXX.......XX.X.....XX...X....XXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
]

function buildWalkableGrid(): Uint8Array {
    const grid = new Uint8Array(GRID_COLS * GRID_ROWS)
    for (let r = 0; r < GRID_ROWS; r++) {
        const row = WALK_GRID_DATA[r] ?? ''
        for (let c = 0; c < GRID_COLS; c++) {
            if (row[c] === 'X') grid[r * GRID_COLS + c] = 1
        }
    }
    return grid
}

export const walkableGrid = buildWalkableGrid()

type Pos  = { x: number; y: number }
type Cell = { col: number; row: number }

const colOf = (idx: number) => idx % GRID_COLS
const rowOf = (idx: number) => Math.floor(idx / GRID_COLS)

function gridToPixelCenter(c: number, r: number): Pos {
    return { x: c * CELL_SIZE + CELL_SIZE / 2, y: r * CELL_SIZE + CELL_SIZE / 2 }
}

function isWalkable(c: number, r: number, grid = walkableGrid): boolean {
    if (c < 0 || c >= GRID_COLS || r < 0 || r >= GRID_ROWS) return false
    return grid[r * GRID_COLS + c] === 1
}

function snapPixel(p: Pos, grid = walkableGrid): Cell {
    const cell = {
        col: Math.max(0, Math.min(GRID_COLS - 1, Math.floor(p.x / CELL_SIZE))),
        row: Math.max(0, Math.min(GRID_ROWS - 1, Math.floor(p.y / CELL_SIZE))),
    }
    if (isWalkable(cell.col, cell.row, grid)) return cell
    for (let radius = 1; radius <= 5; radius++) {
        for (let dr = -radius; dr <= radius; dr++) {
            for (let dc = -radius; dc <= radius; dc++) {
                if (Math.abs(dr) !== radius && Math.abs(dc) !== radius) continue
                const nc = cell.col + dc, nr = cell.row + dr
                if (isWalkable(nc, nr, grid)) return { col: nc, row: nr }
            }
        }
    }
    return cell
}

class MinHeap {
    private data: [number, number][] = []
    push(f: number, idx: number): void {
        this.data.push([f, idx])
        this._up(this.data.length - 1)
    }
    pop(): [number, number] | undefined {
        const top = this.data[0]
        const last = this.data.pop()!
        if (this.data.length > 0) { this.data[0] = last; this._down(0) }
        return top
    }
    get size(): number { return this.data.length }
    private _up(i: number): void {
        while (i > 0) {
            const p = (i - 1) >> 1
            if (this.data[p][0] <= this.data[i][0]) break
            ;[this.data[p], this.data[i]] = [this.data[i], this.data[p]]
            i = p
        }
    }
    private _down(i: number): void {
        const n = this.data.length
        while (true) {
            let m = i
            const l = 2 * i + 1, r = 2 * i + 2
            if (l < n && this.data[l][0] < this.data[m][0]) m = l
            if (r < n && this.data[r][0] < this.data[m][0]) m = r
            if (m === i) break
            ;[this.data[m], this.data[i]] = [this.data[i], this.data[m]]
            i = m
        }
    }
}

const SQRT2 = Math.SQRT2

function octile(ac: number, ar: number, bc: number, br: number): number {
    const dc = Math.abs(bc - ac), dr = Math.abs(br - ar)
    return Math.max(dc, dr) + (SQRT2 - 1) * Math.min(dc, dr)
}

const DIRS: [number, number, number][] = [
    [0, -1, 1], [0, 1, 1], [-1, 0, 1], [1, 0, 1],
    [-1, -1, SQRT2], [1, -1, SQRT2], [-1, 1, SQRT2], [1, 1, SQRT2],
]

export function findPath(from: Pos, to: Pos): Pos[] {
    const { col: sc, row: sr } = snapPixel(from)
    const { col: gc, row: gr } = snapPixel(to)

    if (sc === gc && sr === gr) return [gridToPixelCenter(sc, sr)]

    const g      = new Float32Array(GRID_SIZE).fill(Infinity)
    const parent = new Int32Array(GRID_SIZE).fill(-1)
    const closed = new Uint8Array(GRID_SIZE)

    const startIdx = sr * GRID_COLS + sc
    const goalIdx  = gr * GRID_COLS + gc

    g[startIdx] = 0
    const heap = new MinHeap()
    heap.push(octile(sc, sr, gc, gr), startIdx)

    while (heap.size > 0) {
        const [, idx] = heap.pop()!
        if (closed[idx]) continue
        closed[idx] = 1
        if (idx === goalIdx) {
            const path: Pos[] = []
            let cur = goalIdx
            while (cur !== -1) {
                path.push(gridToPixelCenter(colOf(cur), rowOf(cur)))
                cur = parent[cur]
            }
            return path.reverse()
        }
        for (const [dc, dr, cost] of DIRS) {
            const nc = colOf(idx) + dc, nr = rowOf(idx) + dr
            if (!isWalkable(nc, nr)) continue
            const nIdx = nr * GRID_COLS + nc
            if (closed[nIdx]) continue
            const ng = g[idx] + cost
            if (ng < g[nIdx]) {
                g[nIdx] = ng
                parent[nIdx] = idx
                heap.push(ng + octile(nc, nr, gc, gr), nIdx)
            }
        }
    }
    return []
}

export function getNextStep(from: Pos, to: Pos): Pos {
    const path = findPath(from, to)
    if (path.length === 0) return stepToward(from, to, WALK_SPEED)

    let accumulated = 0
    let prev = path[0]
    for (let i = 1; i < path.length; i++) {
        const dx = path[i].x - prev.x, dy = path[i].y - prev.y
        const seg = Math.sqrt(dx * dx + dy * dy)
        if (accumulated + seg > WALK_SPEED) return path[i - 1]
        accumulated += seg
        prev = path[i]
    }
    return path[path.length - 1]
}
