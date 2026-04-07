const DDRAGON_VERSION = '14.1.1'

const fallbackSrc = (img: HTMLImageElement, url: string) => {
    if (!img.src.includes('ddragon')) img.src = url
}

export function onIconError(event: Event) {
    const img = event.target as HTMLImageElement
    const filename = img.src.split('/').pop()
    if (filename) fallbackSrc(img, `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/champion/${filename}`)
}

export function onSplashError(event: Event) {
    const img = event.target as HTMLImageElement
    const filename = img.src.split('/').pop()
    if (filename) fallbackSrc(img, `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${filename}`)
}

export function getChampionIconUrl(championId: string): string {
    return `/champions/${championId}.png`
}

export function getChampionSplashUrl(championId: string): string {
    return `/champions/splash/${championId}_0.jpg`
}
