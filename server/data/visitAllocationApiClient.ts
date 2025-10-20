import config from '../config'
import RestClient from './restClient'
import { PrisonNegativeBalanceCountDto } from './visitAllocationApiTypes'

export default class VisitAllocationApiClient {
  private restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('visitAllocationApiClient', config.apis.visitAllocation, token)
  }

  // admin-controller

  async resetNegativeBalances(prisonCode: string): Promise<void> {
    await this.restClient.post({ path: `/admin/prison/${prisonCode}/reset` })
  }

  async getNegativeBalanceCount(prisonCode: string): Promise<PrisonNegativeBalanceCountDto> {
    return this.restClient.get({ path: `/admin/prison/${prisonCode}/reset/count` })
  }
}
