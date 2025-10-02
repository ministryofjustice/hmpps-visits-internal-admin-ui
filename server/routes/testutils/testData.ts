import { Prison, VisitStatsSummary } from '../../@types/visits-admin'
import { BookerDto, PermittedPrisonerDto } from '../../data/bookerRegistryApiTypes'
import { ContactDto } from '../../data/prisonerContactRegistryApiTypes'
import { PrisonContactDetails, PrisonName } from '../../data/prisonRegisterApiTypes'
import {
  CategoryGroup,
  PrisonDto,
  SessionTemplate,
  CreateSessionTemplateDto,
  LocationGroup,
  IncentiveGroup,
  CreateLocationGroupDto,
  CreateIncentiveGroupDto,
  CreateCategoryGroupDto,
  UpdateSessionTemplateDto,
  RequestSessionTemplateVisitStatsDto,
  SessionTemplateVisitStatsDto,
  UpdatePrisonDto,
  ExcludeDateDto,
  UpdateLocationGroupDto,
} from '../../data/visitSchedulerApiTypes'

const publicAndStaffClientsActive: CreateSessionTemplateDto['clients'] = [
  { active: true, userType: 'PUBLIC' },
  { active: true, userType: 'STAFF' },
]

export default class TestData {
  // PrisonDto from Visit Scheduler
  static prisonDto = ({
    active = true,
    adultAgeYears = 18,
    clients = [{ active: true, userType: 'STAFF' }],
    code = 'HEI',
    maxAdultVisitors = 3,
    maxChildVisitors = 3,
    maxTotalVisitors = 6,
    policyNoticeDaysMin = 2,
    policyNoticeDaysMax = 28,
  }: Partial<PrisonDto> = {}): PrisonDto =>
    ({
      active,
      adultAgeYears,
      clients,
      code,
      maxAdultVisitors,
      maxChildVisitors,
      maxTotalVisitors,
      policyNoticeDaysMin,
      policyNoticeDaysMax,
    }) as PrisonDto

  static updatePrisonDto = ({
    adultAgeYears,
    maxAdultVisitors,
    maxChildVisitors,
    maxTotalVisitors,
    policyNoticeDaysMin,
    policyNoticeDaysMax,
  }: Partial<UpdatePrisonDto> = {}): UpdatePrisonDto =>
    ({
      adultAgeYears,
      maxAdultVisitors,
      maxChildVisitors,
      maxTotalVisitors,
      policyNoticeDaysMin,
      policyNoticeDaysMax,
    }) as UpdatePrisonDto

  // Prison (with name)
  static prison = ({
    active = true,
    adultAgeYears = 18,
    clients = [{ active: true, userType: 'STAFF' }],
    code = 'HEI',
    maxAdultVisitors = 3,
    maxChildVisitors = 3,
    maxTotalVisitors = 6,
    name = 'Hewell (HMP)',
    policyNoticeDaysMin = 2,
    policyNoticeDaysMax = 28,
  }: Partial<Prison> = {}): Prison =>
    ({
      active,
      adultAgeYears,
      clients,
      code,
      maxAdultVisitors,
      maxChildVisitors,
      maxTotalVisitors,
      name,
      policyNoticeDaysMin,
      policyNoticeDaysMax,
    }) as Prison

  // Array of Visit scheduler PrisonDto
  static prisonDtos = ({
    prisons = [
      this.prisonDto(),
      this.prisonDto({
        code: 'PNI',
        clients: publicAndStaffClientsActive,
      }),
      this.prisonDto({ active: false, code: 'WWI', clients: [] }),
    ] as PrisonDto[],
  } = {}): PrisonDto[] => prisons

  // Array of Prisons
  static prisons = ({
    prisons = [
      this.prison(),
      this.prison({
        code: 'PNI',
        name: 'Preston (HMP & YOI)',
        clients: publicAndStaffClientsActive,
      }),
      this.prison({ active: false, code: 'WWI', name: 'Wandsworth (HMP & YOI)', clients: [] }),
    ] as Prison[],
  } = {}): Prison[] => prisons

  // Array Prison Register PrisonNames
  static prisonNames = ({
    prisons = [
      { prisonId: 'HEI', prisonName: 'Hewell (HMP)' },
      { prisonId: 'PNI', prisonName: 'Preston (HMP & YOI)' },
      { prisonId: 'WWI', prisonName: 'Wandsworth (HMP & YOI)' },
    ] as PrisonName[],
  } = {}): PrisonName[] => prisons

  static sessionTemplate = ({
    dayOfWeek = 'WEDNESDAY',
    name = 'WEDNESDAY, 2023-03-21, 13:45',
    includeLocationGroupType = true,
    includeCategoryGroupType = true,
    includeIncentiveGroupType = true,
    permittedLocationGroups = [],
    prisonerCategoryGroups = [],
    prisonerIncentiveLevelGroups = [],
    prisonId = 'HEI',
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
    clients = publicAndStaffClientsActive,
    visitOrderRestriction = 'VO_PVO',
  }: Partial<SessionTemplate> = {}): SessionTemplate =>
    ({
      dayOfWeek,
      name,
      includeLocationGroupType,
      includeCategoryGroupType,
      includeIncentiveGroupType,
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
      clients,
      visitOrderRestriction,
    }) as SessionTemplate

  static createSessionTemplateDto = ({
    name = 'session template name',
    weeklyFrequency = 2,
    dayOfWeek = 'MONDAY',
    prisonId = 'HEI',
    sessionCapacity = { open: 10, closed: 5 },
    sessionDateRange = { validFromDate: '2023-02-01', validToDate: '2024-12-31' },
    sessionTimeSlot = { startTime: '13:00', endTime: '14:00' },
    visitRoom = 'visit room name',
    includeCategoryGroupType = true,
    categoryGroupReferences = [],
    includeIncentiveGroupType = true,
    incentiveLevelGroupReferences = [],
    includeLocationGroupType = true,
    locationGroupReferences = [],
    clients = publicAndStaffClientsActive,
    visitOrderRestriction = 'VO_PVO',
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
      includeCategoryGroupType,
      categoryGroupReferences,
      includeIncentiveGroupType,
      incentiveLevelGroupReferences,
      includeLocationGroupType,
      locationGroupReferences,
      clients,
      visitOrderRestriction,
    }) as CreateSessionTemplateDto

  static updateSessionTemplateDto = ({
    name = 'session template name',
    sessionCapacity = { open: 10, closed: 5 },
    sessionDateRange = { validFromDate: '2023-02-01', validToDate: '2024-12-31' },
    visitRoom = 'visit room name',
    includeCategoryGroupType = true,
    categoryGroupReferences = [TestData.categoryGroup().reference],
    includeIncentiveGroupType = true,
    incentiveLevelGroupReferences = [TestData.incentiveGroup().reference],
    includeLocationGroupType = true,
    locationGroupReferences = [TestData.locationGroup().reference],
    clients = publicAndStaffClientsActive,
    visitOrderRestriction = 'VO_PVO',
  }: Partial<UpdateSessionTemplateDto> = {}): UpdateSessionTemplateDto =>
    ({
      name,
      sessionCapacity,
      sessionDateRange,
      visitRoom,
      clients,
      includeCategoryGroupType,
      includeIncentiveGroupType,
      includeLocationGroupType,
      categoryGroupReferences,
      incentiveLevelGroupReferences,
      locationGroupReferences,
      visitOrderRestriction,
    }) as UpdateSessionTemplateDto

  static createCategoryGroupDto = ({
    name = 'Category A (High Risk) prisoners',
    prisonId = 'HEI',
    categories = ['A_EXCEPTIONAL', 'A_HIGH', 'A_PROVISIONAL', 'A_STANDARD'],
  }: Partial<CreateCategoryGroupDto> = {}): CreateCategoryGroupDto => ({
    categories,
    name,
    prisonId,
  })

  static createIncentiveGroupDto = ({
    name = 'Enhanced prisoners',
    prisonId = 'HEI',
    incentiveLevels = ['ENHANCED'],
  }: Partial<CreateIncentiveGroupDto> = {}): CreateIncentiveGroupDto => ({ name, prisonId, incentiveLevels })

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

  static categoryGroup = ({
    name = 'Category A (High Risk) prisoners',
    reference = '-cat~abc~de',
    categories = ['A_EXCEPTIONAL', 'A_HIGH', 'A_PROVISIONAL', 'A_STANDARD'],
  }: Partial<CategoryGroup> = {}): CategoryGroup => ({ name, reference, categories })

  static incentiveGroup = ({
    name = 'Enhanced prisoners',
    reference = '-inc~abc~de',
    incentiveLevels = ['ENHANCED'],
  }: Partial<IncentiveGroup> = {}): IncentiveGroup => ({ name, reference, incentiveLevels })

  static locationGroup = ({
    name = 'Wing A',
    reference = '-loc~abc~de',
    locations = [
      {
        levelOneCode: 'A',
        levelTwoCode: undefined,
        levelThreeCode: undefined,
        levelFourCode: undefined,
      },
    ],
  }: Partial<LocationGroup> = {}): LocationGroup => ({ name, reference, locations })

  static updateLocationGroupDto = ({
    name = 'Wing A',
    locations = [
      {
        levelOneCode: 'A',
        levelTwoCode: undefined,
        levelThreeCode: undefined,
        levelFourCode: undefined,
      },
    ],
  }: Partial<UpdateLocationGroupDto> = {}): UpdateLocationGroupDto => ({ name, locations })

  static requestVisitStatsDto = ({
    visitsFromDate = '2023-01-01',
  }: Partial<RequestSessionTemplateVisitStatsDto> = {}): RequestSessionTemplateVisitStatsDto => ({ visitsFromDate })

  static sessionTemplateVisitStatsDto = ({
    cancelCount = 1,
    minimumCapacity = { open: 4, closed: 3 },
    visitCount = 7,
    visitsByDate = [
      {
        visitCounts: {
          open: 4,
          closed: 3,
        },
        visitDate: '2023-01-08',
      },
    ],
    cancelVisitsByDate = [
      {
        visitCounts: {
          open: 1,
          closed: 0,
        },
        visitDate: '2023-01-08',
      },
    ],
  }: Partial<SessionTemplateVisitStatsDto> = {}): SessionTemplateVisitStatsDto => ({
    cancelCount,
    minimumCapacity,
    visitCount,
    visitsByDate,
    cancelVisitsByDate,
  })

  static visitStatsSummary = ({
    bookedCount = 7,
    cancelCount = 1,
    minimumCapacity = { open: 4, closed: 3 },
    dates = {
      '2023-01-08': { booked: 7, cancelled: 1 },
    },
  }: Partial<VisitStatsSummary> = {}): VisitStatsSummary => ({
    bookedCount,
    cancelCount,
    minimumCapacity,
    dates,
  })

  static prisonContactDetails = ({
    type = 'SOCIAL_VISIT',
    emailAddress = 'visits@example.com',
    phoneNumber = '01234567890',
    webAddress = 'https://www.example.com',
  }: Partial<PrisonContactDetails> = {}): PrisonContactDetails => ({
    type,
    emailAddress,
    phoneNumber,
    webAddress,
  })

  static bookerDto = ({
    reference = 'aaaa-bbbb-cccc',
    oneLoginSub = 'one-login-user',
    email = 'user@example.com',
    permittedPrisoners = [],
    createdTimestamp = '2025-06-01T09:00:00',
  }: Partial<BookerDto> = {}): BookerDto => ({
    reference,
    oneLoginSub,
    email,
    permittedPrisoners,
    createdTimestamp,
  })

  static permittedPrisonerDto = ({
    prisonerId = 'A1234BC',
    active = true,
    prisonCode = 'HEI',
    permittedVisitors = [],
  }: Partial<PermittedPrisonerDto> = {}): PermittedPrisonerDto => ({
    prisonerId,
    active,
    prisonCode,
    permittedVisitors,
  })

  static contact = ({
    personId = 1234,
    firstName = 'Jeanette',
    lastName = 'Smith',
    dateOfBirth = '1986-07-28',
    approvedVisitor = true,
  }: Partial<ContactDto> = {}): ContactDto =>
    ({
      personId,
      firstName,
      lastName,
      dateOfBirth,
      approvedVisitor,
    }) as ContactDto

  static excludeDateDto = ({
    excludeDate = '2024-12-12',
    actionedBy = 'User one',
  }: Partial<ExcludeDateDto> = {}): ExcludeDateDto => ({
    excludeDate,
    actionedBy,
  })
}
