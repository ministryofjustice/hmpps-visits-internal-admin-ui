import { PrisonerCategories } from '../data/visitSchedulerApiTypes'

const prisonerCategories: Readonly<Record<PrisonerCategories, string>> = {
  A_EXCEPTIONAL: 'Category A - Exceptional Risk',
  A_HIGH: 'Category A - High Risk',
  A_PROVISIONAL: 'Category A - Provisional',
  A_STANDARD: 'Category A - Standard Risk',
  B: 'Category B',
  C: 'Category C',
  D: 'Category D',
  YOI_CLOSED: 'Young Offender Institution - Closed',
  YOI_OPEN: 'Young Offender Institution - Open',
  YOI_RESTRICTED: 'Young Offender Institution - Restricted',
  UNSENTENCED: 'Unsentenced',
  UNCATEGORISED_SENTENCED_MALE: 'Male - Uncategorised',
  FEMALE_RESTRICTED: 'Female - Restricted',
  FEMALE_CLOSED: 'Female - Closed',
  FEMALE_SEMI: 'Female - Semi-open',
  FEMALE_OPEN: 'Female - Open',
}

export default prisonerCategories
