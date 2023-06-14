import { PrisonService, UserService } from '..'
import SessionTemplateService from '../sessionTemplateService'

jest.mock('..')

export const createMockPrisonService = () => new PrisonService(null, null, null) as jest.Mocked<PrisonService>
export const createMockSessionTemplateService = () =>
  new SessionTemplateService(null, null) as jest.Mocked<SessionTemplateService>
export const createMockUserService = () => new UserService(null) as jest.Mocked<UserService>
