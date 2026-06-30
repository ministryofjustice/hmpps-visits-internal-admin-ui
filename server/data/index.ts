import { AuthenticationClient, InMemoryTokenStore, RedisTokenStore } from '@ministryofjustice/hmpps-auth-clients'
import { createRedisClient } from './redisClient'
import PrisonRegisterApiClient from './prisonRegisterApiClient'
import VisitSchedulerApiClient from './visitSchedulerApiClient'
import config from '../config'
import BookerRegistryApiClient from './bookerRegistryApiClient'
import VisitAllocationApiClient from './visitAllocationApiClient'
import applicationInfoSupplier from '../applicationInfo'
import logger from '../../logger'

export const dataAccess = () => {
  const applicationInfo = applicationInfoSupplier()
  const hmppsAuthClient = new AuthenticationClient(
    config.apis.hmppsAuth,
    logger,
    config.redis.enabled ? new RedisTokenStore(createRedisClient()) : new InMemoryTokenStore(),
  )

  return {
    applicationInfo,
    hmppsAuthClient,
    bookerRegistryApiClient: new BookerRegistryApiClient(hmppsAuthClient),
    prisonRegisterApiClient: new PrisonRegisterApiClient(hmppsAuthClient),
    visitAllocationApiClient: new VisitAllocationApiClient(hmppsAuthClient),
    visitSchedulerApiClient: new VisitSchedulerApiClient(hmppsAuthClient),
  }
}

export type DataAccess = ReturnType<typeof dataAccess>

export {
  AuthenticationClient,
  BookerRegistryApiClient,
  PrisonRegisterApiClient,
  VisitAllocationApiClient,
  VisitSchedulerApiClient,
}
