import logger from '../../logger'
import { HmppsAuthClient, RestClientBuilder, VisitAllocationApiClient } from '../data'
import { PrisonNegativeBalanceCountDto } from '../data/visitAllocationApiTypes'

export default class VisitAllocationService {
  constructor(
    private readonly visitAllocationApiClientFactory: RestClientBuilder<VisitAllocationApiClient>,
    private readonly hmppsAuthClient: HmppsAuthClient,
  ) {}

  async resetNegativeBalances({ username, prisonCode }: { username: string; prisonCode: string }): Promise<void> {
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    const visitAllocationApiClient = this.visitAllocationApiClientFactory(token)

    await visitAllocationApiClient.resetNegativeBalances(prisonCode)
    logger.info(`Negative visit balances for prison ${prisonCode} reset by ${username}`)
  }

  async getNegativeBalanceCount({
    username,
    prisonCode,
  }: {
    username: string
    prisonCode: string
  }): Promise<PrisonNegativeBalanceCountDto> {
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    const visitAllocationApiClient = this.visitAllocationApiClientFactory(token)

    return visitAllocationApiClient.getNegativeBalanceCount(prisonCode)
  }
}
