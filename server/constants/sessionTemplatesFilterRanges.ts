import { SessionTemplatesRangeType } from '../data/visitSchedulerApiTypes'

const sessionTemplatesFilterRanges: Readonly<Record<SessionTemplatesRangeType, string>> = {
  ACTIVE_OR_FUTURE: 'active and future',
  HISTORIC: 'expired',
  ALL: 'all',
}

export default sessionTemplatesFilterRanges
