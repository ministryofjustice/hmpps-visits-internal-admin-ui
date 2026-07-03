import { VisitSchedulerApiClient } from '../data'
import logger from '../../logger'
import { ExcludeDateDto } from '../data/visitSchedulerApiTypes'

export default class ExcludeDateService {
  constructor(private readonly visitSchedulerApiClient: VisitSchedulerApiClient) {}

  async getExcludeDates(username: string, prisonCode: string): Promise<ExcludeDateDto[]> {
    logger.info(`Exclude dates retrieved for prison ${prisonCode} by ${username}`)
    return this.visitSchedulerApiClient.getExcludeDates(prisonCode)
  }

  async addExcludeDate(username: string, prisonCode: string, excludeDate: string): Promise<void> {
    logger.info(`Exclude date ${excludeDate} added to prison ${prisonCode} by ${username}`)
    return this.visitSchedulerApiClient.addExcludeDate(prisonCode, excludeDate, username)
  }

  async removeExcludeDate(username: string, prisonCode: string, excludeDate: string): Promise<void> {
    logger.info(`Exclude date ${excludeDate} removed from prison ${prisonCode} by ${username}`)
    await this.visitSchedulerApiClient.removeExcludeDate(prisonCode, excludeDate, username)
  }
}
