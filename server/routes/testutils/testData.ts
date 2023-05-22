import { Prison } from '../../data/prisonRegisterApiTypes'

export default class TestData {
  static prisons = ({
    prisons = [
      {
        prisonId: 'BLI',
        prisonName: 'Bristol (HMP & YOI)',
      },
      {
        prisonId: 'HEI',
        prisonName: 'Hewell (HMP)',
      },
    ] as Prison[],
  } = {}): Prison[] => prisons

  static supportedPrisonIds = ({ prisonIds = ['BLI', 'HEI'] } = {}): string[] => prisonIds

  static supportedPrisons = ({
    prisons = <Record<string, string>>{
      BLI: 'Bristol (HMP & YOI)',
      HEI: 'Hewell (HMP)',
    },
  } = {}): Record<string, string> => prisons
}
