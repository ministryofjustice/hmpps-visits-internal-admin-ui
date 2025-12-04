import {
  BookerService,
  CategoryGroupService,
  ExcludeDateService,
  IncentiveGroupService,
  LocationGroupService,
  PrisonService,
  SessionTemplateService,
  UserService,
  VisitAllocationService,
  VisitService,
} from '..'

jest.mock('..')

export const createMockBookerService = () => new BookerService(null, null) as jest.Mocked<BookerService>

export const createMockCategoryGroupService = () =>
  new CategoryGroupService(null, null) as jest.Mocked<CategoryGroupService>

export const createMockExcludeDateService = () => new ExcludeDateService(null, null) as jest.Mocked<ExcludeDateService>

export const createMockIncentiveGroupService = () =>
  new IncentiveGroupService(null, null) as jest.Mocked<IncentiveGroupService>

export const createMockLocationGroupService = () =>
  new LocationGroupService(null, null) as jest.Mocked<LocationGroupService>

export const createMockPrisonService = () => new PrisonService(null, null, null) as jest.Mocked<PrisonService>

export const createMockSessionTemplateService = () =>
  new SessionTemplateService(null, null) as jest.Mocked<SessionTemplateService>

export const createMockUserService = () => new UserService(null) as jest.Mocked<UserService>

export const createMockVisitAllocationService = () =>
  new VisitAllocationService(null, null) as jest.Mocked<VisitAllocationService>

export const createMockVisitService = () => new VisitService(null, null) as jest.Mocked<VisitService>
