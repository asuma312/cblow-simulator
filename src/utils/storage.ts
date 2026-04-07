export function loadFromStorage<T>(key: string): Partial<T> {
    try {
        const raw = localStorage.getItem(key)
        if (raw) return JSON.parse(raw)
    } catch {}
    return {}
}

export function saveToStorage<T>(key: string, data: T): void {
    try {
        localStorage.setItem(key, JSON.stringify(data))
    } catch {}
}
