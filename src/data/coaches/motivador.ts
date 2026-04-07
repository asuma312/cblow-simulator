import type { Coach } from '@/types/game.types'

const coach: Coach = {
    id: 'motivador',
    name: 'Coach Motivador',
    focus: 'Moral',
    description: 'Mantém o espírito do time alto. Moral decai 30% mais lento.',
    bonus: { moralDecayReduction: 0.3 },
}

export default coach
