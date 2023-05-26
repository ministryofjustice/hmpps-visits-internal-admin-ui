import { PrisonRegisterPrison } from '../../data/prisonRegisterApiTypes'
import { Prison } from '../../data/visitSchedulerApiTypes'

export default class TestData {
  static prison = ({ active = true, code = 'HEI', excludeDates = [] }: Partial<Prison> = {}): Prison =>
    ({ active, code, excludeDates } as Prison)

  static prisons = ({ prisons = [this.prison(), this.prison({ code: 'PNI' })] as Prison[] } = {}): Prison[] => prisons

  static prisonRegisterPrison = ({
    prisonId = 'HEI',
    prisonName = 'Hewell (HMP)',
  }: Partial<PrisonRegisterPrison> = {}): PrisonRegisterPrison => ({ prisonId, prisonName } as PrisonRegisterPrison)

  static prisonRegisterPrisons = ({
    prisons = [
      this.prisonRegisterPrison(),
      this.prisonRegisterPrison({ prisonId: 'PNI', prisonName: 'Preston (HMP & YOI)' }),
    ] as PrisonRegisterPrison[],
  } = {}): PrisonRegisterPrison[] => prisons
}
