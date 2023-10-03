import { ValidationError } from 'express-validator'
import { PrisonDto } from '../data/visitSchedulerApiTypes'

export type FlashErrorMessage = ValidationError[] | Record<'msg', string>[]

export interface Prison extends PrisonDto {
  name: string
}

export type PrisonConfig = {
  email?: string
  phone?: string
  website?: string
}
