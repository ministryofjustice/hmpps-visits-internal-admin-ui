import { format } from 'date-fns'
import logger from '../../logger'
import { VisitSchedulerApiClient } from '../data'
import {
  CreateSessionTemplateDto,
  RequestSessionTemplateVisitStatsDto,
  SessionTemplate,
  SessionTemplatesRangeType,
  UpdateSessionTemplateDto,
} from '../data/visitSchedulerApiTypes'
import { VisitStatsSummary } from '../@types/visits-admin'

export default class SessionTemplateService {
  constructor(private readonly visitSchedulerApiClient: VisitSchedulerApiClient) {}

  async getSingleSessionTemplate(reference: string): Promise<SessionTemplate> {
    return this.visitSchedulerApiClient.getSingleSessionTemplate(reference)
  }

  async getSessionTemplates(prisonCode: string, rangeType: SessionTemplatesRangeType): Promise<SessionTemplate[]> {
    return this.visitSchedulerApiClient.getSessionTemplates(prisonCode, rangeType)
  }

  async activateSessionTemplate(username: string, reference: string): Promise<SessionTemplate> {
    logger.info(`Session template '${reference}' activated by ${username}`)
    return this.visitSchedulerApiClient.activateSessionTemplate(reference)
  }

  async deactivateSessionTemplate(username: string, reference: string): Promise<SessionTemplate> {
    logger.info(`Session template '${reference}' deactivated by ${username}`)
    return this.visitSchedulerApiClient.deactivateSessionTemplate(reference)
  }

  async deleteSessionTemplate(username: string, reference: string): Promise<void> {
    logger.info(`Session template '${reference}' deleted by ${username}`)
    return this.visitSchedulerApiClient.deleteSessionTemplate(reference)
  }

  async createSessionTemplate(
    username: string,
    createSessionTemplateDto: CreateSessionTemplateDto,
  ): Promise<SessionTemplate> {
    const sessionTemplate = await this.visitSchedulerApiClient.createSessionTemplate(createSessionTemplateDto)
    logger.info(
      `Session template '${sessionTemplate.reference}' created for prison '${sessionTemplate.prisonId}' by ${username}`,
    )
    return sessionTemplate
  }

  async updateSessionTemplate(
    username: string,
    reference: string,
    updateSessionTemplateDto: UpdateSessionTemplateDto,
    validateRequest: boolean,
  ): Promise<SessionTemplate> {
    const sessionTemplate = await this.visitSchedulerApiClient.updateSessionTemplate(
      reference,
      updateSessionTemplateDto,
      validateRequest,
    )
    logger.info(
      `Session template '${sessionTemplate.reference}' updated for prison '${sessionTemplate.prisonId}' by ${username}`,
    )
    return sessionTemplate
  }

  async getTemplateStats(reference: string): Promise<VisitStatsSummary> {
    const requestVisitStatsDto: RequestSessionTemplateVisitStatsDto = {
      visitsFromDate: format(new Date(), 'yyyy-MM-dd'),
    }
    const templateStats = await this.visitSchedulerApiClient.getTemplateStats(requestVisitStatsDto, reference)

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
