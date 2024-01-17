import { ValidationError } from 'express-validator'
import { PrisonDto, SessionCapacity } from '../data/visitSchedulerApiTypes'

export type FlashErrorMessage = ValidationError[] | Record<'msg', string>[]

export interface Prison extends PrisonDto {
  name: string
}

export type VisitStatsSummary = {
  bookedCount: number
  cancelCount: number
  minimumCapacity: SessionCapacity
  dates: Record<string, { booked?: number; cancelled?: number }>
}
