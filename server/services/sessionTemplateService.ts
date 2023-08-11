import logger from '../../logger'
import { RestClientBuilder, VisitSchedulerApiClient, HmppsAuthClient } from '../data'
import {
  CreateSessionTemplateDto,
  RequestSessionTemplateVisitStatsDto,
  SessionTemplate,
  SessionTemplateVisitStatsDto,
  SessionTemplatesRangeType,
  UpdateSessionTemplateDto,
} from '../data/visitSchedulerApiTypes'

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

  async getTemplateStats(
    username: string,
    requestVisitStatsDto: RequestSessionTemplateVisitStatsDto,
    reference: string,
  ): Promise<SessionTemplateVisitStatsDto> {
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    const visitSchedulerApiClient = this.visitSchedulerApiClientFactory(token)

    return visitSchedulerApiClient.getTemplateStats(requestVisitStatsDto, reference)
  }
}
