import type { Coach } from '@/types/game.types'

const coach: Coach = {
    id: 'tecnico',
    name: 'Coach Técnico',
    focus: 'Mecânica',
    description: 'Treina mecânica individual. Os jogadores evoluem mais rápido em mecânica.',
    bonus: { mechanicsTrainBonus: 0.1 },
}

export default coach
