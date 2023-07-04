import { PrisonRegisterPrison } from '../../data/prisonRegisterApiTypes'
import {
  CategoryGroup,
  Prison,
  SessionTemplate,
  CreateSessionTemplateDto,
  LocationGroup,
} from '../../data/visitSchedulerApiTypes'

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
    weeklyFrequency = 1,
    active = true,
  }: Partial<SessionTemplate> = {}): SessionTemplate =>
    ({
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
      weeklyFrequency,
      active,
    } as SessionTemplate)

  static createSessionTemplateDto = ({
    name = 'session template name',
    weeklyFrequency = 2,
    dayOfWeek = 'MONDAY',
    prisonId = 'HEI',
    sessionCapacity = { open: 10, closed: 5 },
    sessionDateRange = { validFromDate: '2023-02-01', validToDate: '2024-12-31' },
    sessionTimeSlot = { startTime: '13:00', endTime: '14:00' },
    visitRoom = 'visit room name',
    categoryGroupReferences = [],
    incentiveLevelGroupReferences = [],
    locationGroupReferences = [],
  }: Partial<CreateSessionTemplateDto> = {}): CreateSessionTemplateDto =>
    ({
      name,
      weeklyFrequency,
      dayOfWeek,
      prisonId,
      sessionCapacity,
      sessionDateRange,
      sessionTimeSlot,
      visitRoom,
      categoryGroupReferences,
      incentiveLevelGroupReferences,
      locationGroupReferences,
    } as CreateSessionTemplateDto)

  static locationGroup = ({
    name = 'Wing A',
    reference = '-afe~dcb~fb',
    locations = [
      {
        levelOneCode: 'A',
        levelTwoCode: undefined,
        levelThreeCode: undefined,
        levelFourCode: undefined,
      },
    ],
  }: Partial<LocationGroup> = {}): LocationGroup => ({ name, reference, locations })

  static categoryGroup = ({
    name = 'Category A (High Risk) prisoners',
    reference = '-afe~dcb~fb',
    categories = ['A_HIGH'],
  }: Partial<CategoryGroup> = {}): CategoryGroup => ({ name, reference, categories })
}
