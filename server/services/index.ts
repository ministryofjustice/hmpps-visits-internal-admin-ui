import { dataAccess } from '../data'
import PrisonService from './prisonService'
import SessionTemplateService from './sessionTemplateService'
import LocationGroupService from './locationGroupService'
import CategoryGroupService from './categoryGroupService'
import IncentiveGroupService from './incentiveGroupService'
import BookerService from './bookerService'
import VisitAllocationService from './visitAllocationService'

export const services = () => {
  const {
    applicationInfo,
    bookerRegistryApiClient,
    prisonRegisterApiClient,
    visitAllocationApiClient,
    visitSchedulerApiClient,
  } = dataAccess()

  return {
    applicationInfo,
    bookerService: new BookerService(bookerRegistryApiClient),
    categoryGroupService: new CategoryGroupService(visitSchedulerApiClient),
    incentiveGroupService: new IncentiveGroupService(visitSchedulerApiClient),
    locationGroupService: new LocationGroupService(visitSchedulerApiClient),
    prisonService: new PrisonService(visitSchedulerApiClient, prisonRegisterApiClient),
    sessionTemplateService: new SessionTemplateService(visitSchedulerApiClient),
    visitAllocationService: new VisitAllocationService(visitAllocationApiClient),
  }
}

export type Services = ReturnType<typeof services>

export {
  BookerService,
  CategoryGroupService,
  IncentiveGroupService,
  LocationGroupService,
  PrisonService,
  SessionTemplateService,
  VisitAllocationService,
}
