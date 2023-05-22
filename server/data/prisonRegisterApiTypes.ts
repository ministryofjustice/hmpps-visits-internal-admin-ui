import { components } from '../@types/prison-register-api'

export type Prison = Pick<components['schemas']['PrisonDto'], 'prisonId' | 'prisonName'>
