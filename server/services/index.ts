import { dataAccess } from '../data'
import UserService from './userService'
import AdminService from './AdminService'

export const services = () => {
  const { hmppsAuthClient,
    visitSchedulerApiClientBuilder,
    prisonRegisterApiClientBuilder
  } = dataAccess()

  const userService = new UserService(hmppsAuthClient)

  const adminService = new AdminService(
      visitSchedulerApiClientBuilder,
      prisonRegisterApiClientBuilder,
      userService
  )

  return {
    userService,
    adminService
  }
}

export type Services = ReturnType<typeof services>

export { UserService,AdminService}
