import {
  CategoryGroupService,
  IncentiveGroupService,
  LocationGroupService,
  PrisonService,
  SessionTemplateService,
  UserService,
} from '..'

jest.mock('..')

export const createMockCategoryGroupService = () =>
  new CategoryGroupService(null, null) as jest.Mocked<CategoryGroupService>

export const createMockIncentiveGroupService = () =>
  new IncentiveGroupService(null, null) as jest.Mocked<IncentiveGroupService>

export const createMockLocationGroupService = () =>
  new LocationGroupService(null, null) as jest.Mocked<LocationGroupService>

export const createMockPrisonService = () => new PrisonService(null, null, null) as jest.Mocked<PrisonService>

export const createMockSessionTemplateService = () =>
  new SessionTemplateService(null, null) as jest.Mocked<SessionTemplateService>

export const createMockUserService = () => new UserService(null) as jest.Mocked<UserService>
