import { components } from '../@types/prison-register-api'

export type PrisonRegisterPrison = Pick<components['schemas']['PrisonDto'], 'prisonId' | 'prisonName'>