import { PrisonRegisterPrison } from '../../data/prisonRegisterApiTypes'
import { Prison, SessionTemplate } from '../../data/visitSchedulerApiTypes'

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

  static sessionTemplate = ({
    biWeekly = false,
    dayOfWeek = 'WEDNESDAY',
    name = 'WEDNESDAY, 2023-03-21, 13:45',
    permittedLocationGroups = [],
    prisonId = 'HEI',
    prisonerCategoryGroups = [],
    prisonerIncentiveLevelGroups = [],
    reference = '-afe.dcc.0f',
    sessionCapacity = {
      closed: 2,
      open: 35,
    },
    sessionDateRange = {
      validFromDate: '2023-03-21',
      validToDate: undefined,
    },
    sessionTimeSlot = {
      endTime: '14:45',
      startTime: '13:45',
    },
    visitRoom = 'Visits Main Room',
    visitType = 'SOCIAL',
  }: Partial<SessionTemplate> = {}): SessionTemplate =>
    ({
      biWeekly,
      dayOfWeek,
      name,
      permittedLocationGroups,
      prisonId,
      prisonerCategoryGroups,
      prisonerIncentiveLevelGroups,
      reference,
      sessionCapacity,
      sessionDateRange,
      sessionTimeSlot,
      visitRoom,
      visitType,
    } as SessionTemplate)
}
