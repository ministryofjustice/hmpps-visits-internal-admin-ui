import { Prison } from '../../@types/visits-admin'
import { PrisonRegisterPrison } from '../../data/prisonRegisterApiTypes'
import {
  CategoryGroup,
  PrisonDto,
  SessionTemplate,
  CreateSessionTemplateDto,
  LocationGroup,
  IncentiveLevelGroup,
  CreateLocationGroupDto,
  CreateIncentiveGroupDto,
  CreateCategoryGroupDto,
} from '../../data/visitSchedulerApiTypes'

export default class TestData {
  // PrisonDto from Visit Scheduler
  static prisonDto = ({ active = true, code = 'HEI', excludeDates = [] }: Partial<PrisonDto> = {}): PrisonDto =>
    ({ active, code, excludeDates } as PrisonDto)

  // Prison (with name)
  static prison = ({
    active = true,
    code = 'HEI',
    excludeDates = [],
    name = 'Hewell (HMP)',
  }: Partial<Prison> = {}): Prison => ({ active, code, excludeDates, name } as Prison)

  // Array of Visit scheduler PrisonDto
  static prisonDtos = ({
    prisons = [
      this.prisonDto(),
      this.prisonDto({ code: 'PNI' }),
      this.prisonDto({ active: false, code: 'WWI' }),
    ] as PrisonDto[],
  } = {}): PrisonDto[] => prisons

  // Array of Prisons
  static prisons = ({
    prisons = [
      this.prison(),
      this.prison({ code: 'PNI', name: 'Preston (HMP & YOI)' }),
      this.prison({ active: false, code: 'WWI', name: 'Wandsworth (HMP & YOI)' }),
    ] as Prison[],
  } = {}): Prison[] => prisons

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

  static createLocationGroupDto = ({
    name = 'Wing A',
    prisonId = 'HEI',
    locations = [
      {
        levelOneCode: 'A',
        levelTwoCode: undefined,
        levelThreeCode: undefined,
        levelFourCode: undefined,
      },
    ],
  }: Partial<CreateLocationGroupDto> = {}): CreateLocationGroupDto => ({ name, prisonId, locations })

  static createCategoryGroupDto = ({
    name = 'Category A (High Risk) prisoners',
    prisonId = 'HEI',
    categories = ['A_EXCEPTIONAL', 'A_HIGH', 'A_PROVISIONAL', 'A_STANDARD'],
  }: Partial<CreateCategoryGroupDto> = {}): CreateCategoryGroupDto => ({
    categories,
    name,
    prisonId,
  })

  static categoryGroup = ({
    name = 'Category A (High Risk) prisoners',
    reference = '-afe~dcb~fb',
    categories = ['A_EXCEPTIONAL', 'A_HIGH', 'A_PROVISIONAL', 'A_STANDARD'],
  }: Partial<CategoryGroup> = {}): CategoryGroup => ({ name, reference, categories })

  static incentiveLevelGroup = ({
    name = 'Enhanced prisoners',
    reference = '-afe~dcb~fc',
    incentiveLevels = ['ENHANCED'],
  }: Partial<IncentiveLevelGroup> = {}): IncentiveLevelGroup => ({ name, reference, incentiveLevels })

  static createIncentiveGroupDto = ({
    name = 'Enhanced prisoners',
    prisonId = 'HEI',
    incentiveLevels = ['ENHANCED'],
  }: Partial<CreateIncentiveGroupDto> = {}): CreateIncentiveGroupDto => ({ name, prisonId, incentiveLevels })
}
