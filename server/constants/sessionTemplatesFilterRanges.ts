import { SessionTemplatesRangeType } from '../data/visitSchedulerApiTypes'

const sessionTemplatesFilterRanges: Readonly<Record<SessionTemplatesRangeType, string>> = {
  CURRENT_OR_FUTURE: 'active and future',
  HISTORIC: 'expired',
  ALL: 'all',
}

export default sessionTemplatesFilterRanges
