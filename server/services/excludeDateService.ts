import { HmppsAuthClient, RestClientBuilder, VisitSchedulerApiClient } from '../data'
import logger from '../../logger'
import { ExcludeDateDto } from '../data/visitSchedulerApiTypes'

export default class ExcludeDateService {
  constructor(
    private readonly visitSchedulerApiClientFactory: RestClientBuilder<VisitSchedulerApiClient>,
    private readonly hmppsAuthClient: HmppsAuthClient,
  ) {}

  async getExcludeDates(username: string, prisonCode: string): Promise<ExcludeDateDto[]> {
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    const visitSchedulerApiClient = this.visitSchedulerApiClientFactory(token)

    logger.info(`Exclude dates retrieved for prison ${prisonCode} by ${username}`)
    return visitSchedulerApiClient.getExcludeDates(prisonCode)
  }

  async addExcludeDate(username: string, prisonCode: string, excludeDate: string): Promise<void> {
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    const visitSchedulerApiClient = this.visitSchedulerApiClientFactory(token)

    logger.info(`Exclude date ${excludeDate} added to prison ${prisonCode} by ${username}`)
    return visitSchedulerApiClient.addExcludeDate(prisonCode, excludeDate, username)
  }

  async removeExcludeDate(username: string, prisonCode: string, excludeDate: string): Promise<void> {
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    const visitSchedulerApiClient = this.visitSchedulerApiClientFactory(token)

    logger.info(`Exclude date ${excludeDate} removed from prison ${prisonCode} by ${username}`)
    await visitSchedulerApiClient.removeExcludeDate(prisonCode, excludeDate, username)
  }
}
