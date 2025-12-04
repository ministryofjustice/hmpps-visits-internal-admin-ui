import { dataAccess } from '../data'
import UserService from './userService'
import PrisonService from './prisonService'
import SessionTemplateService from './sessionTemplateService'
import LocationGroupService from './locationGroupService'
import CategoryGroupService from './categoryGroupService'
import IncentiveGroupService from './incentiveGroupService'
import VisitService from './visitService'
import BookerService from './bookerService'
import ExcludeDateService from './excludeDateService'
import VisitAllocationService from './visitAllocationService'

export const services = () => {
  const {
    hmppsAuthClient,
    applicationInfo,
    manageUsersApiClient,
    bookerRegistryApiClientBuilder,
    prisonRegisterApiClientBuilder,
    visitAllocationApiClientBuilder,
    visitSchedulerApiClientBuilder,
  } = dataAccess()

  const bookerService = new BookerService(bookerRegistryApiClientBuilder, hmppsAuthClient)

  const categoryGroupService = new CategoryGroupService(visitSchedulerApiClientBuilder, hmppsAuthClient)

  const excludeDateService = new ExcludeDateService(visitSchedulerApiClientBuilder, hmppsAuthClient)

  const incentiveGroupService = new IncentiveGroupService(visitSchedulerApiClientBuilder, hmppsAuthClient)

  const locationGroupService = new LocationGroupService(visitSchedulerApiClientBuilder, hmppsAuthClient)

  const prisonService = new PrisonService(
    visitSchedulerApiClientBuilder,
    prisonRegisterApiClientBuilder,
    hmppsAuthClient,
  )

  const sessionTemplateService = new SessionTemplateService(visitSchedulerApiClientBuilder, hmppsAuthClient)

  const userService = new UserService(manageUsersApiClient)

  const visitAllocationService = new VisitAllocationService(visitAllocationApiClientBuilder, hmppsAuthClient)

  const visitService = new VisitService(visitSchedulerApiClientBuilder, hmppsAuthClient)

  return {
    applicationInfo,
    bookerService,
    categoryGroupService,
    excludeDateService,
    incentiveGroupService,
    locationGroupService,
    prisonService,
    sessionTemplateService,
    userService,
    visitAllocationService,
    visitService,
  }
}

export type Services = ReturnType<typeof services>

export {
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
}
