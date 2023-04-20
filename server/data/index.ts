/* eslint-disable import/first */
/*
 * Do appinsights first as it does some magic instrumentation work, i.e. it affects other 'require's
 * In particular, applicationinsights automatically collects bunyan logs
 */
import { initialiseAppInsights, buildAppInsightsClient } from '../utils/azureAppInsights'

initialiseAppInsights()
buildAppInsightsClient()

import HmppsAuthClient from './hmppsAuthClient'
import { createRedisClient } from './redisClient'
import TokenStore from './tokenStore'
import PrisonRegisterApiClient from "./prisonRegisterApiClient";
import VisitSchedulerApiClient from "./visitSchedulerApiClient";

type RestClientBuilder<T> = (token: string) => T

export const dataAccess = () => ({
  hmppsAuthClient: new HmppsAuthClient(new TokenStore(createRedisClient())),
  prisonRegisterApiClientBuilder: ((token: string) =>
      new PrisonRegisterApiClient(token)) as RestClientBuilder<PrisonRegisterApiClient>,
  visitSchedulerApiClientBuilder: ((token: string) =>
      new VisitSchedulerApiClient(token)) as RestClientBuilder<VisitSchedulerApiClient>,
})

export type DataAccess = ReturnType<typeof dataAccess>

export { HmppsAuthClient,
  RestClientBuilder,
  VisitSchedulerApiClient}
