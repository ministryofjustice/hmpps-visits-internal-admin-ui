import { format } from 'date-fns'
import logger from '../../logger'
import { RestClientBuilder, VisitSchedulerApiClient, HmppsAuthClient } from '../data'
import {
  CreateSessionTemplateDto,
  RequestSessionTemplateVisitStatsDto,
  SessionTemplate,
  SessionTemplatesRangeType,
  UpdateSessionTemplateDto,
} from '../data/visitSchedulerApiTypes'
import { VisitStatsSummary } from '../@types/visits-admin'

export default class SessionTemplateService {
  constructor(
    private readonly visitSchedulerApiClientFactory: RestClientBuilder<VisitSchedulerApiClient>,
    private readonly hmppsAuthClient: HmppsAuthClient,
  ) {}

  async getSingleSessionTemplate(username: string, reference: string): Promise<SessionTemplate> {
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    const visitSchedulerApiClient = this.visitSchedulerApiClientFactory(token)

    return visitSchedulerApiClient.getSingleSessionTemplate(reference)
  }

  async getSessionTemplates(
    username: string,
    prisonCode: string,
    rangeType: SessionTemplatesRangeType,
  ): Promise<SessionTemplate[]> {
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    const visitSchedulerApiClient = this.visitSchedulerApiClientFactory(token)

    return visitSchedulerApiClient.getSessionTemplates(prisonCode, rangeType)
  }

  async activateSessionTemplate(username: string, reference: string): Promise<SessionTemplate> {
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    const visitSchedulerApiClient = this.visitSchedulerApiClientFactory(token)

    logger.info(`Session template '${reference}' activated by ${username}`)

    return visitSchedulerApiClient.activateSessionTemplate(reference)
  }

  async deactivateSessionTemplate(username: string, reference: string): Promise<SessionTemplate> {
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    const visitSchedulerApiClient = this.visitSchedulerApiClientFactory(token)

    logger.info(`Session template '${reference}' deactivated by ${username}`)

    return visitSchedulerApiClient.deactivateSessionTemplate(reference)
  }

  async deleteSessionTemplate(username: string, reference: string): Promise<void> {
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    const visitSchedulerApiClient = this.visitSchedulerApiClientFactory(token)

    logger.info(`Session template '${reference}' deleted by ${username}`)

    return visitSchedulerApiClient.deleteSessionTemplate(reference)
  }

  async createSessionTemplate(
    username: string,
    createSessionTemplateDto: CreateSessionTemplateDto,
  ): Promise<SessionTemplate> {
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    const visitSchedulerApiClient = this.visitSchedulerApiClientFactory(token)

    const sessionTemplate = await visitSchedulerApiClient.createSessionTemplate(createSessionTemplateDto)
    logger.info(
      `Session template '${sessionTemplate.reference}' created for prison '${sessionTemplate.prisonId}' by ${username}`,
    )
    return sessionTemplate
  }

  async updateSessionTemplate(
    username: string,
    reference: string,
    updateSessionTemplateDto: UpdateSessionTemplateDto,
  ): Promise<SessionTemplate> {
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    const visitSchedulerApiClient = this.visitSchedulerApiClientFactory(token)

    const sessionTemplate = await visitSchedulerApiClient.updateSessionTemplate(reference, updateSessionTemplateDto)
    logger.info(
      `Session template '${sessionTemplate.reference}' updated for prison '${sessionTemplate.prisonId}' by ${username}`,
    )
    return sessionTemplate
  }

  async getTemplateStats(username: string, reference: string): Promise<VisitStatsSummary> {
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    const visitSchedulerApiClient = this.visitSchedulerApiClientFactory(token)

    const requestVisitStatsDto: RequestSessionTemplateVisitStatsDto = {
      visitsFromDate: format(new Date(), 'yyyy-MM-dd'),
    }
    const templateStats = await visitSchedulerApiClient.getTemplateStats(requestVisitStatsDto, reference)

    const dates = new Map<string, { booked?: number; cancelled?: number }>()

    templateStats.visitsByDate.forEach(date =>
      dates.set(date.visitDate, { booked: date.visitCounts.open + date.visitCounts.closed }),
    )

    templateStats.cancelVisitsByDate.forEach(date =>
      dates.has(date.visitDate)
        ? dates.set(date.visitDate, {
            booked: dates.get(date.visitDate).booked,
            cancelled: date.visitCounts.open + date.visitCounts.closed,
          })
        : dates.set(date.visitDate, { cancelled: date.visitCounts.open + date.visitCounts.closed }),
    )

    const sortedDates = [...dates.entries()].sort()

    return {
      bookedCount: templateStats.visitCount,
      cancelCount: templateStats.cancelCount,
      minimumCapacity: templateStats.minimumCapacity,
      dates: Object.fromEntries(sortedDates),
    }
  }
}
