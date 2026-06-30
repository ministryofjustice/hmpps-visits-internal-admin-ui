import logger from '../../logger'
import { VisitAllocationApiClient } from '../data'
import { PrisonNegativeBalanceCountDto } from '../data/visitAllocationApiTypes'

export default class VisitAllocationService {
  constructor(private readonly visitAllocationApiClient: VisitAllocationApiClient) {}

  async resetNegativeBalances({ username, prisonCode }: { username: string; prisonCode: string }): Promise<void> {
    await this.visitAllocationApiClient.resetNegativeBalances(prisonCode)
    logger.info(`Negative visit balances for prison ${prisonCode} reset by ${username}`)
  }

  async getNegativeBalanceCount({ prisonCode }: { prisonCode: string }): Promise<PrisonNegativeBalanceCountDto> {
    return this.visitAllocationApiClient.getNegativeBalanceCount(prisonCode)
  }
}
