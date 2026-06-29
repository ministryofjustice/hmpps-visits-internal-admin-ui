import HmppsAuthClient from './hmppsAuthClient'
import ManageUsersApiClient from './manageUsersApiClient'
import { createRedisClient } from './redisClient'
import RedisTokenStore from './tokenStore/redisTokenStore'
import InMemoryTokenStore from './tokenStore/inMemoryTokenStore'
import PrisonRegisterApiClient from './prisonRegisterApiClient'
import VisitSchedulerApiClient from './visitSchedulerApiClient'
import config from '../config'
import BookerRegistryApiClient from './bookerRegistryApiClient'
import VisitAllocationApiClient from './visitAllocationApiClient'
import applicationInfoSupplier from '../applicationInfo'

const applicationInfo = applicationInfoSupplier()

type RestClientBuilder<T> = (token: string) => T

export const dataAccess = () => ({
  applicationInfo,
  hmppsAuthClient: new HmppsAuthClient(
    config.redis.enabled ? new RedisTokenStore(createRedisClient()) : new InMemoryTokenStore(),
  ),
  manageUsersApiClient: new ManageUsersApiClient(),
  bookerRegistryApiClientBuilder: ((token: string) =>
    new BookerRegistryApiClient(token)) as RestClientBuilder<BookerRegistryApiClient>,
  prisonRegisterApiClientBuilder: ((token: string) =>
    new PrisonRegisterApiClient(token)) as RestClientBuilder<PrisonRegisterApiClient>,
  visitAllocationApiClientBuilder: ((token: string) =>
    new VisitAllocationApiClient(token)) as RestClientBuilder<VisitAllocationApiClient>,
  visitSchedulerApiClientBuilder: ((token: string) =>
    new VisitSchedulerApiClient(token)) as RestClientBuilder<VisitSchedulerApiClient>,
})

export type DataAccess = ReturnType<typeof dataAccess>

export {
  HmppsAuthClient,
  ManageUsersApiClient,
  BookerRegistryApiClient,
  PrisonRegisterApiClient,
  type RestClientBuilder,
  VisitAllocationApiClient,
  VisitSchedulerApiClient,
}
