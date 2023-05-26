import { PrisonRegisterPrison } from '../../data/prisonRegisterApiTypes'
import { Prison } from '../../data/visitSchedulerApiTypes'

export default class TestData {
  // PrisonDto from Visit Scheduler
  static prison = ({ active = true, code = 'HEI', excludeDates = [] }: Partial<Prison> = {}): Prison =>
    ({ active, code, excludeDates } as Prison)

  // Array of Visit scheduler PrisonDto
  static prisons = ({
    prisons = [this.prison(), this.prison({ code: 'PNI' }), this.prison({ active: false, code: 'WWI' })] as Prison[],
  } = {}): Prison[] => prisons

  // prisonId / prisonName from Prison register as key / value object - returned by PrisonService
  static prisonNames = ({
    prisons = <Record<string, string>>{
      HEI: 'Hewell (HMP)',
      PNI: 'Preston (HMP & YOI)',
      WWI: 'Wandsworth (HMP & YOI)',
    },
  } = {}): Record<string, string> => prisons

  // Array of partial representation of Prison register PrisonDto objects
  static prisonRegisterPrisons = ({
    prisons = [
      { prisonId: 'HEI', prisonName: 'Hewell (HMP)' },
      { prisonId: 'PNI', prisonName: 'Preston (HMP & YOI)' },
      { prisonId: 'WWI', prisonName: 'Wandsworth (HMP & YOI)' },
    ] as PrisonRegisterPrison[],
  } = {}): PrisonRegisterPrison[] => prisons
}
