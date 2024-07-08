import { dataAccess } from '../data'
import UserService from './userService'
import PrisonService from './prisonService'
import SessionTemplateService from './sessionTemplateService'
import LocationGroupService from './locationGroupService'
import CategoryGroupService from './categoryGroupService'
import IncentiveGroupService from './incentiveGroupService'
import VisitService from './visitService'
import BookerService from './bookerService'
import PrisonerContactsService from './prisonerContactsService'

export const services = () => {
  const {
    hmppsAuthClient,
    applicationInfo,
    manageUsersApiClient,
    bookerRegistryApiClientBuilder,
    prisonerContactRegistryApiClientBuilder,
    prisonRegisterApiClientBuilder,
    visitSchedulerApiClientBuilder,
  } = dataAccess()

  const bookerService = new BookerService(bookerRegistryApiClientBuilder, hmppsAuthClient)

  const categoryGroupService = new CategoryGroupService(visitSchedulerApiClientBuilder, hmppsAuthClient)

  const incentiveGroupService = new IncentiveGroupService(visitSchedulerApiClientBuilder, hmppsAuthClient)

  const locationGroupService = new LocationGroupService(visitSchedulerApiClientBuilder, hmppsAuthClient)

  const prisonerContactsService = new PrisonerContactsService(prisonerContactRegistryApiClientBuilder, hmppsAuthClient)

  const prisonService = new PrisonService(
    visitSchedulerApiClientBuilder,
    prisonRegisterApiClientBuilder,
    hmppsAuthClient,
  )

  const sessionTemplateService = new SessionTemplateService(visitSchedulerApiClientBuilder, hmppsAuthClient)

  const userService = new UserService(manageUsersApiClient)

  const visitService = new VisitService(visitSchedulerApiClientBuilder, hmppsAuthClient)

  return {
    applicationInfo,
    bookerService,
    categoryGroupService,
    incentiveGroupService,
    locationGroupService,
    prisonerContactsService,
    prisonService,
    sessionTemplateService,
    userService,
    visitService,
  }
}

export type Services = ReturnType<typeof services>

export {
  BookerService,
  CategoryGroupService,
  IncentiveGroupService,
  LocationGroupService,
  PrisonerContactsService,
  PrisonService,
  SessionTemplateService,
  UserService,
  VisitService,
}
