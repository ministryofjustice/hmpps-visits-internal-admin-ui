import { dataAccess } from '../data'
import UserService from './userService'
import PrisonService from './prisonService'
import SessionTemplateService from './sessionTemplateService'
import LocationGroupService from './locationGroupService'

export const services = () => {
  const { hmppsAuthClient, applicationInfo, prisonRegisterApiClientBuilder, visitSchedulerApiClientBuilder } =
    dataAccess()

  const locationGroupService = new LocationGroupService(visitSchedulerApiClientBuilder, hmppsAuthClient)

  const prisonService = new PrisonService(
    visitSchedulerApiClientBuilder,
    prisonRegisterApiClientBuilder,
    hmppsAuthClient,
  )

  const sessionTemplateService = new SessionTemplateService(visitSchedulerApiClientBuilder, hmppsAuthClient)

  const userService = new UserService(hmppsAuthClient)

  return {
    applicationInfo,
    locationGroupService,
    prisonService,
    sessionTemplateService,
    userService,
  }
}

export type Services = ReturnType<typeof services>

export { LocationGroupService, PrisonService, SessionTemplateService, UserService }
