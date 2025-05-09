import { PrisonDto, SessionCapacity } from '../data/visitSchedulerApiTypes'

export type FlashErrorMessage = { msg: string }
export type FlashFormValues = Record<string, unknown>

type TextOrHtml = { text: string; html?: never } | { text?: never; html: string }

export interface Prison extends PrisonDto {
  name: string
}

export type VisitStatsSummary = {
  bookedCount: number
  cancelCount: number
  minimumCapacity: SessionCapacity
  dates: Record<string, { booked?: number; cancelled?: number }>
}

export type MoJAlert = {
  variant: 'information' | 'success' | 'warning' | 'error'
  title: string
  showTitleAsHeading?: boolean
} & TextOrHtml
