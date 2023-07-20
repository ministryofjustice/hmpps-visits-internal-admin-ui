import { PrisonerCategories } from '../data/visitSchedulerApiTypes'

const prisonerCategories: Readonly<Record<PrisonerCategories, string>> = {
  A_EXCEPTIONAL: 'A EXCEPTIONAL',
  A_HIGH: 'A HIGH',
  A_PROVISIONAL: 'A PROVISIONAL',
  A_STANDARD: 'A STANDARD',
  B: 'B',
  C: 'C',
  D: 'D',
  YOI_CLOSED: 'YOI CLOSED',
  YOI_OPEN: 'YOI OPEN',
  YOI_RESTRICTED: 'YOI RESTRICTED',
  UNSENTENCED: 'UNSENTENCED',
  UNCATEGORISED_SENTENCED_MALE: 'UNCATEGORISED SENTENCED MALE',
  FEMALE_RESTRICTED: 'FEMALE RESTRICTED',
  FEMALE_CLOSED: 'FEMALE CLOSED',
  FEMALE_SEMI: 'FEMALE SEMI',
  FEMALE_OPEN: 'FEMALE OPEN',
}

export default prisonerCategories
