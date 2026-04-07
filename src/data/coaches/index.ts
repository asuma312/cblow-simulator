import type { Coach } from '@/types/game.types'

import tactico from './tactico'
import tecnico from './tecnico'
import farmer from './farmer'
import motivador from './motivador'

export const COACHES: Coach[] = [
    tactico,
    tecnico,
    farmer,
    motivador,
]
