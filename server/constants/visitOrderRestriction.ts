import { VisitOrderRestrictions } from '../data/visitSchedulerApiTypes'

const visitOrderDescriptions: Readonly<Record<VisitOrderRestrictions, string>> = {
  VO_PVO: 'VO or PVO',
  VO: 'VO only',
  PVO: 'PVO only',
  NONE: 'This session does not use a visiting order',
}

export default visitOrderDescriptions
