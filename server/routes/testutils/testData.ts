import { PrisonRegisterPrison } from '../../data/prisonRegisterApiTypes'
import { Prison } from '../../data/visitSchedulerApiTypes'

export default class TestData {
  static prison = ({ active = true, code = 'HEI', excludeDates = [] }: Partial<Prison> = {}): Prison =>
    ({ active, code, excludeDates } as Prison)

  static prisonRegisterPrison = ({
    prisonId = 'HEI',
    prisonName = 'Hewell (HMP)',
  }: Partial<PrisonRegisterPrison> = {}): PrisonRegisterPrison => ({ prisonId, prisonName } as PrisonRegisterPrison)
}
