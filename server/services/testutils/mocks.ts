import { SupportedPrisonsService, UserService } from '..'

jest.mock('..')

export const createMockSupportedPrisonsService = () =>
  new SupportedPrisonsService(null, null, null) as jest.Mocked<SupportedPrisonsService>

export const createMockUserService = () => new UserService(null) as jest.Mocked<UserService>
