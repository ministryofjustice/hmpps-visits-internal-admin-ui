import {
  BookerService,
  CategoryGroupService,
  IncentiveGroupService,
  LocationGroupService,
  PrisonService,
  SessionTemplateService,
  VisitAllocationService,
} from '..'

jest.mock('..')

export const createMockBookerService = () => new BookerService(null) as jest.Mocked<BookerService>

export const createMockCategoryGroupService = () => new CategoryGroupService(null) as jest.Mocked<CategoryGroupService>

export const createMockIncentiveGroupService = () =>
  new IncentiveGroupService(null) as jest.Mocked<IncentiveGroupService>

export const createMockLocationGroupService = () => new LocationGroupService(null) as jest.Mocked<LocationGroupService>

export const createMockPrisonService = () => new PrisonService(null, null) as jest.Mocked<PrisonService>

export const createMockSessionTemplateService = () =>
  new SessionTemplateService(null) as jest.Mocked<SessionTemplateService>

export const createMockVisitAllocationService = () =>
  new VisitAllocationService(null) as jest.Mocked<VisitAllocationService>
