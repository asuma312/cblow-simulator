export const TRAINING_ACTION_LABELS: Record<string, string> = {

    trainFarm:      'Treinar Farm',
    trainMechanics: 'Treinar Mecânica',
    trainTeamfight: 'Treinar Teamfight',
    studyChampion:  'Estudar Campeão',
    stream:         'Stremar',
    rest:           'Descansar',
}

// Array derivado — para componentes que precisam iterar
export const TRAINING_ACTIONS = Object.entries(TRAINING_ACTION_LABELS).map(([type, label]) => ({ type, label }))

export function getActionLabel(type: string | undefined, championId?: string): string {
    if (!type) return '---'
    if (type === 'studyChampion') return `Estudar ${championId ?? ''}`
    return TRAINING_ACTION_LABELS[type] ?? type
}
