import { RestClient, asSystem } from '@ministryofjustice/hmpps-rest-client'
import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import config from '../config'
import logger from '../../logger'
import { PrisonNegativeBalanceCountDto } from './visitAllocationApiTypes'

export default class VisitAllocationApiClient extends RestClient {
  constructor(authenticationClient: AuthenticationClient) {
    super('Visit Allocation API', config.apis.visitAllocation, logger, authenticationClient)
  }

  // admin-controller

  async resetNegativeBalances(prisonCode: string): Promise<void> {
    await this.post({ path: `/admin/prison/${prisonCode}/reset` }, asSystem())
  }

  async getNegativeBalanceCount(prisonCode: string): Promise<PrisonNegativeBalanceCountDto> {
    return this.get({ path: `/admin/prison/${prisonCode}/reset/count` }, asSystem())
  }
}
