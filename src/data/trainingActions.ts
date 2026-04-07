export interface ActionMeta {
    type: string
    label: string
    icon: string
}

export const TRAINING_ACTIONS: ActionMeta[] = [
    { type: 'trainFarm',      label: 'Treinar Farm',      icon: '' },
    { type: 'trainMechanics', label: 'Treinar Mecânica',  icon: '' },
    { type: 'trainTeamfight', label: 'Treinar Teamfight', icon: '' },
    { type: 'studyChampion',  label: 'Estudar Campeão',   icon: '' },
    { type: 'stream',         label: 'Stremar',           icon: '' },
    { type: 'rest',           label: 'Descansar',         icon: '' },
]

export function getActionLabel(type: string | undefined, championId?: string): string {
    if (!type) return '---'
    if (type === 'studyChampion') return `Estudar ${championId ?? ''}`
    return TRAINING_ACTIONS.find(a => a.type === type)?.label ?? type
}
