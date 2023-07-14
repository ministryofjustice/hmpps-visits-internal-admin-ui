import { dataAccess } from '../data'
import UserService from './userService'
import PrisonService from './prisonService'
import SessionTemplateService from './sessionTemplateService'
import LocationGroupService from './locationGroupService'
import CategoryGroupService from './categoryGroupService'
import IncentiveGroupService from './incentiveGroupService'

export const services = () => {
  const { hmppsAuthClient, applicationInfo, prisonRegisterApiClientBuilder, visitSchedulerApiClientBuilder } =
    dataAccess()

  const categoryGroupService = new CategoryGroupService(visitSchedulerApiClientBuilder, hmppsAuthClient)

  const incentiveGroupService = new IncentiveGroupService(visitSchedulerApiClientBuilder, hmppsAuthClient)

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
    categoryGroupService,
    incentiveGroupService,
    locationGroupService,
    prisonService,
    sessionTemplateService,
    userService,
  }
}

export type Services = ReturnType<typeof services>

export {
  CategoryGroupService,
  IncentiveGroupService,
  LocationGroupService,
  PrisonService,
  SessionTemplateService,
  UserService,
}
