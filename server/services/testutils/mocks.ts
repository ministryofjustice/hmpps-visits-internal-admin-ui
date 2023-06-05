import { PrisonService, UserService } from '..'

jest.mock('..')

export const createMockPrisonService = () => new PrisonService(null, null, null) as jest.Mocked<PrisonService>
export const createMockUserService = () => new UserService(null) as jest.Mocked<UserService>
