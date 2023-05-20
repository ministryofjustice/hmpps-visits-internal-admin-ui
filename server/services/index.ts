import { dataAccess } from '../data'
import UserService from './userService'
import SupportedPrisonsService from './supportedPrisonsService'

export const services = () => {
  const { hmppsAuthClient, applicationInfo, prisonRegisterApiClientBuilder, visitSchedulerApiClientBuilder } =
    dataAccess()

  const supportedPrisonsService = new SupportedPrisonsService(
    visitSchedulerApiClientBuilder,
    prisonRegisterApiClientBuilder,
    hmppsAuthClient,
  )

  const userService = new UserService(hmppsAuthClient)

  return {
    applicationInfo,
    supportedPrisonsService,
    userService,
  }
}

export type Services = ReturnType<typeof services>

export { SupportedPrisonsService, UserService }
