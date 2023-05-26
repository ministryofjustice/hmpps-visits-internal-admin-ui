import { dataAccess } from '../data'
import UserService from './userService'
import PrisonService from './prisonService'

export const services = () => {
  const { hmppsAuthClient, applicationInfo, prisonRegisterApiClientBuilder, visitSchedulerApiClientBuilder } =
    dataAccess()

  const prisonService = new PrisonService(
    visitSchedulerApiClientBuilder,
    prisonRegisterApiClientBuilder,
    hmppsAuthClient,
  )

  const userService = new UserService(hmppsAuthClient)

  return {
    applicationInfo,
    prisonService,
    userService,
  }
}

export type Services = ReturnType<typeof services>

export { PrisonService, UserService }
