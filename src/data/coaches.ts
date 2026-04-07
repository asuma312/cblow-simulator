import type { Coach } from '@/types/game.types'

export const COACHES: Coach[] = [
    {
        id: 'tactico',
        name: 'Coach Tático',
        focus: 'Estratégia',
        description: 'Especialista em teamfights e composições. Seu time brilha nas lutas coletivas.',
        bonus: { teamfightMultiplier: 1.15 },
    },
    {
        id: 'tecnico',
        name: 'Coach Técnico',
        focus: 'Mecânica',
        description: 'Treina mecânica individual. Os jogadores evoluem mais rápido em mecânica.',
        bonus: { mechanicsTrainBonus: 0.1 },
    },
    {
        id: 'farmer',
        name: 'Coach Farmer',
        focus: 'Early Game',
        description: 'Obsessão por CS. Seus jogadores dominam os primeiros 15 minutos.',
        bonus: { farmEarlyBonus: 1.15 },
    },
    {
        id: 'motivador',
        name: 'Coach Motivador',
        focus: 'Moral',
        description: 'Mantém o espírito do time alto. Moral decai 30% mais lento.',
        bonus: { moralDecayReduction: 0.3 },
    },
]
