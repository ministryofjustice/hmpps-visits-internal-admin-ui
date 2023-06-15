import { dataAccess } from '../data'
import UserService from './userService'
import PrisonService from './prisonService'
import SessionTemplateService from './sessionTemplateService'

export const services = () => {
  const { hmppsAuthClient, applicationInfo, prisonRegisterApiClientBuilder, visitSchedulerApiClientBuilder } =
    dataAccess()

  const prisonService = new PrisonService(
    visitSchedulerApiClientBuilder,
    prisonRegisterApiClientBuilder,
    hmppsAuthClient,
  )

  const sessionTemplateService = new SessionTemplateService(visitSchedulerApiClientBuilder, hmppsAuthClient)

  const userService = new UserService(hmppsAuthClient)

  return {
    applicationInfo,
    prisonService,
    sessionTemplateService,
    userService,
  }
}

export type Services = ReturnType<typeof services>

export { PrisonService, SessionTemplateService, UserService }
