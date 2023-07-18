import { IncentiveLevels } from '../data/visitSchedulerApiTypes'

const incentiveLevels: Readonly<Record<IncentiveLevels, string>> = {
  ENHANCED: 'Enhanced',
  ENHANCED_2: 'Enhanced 2',
  ENHANCED_3: 'Enhanced 3',
  BASIC: 'Basic',
  STANDARD: 'Standard',
}

export default incentiveLevels
