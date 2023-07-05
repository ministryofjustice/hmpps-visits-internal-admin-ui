import {
  CategoryGroupService,
  IncentiveLevelGroupService,
  LocationGroupService,
  PrisonService,
  SessionTemplateService,
  UserService,
} from '..'

jest.mock('..')

export const createMockCategoryGroupService = () =>
  new CategoryGroupService(null, null) as jest.Mocked<CategoryGroupService>

export const createMockIncentiveLevelGroupService = () =>
  new IncentiveLevelGroupService(null, null) as jest.Mocked<IncentiveLevelGroupService>

export const createMockLocationGroupService = () =>
  new LocationGroupService(null, null) as jest.Mocked<LocationGroupService>

export const createMockPrisonService = () => new PrisonService(null, null, null) as jest.Mocked<PrisonService>

export const createMockSessionTemplateService = () =>
  new SessionTemplateService(null, null) as jest.Mocked<SessionTemplateService>

export const createMockUserService = () => new UserService(null) as jest.Mocked<UserService>
